#!/usr/bin/env python3
"""Junta o resultado de uma Action ao projeto.json MAIS RECENTE (o app pode ter salvo no meio do caminho).

Uso:
  python3 scripts/aplicar_resultado.py projetos/<id>/projeto.json --resultado out/resultado.json
  python3 scripts/aplicar_resultado.py projetos/<id>/projeto.json --erro "mensagem"
"""
import argparse, datetime, json, os, subprocess, sys


def limpar_midia(p, pasta):
    usados = {n.get("audio") for n in (p.get("narracao") or {}).values()} | {i.get("arquivo") for i in (p.get("imagens") or {}).values()}
    for sub in ("audio", "imagens"):
        d = os.path.join(pasta, sub)
        if not os.path.isdir(d):
            continue
        for nome in os.listdir(d):
            if f"{sub}/{nome}" not in usados:
                caminho = os.path.join(d, nome)
                subprocess.call(["git", "rm", "-q", "--cached", "--ignore-unmatch", caminho])
                os.remove(caminho)
                print(f"  - {sub}/{nome}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--resultado")
    ap.add_argument("--erro")
    ap.add_argument("--campos", help="só estes campos do resultado (ex.: narracao,imagens)")
    ap.add_argument("--substituir", action="store_true", help="sobrescreve cortes e efeitos (em vez de só preencher vazios)")
    ap.add_argument("--sem-status", action="store_true", help="não mexe no status do projeto (ex.: preparar a gameplay enquanto o roteiro é gerado)")
    ap.add_argument("--limpar-midia", action="store_true", help="apaga áudios/imagens que o projeto não usa mais")
    a = ap.parse_args()
    p = json.load(open(a.projeto, encoding="utf-8"))
    proc = p.setdefault("processamento", {})
    if a.erro is not None:
        p["status"] = "erro"
        proc["erro"] = a.erro[-800:]
    else:
        r = json.load(open(a.resultado, encoding="utf-8"))
        if a.campos:
            r = {k: v for k, v in r.items() if k in a.campos.split(",")}
        if "video" in r:
            # mantém o que o usuário escolheu no app (enquadramento, foco, volume)
            p["video"] = {**(p.get("video") or {}), **r["video"]}
        if "palavras" in r:
            p["palavras"] = r["palavras"]
        if "cortes" in r and (a.substituir or not p.get("cortes")):
            p["cortes"] = r["cortes"]
        for k in ("cenas", "narracao", "imagens", "titulo", "fontesPesquisa", "voz", "sugestoes", "gancho", "estiloIA", "tema"):
            if k in r:
                p[k] = r[k]
        if "fundoVideo" in r:
            p["fundoVideo"] = {**(p.get("fundoVideo") or {}), **r["fundoVideo"]}
        if "efeitos" in r and a.substituir:
            p["efeitos"] = {**p.get("efeitos", {}), **r["efeitos"]}
        elif "efeitos" in r:
            ef = p.setdefault("efeitos", {})
            for k, v in r["efeitos"].items():
                if isinstance(v, list) and ef.get(k):
                    continue  # não apaga títulos/emojis/zooms que você já fez
                ef[k] = v
        if "legenda" in r:
            p["legenda"] = {**p.get("legenda", {}), **r["legenda"]}
        if not a.sem_status:
            p["status"] = "pronto"
            proc.pop("erro", None)
    if a.limpar_midia:
        limpar_midia(p, os.path.dirname(a.projeto))
    p["atualizadoEm"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    json.dump(p, open(a.projeto, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(a.projeto, "a", encoding="utf-8").write("\n")
    print(f"{a.projeto}: status={p.get('status')}")


if __name__ == "__main__":
    sys.exit(main())
