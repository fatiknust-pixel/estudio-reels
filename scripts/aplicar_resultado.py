#!/usr/bin/env python3
"""Junta o resultado de uma Action ao projeto.json MAIS RECENTE (o app pode ter salvo no meio do caminho).

Uso:
  python3 scripts/aplicar_resultado.py projetos/<id>/projeto.json --resultado out/resultado.json
  python3 scripts/aplicar_resultado.py projetos/<id>/projeto.json --erro "mensagem"
"""
import argparse, datetime, json, sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--resultado")
    ap.add_argument("--erro")
    a = ap.parse_args()
    p = json.load(open(a.projeto, encoding="utf-8"))
    proc = p.setdefault("processamento", {})
    if a.erro is not None:
        p["status"] = "erro"
        proc["erro"] = a.erro[-800:]
    else:
        r = json.load(open(a.resultado, encoding="utf-8"))
        if "video" in r:
            # mantém o que o usuário escolheu no app (enquadramento, foco, volume)
            p["video"] = {**(p.get("video") or {}), **r["video"]}
        if "palavras" in r:
            p["palavras"] = r["palavras"]
        if r.get("cortes") and not p.get("cortes"):
            p["cortes"] = r["cortes"]
        for k in ("cenas", "narracao", "imagens", "titulo", "fontesPesquisa", "voz", "sugestoes"):
            if k in r:
                p[k] = r[k]
        if "efeitos" in r:
            ef = p.setdefault("efeitos", {})
            for k, v in r["efeitos"].items():
                if isinstance(v, list) and ef.get(k):
                    continue  # não apaga títulos/emojis/zooms que você já fez
                ef[k] = v
        if "legenda" in r:
            p["legenda"] = {**p.get("legenda", {}), **r["legenda"]}
        p["status"] = "pronto"
        proc.pop("erro", None)
    p["atualizadoEm"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    json.dump(p, open(a.projeto, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(a.projeto, "a", encoding="utf-8").write("\n")
    print(f"{a.projeto}: status={p['status']}")


if __name__ == "__main__":
    sys.exit(main())
