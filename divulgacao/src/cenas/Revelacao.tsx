import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, SANS, useFormato } from "../tema";
import { Logo } from "../componentes/Logo";
import { Sfx } from "../componentes/Som";

// O ícone do app se monta (fundo, contorno do celular, play, legenda) e o nome entra.
export const Revelacao = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v, W, H } = useFormato();
  const cx = W / 2;
  const cy = v ? 700 : 380;
  const fundo = spring({ frame: f - 2, fps, config: { damping: 13 } });
  const traco = interpolate(f, [6, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const play = spring({ frame: f - 18, fps, config: { damping: 9, stiffness: 200 } });
  const legenda = spring({ frame: f - 24, fps, config: { damping: 16 } });
  const nome = "Estúdio Reels";
  const flash = interpolate(f, [0, 10], [0.85, 0], { extrapolateRight: "clamp" });
  const zoom = interpolate(f, [0, 120], [1.06, 1], { easing: Easing.out(Easing.quad) });
  const tam = v ? 300 : 280;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {[0, 1, 2].map((k) => {
          const t = interpolate(f - 20 - k * 5, [0, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return t > 0 && t < 1 ? <circle key={k} cx={cx} cy={cy} r={160 + t * 760} fill="none" stroke={k === 1 ? COR.ciano : COR.azul} strokeWidth={5 - k} opacity={(1 - t) * 0.8} /> : null;
        })}
      </svg>
      <div style={{ position: "absolute", left: cx - tam / 2, top: cy - tam / 2, filter: `drop-shadow(0 30px 60px rgba(139,92,246,${0.5 * fundo}))` }}>
        <Logo tamanho={tam} fundo={fundo} traco={traco} play={play} legenda={legenda} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + tam / 2 + 40, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: v ? 122 : 136, color: COR.branco, letterSpacing: -3 }}>
          {nome.split("").map((l, i) => {
            const s = spring({ frame: f - 26 - i * 1.5, fps, config: { damping: 13, stiffness: 160 } });
            return (
              <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: s, transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s})`, color: i >= 8 ? COR.ciano : undefined }}>
                {l}
              </span>
            );
          })}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 34 : 34, color: COR.claro, marginTop: 8, opacity: spring({ frame: f - 46, fps }) }}>
          Vídeos 9:16 com IA, do roteiro ao MP4
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <Sfx nome="swoosh" em={18} volume={0.4} />
      <Sfx nome="pop" em={20} volume={0.5} />
    </AbsoluteFill>
  );
};
