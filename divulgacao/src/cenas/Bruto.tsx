import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { quando } from "../dados";
import { COR, SANS, useFormato } from "../tema";
import { Celular, Tela, posCelular } from "../componentes/Celular";
import { Ficha, Rotulo, Surge } from "../componentes/Texto";
import { Sfx } from "../componentes/Som";

const ID = "bruto";
// Legenda simulada no estilo "Legenda impacto": 1–2 palavras por vez, destaque amarelo e zoom.
const FALA: { w: string; forte?: boolean }[] = [
  { w: "EU" }, { w: "EDITEI" }, { w: "ESTE", forte: false }, { w: "VÍDEO", forte: true }, { w: "EM" }, { w: "DOIS", forte: true }, { w: "MINUTOS", forte: true },
];

/** "Vídeo bruto" abstrato (sem pessoas) com a legenda de impacto por cima. */
const VideoBruto: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.floor(t / 7);
  const idx = Math.min(FALA.length - 1, Math.max(0, k));
  const pal = FALA[idx];
  const pop = spring({ frame: t - k * 7, fps: 30, config: { damping: 9, stiffness: 260 } });
  const zoom = pal.forte ? 1.12 : 1;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#1b1430" }}>
      <div style={{ position: "absolute", inset: -60, transform: `scale(${zoom}) translate(${noise2D("bx", t * 0.02, 0) * 20}px, ${noise2D("by", 0, t * 0.02) * 20}px)`, transition: "none" }}>
        <div style={{ position: "absolute", left: 40, top: 120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", opacity: 0.8 }} />
        <div style={{ position: "absolute", left: 180, top: 420, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, #FF5A52 0%, transparent 70%)", opacity: 0.55 }} />
        <div style={{ position: "absolute", left: -40, top: 560, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, #5CC8FF 0%, transparent 70%)", opacity: 0.45 }} />
      </div>
      {/* barra de progresso no topo, como no app */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${Math.min(100, t * 1.1)}%`, background: COR.ciano }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 64, letterSpacing: -1, lineHeight: 1 }}>
        <span
          style={{
            display: "inline-block",
            color: pal.forte ? COR.ciano : "#fff",
            transform: `scale(${0.6 + 0.4 * pop})`,
            textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,0.6)",
            WebkitTextStroke: "2px #000",
          }}
        >
          {pal.w}
        </span>
      </div>
    </div>
  );
};

/** Onda sonora em que as pausas somem (cortes automáticos). */
const Onda: React.FC<{ f: number; corte: number; largura: number }> = ({ f, corte, largura }) => {
  const c = interpolate(f, [corte, corte + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barras = 64;
  const pausas = [[14, 22], [38, 45]];
  let x = 0;
  const els: React.ReactNode[] = [];
  for (let i = 0; i < barras; i++) {
    const pausa = pausas.some(([a, b]) => i >= a && i < b);
    const w = pausa ? (largura / barras) * (1 - c) : largura / barras;
    const h = pausa ? 6 : 20 + Math.abs(noise2D("o", i * 0.35, 0)) * 90 + Math.abs(Math.sin(i * 1.7)) * 20;
    els.push(<rect key={i} x={x + 1} y={60 - h / 2} width={Math.max(0, w - 3)} height={h} rx={2} fill={pausa ? COR.vermelho : COR.claro} opacity={pausa ? 1 - c : 0.9} />);
    x += w;
  }
  return (
    <svg width={largura} height={120} style={{ display: "block" }}>
      {els}
    </svg>
  );
};

// Modo 2: vídeo seu + estilo viral → legenda, cortes nas pausas e zoom.
export const Bruto = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v } = useFormato();
  const CEL = posCelular(v);
  const legenda = quando(ID, "legenda", 0, 50) - 6;
  const cortes = quando(ID, "cortes", 0, 90) - 6;
  const zoom = quando(ID, "zoom", 0, 120) - 6;
  const troca = legenda - 4;
  const sobe = spring({ frame: f - troca, fps, config: { damping: 18, stiffness: 130 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: CEL.x, top: CEL.y }}>
        <Celular largura={CEL.largura} rotY={v ? 0 : -8} rotX={3}>
          <Tela nome="novo-bruto" />
          {sobe > 0.01 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - sobe) * 900}px)` }}>
              <VideoBruto t={f - troca} />
            </div>
          )}
        </Celular>
      </div>
      <div style={{ position: "absolute", left: v ? 70 : 860, top: v ? 190 : 150, width: v ? 960 : 1000 }}>
        <Rotulo texto="Modo 2 · Seu vídeo" em={2} cor={COR.ciano} />
        <Surge texto="Grave. Envie." em={4} tamanho={v ? 60 : 72} peso={800} intervalo={2} style={{ marginTop: 20 }} />
        <Surge texto="Pronto para viralizar." em={troca} tamanho={v ? 60 : 72} peso={800} cor={COR.ciano} intervalo={2} style={{ marginTop: 4 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: v ? 10 : 16, marginTop: v ? 24 : 40 }}>
          <Ficha texto="Legenda palavra por palavra (Whisper)" em={legenda} cor={COR.ciano} style={v ? { fontSize: 24, padding: "10px 20px" } : undefined} />
          <Ficha texto="Cortes automáticos nas pausas" em={cortes} cor={COR.vermelho} style={v ? { fontSize: 24, padding: "10px 20px" } : undefined} />
          <Ficha texto="Zoom e destaque no que importa" em={zoom} cor={COR.azul} style={v ? { fontSize: 24, padding: "10px 20px" } : undefined} />
        </div>
        {!v && (
          <div style={{ marginTop: 40, opacity: spring({ frame: f - cortes + 6, fps }) }}>
            <Onda f={f} corte={cortes + 6} largura={820} />
          </div>
        )}
      </div>
      <Sfx nome="whoosh" em={troca} volume={0.3} />
      {FALA.map((_, k) => (
        <Sfx key={k} nome="pop" em={troca + k * 7} volume={0.25} />
      ))}
      <Sfx nome="swoosh" em={cortes + 6} volume={0.35} />
    </AbsoluteFill>
  );
};
