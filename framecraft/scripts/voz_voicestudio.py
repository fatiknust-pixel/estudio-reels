"""Narração com o VoiceStudio (github.com/debpalash/VoiceStudio, motor OmniVoice, Apache-2.0).

1. Na primeira vez, cria vozes candidatas pelo "voice design" (`voz.voicestudio.candidatas`), escolhe
   a mais clara pelo espectro (e que o Whisper entende) e salva em voz/referencia.wav + voz/referencia.txt. Essa amostra entra no repositório,
   então a voz fica igual em todas as cenas e em todas as execuções.
2. Cada cena é gerada clonando essa amostra.
3. O Whisper (faster-whisper) transcreve o resultado: dá o tempo de cada palavra para a legenda e
   confere se a fala saiu certa. Se sair muito diferente do texto, gera mais uma vez com outra semente.

Precisa do VoiceStudio no PYTHONPATH (o workflow clona o repositório) e roda em CPU.
"""
import difflib, os, re, subprocess, tempfile, unicodedata

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PASTA_VOZ = os.path.join(RAIZ, "voz")
TEXTO_REFERENCIA = (
    "Olá! Hoje eu vou te mostrar uma ferramenta que transforma uma ideia em vídeo em poucos minutos. "
    "É simples, é rápido, e o resultado impressiona."
)

# Masterização de voz (ffmpeg): tira o grave que embola, realça a faixa de clareza (3–5 kHz),
# dá brilho, controla os "s" e iguala o volume. Corrige a voz "abafada".
MASTER = ",".join([
    "highpass=f=85",
    "equalizer=f=220:t=q:w=1.0:g=-4",
    "equalizer=f=450:t=q:w=1.2:g=-2",
    "equalizer=f=3200:t=q:w=1.0:g=4",
    "equalizer=f=5000:t=q:w=1.4:g=2.5",
    "highshelf=f=9000:g=2",
    "deesser=i=0.35",
    "acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=3",
    "alimiter=limit=0.89",
])

_modelo = None
_whisper = None


def _carregar():
    global _modelo, _whisper
    if _modelo is None:
        import torch
        from omnivoice.models.omnivoice import OmniVoice
        torch.set_num_threads(os.cpu_count() or 4)
        _modelo = OmniVoice.from_pretrained(os.environ.get("OMNIVOICE_MODELO", "k2-fsa/OmniVoice"), device_map="cpu", dtype=torch.float32)
    if _whisper is None:
        from faster_whisper import WhisperModel
        _whisper = WhisperModel(os.environ.get("WHISPER_MODELO", "small"), device="cpu", compute_type="int8")
    return _modelo, _whisper


def _salvar(audio, caminho):
    import torchaudio
    torchaudio.save(caminho, audio, _modelo.sampling_rate)


def _normal(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def _transcrever(wav):
    # entrega o áudio já decodificado (16 kHz mono), sem depender do PyAV
    import soundfile as sf
    import torch, torchaudio
    dados, sr = sf.read(wav, dtype="float32", always_2d=True)
    sinal = torch.from_numpy(dados.mean(axis=1))
    if sr != 16000:
        sinal = torchaudio.functional.resample(sinal, sr, 16000)
    segs, _ = _whisper.transcribe(sinal.numpy(), language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
    return [{"p": w.word.strip(), "i": float(w.start), "f": float(w.end)} for s in segs for w in (s.words or [])]


def _alinhar(texto, ouvidas, duracao):
    """Tempo de cada palavra do roteiro, a partir das palavras ouvidas pelo Whisper."""
    roteiro = [w for w in texto.split() if _normal(w)]
    a = [_normal(w) for w in roteiro]
    b = [_normal(w["p"]) for w in ouvidas]
    tempos = [None] * len(roteiro)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for bloco in sm.get_opcodes():
        tag, i1, i2, j1, j2 = bloco
        if tag == "equal":
            for k in range(i2 - i1):
                tempos[i1 + k] = (ouvidas[j1 + k]["i"], ouvidas[j1 + k]["f"])
        elif tag == "replace" and j2 > j1:
            ini, fim = ouvidas[j1]["i"], ouvidas[j2 - 1]["f"]
            n = i2 - i1
            for k in range(n):
                tempos[i1 + k] = (ini + (fim - ini) * k / n, ini + (fim - ini) * (k + 1) / n)
    # preenche o que ficou sem tempo, entre os vizinhos conhecidos
    for k in range(len(tempos)):
        if tempos[k] is None:
            ant = next((tempos[j][1] for j in range(k - 1, -1, -1) if tempos[j]), 0.0)
            prox = next((tempos[j][0] for j in range(k + 1, len(tempos)) if tempos[j]), duracao)
            tempos[k] = (ant, max(ant + 0.05, min(prox, ant + 0.4)))
    acerto = sm.ratio()
    palavras = [{"p": re.sub(r"[,.;:!?]+$", "", w), "i": round(t[0], 3), "f": round(t[1], 3)} for w, t in zip(roteiro, tempos)]
    return palavras, acerto


def _clareza(wav):
    """Nota de clareza pelo espectro: muita energia em 1,5–5 kHz é bom; grave demais (< 250 Hz) é ruim."""
    import numpy as np, soundfile as sf
    x, sr = sf.read(wav, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    S = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    fr = np.fft.rfftfreq(len(x), 1 / sr)
    tot = S.sum() or 1.0
    banda = lambda a, b: S[(fr >= a) & (fr < b)].sum() / tot
    return 100 * (banda(1500, 5000) - 0.5 * banda(0, 250))


def _referencia(config):
    os.makedirs(PASTA_VOZ, exist_ok=True)
    wav = os.path.join(PASTA_VOZ, "referencia.wav")
    txt = os.path.join(PASTA_VOZ, "referencia.txt")
    if os.path.exists(wav) and not os.path.exists(txt):
        # amostra gravada por uma pessoa: o Whisper escreve a transcrição do trecho
        _carregar()
        ouvidas = _transcrever(wav)
        with open(txt, "w", encoding="utf-8") as f:
            f.write(" ".join(w["p"] for w in ouvidas).strip() + "\n")
        print(f"  transcrição da amostra: {open(txt, encoding='utf-8').read().strip()}", flush=True)
    if not (os.path.exists(wav) and os.path.exists(txt)):
        import json, shutil, torch
        instrucoes = config.get("candidatas") or [config.get("instrucao", "male, young adult, moderate pitch")]
        sementes = int(config.get("sementes", 2))
        notas = []
        for instr in instrucoes:
            for semente in range(1, sementes + 1):
                torch.manual_seed(semente)
                audio = _modelo.generate(text=TEXTO_REFERENCIA, language="pt", instruct=instr)[0]
                cand = os.path.join(PASTA_VOZ, f"candidata-{len(notas) + 1}.wav")
                _salvar(audio, cand)
                _, acerto = _alinhar(TEXTO_REFERENCIA, _transcrever(cand), audio.shape[-1] / _modelo.sampling_rate)
                nota = _clareza(cand)
                notas.append({"arquivo": os.path.basename(cand), "instrucao": instr, "semente": semente, "clareza": round(nota, 2), "acerto": round(acerto, 3)})
                print(f"  candidata {len(notas)}: {instr} (semente {semente}) clareza {nota:.1f}, acerto {acerto:.0%}", flush=True)
        boas = [n for n in notas if n["acerto"] >= 0.9] or notas
        escolhida = max(boas, key=lambda n: n["clareza"])
        print(f"  escolhida: {escolhida}", flush=True)
        shutil.copy(os.path.join(PASTA_VOZ, escolhida["arquivo"]), wav)
        for n in notas:
            os.unlink(os.path.join(PASTA_VOZ, n["arquivo"]))
        with open(os.path.join(PASTA_VOZ, "candidatas.json"), "w", encoding="utf-8") as f:
            json.dump({"escolhida": escolhida, "candidatas": notas}, f, ensure_ascii=False, indent=1)
        with open(txt, "w", encoding="utf-8") as f:
            f.write(TEXTO_REFERENCIA + "\n")
    return wav, open(txt, encoding="utf-8").read().strip()


def gerar(texto, destino_mp3, config):
    """Gera a narração de uma cena. Devolve a lista de palavras com tempo."""
    import torch
    _carregar()
    ref_wav, ref_txt = _referencia(config)
    melhor = None
    for tentativa in range(2):
        torch.manual_seed(1000 + tentativa)
        audio = _modelo.generate(
            text=texto, language="pt", ref_audio=ref_wav, ref_text=ref_txt, speed=float(config.get("velocidade", 1.0)),
            num_step=int(config.get("passos", 64)),
        )[0]
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            _salvar(audio, tmp.name)
            duracao = audio.shape[-1] / _modelo.sampling_rate
            palavras, acerto = _alinhar(texto, _transcrever(tmp.name), duracao)
            print(f"  tentativa {tentativa + 1}: {duracao:.1f}s, acerto da fala {acerto:.0%}", flush=True)
            if melhor is None or acerto > melhor[0]:
                if melhor:
                    os.unlink(melhor[1])
                melhor = (acerto, tmp.name, palavras)
            else:
                os.unlink(tmp.name)
        if acerto >= 0.85:
            break
    acerto, wav, palavras = melhor
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", MASTER, "-ar", "48000", "-b:a", "192k", destino_mp3])
    os.unlink(wav)
    return palavras
