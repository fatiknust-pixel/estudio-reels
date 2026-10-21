import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COR, MONO, SANS, entrada, useFormato } from "../tema";
import { Aparece } from "../componentes/Base";
import { Sfx } from "../componentes/Som";

export const Abertura = () => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const logo = entrada(f, 2, 26);
  const regua = entrada(f, 26, 24);
  const tam = v ? 300 : 340;
  return (
    <AbsoluteFill>
      <Img src={staticFile("logo.svg")} style={{ position: "absolute", left: v ? 70 : 1290, top: v ? 300 : 300, width: tam, height: tam, opacity: logo, transform: `scale(${0.92 + 0.08 * logo})` }} />
      <div style={{ position: "absolute", left: v ? 70 : 110, top: v ? 700 : 300, width: v ? 940 : 1050 }}>
        <Aparece em={10}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: v ? 150 : 170, color: COR.texto, letterSpacing: -3, lineHeight: 1 }}>Framecraft</div>
        </Aparece>
        <Aparece em={18}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: v ? 48 : 50, color: COR.texto, marginTop: 24, lineHeight: 1.15 }}>Criador de vídeos 9:16 e 16:9, com inteligência artificial</div>
        </Aparece>
        <div style={{ width: 320 * regua, height: 3, background: COR.destaque, marginTop: 34 }} />
        <Aparece em={44}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22, color: COR.apagado, marginTop: v ? 60 : 70, lineHeight: 1.7, letterSpacing: 1 }}>
            PROJETO PESSOAL
            <br />
            <span style={{ color: COR.suave }}>DESENVOLVIDO POR FABIO SARRI</span>
            <br />
            COM AUXÍLIO DE INTELIGÊNCIA ARTIFICIAL
          </div>
        </Aparece>
      </div>
      <Sfx nome="swoosh" em={8} volume={0.12} />
    </AbsoluteFill>
  );
};
