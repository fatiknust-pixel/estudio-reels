#!/usr/bin/env python3
"""Gera a trilha e os efeitos sonoros do vídeo por síntese (numpy), sem direitos autorais.

A trilha é montada em cima da linha do tempo (src/gerado/narracao.json): introdução tensa
até a cena "revelacao", "drop" com batida completa a partir dela, e encerramento suave na cena
"final". Rode depois de gerar_audio.py.

Uso: python3 scripts/gerar_sons.py
"""
import json, os, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PASTA = os.path.join(RAIZ, "public", "sfx")
SR = 44100
rng = np.random.default_rng(7)


# ---------- blocos básicos ----------
def t(d):
    return np.arange(int(d * SR)) / SR


def filtro(x, tipo, f, ordem=2):
    if isinstance(f, (list, tuple)):
        f = [min(v, SR / 2 - 100) for v in f]
    else:
        f = min(f, SR / 2 - 100)
    return sosfilt(butter(ordem, f, btype=tipo, fs=SR, output="sos"), x)


def env(n, a=0.005, d=0.2, curva=4.0):
    """Ataque linear + decaimento exponencial."""
    tt = np.arange(n) / SR
    e = np.minimum(1, tt / max(a, 1e-4)) * np.exp(-np.maximum(0, tt - a) * curva / max(d, 1e-3))
    return e


def ruido(d, cor="white"):
    n = rng.standard_normal(int(d * SR))
    if cor == "pink":
        n = filtro(n, "lowpass", 2500, 1) * 2
    return n


def saw(f, tt, voices=1, det=0.12):
    out = np.zeros_like(tt)
    for k in range(voices):
        df = f * (1 + det * (k - (voices - 1) / 2) / 100) if voices > 1 else f
        ph = rng.random()
        out += 2 * ((tt * df + ph) % 1) - 1
    return out / voices


def hz(nota):
    """'A2' -> Hz"""
    nomes = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    n, o = nota[:-1], int(nota[-1])
    return 440 * 2 ** ((nomes[n] + (o - 4) * 12) / 12)


def eco(x, atraso, fb=0.35, mix=0.3, vezes=4):
    out = x.copy()
    k = int(atraso * SR)
    g = mix
    for i in range(1, vezes + 1):
        if k * i >= len(x):
            break
        out[k * i:] += x[:-k * i] * g
        g *= fb
    return out


def reverb(x, tam=1.2, mix=0.25):
    """Reverb simples por convolução com ruído decaindo."""
    n = int(tam * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5 / tam)
    ir = filtro(ir, "lowpass", 5000, 1)
    ir /= np.sqrt(np.sum(ir ** 2))
    from scipy.signal import fftconvolve
    molhado = fftconvolve(x, ir)[: len(x) + n]
    seco = np.concatenate([x, np.zeros(len(molhado) - len(x))])
    return seco * (1 - mix) + molhado * mix


def salvar(nome, x, pico=0.9, mp3=True):
    x = np.asarray(x, dtype=np.float64)
    m = np.max(np.abs(x)) or 1
    x = x / m * pico
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    destino = os.path.join(PASTA, nome + (".mp3" if mp3 else ".wav"))
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wavfile.write(tmp.name, SR, (x * 32767).astype(np.int16))
        if mp3:
            subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-b:a", "192k", destino])
        else:
            os.replace(tmp.name, destino)
    if os.path.exists(tmp.name):
        os.unlink(tmp.name)
    print("✓", os.path.relpath(destino, RAIZ))


# ---------- efeitos sonoros ----------
def whoosh(d=0.55, sobe=True):
    n = ruido(d, "pink")
    tt = t(d)
    fc = np.where(sobe, 300 + 5000 * (tt / d) ** 1.5, 5300 - 5000 * (tt / d) ** 0.7)
    # filtro passa-banda variável aproximado por blocos
    out = np.zeros_like(n)
    bloco = 512
    for i in range(0, len(n), bloco):
        f = float(fc[min(i, len(fc) - 1)])
        out[i:i + bloco] = filtro(n[max(0, i - 2048):i + bloco], "bandpass", [max(80, f * 0.6), f * 1.6])[-len(n[i:i + bloco]):]
    forma = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.4
    return reverb(out * forma, 0.6, 0.2)


def impacto():
    d = 1.8
    tt = t(d)
    f = 40 + 90 * np.exp(-tt * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.9, 3.5)
    estalo = filtro(ruido(d), "lowpass", 3500) * env(len(tt), 0.001, 0.08, 6)
    corpo = filtro(ruido(d, "pink"), "lowpass", 600) * env(len(tt), 0.002, 0.5, 4) * 0.6
    return reverb(np.tanh((sub * 1.4 + estalo * 0.8 + corpo) * 1.3), 1.6, 0.3)


def subida(d=2.0):
    tt = t(d)
    n = ruido(d, "pink")
    out = np.zeros_like(n)
    bloco = 1024
    for i in range(0, len(n), bloco):
        f = 400 + 7000 * (i / len(n)) ** 2
        out[i:i + bloco] = filtro(n[max(0, i - 2048):i + bloco], "bandpass", [f * 0.7, f * 1.4])[-len(n[i:i + bloco]):]
    tom = np.sin(2 * np.pi * np.cumsum(220 + 660 * (tt / d) ** 2) / SR) * 0.25
    forma = (tt / d) ** 2.2
    return (out + tom) * forma


def clique():
    d = 0.06
    x = filtro(ruido(d), "bandpass", [1800, 6000]) * env(int(d * SR), 0.0005, 0.012, 5)
    x += np.sin(2 * np.pi * 2400 * t(d)) * env(int(d * SR), 0.0005, 0.01, 6) * 0.5
    return x


def tecla():
    d = 0.05
    return filtro(ruido(d), "bandpass", [2500, 7000]) * env(int(d * SR), 0.0005, 0.01, 6)


def bipe():
    a = np.sin(2 * np.pi * 1760 * t(0.07)) * env(int(0.07 * SR), 0.002, 0.06, 2)
    b = np.sin(2 * np.pi * 2637 * t(0.16)) * env(int(0.16 * SR), 0.002, 0.14, 3)
    return eco(np.concatenate([a, np.zeros(int(0.03 * SR)), b, np.zeros(int(0.3 * SR))]), 0.09, 0.3, 0.2)


def sucesso():
    notas = ["E5", "G#5", "B5", "E6"]
    x = np.zeros(int(1.4 * SR))
    for i, nt in enumerate(notas):
        d = 1.4 - i * 0.07
        tt = t(d)
        tom = (np.sin(2 * np.pi * hz(nt) * tt) + 0.3 * np.sin(4 * np.pi * hz(nt) * tt)) * env(len(tt), 0.003, 0.5, 4)
        k = int(i * 0.07 * SR)
        L = min(len(tom), len(x) - k)
        x[k:k + L] += tom[:L]
    return reverb(x, 1.0, 0.25)


def pop():
    d = 0.12
    tt = t(d)
    f = 1100 * np.exp(-tt * 18) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, 0.05, 4)


def glitch():
    d = 0.35
    x = np.zeros(int(d * SR))
    for k in range(7):
        i = int(rng.random() * (len(x) - 2500))
        L = int(rng.integers(600, 2500))
        seg = np.sign(np.sin(2 * np.pi * rng.uniform(150, 900) * t(L / SR))) * 0.6
        seg += filtro(ruido(L / SR), "highpass", 3000) * 0.4
        x[i:i + L] += seg
    return np.tanh(x * 1.5) * 0.8


def tique():
    d = 0.03
    return np.sin(2 * np.pi * 3200 * t(d)) * env(int(d * SR), 0.0005, 0.008, 6)


def swoosh_curto():
    return whoosh(0.3, True)


# ---------- trilha ----------
def trilha(lt):
    bpm = lt["bpm"]
    beat = 60 / bpm
    fps = lt["fps"]
    total = lt["total"] / fps + 2.5
    c = lt["cenas"]
    drop = c["revelacao"]["inicio"] / fps
    fim = c["final"]["inicio"] / fps
    n = int(total * SR)
    mix = np.zeros(n)
    kick_bus = np.zeros(n)  # para o "sidechain"
    pad_bus = np.zeros(n)
    bass_bus = np.zeros(n)
    perc = np.zeros(n)
    arp_bus = np.zeros(n)

    # progressão: Am - F - C - G (1 compasso cada)
    acordes = [["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["G3", "B3", "D4"]]
    baixos = ["A1", "F1", "C2", "G1"]
    compasso = beat * 4

    def put(bus, x, s):
        i = int(s * SR)
        if i >= n:
            return
        L = min(len(x), n - i)
        bus[i:i + L] += x[:L]

    # kick
    dk = 0.45
    tk = t(dk)
    kick = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-tk * 30)) / SR) * env(len(tk), 0.001, 0.35, 4)
    kick += filtro(ruido(dk), "lowpass", 4000) * env(len(tk), 0.0005, 0.01, 6) * 0.4
    clap = filtro(ruido(0.25), "bandpass", [900, 4500]) * env(int(0.25 * SR), 0.001, 0.12, 5)
    clap = reverb(clap, 0.5, 0.3)
    hat = filtro(ruido(0.05), "highpass", 7000) * env(int(0.05 * SR), 0.0005, 0.02, 6)

    nb = int(total / beat) + 1
    for b in range(nb):
        s = b * beat
        bar = int(s // compasso)
        ac = acordes[bar % 4]
        intro = s < drop
        outro = s >= fim
        # bateria
        if not intro and not outro:
            put(kick_bus, kick, s)
            if b % 2 == 1:
                put(perc, clap * 0.55, s)
            put(perc, hat * 0.35, s + beat / 2)
            put(perc, hat * 0.18, s + beat / 4 * 3)
        elif intro and s > drop - compasso * 2:
            # rufar acelerando antes do drop
            pass
        elif intro:
            put(perc, hat * 0.22, s + beat / 2)
            if b % 4 == 0:
                put(kick_bus, kick * 0.55, s)
        # baixo em colcheias
        if not outro and (not intro or s > drop - compasso * 4):
            f = hz(baixos[bar % 4])
            for k in range(2):
                d = beat / 2 * 0.9
                tt = t(d)
                x = saw(f, tt, 2, 8) * env(len(tt), 0.004, 0.25, 2.5)
                x = filtro(x, "lowpass", 380 if intro else 650) + np.sin(2 * np.pi * f * tt) * env(len(tt), 0.004, 0.3, 2) * 0.8
                put(bass_bus, x * (0.5 if intro else 0.85), s + k * beat / 2)
        # arpejo em semicolcheias
        if b % 1 == 0:
            for k in range(4):
                nt = ac[(b * 4 + k) % 3]
                f = hz(nt) * (2 if k % 2 else 1)
                d = 0.22
                tt = t(d)
                x = (saw(f, tt) * 0.5 + np.sin(2 * np.pi * f * tt)) * env(len(tt), 0.002, 0.12, 4)
                corte = 1200 if intro else 3200
                if outro:
                    corte = 900
                put(arp_bus, filtro(x, "lowpass", corte) * 0.32, s + k * beat / 4)

    # pad (um por compasso)
    nbar = int(total / compasso) + 1
    for bar in range(nbar):
        s = bar * compasso
        ac = acordes[bar % 4]
        d = compasso + 0.6
        tt = t(d)
        x = sum(saw(hz(nt), tt, 3, 14) for nt in ac) / 3
        x = filtro(x, "lowpass", 900 if s < drop else 1800)
        e = np.minimum(1, tt / 0.35) * np.minimum(1, np.maximum(0, (d - tt) / 0.6))
        put(pad_bus, x * e * 0.42, s)

    # subida e impacto no drop, impacto final
    put(mix, subida(compasso * 1.0) * 0.5, drop - compasso * 1.0)
    put(mix, impacto() * 0.9, drop)
    put(mix, impacto() * 0.6, fim)
    # acorde final sustentado
    d = 5.0
    tt = t(d)
    final = sum(saw(hz(nt), tt, 3, 12) for nt in ["A2", "E3", "A3", "C4", "E4"]) / 5
    final = filtro(final, "lowpass", 1400) * np.minimum(1, tt / 0.05) * np.exp(-tt * 0.7)
    put(mix, reverb(final, 2.0, 0.35)[: int(d * SR)] * 0.5, fim)

    # sidechain: abaixa pad/baixo/arpejo a cada kick
    sc = np.ones(n)
    kk = np.abs(kick_bus)
    envk = filtro(kk, "lowpass", 12, 1)
    envk = envk / (envk.max() or 1)
    sc = 1 - 0.65 * np.clip(envk * 3, 0, 1)

    mix += kick_bus * 0.95 + perc * 0.8 + (pad_bus * 0.9 + bass_bus + eco(arp_bus, beat * 0.75, 0.35, 0.3)) * sc
    # fade de entrada e saída
    mix *= np.minimum(1, np.arange(n) / (0.4 * SR))
    fim_s = lt["total"] / fps
    cauda = np.clip((fim_s + 1.5 - np.arange(n) / SR) / 1.5, 0, 1)
    mix *= np.where(np.arange(n) / SR > fim_s, cauda, 1)
    mix = np.tanh(mix * 1.1)
    # leve abertura estéreo no arpejo/pad
    esq = mix + eco(arp_bus * sc, 0.011, 0, 0.12, 1) * 0.15
    dir_ = mix - eco(arp_bus * sc, 0.017, 0, 0.12, 1) * 0.15
    return np.stack([esq, dir_], 1)


def main():
    os.makedirs(PASTA, exist_ok=True)
    salvar("whoosh", whoosh(0.55, True), 0.8)
    salvar("whoosh-desce", whoosh(0.55, False), 0.8)
    salvar("swoosh", swoosh_curto(), 0.7)
    salvar("impacto", impacto(), 0.95)
    salvar("subida", subida(2.0), 0.8)
    salvar("clique", clique(), 0.6)
    salvar("tecla", tecla(), 0.5)
    salvar("bipe", bipe(), 0.6)
    salvar("sucesso", sucesso(), 0.7)
    salvar("pop", pop(), 0.6)
    salvar("glitch", glitch(), 0.6)
    salvar("tique", tique(), 0.4)
    lt = json.load(open(os.path.join(RAIZ, "src", "gerado", "narracao.json"), encoding="utf-8"))
    salvar("trilha", trilha(lt), 0.89)


if __name__ == "__main__":
    main()
