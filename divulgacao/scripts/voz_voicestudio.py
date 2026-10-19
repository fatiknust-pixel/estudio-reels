"""Narração com o VoiceStudio (github.com/debpalash/VoiceStudio, motor OmniVoice, Apache-2.0).

1. Na primeira vez, cria uma voz pelo "voice design" (descrição em `voz.voicestudio.instrucao`)
   e salva uma amostra em voz/referencia.wav + voz/referencia.txt. Essa amostra entra no repositório,
   então a voz fica igual em todas as cenas e em todas as execuções.
2. Cada cena é gerada clonando essa amostra.
3. O Whisper (faster-whisper) transcreve o resultado: dá o tempo de cada palavra para a legenda e
   confere se a fala saiu certa. Se sair muito diferente do texto, gera de novo com outra semente.

Precisa do VoiceStudio no PYTHONPATH (o workflow clona o repositório) e roda em CPU.
"""
import difflib, os, re, subprocess, tempfile, unicodedata

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PASTA_VOZ = os.path.join(RAIZ, "voz")
TEXTO_REFERENCIA = (
    "Olá! Hoje eu vou te mostrar uma ferramenta que transforma uma ideia em vídeo em poucos minutos. "
    "É simples, é rápido, e o resultado impressiona."
)

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
    segs, _ = _whisper.transcribe(wav, language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
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


def _referencia(instrucao):
    os.makedirs(PASTA_VOZ, exist_ok=True)
    wav = os.path.join(PASTA_VOZ, "referencia.wav")
    txt = os.path.join(PASTA_VOZ, "referencia.txt")
    if not (os.path.exists(wav) and os.path.exists(txt)):
        import torch
        torch.manual_seed(int(os.environ.get("VOZ_SEMENTE", "7")))
        print(f"  criando a voz pelo voice design: {instrucao}", flush=True)
        audio = _modelo.generate(text=TEXTO_REFERENCIA, language="pt", instruct=instrucao)[0]
        _salvar(audio, wav)
        with open(txt, "w", encoding="utf-8") as f:
            f.write(TEXTO_REFERENCIA + "\n")
    return wav, open(txt, encoding="utf-8").read().strip()


def gerar(texto, destino_mp3, config):
    """Gera a narração de uma cena. Devolve a lista de palavras com tempo."""
    import torch
    _carregar()
    ref_wav, ref_txt = _referencia(config.get("instrucao", "male, young adult, low pitch"))
    melhor = None
    for tentativa in range(3):
        torch.manual_seed(1000 + tentativa)
        audio = _modelo.generate(
            text=texto, language="pt", ref_audio=ref_wav, ref_text=ref_txt, speed=float(config.get("velocidade", 1.0))
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
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", destino_mp3])
    os.unlink(wav)
    return palavras
