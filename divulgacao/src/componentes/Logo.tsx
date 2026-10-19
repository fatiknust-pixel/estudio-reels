import { evolvePath } from "@remotion/paths";

// Ícone do Estúdio Reels (o mesmo de public/icones/icone.svg), montado peça por peça.
const CELULAR = "M186 70 h140 a36 36 0 0 1 36 36 v300 a36 36 0 0 1 -36 36 h-140 a36 36 0 0 1 -36 -36 v-300 a36 36 0 0 1 36 -36 z";

export const Logo: React.FC<{
  tamanho: number;
  fundo?: number; // 0..1
  traco?: number; // 0..1 contorno do celular
  play?: number; // 0..1
  legenda?: number; // 0..1
}> = ({ tamanho, fundo = 1, traco = 1, play = 1, legenda = 1 }) => {
  const ev = evolvePath(Math.max(0.0001, traco), CELULAR);
  return (
    <svg viewBox="0 0 512 512" width={tamanho} height={tamanho} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A1C71" />
          <stop offset="1" stopColor="#0B0F1A" />
        </linearGradient>
      </defs>
      <g opacity={fundo} transform={`translate(256 256) scale(${0.6 + 0.4 * fundo}) translate(-256 -256)`}>
        <rect width="512" height="512" rx="112" fill="url(#logo-g)" />
        <rect width="512" height="512" rx="112" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="4" />
      </g>
      <path d={CELULAR} fill="none" stroke="#fff" strokeWidth="22" opacity=".92" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      <path d="M222 190 L318 248 L222 306 Z" fill="#FFD60A" transform={`translate(270 248) scale(${play}) translate(-270 -248)`} />
      <g transform={`translate(${(1 - legenda) * -40} 0)`} opacity={legenda}>
        <rect x="104" y="356" width={304 * legenda} height="62" rx="16" fill="#FFD60A" />
        <rect x="134" y="378" width="120" height="18" rx="9" fill="#111" />
        <rect x="266" y="378" width="112" height="18" rx="9" fill="#111" opacity=".55" />
      </g>
    </svg>
  );
};
