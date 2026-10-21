import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Caixa, Titulo, Aparece } from "../componentes/Base";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

const ETAPAS = [
  { nome: "Roteiro", palavra: "roteiro", tool: "editor de texto" },
  { nome: "Narração", palavra: "narração", tool: "gravador de voz" },
  { nome: "Legendas", palavra: "legendar", tool: "gerador de legendas" },
  { nome: "Cortes", palavra: "cortar", tool: "editor de vídeo" },
  { nome: "Edição", palavra: "editar", tool: "efeitos e acabamento" },
];

export const Problema = () => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const fim = quando("problema", "diferente", 0, 240);
  return (
    <AbsoluteFill>
      <Titulo n={2} rotulo="O problema" texto="Muitas etapas, muitas ferramentas" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1500 }} />
      {ETAPAS.map((e, i) => {
        const em = quando("problema", e.palavra, 0, 40 + i * 25) - 6;
        const w = v ? 940 : 310;
        const h = v ? 170 : 270;
        return (
          <Caixa key={e.nome} em={em} ativo={f >= em && f < em + 40} style={{ position: "absolute", left: v ? M : M + i * (w + 37.5), top: v ? 520 + i * (h + 22) : 470, width: w, height: h, padding: v ? "0 36px" : "30px 28px", display: "flex", flexDirection: v ? "row" : "column", alignItems: v ? "center" : "flex-start", justifyContent: v ? "flex-start" : "space-between", gap: 28 }}>
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 26, color: COR.destaque }}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 44 : 40, color: COR.texto }}>{e.nome}</div>
              <div style={{ fontFamily: MONO, fontSize: 21, color: COR.suave, marginTop: 8 }}>{e.tool}</div>
            </div>
          </Caixa>
        );
      })}
      <Aparece em={fim - 6} style={{ position: "absolute", left: M, top: v ? 1520 : 800, fontFamily: MONO, fontWeight: 500, fontSize: v ? 24 : 24, color: COR.suave, letterSpacing: 1 }}>
        5 ETAPAS · 5 FERRAMENTAS DIFERENTES
      </Aparece>
      <Sfx nome="tique" em={10} volume={0.2} />
    </AbsoluteFill>
  );
};
