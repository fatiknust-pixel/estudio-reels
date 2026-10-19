import { Img, staticFile } from "remotion";
import { MARCAS } from "../dados";
import { COR, SANS } from "../tema";

// Celular com as telas reais do app. Tudo dentro dele usa as coordenadas do app (390 px de largura),
// então os destaques caem exatamente em cima dos elementos capturados (public/telas/marcas.json).
export const LARGURA_APP = 390;
export const ALTURA_APP = 844;
const BARRA = 44; // barra de status desenhada acima da tela capturada

export const Celular: React.FC<{
  largura: number;
  children: React.ReactNode;
  rotY?: number;
  rotX?: number;
  brilho?: number;
  style?: React.CSSProperties;
}> = ({ largura, children, rotY = 0, rotX = 0, brilho = 0.5, style }) => {
  const borda = largura * 0.035;
  const interna = largura - borda * 2;
  const k = interna / LARGURA_APP;
  const alturaTela = (ALTURA_APP + BARRA) * k;
  const raio = largura * 0.13;
  return (
    <div style={{ perspective: 2200, ...style }}>
      <div
        style={{
          width: largura,
          height: alturaTela + borda * 2,
          borderRadius: raio,
          padding: borda,
          boxSizing: "border-box",
          background: "linear-gradient(150deg, #2B3446 0%, #0D121C 45%, #1E2533 100%)",
          boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 ${120 * brilho}px rgba(47,107,255,${0.35 * brilho}), inset 0 0 0 2px rgba(255,255,255,0.12)`,
          transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        <div
          style={{
            width: interna,
            height: alturaTela,
            borderRadius: raio - borda,
            overflow: "hidden",
            position: "relative",
            background: "#0B0D14",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: LARGURA_APP, height: ALTURA_APP + BARRA, transform: `scale(${k})`, transformOrigin: "0 0" }}>
            <BarraStatus />
            <div style={{ position: "absolute", left: 0, top: BARRA, width: LARGURA_APP, height: ALTURA_APP, overflow: "hidden" }}>{children}</div>
          </div>
          {/* reflexo de vidro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.06) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BarraStatus = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: LARGURA_APP, height: BARRA, background: "#0B0D14", fontFamily: SANS }}>
    <span style={{ position: "absolute", left: 34, top: 14, fontSize: 15, fontWeight: 600, color: "#fff" }}>9:41</span>
    <div style={{ position: "absolute", left: 195 - 58, top: 9, width: 116, height: 30, borderRadius: 20, background: "#000", border: "1px solid #222" }} />
    <svg style={{ position: "absolute", right: 26, top: 16 }} width="68" height="13" viewBox="0 0 68 13">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 5} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill="#fff" />
      ))}
      <path d="M27 5a9 9 0 0112 0M29.5 7.8a5 5 0 017 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="10.6" r="1.4" fill="#fff" />
      <rect x="44" y="1" width="21" height="11" rx="3" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.5" />
      <rect x="46" y="3" width="16" height="7" rx="1.5" fill="#fff" />
      <rect x="66" y="4.5" width="1.6" height="4" rx="0.8" fill="#fff" opacity="0.5" />
    </svg>
  </div>
);

/** Uma tela capturada do app, com rolagem (px do app). */
export const Tela: React.FC<{ nome: string; rolagem?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  nome,
  rolagem = 0,
  style,
  children,
}) => {
  const m = MARCAS[nome];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0B0D14", ...style }}>
      <div style={{ position: "absolute", left: 0, top: -rolagem, width: LARGURA_APP, height: m?.altura ?? ALTURA_APP }}>
        <Img src={staticFile(`telas/${nome}.png`)} style={{ width: LARGURA_APP, display: "block" }} />
        {children}
      </div>
    </div>
  );
};

/** Moldura de destaque sobre um elemento da tela (coordenadas do app). */
export const Destaque: React.FC<{ r: [number, number, number, number]; p: number; cor?: string; raio?: number; folga?: number }> = ({
  r,
  p,
  cor = COR.azul,
  raio = 10,
  folga = 4,
}) => {
  if (p <= 0) return null;
  const s = 0.92 + 0.08 * Math.min(1, p);
  return (
    <div
      style={{
        position: "absolute",
        left: r[0] - folga,
        top: r[1] - folga,
        width: r[2] + folga * 2,
        height: r[3] + folga * 2,
        borderRadius: raio,
        border: `3px solid ${cor}`,
        background: `${cor}1F`,
        boxShadow: `0 0 0 6px ${cor}26, 0 0 24px ${cor}80`,
        opacity: Math.min(1, p),
        transform: `scale(${s})`,
      }}
    />
  );
};

/** Toque do dedo (círculo que se expande). */
export const Toque: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t < 0 || t > 22) return null;
  const p = t / 22;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 22,
          top: y - 22,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: "rgba(255,214,10,0.35)",
          transform: `scale(${t < 6 ? 0.7 + t * 0.05 : 1})`,
          opacity: 1 - Math.max(0, p - 0.5) * 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 22,
          top: y - 22,
          width: 44,
          height: 44,
          borderRadius: 22,
          border: "2px solid rgba(255,214,10,0.7)",
          transform: `scale(${1 + p * 1.6})`,
          opacity: 1 - p,
        }}
      />
    </>
  );
};

/** Converte um ponto da tela do app (px do app) para px dentro da caixa do celular. */
export const noCelular = (largura: number, x: number, y: number) => {
  const borda = largura * 0.035;
  const k = (largura - borda * 2) / LARGURA_APP;
  return { x: borda + x * k, y: borda + (BARRA + y) * k, k };
};

/** Altura total do celular para uma largura. */
export const alturaCelular = (largura: number) => {
  const borda = largura * 0.035;
  const k = (largura - borda * 2) / LARGURA_APP;
  return (ALTURA_APP + BARRA) * k + borda * 2;
};

/** Posição padrão do celular nas cenas: à esquerda no 16:9, centralizado embaixo no 9:16. */
export const posCelular = (v: boolean) => (v ? { x: 340, y: 640, largura: 400 } : { x: 250, y: 78, largura: 400 });
