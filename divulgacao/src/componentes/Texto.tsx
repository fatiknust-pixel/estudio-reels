import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, MONO, SANS } from "../tema";

/** Texto que entra palavra por palavra (desfoque + subida), a partir do quadro `em`. */
export const Surge: React.FC<{
  texto: string;
  em: number;
  tamanho: number;
  peso?: number;
  cor?: string;
  destaque?: Record<string, string>; // palavra -> cor
  intervalo?: number;
  style?: React.CSSProperties;
  sair?: number; // quadro em que o texto sai
}> = ({ texto, em, tamanho, peso = 700, cor = COR.branco, destaque = {}, intervalo = 3, style, sair }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palavras = texto.split(" ");
  const saida = sair !== undefined ? interpolate(f, [sair, sair + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: tamanho,
        fontWeight: peso,
        color: cor,
        lineHeight: 1.08,
        letterSpacing: -tamanho * 0.02,
        opacity: saida,
        transform: `translateY(${(1 - saida) * -20}px)`,
        ...style,
      }}
    >
      {palavras.map((w, i) => {
        const s = spring({ frame: f - em - i * intervalo, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
        const limpo = w.replace(/[,.:?!]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: tamanho * 0.24,
              opacity: s,
              filter: `blur(${(1 - s) * 12}px)`,
              transform: `translateY(${(1 - s) * tamanho * 0.5}px)`,
              color: destaque[limpo] || undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Etiqueta pequena em caixa alta (estilo "etiqueta industrial" do app). */
export const Rotulo: React.FC<{ texto: string; em: number; cor?: string; style?: React.CSSProperties }> = ({ texto, em, cor = COR.claro, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - em, fps, config: { damping: 18 } });
  const letras = Math.round(interpolate(f - em, [0, 14], [0, texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div
      style={{
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: 5,
        textTransform: "uppercase",
        color: cor,
        opacity: s,
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...style,
      }}
    >
      <span style={{ width: 40 * s, height: 3, background: cor, display: "inline-block", borderRadius: 2 }} />
      {texto.slice(0, letras)}
    </div>
  );
};

/** Ficha arredondada com ícone/ponto e texto. */
export const Ficha: React.FC<{ texto: string; em: number; cor?: string; mono?: boolean; style?: React.CSSProperties }> = ({
  texto,
  em,
  cor = COR.claro,
  mono = false,
  style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - em, fps, config: { damping: 13, stiffness: 160 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 24px",
        borderRadius: 999,
        background: "rgba(13,30,64,0.72)",
        border: `1.5px solid ${cor}55`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`,
        fontFamily: mono ? MONO : SANS,
        fontWeight: 600,
        fontSize: 28,
        color: COR.branco,
        opacity: s,
        transform: `translateX(${(1 - s) * 60}px) scale(${0.85 + 0.15 * s})`,
        ...style,
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 6, background: cor, boxShadow: `0 0 12px ${cor}` }} />
      {texto}
    </div>
  );
};
