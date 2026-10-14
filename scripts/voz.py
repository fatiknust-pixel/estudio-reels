#!/usr/bin/env python3
"""Narração das cenas (Modo 1) com edge-tts + tempo de cada palavra (para a legenda).

Trabalha sobre um projeto.json: só gera as cenas cujo texto/voz mudou (cache por hash) e grava
os áudios ao lado, em audio/<cena>-<hash>.mp3 (nome novo a cada mudança, então o app nunca usa
áudio velho do cache). Atualiza o campo "narracao" do próprio projeto.json.

Uso: python3 scripts/voz.py <pasta-ou-projeto.json> [--midia PASTA] [--forcar]
  --midia: onde ficam audio/ (padrão: a pasta do projeto.json)
"""
import argparse, asyncio, hashlib, json, os, subprocess, sys, time


def duracao(arquivo):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", arquivo])
    return float(out.strip())


async def via_edge(texto, voz, velocidade, destino):
    import edge_tts
    kwargs = {"rate": velocidade}
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
    voz_id, vel = voz.get("edge", "pt-BR-AntonioNeural"), voz.get("velocidade", "+5%")
    anterior = p.get("narracao") or {}
    nova = {}
    os.makedirs(os.path.join(midia, "audio"), exist_ok=True)
    for cena in p.get("cenas", []):
        cid, texto = cena["id"], cena["texto"].strip()
        h = hashlib.sha1(f"edge|{voz_id}|{vel}|{texto}".encode()).hexdigest()[:10]
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
                palavras = asyncio.run(via_edge(texto, voz_id, vel, dest))
                if not palavras:
                    raise RuntimeError("edge-tts não devolveu o tempo das palavras")
                break
            except Exception as e:
                if tentativa == 3:
                    raise
                print(f"  tentativa {tentativa + 1} falhou ({e}); de novo…", flush=True)
                time.sleep(3 * (tentativa + 1))
        nova[cid] = {"hash": h, "texto": texto, "audio": rel, "duracao": round(duracao(dest), 3), "palavras": palavras}
    p["narracao"] = nova
    json.dump(p, open(arq, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total = sum(n["duracao"] for n in nova.values())
    print(f"Narração pronta: {total:.1f}s em {len(nova)} cenas")


if __name__ == "__main__":
    sys.exit(main())
