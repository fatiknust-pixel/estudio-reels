import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { COR, MONO, SANS, entrada, useFormato } from "../tema";

/** Fundo grafite com grade fina de engenharia. */
export const Fundo = () => {
  const { W, H } = useFormato();
  return (
    <AbsoluteFill style={{ background: COR.fundo }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COR.grade} 1px, transparent 1px), linear-gradient(90deg, ${COR.grade} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${(W % 60) / 2}px ${(H % 60) / 2}px`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Texto que surge (opacidade + leve subida). */
export const Aparece: React.FC<{ em: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; desloca?: number }> = ({
  em,
  dur = 16,
  children,
  style,
  desloca = 14,
}) => {
  const f = useCurrentFrame();
  const p = entrada(f, em, dur);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * desloca}px)`, ...style }}>{children}</div>;
};

/** Título de cena: número + nome em caixa alta e o título em si. */
export const Titulo: React.FC<{ n: number; rotulo: string; texto: string; em?: number; tamanho?: number; style?: React.CSSProperties }> = ({
  n,
  rotulo,
  texto,
  em = 4,
  tamanho,
  style,
}) => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const p = entrada(f, em, 18);
  return (
    <div style={{ ...style, width: v ? 940 : Math.min(Number(style?.width ?? 1700), 1700) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: MONO, fontWeight: 600, fontSize: v ? 24 : 22, letterSpacing: 4, color: COR.destaque, opacity: p }}>
        <span>{String(n).padStart(2, "0")}</span>
        <span style={{ width: 48 * p, height: 2, background: COR.destaque }} />
        <span style={{ textTransform: "uppercase" }}>{rotulo}</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tamanho ?? (v ? 60 : 64), lineHeight: 1.12, color: COR.texto, marginTop: 18, letterSpacing: -0.8, opacity: entrada(f, em + 6, 18), transform: `translateY(${(1 - entrada(f, em + 6, 18)) * 16}px)` }}>
        {texto}
      </div>
    </div>
  );
};

/** Caixa técnica (bloco de diagrama / cartão). */
export const Caixa: React.FC<{ em: number; ativo?: boolean; style?: React.CSSProperties; children: React.ReactNode; cor?: string }> = ({ em, ativo, style, children, cor }) => {
  const f = useCurrentFrame();
  const p = entrada(f, em, 18);
  const c = cor ?? COR.destaque;
  return (
    <div
      style={{
        background: COR.painel,
        border: `1.5px solid ${ativo ? c : COR.linha}`,
        borderRadius: 10,
        boxShadow: ativo ? `0 0 0 4px ${c}22` : "none",
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Rótulo pequeno em mono (especificação técnica). */
export const Spec: React.FC<{ children: React.ReactNode; cor?: string; style?: React.CSSProperties }> = ({ children, cor = COR.suave, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 20, color: cor, letterSpacing: 0.5, ...style }}>{children}</div>
);

/** Linha que se desenha (conector de diagrama), com seta opcional e pulso de "sinal" percorrendo. */
export const Conector: React.FC<{ d: string; em: number; dur?: number; seta?: boolean; sinal?: boolean; cor?: string }> = ({
  d,
  em,
  dur = 18,
  seta = true,
  sinal = false,
  cor = COR.suave,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [em, em + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= 0) return null;
  const ev = evolvePath(p, d);
  return (
    <g>
      <path d={d} stroke={cor} strokeWidth={2} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} markerEnd={seta && p >= 1 ? "url(#seta)" : undefined} />
      {sinal && p >= 1 && <path d={d} stroke={COR.destaque} strokeWidth={3} fill="none" strokeDasharray="10 70" strokeDashoffset={-((f * 3) % 80)} />}
    </g>
  );
};

/** Definição da ponta de seta para os SVGs de diagrama. */
export const Defs = () => (
  <defs>
    <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={COR.suave} />
    </marker>
  </defs>
);

/** Nota de glossário: termo técnico + explicação simples. */
export const Glossario: React.FC<{ termo: string; explica: string; em: number; style?: React.CSSProperties }> = ({ termo, explica, em, style }) => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const p = entrada(f, em, 16);
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "baseline", opacity: p, transform: `translateY(${(1 - p) * 10}px)`, ...style }}>
      <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: v ? 22 : 21, color: COR.destaque, whiteSpace: "nowrap" }}>{termo}</span>
      <span style={{ fontFamily: SANS, fontSize: v ? 25 : 24, color: COR.suave, lineHeight: 1.35 }}>{explica}</span>
    </div>
  );
};
