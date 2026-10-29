#!/usr/bin/env python3
"""Narração gravada por você (Modo 1) no lugar da voz da IA.

1. Limpa o áudio (DeepFilterNet: tira ruído de fundo) e aplica o tratamento de estúdio de voz.py.
2. Transcreve com faster-whisper (tempo por palavra).
3. Alinha a transcrição ao texto das cenas: a legenda mostra a grafia do roteiro no tempo da sua fala,
   mesmo quando o Whisper erra uma palavra (as que ele não reconheceu têm o tempo interpolado).
4. Corta o áudio em um arquivo por cena e grava projeto.narracao (com voz.propria = true, voz.py não refaz).

Uso: python3 scripts/voz_propria.py <projeto.json> --original ARQUIVO [--midia PASTA] [--modelo medium]
     [--deepfilter BINARIO]   (sem o binário, pula a limpeza de ruído)
     [--simular palavras.json] (pula o whisper; para testes)
"""
import argparse, difflib, hashlib, json, os, re, shutil, subprocess, sys, tempfile, unicodedata

from voz import FILTRO_VOZ, duracao
from processar_bruto import transcrever


def norm(p):
    p = unicodedata.normalize("NFD", p.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in p if unicodedata.category(c) != "Mn"))


def limpar_audio(original, destino, deepfilter):
    """original → wav 48 kHz mono → DeepFilterNet (se houver) → tratamento de estúdio → wav 44,1 kHz."""
    tmp = tempfile.mkdtemp(prefix="vozp-")
    wav = os.path.join(tmp, "voz.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", original, "-vn", "-ac", "1", "-ar", "48000", wav], check=True)
    if deepfilter:
        saida = os.path.join(tmp, "limpo")
        try:
            subprocess.run([deepfilter, "-o", saida, wav], check=True)
            wav = os.path.join(saida, sorted(n for n in os.listdir(saida) if n.endswith(".wav"))[0])
            print("   ruído removido (DeepFilterNet)", flush=True)
        except Exception as e:  # sem a limpeza o vídeo ainda sai, só com mais ruído
            print(f"! DeepFilterNet falhou ({e}); seguindo só com o tratamento de estúdio", flush=True)
    else:
        print("   sem DeepFilterNet: só o tratamento de estúdio", flush=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", FILTRO_VOZ, "-ar", "44100", "-ac", "1", destino], check=True)
    shutil.rmtree(tmp, ignore_errors=True)


def alinhar(cenas, ditas, total):
    """Tempo de cada palavra do roteiro a partir das palavras ditas (Whisper). Devolve, por cena, [{p, i, f}]."""
    roteiro = [(k, w) for k, c in enumerate(cenas) for w in c["texto"].split()]
    a, b = [norm(w) for _, w in roteiro], [norm(w["p"]) for w in ditas]
    tempos, onde = [None] * len(roteiro), [None] * len(roteiro)  # onde: índice da palavra dita que casou
    for m in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for j in range(m.size):
            tempos[m.a + j] = (ditas[m.b + j]["i"], ditas[m.b + j]["f"])
            onde[m.a + j] = m.b + j
    if not any(tempos):
        raise RuntimeError("a fala não bate com o texto das cenas (leu o roteiro deste vídeo?)")
    acertos = sum(t is not None for t in tempos)
    print(f"   {acertos}/{len(roteiro)} palavras do roteiro reconhecidas na fala", flush=True)
    # as não reconhecidas (ex.: "55 km" dito "cinquenta e cinco quilômetros"): ocupam o trecho das palavras ditas
    # que sobraram entre as vizinhas reconhecidas, dividido pelo tamanho de cada palavra
    k = 0
    while k < len(tempos):
        if tempos[k] is not None:
            k += 1
            continue
        fim = k
        while fim < len(tempos) and tempos[fim] is None:
            fim += 1
        sobra = ditas[(onde[k - 1] + 1 if k > 0 else 0):(onde[fim] if fim < len(tempos) else len(ditas))]
        if sobra:
            ini_t, fim_t = sobra[0]["i"], sobra[-1]["f"]
        else:
            ini_t = tempos[k - 1][1] if k > 0 else 0.0
            fim_t = tempos[fim][0] if fim < len(tempos) else total
        pesos = [len(roteiro[j][1]) + 1 for j in range(k, fim)]
        passo, t = (fim_t - ini_t) / sum(pesos), ini_t
        for j, peso in zip(range(k, fim), pesos):
            tempos[j] = (round(t, 3), round(t + passo * peso, 3))
            t += passo * peso
        k = fim
    por_cena = [[] for _ in cenas]
    for (c, w), (i, f) in zip(roteiro, tempos):
        por_cena[c].append({"p": w, "i": i, "f": f})
    return por_cena


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--original", required=True)
    ap.add_argument("--midia")
    ap.add_argument("--modelo", default="medium")
    ap.add_argument("--deepfilter")
    ap.add_argument("--simular")
    a = ap.parse_args()
    arq = a.projeto if a.projeto.endswith(".json") else os.path.join(a.projeto, "projeto.json")
    midia = a.midia or os.path.dirname(arq)
    p = json.load(open(arq, encoding="utf-8"))
    cenas = [c for c in p.get("cenas", []) if c.get("texto", "").strip()]
    if not cenas:
        raise SystemExit("projeto sem cenas")

    os.makedirs(os.path.join(midia, "audio"), exist_ok=True)
    limpo = os.path.join(tempfile.mkdtemp(prefix="vozp-"), "narracao.wav")
    print("== Limpando o áudio", flush=True)
    limpar_audio(a.original, limpo, a.deepfilter)
    total = duracao(limpo)
    print(f"== Transcrevendo ({total:.1f}s)", flush=True)
    idioma = str(p.get("idioma", "pt-BR")).split("-")[0]
    ditas = json.load(open(a.simular)) if a.simular else transcrever(limpo, a.modelo, idioma)
    por_cena = alinhar(cenas, ditas, total)

    # corte entre cenas: no meio do silêncio entre a última palavra de uma e a primeira da seguinte
    cortes = [0.0]
    for k in range(1, len(cenas)):
        cortes.append(round((por_cena[k - 1][-1]["f"] + por_cena[k][0]["i"]) / 2, 3))
    cortes.append(total)
    marca = hashlib.sha1(open(a.original, "rb").read()).hexdigest()[:8]
    nova = {}
    for k, c in enumerate(cenas):
        ini, fim = cortes[k], cortes[k + 1]
        h = f"propria-{marca}-{k}"
        rel = f"audio/{c['id']}-{h}.mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ini:.3f}", "-i", limpo, "-t", f"{fim - ini:.3f}",
                        "-ar", "44100", "-ac", "1", "-b:a", "160k", os.path.join(midia, rel)], check=True)
        palavras = [{"p": w["p"], "i": round(max(0, w["i"] - ini), 3), "f": round(max(0, w["f"] - ini), 3)} for w in por_cena[k]]
        nova[c["id"]] = {"hash": h, "texto": c["texto"].strip(), "audio": rel, "duracao": round(duracao(os.path.join(midia, rel)), 3), "palavras": palavras}
        print(f"♪ {c['id']}: {ini:.1f}s → {fim:.1f}s", flush=True)
    p["narracao"] = nova
    p["voz"] = {**(p.get("voz") or {}), "propria": True}
    json.dump(p, open(arq, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Narração própria pronta: {total:.1f}s em {len(nova)} cenas")


if __name__ == "__main__":
    sys.exit(main())
