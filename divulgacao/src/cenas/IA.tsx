import { AbsoluteFill, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MARCAS, quando } from "../dados";
import { COR, SANS, useFormato } from "../tema";
import { Celular, Tela, posCelular } from "../componentes/Celular";
import { Icone, NomeIcone } from "../componentes/Icone";
import { Rotulo, Surge } from "../componentes/Texto";
import { Sfx } from "../componentes/Som";

const ID = "ia";
const TEMA = "Por que o real perdeu valor desde 1994?";
const ETAPAS: { p: string; t: string; i: NomeIcone }[] = [
  { p: "pesquisa", t: "Pesquisa fontes", i: "pesquisa" },
  { p: "roteiro", t: "Escreve o roteiro", i: "roteiro" },
  { p: "voz", t: "Gera a voz", i: "voz" },
  { p: "imagens", t: "Busca imagens", i: "imagem" },
  { p: "animações", t: "Anima as cenas", i: "anima" },
];

/** Vídeo real feito pelo app, tocando na tela do celular. */
export const VideoReal: React.FC<{ de?: number; style?: React.CSSProperties }> = ({ de = 0, style }) => (
  <OffthreadVideo src={staticFile("real/plano-real.mp4")} startFrom={de} muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />
);

// Modo 1: digita o tema, a IA passa pelas etapas e o vídeo pronto aparece no celular.
export const IA = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v } = useFormato();
  const CEL = posCelular(v);
  const ta = MARCAS["novo-ia"].el["textarea"][0];
  const letras = Math.round(interpolate(f, [4, 40], [0, TEMA.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const ems = ETAPAS.map((e, k) => quando(ID, e.p, 0, 50 + k * 18) - 4);
  const pronto = ems[4] + 16;
  const video = spring({ frame: f - pronto, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: CEL.x, top: CEL.y }}>
        <Celular largura={CEL.largura} rotY={v ? 0 : -8} rotX={3}>
          <Tela nome="novo-ia">
            <div style={{ position: "absolute", left: ta[0] + 3, top: ta[1] + 3, width: ta[2] - 6, height: ta[3] - 6, background: "#0b0d14", borderRadius: 10, padding: "9px 9px", boxSizing: "border-box", fontFamily: "system-ui, -apple-system, Roboto, sans-serif", fontSize: 15.5, lineHeight: 1.35, color: "#f5f6fa" }}>
              {TEMA.slice(0, letras)}
              {letras < TEMA.length && <span style={{ opacity: f % 14 < 7 ? 1 : 0, color: COR.ciano }}>|</span>}
            </div>
          </Tela>
          {video > 0.01 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - video) * 900}px)`, background: "#000" }}>
              <VideoReal de={0} />
            </div>
          )}
        </Celular>
      </div>
      <div style={{ position: "absolute", left: v ? 70 : 860, top: v ? 190 : 150, width: v ? 960 : 1000 }}>
        <Rotulo texto="Modo 1 · Vídeo gerado por IA" em={2} cor={COR.ciano} />
        <Surge texto="Você digita o tema." em={4} tamanho={v ? 60 : 72} peso={800} intervalo={2} style={{ marginTop: 20 }} />
        <Surge texto="A IA faz o resto." em={ems[0] - 6} tamanho={v ? 60 : 72} peso={800} cor={COR.ciano} intervalo={2} style={{ marginTop: 4 }} />
        <div style={{ display: "flex", flexDirection: v ? "row" : "column", gap: v ? 10 : 16, marginTop: v ? 28 : 44 }}>
          {ETAPAS.map((e, k) => {
            const s = spring({ frame: f - ems[k], fps, config: { damping: 14, stiffness: 160 } });
            const feito = f >= ems[k] + 10;
            return (
              <div
                key={k}
                style={{
                  display: "flex",
                  flexDirection: v ? "column" : "row",
                  alignItems: "center",
                  gap: v ? 8 : 20,
                  width: v ? 180 : undefined,
                  padding: v ? "14px 6px" : "14px 24px",
                  borderRadius: 18,
                  background: feito ? "rgba(255,214,10,0.10)" : "rgba(26,31,46,0.8)",
                  border: `1.5px solid ${feito ? COR.ciano : COR.linha}`,
                  opacity: 0.35 + 0.65 * s,
                  transform: `translateX(${(1 - s) * (v ? 0 : 40)}px) scale(${0.94 + 0.06 * s})`,
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: feito ? COR.ciano : "rgba(201,184,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icone nome={feito ? "check" : e.i} tamanho={32} cor={feito ? "#111" : COR.claro} espessura={2.4} />
                </div>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: v ? 22 : 32, color: COR.branco, textAlign: "center", lineHeight: 1.15 }}>{e.t}</span>
              </div>
            );
          })}
        </div>
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        <Sfx key={i} nome="tecla" em={4 + i * 3} volume={0.22} />
      ))}
      {ems.map((e, k) => (
        <Sfx key={"e" + k} nome="pop" em={e + 10} volume={0.4} />
      ))}
      <Sfx nome="whoosh" em={pronto - 2} volume={0.35} />
      <Sfx nome="sucesso" em={pronto + 6} volume={0.35} />
    </AbsoluteFill>
  );
};
