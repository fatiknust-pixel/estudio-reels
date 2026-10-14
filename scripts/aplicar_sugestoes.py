#!/usr/bin/env python3
"""Sugestões do Claude para o Modo 2 (vídeo bruto).

  --transcricao PROJETO            imprime a transcrição numerada (entrada do Claude)
  --validar SUGESTOES PROJETO      confere índices e limites (saída "✅" quando ok)
  --aplicar SUGESTOES PROJETO [--novo]
                                   aplica no projeto: gancho, cortes, destaques, zooms, emojis,
                                   títulos e enquete. Tudo que vem da IA leva id "ia-…" (ou motivo
                                   "IA: …") para o app poder ligar/desligar. --novo também troca o título.
"""
import json, sys, uuid

ZOOM_ESTILO = {"impacto": 1.2, "cortes-rapidos": 1.25, "podcast": 1.15, "tutorial": 1.15, "noticia": 1.12, "documentario": 1.08}


def ler(a):
    return json.load(open(a, encoding="utf-8"))


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def transcricao(p):
    ws = p.get("palavras") or []
    linhas, atual, ini = [], [], None
    for k, w in enumerate(ws):
        if atual and (w["i"] - ws[k - 1]["f"] > 0.45 or len(atual) >= 14):
            linhas.append(f"{fmt(ini)}  " + " ".join(atual))
            atual = []
        if not atual:
            ini = w["i"]
        atual.append(f"[{k}]{w['p']}")
    if atual:
        linhas.append(f"{fmt(ini)}  " + " ".join(atual))
    cab = f"Estilo: {p.get('estilo')}\nDuração: {fmt((p.get('video') or {}).get('duracao', 0))}\nPalavras: {len(ws)} (índices 0 a {len(ws) - 1})\n"
    return cab + "\n" + "\n".join(linhas) + "\n"


def validar(s, p):
    n = len(p.get("palavras") or [])
    ws = p.get("palavras") or []
    erros = []

    def faixa(o, onde, max_seg=None):
        de, ate = o.get("de"), o.get("ate")
        if not isinstance(de, int) or not isinstance(ate, int) or not (0 <= de <= ate < n):
            erros.append(f"{onde}: de/ate inválidos ({de}, {ate}); use índices entre 0 e {n - 1}")
            return
        if max_seg and ws[ate]["f"] - ws[de]["i"] > max_seg:
            erros.append(f"{onde}: longo demais ({ws[ate]['f'] - ws[de]['i']:.1f}s, máx. {max_seg}s)")

    g = s.get("gancho")
    if g:
        faixa(g, "gancho", 8)
        if g.get("texto") and len(g["texto"].split()) > 8:
            erros.append("gancho.texto: use até 6 palavras")
    for k, c in enumerate(s.get("cortes") or []):
        faixa(c, f"cortes[{k}]", 30)
    for k, z in enumerate(s.get("zooms") or []):
        faixa(z, f"zooms[{k}]", 4)
    for k, t in enumerate(s.get("titulos") or []):
        faixa(t, f"titulos[{k}]")
        if not t.get("texto"):
            erros.append(f"titulos[{k}]: sem texto")
    for k, d in enumerate(s.get("destaques") or []):
        if not isinstance(d, int) or not 0 <= d < n:
            erros.append(f"destaques[{k}]: índice inválido {d}")
    for k, e in enumerate(s.get("emojis") or []):
        if not isinstance(e.get("em"), int) or not 0 <= e["em"] < n or not e.get("emoji"):
            erros.append(f"emojis[{k}]: precisa de em (índice) e emoji")
    q = s.get("enquete")
    if q and (not q.get("pergunta") or len(q.get("opcoes") or []) < 2):
        erros.append("enquete: precisa de pergunta e 2 opções")
    cortado = sum(ws[c["ate"]]["f"] - ws[c["de"]]["i"] for c in s.get("cortes") or [] if isinstance(c.get("de"), int) and isinstance(c.get("ate"), int) and 0 <= c["de"] <= c["ate"] < n)
    dur = (p.get("video") or {}).get("duracao") or 1
    if cortado > dur * 0.5:
        erros.append(f"cortes removem {cortado:.0f}s de {dur:.0f}s — corte menos")
    return erros


def aplicar(s, p, novo=False):
    ws = p.get("palavras") or []
    n = len(ws)
    ef = p.setdefault("efeitos", {})
    iid = lambda: "ia-" + uuid.uuid4().hex[:8]
    antes = lambda k: (ws[k - 1]["f"] + ws[k]["i"]) / 2 if k > 0 else max(0, ws[k]["i"] - 0.1)
    depois = lambda k: (ws[k]["f"] + ws[k + 1]["i"]) / 2 if k + 1 < n else ws[k]["f"] + 0.15
    estilo = p.get("estilo", "impacto")

    # tira o que a IA tinha posto antes
    p["cortes"] = [c for c in p.get("cortes") or [] if not str(c.get("motivo", "")).startswith("IA")]
    for k in ("zooms", "emojis", "titulos", "sons"):
        ef[k] = [x for x in ef.get(k) or [] if not str(x.get("id", "")).startswith("ia-")]

    g = s.get("gancho")
    if g:
        p["gancho"] = {"i": round(antes(g["de"]), 3), "f": round(depois(g["ate"]), 3), "texto": (g.get("texto") or "").strip() or None, "ia": True}
    elif (p.get("gancho") or {}).get("ia"):
        p["gancho"] = None

    for c in s.get("cortes") or []:
        p["cortes"].append({"id": "c" + uuid.uuid4().hex[:8], "i": round(antes(c["de"]), 3), "f": round(depois(c["ate"]), 3), "motivo": f"IA: {c.get('motivo', 'enrolação')}"})

    if s.get("destaques") is not None:
        for w in ws:
            w.pop("destaque", None)
        for k in s["destaques"]:
            ws[k]["destaque"] = True

    zooms = s.get("zooms") or []
    if zooms and estilo != "documentario":
        if estilo in ("impacto",):
            ef["zooms"] = [z for z in ef["zooms"] if not str(z.get("id", "")).startswith("auto-")]
        esc = ZOOM_ESTILO.get(estilo, 1.15)
        for z in zooms:
            ef["zooms"].append({"id": iid(), "i": round(max(0, ws[z["de"]]["i"] - 0.05), 3), "f": round(ws[z["ate"]]["f"] + 0.3, 3), "escala": esc})

    for k, e in enumerate(s.get("emojis") or []):
        ef["emojis"].append({"id": iid(), "emoji": e["emoji"], "i": round(ws[e["em"]]["i"], 3), "dur": 1.4, "x": 78 if k % 2 == 0 else 22, "y": 36})

    titulos = s.get("titulos") or []
    if titulos:
        ef["titulos"] = [t for t in ef["titulos"] if not str(t.get("id", "")).startswith("auto-")]
    for t in titulos:
        i = ws[t["de"]]["i"]
        f = max(ws[t["ate"]]["f"], i + 1.5)
        if estilo == "podcast":
            f = max(f, (p.get("video") or {}).get("duracao", f))
        ef["titulos"].append({"id": iid(), "texto": t["texto"], "i": round(i, 3), "f": round(f, 3), "posicao": 12, **({"cor": "vermelho"} if estilo == "noticia" else {})})

    q = s.get("enquete")
    if q and not ef.get("enquete"):
        ef["enquete"] = {"pergunta": q["pergunta"], "opcoes": q["opcoes"][:4], "dur": 3, "ia": True}

    if novo and s.get("titulo"):
        p["titulo"] = s["titulo"][:70]
    p["sugestoes"] = {**s, "aplicadas": True}
    return p


def main():
    a = sys.argv[1:]
    if a and a[0] == "--transcricao":
        sys.stdout.write(transcricao(ler(a[1])))
    elif a and a[0] == "--validar":
        erros = validar(ler(a[1]), ler(a[2]))
        for e in erros:
            print("❌ " + e)
        print(f"{len(erros)} erro(s)." if erros else "✅ Sugestões válidas.")
        return 1 if erros else 0
    elif a and a[0] == "--aplicar":
        s, arq = ler(a[1]), a[2]
        erros = validar(s, ler(arq))
        if erros:
            print("\n".join(erros))
            return 1
        p = aplicar(s, ler(arq), "--novo" in a)
        json.dump(p, open(arq, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"✓ sugestões aplicadas em {arq}")
    else:
        print(__doc__)
        return 2


if __name__ == "__main__":
    sys.exit(main())
