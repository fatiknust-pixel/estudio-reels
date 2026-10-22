#!/usr/bin/env python3
"""Mede cada foto de um projeto.json do Modo 1 e acha o ponto que não pode ser cortado.

Grava em projeto["imagens"][chave]:
  largura, altura  tamanho da foto
  rostos           quantos rostos foram achados (OpenCV, Haar)
  foco {x, y}      centro do assunto em % da foto (0–100): o rosto, ou, sem rosto, o ponto de maior detalhe

O vídeo usa isso para enquadrar (src/foto.ts): corta pelo foco quando perde pouco da foto e,
quando a foto não combina com o quadro, mostra ela inteira sobre um fundo desfocado.

Uso: python3 scripts/enquadrar.py <projeto.json> [--midia PASTA] [--forcar]
Só mede o que ainda não foi medido (ou tudo, com --forcar). Sem OpenCV, avisa e segue sem medir.
"""
import argparse, json, os, sys


def achar_foco(cv2, np, caminho):
    img = cv2.imread(caminho, cv2.IMREAD_COLOR)
    if img is None:
        return None
    alt, larg = img.shape[:2]
    escala = min(1.0, 900 / max(larg, alt))
    mini = cv2.resize(img, (max(1, int(larg * escala)), max(1, int(alt * escala)))) if escala < 1 else img
    ma, ml = mini.shape[:2]
    cinza = cv2.equalizeHist(cv2.cvtColor(mini, cv2.COLOR_BGR2GRAY))

    # rostos: de frente e de perfil; vale o maior e os de tamanho parecido
    caixas = []
    minimo = (max(24, ml // 14), max(24, ma // 14))
    cru = cv2.cvtColor(mini, cv2.COLOR_BGR2GRAY)
    for nome, vizinhos, imagens in (("haarcascade_frontalface_default.xml", 5, (cinza, cru)), ("haarcascade_profileface.xml", 6, (cinza,))):
        det = cv2.CascadeClassifier(cv2.data.haarcascades + nome)
        for g in imagens:
            achados = det.detectMultiScale(g, scaleFactor=1.1, minNeighbors=vizinhos, minSize=minimo)
            caixas += [tuple(int(v) for v in c) for c in achados]
    if caixas:
        maior = max(w * h for (_, _, w, h) in caixas)
        uteis = [c for c in caixas if c[2] * c[3] >= maior * 0.35]
        x0 = min(c[0] for c in uteis); y0 = min(c[1] for c in uteis)
        x1 = max(c[0] + c[2] for c in uteis); y1 = max(c[1] + c[3] for c in uteis)
        return {"largura": larg, "altura": alt, "rostos": len(uteis), "foco": {"x": round((x0 + x1) / 2 / ml * 100, 1), "y": round((y0 + y1) / 2 / ma * 100, 1)}}

    # sem rosto: onde há mais detalhe (bordas), com preferência leve pelo centro
    gx = cv2.Sobel(cinza, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(cinza, cv2.CV_32F, 0, 1, ksize=3)
    mapa = cv2.GaussianBlur(cv2.magnitude(gx, gy), (0, 0), max(ml, ma) / 14)
    yy, xx = np.mgrid[0:ma, 0:ml]
    centro = np.exp(-(((xx - ml / 2) / (ml * 0.55)) ** 2 + ((yy - ma / 2) / (ma * 0.55)) ** 2))
    _, _, _, pico = cv2.minMaxLoc((mapa * centro).astype(np.float32))
    fx = min(80, max(20, pico[0] / ml * 100))
    fy = min(80, max(20, pico[1] / ma * 100))
    return {"largura": larg, "altura": alt, "rostos": 0, "foco": {"x": round(fx, 1), "y": round(fy, 1)}}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--midia")
    ap.add_argument("--forcar", action="store_true")
    a = ap.parse_args()
    try:
        import cv2, numpy as np
    except ImportError:
        print("! OpenCV não instalado — fotos sem medida (o vídeo enquadra como antes)")
        return 0
    midia = a.midia or os.path.dirname(a.projeto)
    p = json.load(open(a.projeto, encoding="utf-8"))
    n = 0
    for chave, info in (p.get("imagens") or {}).items():
        arq = info.get("arquivo")
        if not arq or not os.path.exists(os.path.join(midia, arq)):
            continue
        if info.get("foco") and info.get("largura") and not a.forcar:
            continue
        r = achar_foco(cv2, np, os.path.join(midia, arq))
        if not r:
            print(f"! {chave}: não consegui abrir a foto")
            continue
        info.update(r)
        n += 1
        print(f"✓ {chave}: {r['largura']}x{r['altura']}, {r['rostos']} rosto(s), foco {r['foco']['x']}% {r['foco']['y']}%")
    json.dump(p, open(a.projeto, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(a.projeto, "a", encoding="utf-8").write("\n")
    print(f"{n} foto(s) medida(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
