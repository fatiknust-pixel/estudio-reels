import { Img, staticFile, useCurrentFrame } from "remotion";
import { COR, entrada } from "../tema";

const RAZAO = 2532 / 1170;

/** Moldura de celular com a tela do aplicativo (captura real). `children` entra sobre a tela. */
export const Celular: React.FC<{ largura: number; em: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ largura, em, style, children }) => {
  const f = useCurrentFrame();
  const p = entrada(f, em, 22);
  const borda = 10;
  return (
    <div style={{ position: "absolute", width: largura, height: (largura - borda * 2) * RAZAO + borda * 2, borderRadius: 46, background: "#050506", border: `1.5px solid ${COR.linha}`, padding: borda, boxSizing: "border-box", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", opacity: p, transform: `translateY(${(1 - p) * 30}px)`, ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: COR.fundo }}>{children}</div>
    </div>
  );
};

/** Captura de tela que ocupa toda a tela do celular; `opacidade` permite fundir uma com a outra. */
export const Tela: React.FC<{ src: string; opacidade?: number }> = ({ src, opacidade = 1 }) => (
  <Img src={staticFile(`telas/${src}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: opacidade }} />
);

export const alturaCelular = (largura: number) => (largura - 20) * RAZAO + 20;
