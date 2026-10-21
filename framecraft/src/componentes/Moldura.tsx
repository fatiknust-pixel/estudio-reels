import { useCurrentFrame } from "remotion";
import { NARRACAO } from "../dados";
import roteiro from "../../conteudo/roteiro.json";
import { COR, MONO, useFormato } from "../tema";

const CENAS = roteiro.cenas;

/** Cabeçalho fixo (projeto e instituição) e barra de capítulos com o capítulo atual destacado. */
export const Moldura = () => {
  const f = useCurrentFrame();
  const { v, W, H } = useFormato();
  const atual = CENAS.reduce((acc, c, i) => (f >= NARRACAO.cenas[c.id].inicio + NARRACAO.transicao / 2 ? i : acc), 0);
  const margem = v ? 70 : 110;
  const fimTotal = NARRACAO.total;
  const intro = Math.min(1, f / 20);
  const saida = Math.min(1, Math.max(0, (fimTotal - f) / 20));
  const op = intro * saida;
  return (
    <>
      <div style={{ position: "absolute", left: margem, right: margem, top: v ? 90 : 52, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontWeight: 500, fontSize: v ? 20 : 18, letterSpacing: 2.5, color: COR.apagado, opacity: op }}>
        <span>
          <span style={{ color: COR.texto, fontWeight: 600 }}>FRAMECRAFT</span>
          {"  ·  "}
          {String(atual + 1).padStart(2, "0")}/{String(CENAS.length).padStart(2, "0")} {CENAS[atual].titulo.toUpperCase()}
        </span>
        {!v && <span>PROJETO PESSOAL · FABIO SARRI</span>}
      </div>
      <div style={{ position: "absolute", left: margem, right: margem, top: (v ? 90 : 52) + 34, height: 1, background: COR.linha, opacity: op }} />
      <div style={{ position: "absolute", left: margem, right: margem, top: H - (v ? 120 : 46), display: "flex", gap: 6, opacity: op }}>
        {CENAS.map((c, i) => {
          const cena = NARRACAO.cenas[c.id];
          const p = Math.min(1, Math.max(0, (f - cena.inicio) / cena.quadros));
          return (
            <div key={c.id} style={{ flex: cena.quadros, height: 3, background: "rgba(255,255,255,0.10)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${(i < atual ? 1 : i === atual ? p : 0) * 100}%`, height: "100%", background: i === atual ? COR.destaque : "rgba(255,255,255,0.45)" }} />
            </div>
          );
        })}
      </div>
      <span style={{ display: "none" }}>{W}</span>
    </>
  );
};
