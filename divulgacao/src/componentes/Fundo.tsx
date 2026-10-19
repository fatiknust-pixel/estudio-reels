import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D, noise3D } from "@remotion/noise";
import { COR } from "../tema";

// Fundo único do vídeo: gradiente que "respira", grade em perspectiva correndo e partículas
// guiadas por ruído (@remotion/noise). As cenas ficam por cima, com fundo transparente.
export const Fundo: React.FC<{ alerta?: number; brilho?: number }> = ({ alerta = 0, brilho = 0 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const gx = 50 + noise2D("gx", f * 0.004, 0) * 18;
  const gy = 42 + noise2D("gy", 0, f * 0.004) * 14;
  const pontos = Array.from({ length: 46 }, (_, i) => {
    const x = (noise3D("px", i * 3.1, 0, f * 0.0025) * 0.5 + 0.5) * width;
    const y = (noise3D("py", 0, i * 2.7, f * 0.0025) * 0.5 + 0.5) * height;
    const a = (noise2D("pa", i, f * 0.01) * 0.5 + 0.5) * 0.55;
    const r = 1 + (i % 4) * 0.8;
    return { x, y, a, r };
  });
  const passo = 90;
  const desloca = (f * 1.6) % passo;
  return (
    <AbsoluteFill style={{ background: COR.noite, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 800px at ${gx}% ${gy}%, ${COR.marinho} 0%, ${COR.fundo} 45%, ${COR.noite} 100%)`,
        }}
      />
      {/* grade em perspectiva */}
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 30%" }}>
        <div
          style={{
            position: "absolute",
            left: -width,
            width: width * 3,
            top: height * 0.52,
            height: height * 1.6,
            transform: "rotateX(72deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `linear-gradient(${COR.linha} 1.5px, transparent 1.5px), linear-gradient(90deg, ${COR.linha} 1.5px, transparent 1.5px)`,
            backgroundSize: `${passo}px ${passo}px`,
            backgroundPosition: `0 ${desloca}px`,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 70%)",
          }}
        />
      </AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {pontos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={COR.claro} opacity={p.a} />
        ))}
      </svg>
      {/* tons de alerta (cena do problema) e clarão */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(1100px 700px at 50% 45%, rgba(255,90,95,0.28), rgba(40,6,10,0.75))",
          opacity: alerta,
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(139,92,246,0.4), transparent 60%)", opacity: brilho }} />
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ opacity: interpolate(f, [0, 12], [1, 0], { extrapolateRight: "clamp" }), background: "#000" }} />
    </AbsoluteFill>
  );
};
