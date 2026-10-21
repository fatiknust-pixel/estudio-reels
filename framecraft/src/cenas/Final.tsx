import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COR, MONO, SANS, entrada, useFormato } from "../tema";
import { Aparece } from "../componentes/Base";
import { Sfx } from "../componentes/Som";

export const Final = () => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const logo = entrada(f, 2, 26);
  const tam = v ? 260 : 220;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Img src={staticFile("logo.svg")} style={{ width: tam, height: tam, opacity: logo, transform: `scale(${0.92 + 0.08 * logo})`, marginBottom: 46 }} />
      <Aparece em={10}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: v ? 140 : 150, color: COR.texto, letterSpacing: -3, lineHeight: 1 }}>Framecraft</div>
      </Aparece>
      <Aparece em={20}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: v ? 44 : 46, color: COR.suave, marginTop: 24 }}>Da ideia ao vídeo, direto do celular</div>
      </Aparece>
      <div style={{ width: 240 * entrada(f, 30, 24), height: 3, background: COR.destaque, margin: "46px 0" }} />
      <Aparece em={44}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22, color: COR.apagado, lineHeight: 1.8, letterSpacing: 1 }}>
          <span style={{ color: COR.suave }}>FABIO SARRI</span>
          <br />
          DESENVOLVIDO COM AUXÍLIO DE INTELIGÊNCIA ARTIFICIAL
        </div>
      </Aparece>
      <Sfx nome="swoosh" em={6} volume={0.12} />
    </AbsoluteFill>
  );
};
