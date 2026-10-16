#!/usr/bin/env python3
"""Modo 2: prepara um vídeo bruto para o editor.

1. Normaliza o original (H.264, 30 fps, lado maior ≤ 1920) → fonte.mp4 (usada no render)
2. Gera uma prévia leve (lado maior ≤ 960, keyframes frequentes) → previa.mp4 (usada no app)
3. Transcreve com faster-whisper (pt, tempo por palavra)
4. Aplica o estilo escolhido: palavras em destaque e cortes automáticos de pausas

Saída: um JSON com {video, palavras, cortes} que o aplicar_resultado.py junta ao projeto.json.

Uso:
  python3 scripts/processar_bruto.py --original ORIG --projeto projetos/<id>/projeto.json \
      --fonte out/fonte.mp4 --previa projetos/<id>/previa.mp4 --saida out/resultado.json [--modelo medium]
  --simular palavras.json   (pula o whisper; para testes)
"""
import argparse, json, os, re, subprocess, sys, unicodedata, uuid


def ffprobe(arq):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height",
                                   "-of", "json", arq])
    j = json.loads(out)
    v = next((s for s in j.get("streams", []) if s.get("codec_type") == "video"), None)
    if not v:
        raise SystemExit("O arquivo enviado não tem vídeo.")
    tem_audio = any(s.get("codec_type") == "audio" for s in j.get("streams", []))
    return float(j["format"]["duration"]), int(v["width"]), int(v["height"]), tem_audio


def ffmpeg(*args):
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-stats", *args])


# Tratamento de voz usado em vídeos profissionais de redes sociais:
# corta graves de vento/ruído (highpass), reduz chiado (afftdn), equilibra o volume da fala
# (compressor) e deixa no volume que TikTok/Reels esperam (~-14 LUFS, pico -1,5 dBTP).
CADEIA_VOZ = ("highpass=f=80,afftdn=nf=-25,"
              "acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2,"
              "loudnorm=I=-14:TP=-1.5:LRA=11")
# Leve correção de imagem: um pouco mais de contraste/cor e nitidez (vídeo de celular costuma vir "lavado")
CADEIA_IMAGEM = "eq=contrast=1.06:saturation=1.12:gamma=1.02,unsharp=5:5:0.45:5:5:0"


def normalizar_video(original, fonte, previa, tratar_audio=True, melhorar_imagem=True, tem_audio=True):
    # o ffmpeg já aplica a rotação do celular (autorotate), então largura/altura saem certas
    vf = "scale=w='min(iw,1920)':h='min(ih,1920)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30"
    if melhorar_imagem:
        vf += "," + CADEIA_IMAGEM
    vf += ",format=yuv420p"
    af = ["-af", CADEIA_VOZ] if (tratar_audio and tem_audio) else []
    ffmpeg("-i", original, "-vf", vf, *af,
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
           "-movflags", "+faststart", fonte)
    ffmpeg("-i", fonte,
           "-vf", "scale=w='min(iw,960)':h='min(ih,960)':force_original_aspect_ratio=decrease:force_divisible_by=2",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-g", "15", "-c:a", "aac", "-b:a", "96k",
           "-movflags", "+faststart", previa)


def rastrear_rosto(arquivo, duracao, passo=0.5):
    """Auto-enquadramento: acha o rosto principal a cada `passo` s e devolve [{t, x, y}] em % do quadro.

    Suaviza e só move a "câmera" quando o rosto sai de uma zona morta, como fazem editores
    profissionais (o enquadramento segura firme e acompanha o movimento com calma).
    """
    try:
        import cv2, numpy as np
    except ImportError:
        print("   (opencv não instalado: sem auto-enquadramento)")
        return []
    largura = 480
    w, h = largura, None
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", arquivo]).decode().strip()
    vw, vh = [int(x) for x in out.split(",")[:2]]
    h = int(round(vh * largura / vw / 2) * 2)
    bruto = subprocess.check_output(["ffmpeg", "-v", "error", "-i", arquivo, "-vf", f"fps={1/passo},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"])
    n = len(bruto) // (w * h)
    detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    pontos = []
    for k in range(n):
        img = np.frombuffer(bruto[k * w * h:(k + 1) * w * h], dtype=np.uint8).reshape(h, w)
        rostos = detector.detectMultiScale(img, scaleFactor=1.15, minNeighbors=6, minSize=(int(w * 0.07), int(w * 0.07)))
        if len(rostos):
            x, y, rw, rh = max(rostos, key=lambda r: r[2] * r[3])
            pontos.append((k * passo, (x + rw / 2) / w * 100, (y + rh * 0.45) / h * 100))
    if len(pontos) < max(2, n * 0.15):
        print(f"   rosto encontrado em {len(pontos)}/{n} amostras: sem auto-enquadramento")
        return []
    # mediana móvel (tira detecções falsas) + zona morta de 6% (segura o quadro parado)
    xs = [p[1] for p in pontos]; ys = [p[2] for p in pontos]
    med = lambda v, i: sorted(v[max(0, i - 2):i + 3])[len(v[max(0, i - 2):i + 3]) // 2]
    foco, ax, ay = [], None, None
    for i, (t, _, _) in enumerate(pontos):
        mx, my = med(xs, i), med(ys, i)
        if ax is None or abs(mx - ax) > 6 or abs(my - ay) > 6:
            ax = mx if ax is None else ax + (mx - ax) * 0.7
            ay = my if ay is None else ay + (my - ay) * 0.7
            foco.append({"t": round(t, 2), "x": round(ax, 1), "y": round(ay, 1)})
    print(f"   rosto encontrado em {len(pontos)}/{n} amostras, {len(foco)} ajustes de enquadramento")
    return foco


def audio_16k(arquivo):
    """Áudio mono 16 kHz em float32 lido pelo ffmpeg (não depende da versão do PyAV)."""
    import numpy as np
    bruto = subprocess.check_output(["ffmpeg", "-v", "error", "-i", arquivo, "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"])
    return np.frombuffer(bruto, dtype=np.int16).astype(np.float32) / 32768.0


def transcrever(arquivo, modelo, idioma="pt"):
    from faster_whisper import WhisperModel
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segmentos, info = m.transcribe(audio_16k(arquivo), language=idioma, word_timestamps=True, vad_filter=True,
                                   vad_parameters={"min_silence_duration_ms": 300}, beam_size=5,
                                   condition_on_previous_text=False)
    palavras = []
    for s in segmentos:
        for w in s.words or []:
            texto = w.word.strip()
            if not texto:
                continue
            palavras.append({"p": texto, "i": round(w.start, 3), "f": round(w.end, 3)})
            print(f"{w.start:7.2f} {texto}", flush=True)
    return palavras


def limpar(palavras):
    """Tira pontuação de fim (mantém ? e !) e corrige tempos sobrepostos."""
    saida = []
    for w in palavras:
        p = re.sub(r"[,.;:…\"“”]+$", "", w["p"]).strip()
        p = re.sub(r"^[\"“”]+", "", p)
        if not p:
            continue
        i, f = float(w["i"]), float(w["f"])
        if saida and i < saida[-1]["f"]:
            i = saida[-1]["f"]
        if f <= i:
            f = i + 0.08
        saida.append({"p": p, "i": round(i, 3), "f": round(f, 3)})
    return saida


PARADAS = set("""a o as os um uma uns umas de do da dos das no na nos nas em por para pra pro com sem que se
e ou mas como mais menos muito muita já não sim é foi era ser ter tem tinha ao aos à às eu tu ele ela nós
vocês você eles elas me te lhe nos vos meu minha seu sua isso isto aquilo esse essa este esta aquele aquela
então porque porquê quando onde qual quais quem também só até depois antes aqui ali lá tá tô né aí bem
vai vou vamos pode posso fazer faz fiz está estou estava estão são sou""".split())


def sem_acento(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def destacar(palavras, a_cada=4):
    """Legenda impacto: destaca números, valores e palavras fortes (no máximo ~1 a cada `a_cada`)."""
    ultimo = -99
    for k, w in enumerate(palavras):
        base = sem_acento(re.sub(r"[?!]", "", w["p"]))
        forte = bool(re.search(r"\d|%|r\$|reais|mil|milh|bilh", base)) or (len(base) >= 7 and base not in PARADAS)
        if forte and k - ultimo >= a_cada:
            w["destaque"] = True
            ultimo = k
    return palavras


def cortes_de_pausas(palavras, duracao, limite, margem=0.12):
    ws = [w for w in palavras if w["p"].strip()]
    cortes = []
    novo = lambda i, f, motivo: {"id": "c" + uuid.uuid4().hex[:8], "i": round(i, 3), "f": round(f, 3), "motivo": motivo}
    if not ws:
        return cortes
    if ws[0]["i"] - margem > 0.2:
        cortes.append(novo(0, ws[0]["i"] - margem, "início"))
    for a, b in zip(ws, ws[1:]):
        if b["i"] - a["f"] > limite:
            cortes.append(novo(a["f"] + margem, b["i"] - margem, "pausa"))
    ult = ws[-1]["f"] + margem * 2
    if duracao - ult > 0.3:
        cortes.append(novo(ult, duracao, "fim"))
    return cortes


def zooms_nos_destaques(palavras, escala=1.18, intervalo=2.5):
    """Legenda impacto: "punch-in" curto no rosto quando aparece uma palavra destacada."""
    zooms, ultimo = [], -99.0
    for w in palavras:
        if w.get("destaque") and w["i"] - ultimo >= intervalo:
            zooms.append({"id": zid(), "i": round(max(0, w["i"] - 0.05), 3), "f": round(w["f"] + 0.45, 3), "escala": escala})
            ultimo = w["i"]
    return zooms


def trechos_mantidos(duracao, cortes):
    cs = sorted((min(c["i"], c["f"]), max(c["i"], c["f"])) for c in cortes)
    juntos = []
    for i, f in cs:
        if juntos and i <= juntos[-1][1]:
            juntos[-1][1] = max(juntos[-1][1], f)
        else:
            juntos.append([i, f])
    trechos, pos = [], 0.0
    for i, f in juntos:
        if i - pos > 0.04:
            trechos.append((pos, i))
        pos = max(pos, f)
    if duracao - pos > 0.04:
        trechos.append((pos, duracao))
    return trechos


# Ritmo: intervalo máximo (s) sem nenhuma mudança visual, por estilo. Guias de retenção de vídeos
# curtos recomendam uma "quebra de padrão" (zoom, corte, texto, som) a cada ~3–5 s.
RITMO = {"impacto": 3.0, "cortes-rapidos": 2.5, "noticia": 4.5, "tutorial": 4.5, "podcast": 6.0, "documentario": None}


def completar_ritmo(estilo, palavras, duracao, cortes, zooms):
    """Onde ficar tempo demais sem mudança visual, entra um leve corte de enquadramento (zoom seco)."""
    lim = RITMO.get(estilo)
    if not lim or not palavras:
        return zooms
    eventos = sorted([z["i"] for z in zooms] + [z["f"] for z in zooms] + [c["f"] for c in cortes])
    novos, ultimo = [], palavras[0]["i"]
    for w in palavras:
        perto = [e for e in eventos if ultimo < e <= w["i"]]
        if perto:
            ultimo = perto[-1]
        if w["i"] - ultimo >= lim:
            fim = min(duracao, w["i"] + lim * 0.8)
            novos.append({"id": zid(), "i": round(w["i"], 3), "f": round(fim, 3), "escala": 1.08, "seco": True})
            ultimo = fim
    return zooms + novos


def zid():
    return "auto-z" + uuid.uuid4().hex[:6]  # "auto-": feito pelo estilo (a IA pode substituir)


def efeitos_do_estilo(estilo, palavras, duracao, cortes):
    """O que cada estilo pronto faz sozinho (sem IA). Devolve {'zooms': [...], 'titulos': [...]}."""
    ef = {}
    trechos = trechos_mantidos(duracao, cortes)
    alternar = lambda esc: [{"id": zid(), "i": round(i, 3), "f": round(f, 3), "escala": esc, "seco": True}
                            for k, (i, f) in enumerate(trechos) if k % 2 == 1]
    if estilo == "impacto":
        # punch-in nas palavras fortes + enquadramento alternado a cada corte (jump cut "escondido")
        ef["zooms"] = zooms_nos_destaques(palavras) + alternar(1.1)
    elif estilo == "cortes-rapidos":
        # jump cut: o enquadramento alterna (normal / mais perto) a cada trecho que sobrou
        ef["zooms"] = alternar(1.14)
    elif estilo == "documentario":
        # aproximação lenta e contínua, em janelas de ~7 s
        zs, t = [], 0.0
        while t < duracao - 1:
            zs.append({"id": zid(), "i": round(t, 3), "f": round(min(duracao, t + 7), 3), "escala": 1.1, "suave": True})
            t += 7
        ef["zooms"] = zs
    elif estilo in ("tutorial", "podcast"):
        ef["zooms"] = alternar(1.08 if estilo == "tutorial" else 1.06)
    if estilo == "noticia":
        ef["zooms"] = alternar(1.08)
    if estilo == "noticia" and palavras:
        ini = palavras[0]["i"]
        ef["titulos"] = [{"id": "auto-t" + uuid.uuid4().hex[:6], "texto": "ÚLTIMAS NOTÍCIAS", "i": round(ini, 3), "f": round(ini + 3, 3), "posicao": 12, "cor": "vermelho"}]
    ef["zooms"] = completar_ritmo(estilo, palavras, duracao, cortes, ef.get("zooms", []))
    return ef


# a cada quantas palavras, no máximo, uma fica destacada (None = sem destaque automático)
DESTAQUE_A_CADA = {"impacto": 3, "cortes-rapidos": 4, "noticia": 5, "tutorial": 5, "podcast": 6, "documentario": None}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--original", required=True)
    ap.add_argument("--projeto", required=True)
    ap.add_argument("--fonte", required=True)
    ap.add_argument("--previa", required=True)
    ap.add_argument("--saida", required=True)
    ap.add_argument("--modelo", default="medium")
    ap.add_argument("--simular", help="JSON com palavras (pula o whisper)")
    a = ap.parse_args()

    projeto = json.load(open(a.projeto, encoding="utf-8"))
    proc = projeto.get("processamento") or {}
    os.makedirs(os.path.dirname(a.fonte) or ".", exist_ok=True)
    os.makedirs(os.path.dirname(a.previa) or ".", exist_ok=True)

    print("== Normalizando vídeo (tratamento de voz e imagem)", flush=True)
    _, _, _, tem_audio_orig = ffprobe(a.original)
    normalizar_video(a.original, a.fonte, a.previa, tratar_audio=proc.get("tratarAudio", True),
                     melhorar_imagem=proc.get("melhorarImagem", True), tem_audio=tem_audio_orig)
    duracao, largura, altura, tem_audio = ffprobe(a.fonte)
    print(f"   {largura}x{altura}, {duracao:.1f}s, áudio: {tem_audio}")
    print("== Auto-enquadramento (rosto)", flush=True)
    foco = rastrear_rosto(a.fonte, duracao) if proc.get("seguirRosto", True) else []

    palavras = []
    if a.simular:
        palavras = json.load(open(a.simular, encoding="utf-8"))
    elif tem_audio:
        print(f"== Transcrevendo (faster-whisper {a.modelo})", flush=True)
        palavras = transcrever(a.fonte, a.modelo, proc.get("idioma", "pt"))
    palavras = limpar(palavras)

    estilo = projeto.get("estilo", "impacto")
    if DESTAQUE_A_CADA.get(estilo):
        destacar(palavras, DESTAQUE_A_CADA[estilo])
    cortes = []
    if proc.get("cortarPausas", True):
        cortes = cortes_de_pausas(palavras, duracao, float(proc.get("limitePausa", 0.5)))

    resultado = {
        "video": {"duracao": round(duracao, 3), "largura": largura, "altura": altura, "previa": os.path.basename(a.previa), "foco": foco},
        "palavras": palavras,
        "cortes": cortes,
    }
    ef = efeitos_do_estilo(estilo, palavras, duracao, cortes)
    if ef:
        resultado["efeitos"] = ef
    json.dump(resultado, open(a.saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    final = duracao - sum(c["f"] - c["i"] for c in cortes)
    print(f"== Pronto: {len(palavras)} palavras, {len(cortes)} cortes ({duracao:.1f}s → {final:.1f}s)")


if __name__ == "__main__":
    sys.exit(main())
