#!/usr/bin/env python3
"""Narração das cenas (Modo 1) com edge-tts + tempo de cada palavra (para a legenda).

Trabalha sobre um projeto.json: só gera as cenas cujo texto/voz mudou (cache por hash) e grava
os áudios ao lado, em audio/<cena>-<hash>.mp3 (nome novo a cada mudança, então o app nunca usa
áudio velho do cache). Atualiza o campo "narracao" do próprio projeto.json.

Uso: python3 scripts/voz.py <pasta-ou-projeto.json> [--midia PASTA] [--forcar]
  --midia: onde ficam audio/ (padrão: a pasta do projeto.json)
"""
import argparse, asyncio, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time


def duracao(arquivo):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", arquivo])
    return float(out.strip())


async def via_edge(texto, voz, velocidade, destino, tom=None):
    import edge_tts
    kwargs = {"rate": velocidade}
    if tom:
        kwargs["pitch"] = tom
    if "boundary" in edge_tts.Communicate.__init__.__code__.co_varnames:
        kwargs["boundary"] = "WordBoundary"
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if proxy:
        kwargs["proxy"] = proxy
    com = edge_tts.Communicate(texto, voz, **kwargs)
    palavras = []
    with open(destino, "wb") as f:
        async for c in com.stream():
            if c["type"] == "audio":
                f.write(c["data"])
            elif c["type"] == "WordBoundary":
                ini = c["offset"] / 1e7
                palavras.append({"p": c["text"], "i": round(ini, 3), "f": round(ini + c["duration"] / 1e7, 3)})
    return palavras


# ---------- narração fluida (voz.fluida) ----------
# O edge-tts lê o texto inteiro de uma vez, sem pausas dramáticas. Aqui cada frase é lida separadamente e as frases são
# coladas com silêncios que seguem a pontuação (ponto, interrogação, reticências, parágrafo): a fala respira, a virada
# de uma revelação "cai" melhor e dá para variar o ritmo. O tempo de cada palavra é somado ao início da frase.
PAUSAS = {".": 0.24, "!": 0.28, "?": 0.34, "…": 0.48, ":": 0.26, ";": 0.22}  # além do silêncio que a própria frase já traz no fim
PAUSA_PARAGRAFO = 0.65
RESPIRO_FINAL = 0.4
ABREVIACOES = {"a.c", "d.c", "dr", "dra", "sr", "sra", "srta", "prof", "profa", "st", "sto", "sta", "mr", "mrs", "ms", "vs", "etc", "nº", "no", "av", "cap", "séc", "ex", "mt", "gen", "cel", "ten", "jr"}


def dividir_frases(texto):
    """Quebra em frases onde há . ! ? … seguido de maiúscula/aspas/dígito, sem cortar abreviações, siglas (S.A.) nem a.C./d.C."""
    texto = " ".join(texto.split())
    partes, ini = [], 0
    for m in re.finditer(r"[.!?…]+[\"”’')\]]*\s+(?=[\"“‘'(¿¡A-ZÀ-ÖØ-Þ0-9])", texto):
        corte = m.end()
        anterior = texto[ini:m.start()].split(" ")[-1].lower().rstrip(".")
        if anterior in ABREVIACOES or re.fullmatch(r"[a-zà-ÿ]\.?", anterior or "xx") and texto[m.start()] == ".":
            continue  # abreviação ou inicial ("Dr. Silva", "J. K. Rowling")
        partes.append(texto[ini:corte].strip())
        ini = corte
    if texto[ini:].strip():
        partes.append(texto[ini:].strip())
    # só fragmentos minúsculos ("Sim.", "Ah.") grudam na vizinha; frases curtas de efeito ("Ninguém esperava aquilo!") ganham pausa
    juntas = []
    for fr in partes:
        if juntas and (len(fr) < 8 or len(juntas[-1]) < 8):
            juntas[-1] += " " + fr
        else:
            juntas.append(fr)
    return juntas


def pausa_depois(frase):
    fim = frase.rstrip().rstrip("\"”’')]")[-1:]
    return PAUSAS.get(fim, 0.2)


def montar_segmentos(texto):
    """[(frase, pausa_depois)] — pausa maior no fim de parágrafo, respiro curto no fim da cena."""
    segs = []
    paragrafos = [x.strip() for x in re.split(r"\n\s*\n", texto) if x.strip()]
    for pi, par in enumerate(paragrafos):
        frases = dividir_frases(par)
        for fi, fr in enumerate(frases):
            pausa = pausa_depois(fr)
            if fi == len(frases) - 1 and pi < len(paragrafos) - 1:
                pausa = max(pausa, PAUSA_PARAGRAFO)
            segs.append([fr, pausa])
    if segs:
        segs[-1][1] = RESPIRO_FINAL
    return segs


def silencio(arquivo, segundos):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", f"{segundos:.3f}", "-c:a", "libmp3lame", "-b:a", "48k", arquivo], check=True)


async def narrar_fluido(texto, voz_id, vel, tom, destino):
    segs = montar_segmentos(texto)
    if not segs:
        raise RuntimeError("cena sem texto")
    tmp = tempfile.mkdtemp(prefix="voz-")
    sem = asyncio.Semaphore(3)

    async def uma(i, frase):
        async with sem:
            arq = os.path.join(tmp, f"s{i}.mp3")
            for tentativa in range(4):
                try:
                    palavras = await via_edge(frase, voz_id, vel, arq, tom)
                    if not palavras:
                        raise RuntimeError("edge-tts não devolveu o tempo das palavras")
                    return arq, palavras
                except Exception as e:
                    if tentativa == 3:
                        raise
                    print(f"  frase {i + 1}: tentativa {tentativa + 1} falhou ({e}); de novo…", flush=True)
                    await asyncio.sleep(2 * (tentativa + 1))

    feitas = await asyncio.gather(*[uma(i, fr) for i, (fr, _) in enumerate(segs)])
    lista, palavras_todas, cursor = [], [], 0.0
    pausas = {}
    for i, ((frase, pausa), (arq, palavras)) in enumerate(zip(segs, feitas)):
        for w in palavras:
            palavras_todas.append({"p": w["p"], "i": round(w["i"] + cursor, 3), "f": round(w["f"] + cursor, 3)})
        d = duracao(arq)
        lista.append(arq)
        cursor += d
        chave = round(pausa, 2)
        if chave not in pausas:
            pausas[chave] = os.path.join(tmp, f"p{len(pausas)}.mp3")
            silencio(pausas[chave], chave)
        lista.append(pausas[chave])
        cursor += chave
    arquivo_lista = os.path.join(tmp, "lista.txt")
    with open(arquivo_lista, "w") as f:
        for arq in lista:
            f.write("file '" + arq.replace("'", "'\\''") + "'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", arquivo_lista, "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", destino], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    return palavras_todas


async def resolver_voz(voz_id):
    """Confere se a voz existe no edge-tts; se não, usa outra voz neural do mesmo idioma (e avisa)."""
    try:
        import edge_tts
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        vozes = await asyncio.wait_for(edge_tts.list_voices(**({"proxy": proxy} if proxy else {})), 25)
    except Exception as e:
        print(f"  (não consegui conferir a lista de vozes: {e})")
        return voz_id
    nomes = {v["ShortName"] for v in vozes}
    if voz_id in nomes:
        return voz_id
    idioma = "-".join(voz_id.split("-")[:2])
    ia = sorted(n for n in nomes if n.startswith(idioma + "-") and "Neural" in n)
    if ia:
        print(f"! voz {voz_id} não existe mais; usando {ia[0]}")
        return ia[0]
    print(f"! voz {voz_id} não existe e não achei outra de {idioma}")
    return voz_id


# Tratamento de estúdio (voz.tratamento): corta graves, dá presença, suaviza o "s", comprime e
# normaliza o volume (-16 LUFS, pico -1,5 dBTP). Não muda a duração, então o tempo das palavras vale.
FILTRO_VOZ = ",".join([
    "highpass=f=80",
    "equalizer=f=220:t=q:w=1.0:g=-1.5",
    "equalizer=f=3200:t=q:w=1.2:g=2.5",
    "deesser=i=0.35",
    "acompressor=threshold=-21dB:ratio=2.8:attack=6:release=90:makeup=2",
    "loudnorm=I=-16:TP=-1.5:LRA=7",
    "apad=pad_dur=0.4",  # respiro no fim: o corte nunca come a última sílaba
])


def tratar(arquivo):
    tmp = arquivo + ".tmp.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", arquivo, "-af", FILTRO_VOZ, "-ar", "44100", "-ac", "1", "-b:a", "160k", tmp], check=True)
    os.replace(tmp, arquivo)


VOZ_PADRAO = {"pt-BR": "pt-BR-AntonioNeural", "en-US": "en-US-AndrewMultilingualNeural", "es-ES": "es-ES-AlvaroNeural", "fr-FR": "fr-FR-HenriNeural", "de-DE": "de-DE-ConradNeural", "it-IT": "it-IT-DiegoNeural"}


def carregar_pronuncias():
    """scripts/pronuncias.json: como a voz deve ler termos em inglês/siglas (ex.: Claude -> Clód)."""
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pronuncias.json")
    d = json.load(open(f, encoding="utf-8")) if os.path.exists(f) else {}
    return {k: v for k, v in d.items() if not k.startswith("_")}


def falado(texto, pron):
    for k in sorted(pron, key=len, reverse=True):
        texto = re.sub(rf"(?<![\wÀ-ÿ]){re.escape(k)}(?![\wÀ-ÿ])", pron[k], texto)
    return texto


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--midia")
    ap.add_argument("--forcar", action="store_true")
    a = ap.parse_args()
    arq = a.projeto if a.projeto.endswith(".json") else os.path.join(a.projeto, "projeto.json")
    midia = a.midia or os.path.dirname(arq)
    p = json.load(open(arq, encoding="utf-8"))
    voz = p.get("voz") or {}
    if voz.get("propria"):  # narração gravada por você (scripts/voz_propria.py): não refaz com a IA
        print("= voz própria: narração mantida")
        return
    voz_id, vel = voz.get("edge", VOZ_PADRAO.get(p.get("idioma", "pt-BR"), "pt-BR-AntonioNeural")), voz.get("velocidade", "+5%")
    trat = bool(voz.get("tratamento"))
    fluida = bool(voz.get("fluida"))
    tom = voz.get("tom") or None  # tom da voz, ex.: "-2Hz" (mais grave)
    if fluida:
        voz_id = asyncio.run(resolver_voz(voz_id))
    anterior = p.get("narracao") or {}
    nova = {}
    pron = carregar_pronuncias() if str(p.get("idioma", "pt-BR")).startswith("pt") else {}  # o dicionário é de português
    volta = {re.sub(r"[^\w]", "", v).lower(): k for k, v in pron.items()}
    os.makedirs(os.path.join(midia, "audio"), exist_ok=True)
    for cena in p.get("cenas", []):
        cid, texto = cena["id"], cena["texto"].strip()
        lido = falado(texto, pron)
        h = hashlib.sha1(f"edge|{voz_id}|{vel}|{lido}{'|estudio' if trat else ''}{f'|fluida2|{tom}' if fluida else ''}".encode()).hexdigest()[:10]
        velho = anterior.get(cid)
        if velho and velho.get("hash") == h and os.path.exists(os.path.join(midia, velho["audio"])) and not a.forcar:
            nova[cid] = velho
            print(f"= {cid}")
            continue
        rel = f"audio/{cid}-{h}.mp3"
        dest = os.path.join(midia, rel)
        print(f"♪ {cid} …", flush=True)
        for tentativa in range(4):
            try:
                palavras = asyncio.run(narrar_fluido(lido, voz_id, vel, tom, dest) if fluida else via_edge(lido, voz_id, vel, dest, tom))
                if not palavras:
                    raise RuntimeError("edge-tts não devolveu o tempo das palavras")
                for w in palavras:  # a legenda mostra a grafia original, não a da pronúncia
                    w["p"] = volta.get(re.sub(r"[^\w]", "", w["p"]).lower(), w["p"]) if lido != texto else w["p"]
                break
            except Exception as e:
                if tentativa == 3:
                    raise
                print(f"  tentativa {tentativa + 1} falhou ({e}); de novo…", flush=True)
                time.sleep(3 * (tentativa + 1))
        if trat:
            tratar(dest)
        nova[cid] = {"hash": h, "texto": texto, "audio": rel, "duracao": round(duracao(dest), 3), "palavras": palavras}
    p["narracao"] = nova
    json.dump(p, open(arq, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total = sum(n["duracao"] for n in nova.values())
    print(f"Narração pronta: {total:.1f}s em {len(nova)} cenas")


if __name__ == "__main__":
    sys.exit(main())
