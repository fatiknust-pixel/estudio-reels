import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fimFala, quando } from "../dados";
import roteiro from "../../conteudo/roteiro.json";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Logo } from "../componentes/Logo";
import { Sfx } from "../componentes/Som";

const ID = "final";

export const Final = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { v } = useFormato();
  const ideia = quando(ID, "Da", 0, 40) - 2;
  const minutos = quando(ID, "minutos", 0, 60);
  const marca = spring({ frame: f - 2, fps, config: { damping: 14 } });
  const traco = interpolate(f, [2, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const s1 = spring({ frame: f - ideia, fps, config: { damping: 12, stiffness: 150 } });
  const s2 = spring({ frame: f - minutos + 2, fps, config: { damping: 10, stiffness: 150 } });
  const creditos = fimFala(ID) + 6;
  const sc = spring({ frame: f - creditos, fps, config: { damping: 20 } });
  const apaga = interpolate(f, [durationInFrames - 20, durationInFrames - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 360 : 130, display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: v ? 26 : 36, opacity: marca, transform: `scale(${0.85 + 0.15 * marca})` }}>
        <Logo tamanho={v ? 200 : 160} fundo={marca} traco={traco} play={marca} legenda={marca} />
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: v ? 110 : 116, color: COR.branco, letterSpacing: -3, textAlign: "center", lineHeight: 1 }}>
          Estúdio <span style={{ color: COR.ciano }}>Reels</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: v ? 860 : 410, display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: v ? 0 : 28, fontFamily: SANS, fontWeight: 800, fontSize: v ? 84 : 84, letterSpacing: -2, lineHeight: 1.12, textAlign: "center" }}>
        <span style={{ color: COR.branco, opacity: s1, transform: `translateY(${(1 - s1) * 50}px)`, display: "inline-block" }}>Da ideia ao vídeo,</span>
        <span style={{ color: COR.ciano, opacity: s2, transform: `translateY(${(1 - s2) * 50}px) scale(${0.8 + 0.2 * s2})`, display: "inline-block", textShadow: "0 0 40px rgba(255,214,10,0.45)" }}>em minutos.</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: v ? 1180 : 650, textAlign: "center", opacity: sc, transform: `translateY(${(1 - sc) * 20}px)` }}>
        <div style={{ width: 120 * sc, height: 4, background: COR.ciano, margin: "0 auto 28px", borderRadius: 2 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 36 : 34, color: COR.suave, lineHeight: 1.45 }}>
          Projeto de <b style={{ color: COR.branco, fontWeight: 800 }}>{roteiro.autor}</b>
          {v ? <br /> : " · "}desenvolvido com auxílio de IA
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: v ? 24 : 24, color: COR.claro, marginTop: 18 }}>fatiknust-pixel.github.io/estudio-reels</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: apaga }} />
      <Sfx nome="pop" em={ideia} volume={0.35} />
      <Sfx nome="whoosh" em={minutos - 3} volume={0.35} />
    </AbsoluteFill>
  );
};
