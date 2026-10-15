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


def normalizar_video(original, fonte, previa):
    # o ffmpeg já aplica a rotação do celular (autorotate), então largura/altura saem certas
    ffmpeg("-i", original,
           "-vf", "scale=w='min(iw,1920)':h='min(ih,1920)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30,format=yuv420p",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
           "-movflags", "+faststart", fonte)
    ffmpeg("-i", fonte,
           "-vf", "scale=w='min(iw,960)':h='min(ih,960)':force_original_aspect_ratio=decrease:force_divisible_by=2",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-g", "15", "-c:a", "aac", "-b:a", "96k",
           "-movflags", "+faststart", previa)


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


def zid():
    return "auto-z" + uuid.uuid4().hex[:6]  # "auto-": feito pelo estilo (a IA pode substituir)


def efeitos_do_estilo(estilo, palavras, duracao, cortes):
    """O que cada estilo pronto faz sozinho (sem IA). Devolve {'zooms': [...], 'titulos': [...]}."""
    ef = {}
    if estilo == "impacto":
        ef["zooms"] = zooms_nos_destaques(palavras)
    elif estilo == "cortes-rapidos":
        # jump cut: o enquadramento alterna (normal / mais perto) a cada trecho que sobrou
        ef["zooms"] = [{"id": zid(), "i": round(i, 3), "f": round(f, 3), "escala": 1.14, "seco": True}
                       for k, (i, f) in enumerate(trechos_mantidos(duracao, cortes)) if k % 2 == 1]
    elif estilo == "documentario":
        # aproximação lenta e contínua, em janelas de ~7 s
        zs, t = [], 0.0
        while t < duracao - 1:
            zs.append({"id": zid(), "i": round(t, 3), "f": round(min(duracao, t + 7), 3), "escala": 1.1, "suave": True})
            t += 7
        ef["zooms"] = zs
    elif estilo == "noticia" and palavras:
        ini = palavras[0]["i"]
        ef["titulos"] = [{"id": "auto-t" + uuid.uuid4().hex[:6], "texto": "ÚLTIMAS NOTÍCIAS", "i": round(ini, 3), "f": round(ini + 3, 3), "posicao": 12, "cor": "vermelho"}]
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

    print("== Normalizando vídeo", flush=True)
    normalizar_video(a.original, a.fonte, a.previa)
    duracao, largura, altura, tem_audio = ffprobe(a.fonte)
    print(f"   {largura}x{altura}, {duracao:.1f}s, áudio: {tem_audio}")

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
        "video": {"duracao": round(duracao, 3), "largura": largura, "altura": altura, "previa": os.path.basename(a.previa)},
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
