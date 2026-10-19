#!/usr/bin/env python3
"""Gera a narração de cada cena, o tempo de cada palavra (legenda) e a linha do tempo do vídeo.

Só regenera as cenas cujo texto ou voz mudou (cache por hash).

Motores:
  edge   -> vozes neurais da Microsoft (pt-BR-AntonioNeural). Mais natural. (pip install edge-tts)
  kokoro -> modelo local/offline (pip install kokoro-onnx soundfile). Tempo das palavras estimado.

A linha do tempo (início e duração de cada cena, em quadros) é calculada aqui e salva em
src/gerado/narracao.json. O vídeo (Remotion) e a trilha (gerar_sons.py) leem esse arquivo,
então os cortes caem sempre na batida da música.

Uso:
  python3 scripts/gerar_audio.py                          # motor edge
  python3 scripts/gerar_audio.py --motor kokoro --modelo PASTA_COM_MODELO
  python3 scripts/gerar_audio.py --motor voicestudio     # VoiceStudio (OmniVoice), precisa do repositório no PYTHONPATH
  python3 scripts/gerar_audio.py --forcar revelacao       # refaz só a cena 'revelacao'
"""
import argparse, asyncio, hashlib, json, math, os, re, subprocess, tempfile

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROTEIRO = os.path.join(RAIZ, "conteudo", "roteiro.json")
SAIDA = os.path.join(RAIZ, "src", "gerado", "narracao.json")

FPS = 30
TRANSICAO = 15  # quadros de sobreposição entre cenas (1 batida a 120 BPM)
ENTRADA = 0.3   # segundos entre o início da cena e o começo da fala
SOBRA = 0.12    # segundos depois que a fala termina


def duracao(arquivo):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "default=nw=1:nk=1", arquivo])
    return float(out.strip())


async def via_edge(texto, voz, velocidade, destino):
    import edge_tts
    kwargs = {"rate": velocidade, "boundary": "WordBoundary"}
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


def via_kokoro(texto, voz, velocidade, destino, modelo):
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    global _KOKORO
    if "_KOKORO" not in globals():
        _KOKORO = Kokoro(os.path.join(modelo, "kokoro-v1.0.onnx"), os.path.join(modelo, "voices-v1.0.bin"))
    frases = [f for f in re.split(r"(?<=[.!?:])\s+", texto.strip()) if f]
    pedacos, palavras, t, sr = [], [], 0.0, 24000
    for frase in frases:
        audio, sr = _KOKORO.create(frase, voice=voz, speed=velocidade, lang="pt-br")
        idx = np.where(np.abs(audio) > 0.01)[0]
        if len(idx):
            audio = audio[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.05 * sr)]
        dur = len(audio) / sr
        toks = frase.split()
        pesos = [len(re.sub(r"\W", "", w)) + 2 + (3 if re.search(r"[,.;:!?]$", w) else 0) for w in toks]
        total, acc = sum(pesos), 0.0
        for w, peso in zip(toks, pesos):
            ini = t + dur * acc / total
            acc += peso
            palavras.append({"p": re.sub(r"[,.;:!?]+$", "", w), "i": round(ini, 3), "f": round(t + dur * acc / total, 3)})
        pausa = np.zeros(int(sr * (0.26 if frase[-1] in ".!?" else 0.14)), dtype=audio.dtype)
        pedacos += [audio, pausa]
        t += dur + len(pausa) / sr
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, np.concatenate(pedacos), sr)
        subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-b:a", "160k", destino])
        os.unlink(tmp.name)
    return palavras


def linha_do_tempo(roteiro, cenas):
    """Duração de cada cena arredondada para a batida, para os cortes caírem no ritmo."""
    passo = round(FPS * 60 / roteiro.get("bpm", 120))
    inicio = 0
    for c in roteiro["cenas"]:
        info = cenas[c["id"]]
        # usa o fim da última palavra (o arquivo de áudio costuma ter silêncio no final)
        fala = info["palavras"][-1]["f"] if info["palavras"] else info["duracao"]
        precisa = (ENTRADA + fala + SOBRA + c.get("extra", 0)) * FPS + TRANSICAO
        quadros = int(math.ceil(precisa / passo) * passo)
        info.update({"inicio": inicio, "quadros": quadros, "falaEm": round(ENTRADA * FPS)})
        inicio += quadros - TRANSICAO
    return inicio + TRANSICAO


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--motor", default=os.environ.get("MOTOR_TTS", "edge"), choices=["edge", "kokoro", "voicestudio"])
    ap.add_argument("--modelo", default=os.environ.get("KOKORO_MODELO", "modelos/kokoro"))
    ap.add_argument("--forcar", nargs="*", help="ids de cenas para refazer (vazio = todas)")
    a = ap.parse_args()

    roteiro = json.load(open(ROTEIRO, encoding="utf-8"))
    voz = roteiro["voz"]
    os.makedirs(os.path.join(RAIZ, "public", "audio"), exist_ok=True)
    anterior = json.load(open(SAIDA, encoding="utf-8")) if os.path.exists(SAIDA) else {"cenas": {}}

    if a.motor == "edge":
        voz_id, vel = voz["edge"], voz.get("velocidade", "+0%")
    elif a.motor == "voicestudio":
        vs = voz["voicestudio"]
        voz_id, vel = "voicestudio:" + vs.get("instrucao", ""), vs.get("velocidade", 1.0)
    else:
        voz_id, vel = voz["kokoro"], voz.get("kokoroVelocidade", 1.0)

    cenas = {}
    for cena in roteiro["cenas"]:
        cid, texto = cena["id"], cena["texto"]
        h = hashlib.sha1(f"{a.motor}|{voz_id}|{vel}|{texto}".encode()).hexdigest()[:12]
        arq = f"audio/{cid}.mp3"
        dest = os.path.join(RAIZ, "public", arq)
        velho = anterior["cenas"].get(cid)
        refazer = a.forcar is not None and (len(a.forcar) == 0 or cid in a.forcar)
        if velho and velho.get("hash") == h and os.path.exists(dest) and not refazer:
            cenas[cid] = {k: velho[k] for k in ("hash", "audio", "duracao", "palavras")}
            print(f"= {cid} (sem mudanças)")
            continue
        print(f"♪ {cid} …", flush=True)
        if a.motor == "edge":
            palavras = asyncio.run(via_edge(texto, voz_id, vel, dest))
        elif a.motor == "voicestudio":
            import voz_voicestudio
            palavras = voz_voicestudio.gerar(texto, dest, voz["voicestudio"])
        else:
            palavras = via_kokoro(texto, voz_id, float(vel), dest, a.modelo)
        cenas[cid] = {"hash": h, "audio": arq, "duracao": round(duracao(dest), 3), "palavras": palavras}

    total = linha_do_tempo(roteiro, cenas)
    saida = {"motor": a.motor, "voz": voz_id, "fps": FPS, "transicao": TRANSICAO,
             "bpm": roteiro.get("bpm", 120), "total": total, "cenas": cenas}
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print(f"✓ {SAIDA} · {total} quadros ({total / FPS:.1f} s)")


if __name__ == "__main__":
    main()
