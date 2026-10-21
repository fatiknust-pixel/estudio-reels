import { useCurrentFrame } from "remotion";
import { COR, MONO, SANS, entrada, useFormato } from "../tema";
import { Caixa } from "./Base";

export type Passo = { nome: string; sub: string; em: number };

/** Lista numerada de etapas; a etapa em destaque acompanha a fala. */
export const Passos: React.FC<{ itens: Passo[]; esq: number; topo: number; largura: number; alto: number; vao?: number }> = ({ itens, esq, topo, largura, alto, vao = 16 }) => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const atual = itens.reduce((a, it, i) => (f >= it.em ? i : a), -1);
  return (
    <div style={{ position: "absolute", left: esq, top: topo, width: largura }}>
      {itens.map((it, i) => (
        <Caixa key={it.nome} em={it.em - 6} ativo={i === atual} style={{ height: alto, marginBottom: vao, padding: v ? "0 30px" : "0 34px", display: "flex", alignItems: "center", gap: 26 }}>
          <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: v ? 26 : 26, color: i === atual ? COR.destaque : COR.apagado }}>{String(i + 1).padStart(2, "0")}</span>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 36 : 38, color: COR.texto, lineHeight: 1.1 }}>{it.nome}</div>
            <div style={{ fontFamily: SANS, fontSize: v ? 24 : 25, color: COR.suave, marginTop: 6, opacity: 0.4 + 0.6 * entrada(f, it.em, 14) }}>{it.sub}</div>
          </div>
        </Caixa>
      ))}
    </div>
  );
};
