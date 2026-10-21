import { AbsoluteFill } from "remotion";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Aparece } from "../componentes/Base";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const Autoria = () => {
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const pilares = [
    { nome: "Pensado", em: quando("autoria", "pensado", 0, 40) },
    { nome: "Projetado", em: quando("autoria", "projetado", 0, 70) },
    { nome: "Desenvolvido", em: quando("autoria", "desenvolvido", 0, 100) },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: M, top: v ? 600 : 250, width: v ? 940 : 1500 }}>
        <Aparece em={4}>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: COR.destaque }}>AUTORIA</div>
        </Aparece>
        <Aparece em={10}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: v ? 150 : 190, color: COR.texto, letterSpacing: -3, lineHeight: 1, marginTop: 24 }}>Fabio Sarri</div>
        </Aparece>
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", gap: v ? 18 : 60, marginTop: v ? 70 : 80 }}>
          {pilares.map((p, i) => (
            <Aparece key={p.nome} em={p.em - 4} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, color: COR.destaque }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 48 : 52, color: COR.texto }}>{p.nome}</span>
            </Aparece>
          ))}
        </div>
        <Aparece em={quando("autoria", "parceira", 0, 160) - 20} style={{ marginTop: v ? 70 : 80 }}>
          <div style={{ width: 120, height: 3, background: COR.destaque, marginBottom: 28 }} />
          <div style={{ fontFamily: SANS, fontSize: v ? 36 : 38, color: COR.suave, lineHeight: 1.35 }}>com a inteligência artificial como parceira de desenvolvimento</div>
        </Aparece>
      </div>
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
