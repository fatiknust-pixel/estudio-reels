import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { quando } from "../dados";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Surge } from "../componentes/Texto";
import { Sfx } from "../componentes/Som";

const ID = "abertura";
const CORES = ["#8B5CF6", "#FFD60A", "#30D158", "#FF5A52", "#5CC8FF", "#FFB547"];

// Linha do tempo de um editor de vídeo lotando de clipes + relógio disparado: "leva horas".
export const Abertura = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v } = useFormato();
  const horas = quando(ID, "horas", 0, 60);
  const caixa = v ? { x: 60, y: 300, w: 960, h: 520 } : { x: 110, y: 230, w: 820, h: 560 };
  const trilhas = 6;
  const alt = (caixa.h - 90) / trilhas;
  const segundos = Math.floor(interpolate(f, [0, horas + 10], [0, 3 * 3600 + 47 * 60 + 12], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) }));
  const hh = String(Math.floor(segundos / 3600)).padStart(2, "0");
  const mm = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  const tremor = f > horas - 4 ? noise2D("t", f * 0.8, 0) * 6 : 0;
  const entra = spring({ frame: f, fps, config: { damping: 18 } });
  const cabeca = (f * 9) % (caixa.w - 40);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: caixa.x,
          top: caixa.y,
          width: caixa.w,
          height: caixa.h,
          borderRadius: 22,
          background: "rgba(19,23,34,0.92)",
          border: `1.5px solid ${COR.linha}`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
          overflow: "hidden",
          opacity: entra,
          transform: `translate(${tremor}px, ${tremor * 0.4}px) scale(${0.92 + 0.08 * entra})`,
        }}
      >
        <div style={{ height: 60, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: `1px solid ${COR.linha}` }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
          ))}
          <span style={{ marginLeft: 14, fontFamily: SANS, fontWeight: 600, fontSize: 20, color: COR.suave }}>projeto_final_v7_AGORA_VAI.mp4</span>
        </div>
        {Array.from({ length: trilhas }, (_, t) => (
          <div key={t} style={{ position: "absolute", left: 0, right: 0, top: 70 + t * alt, height: alt - 8, borderBottom: `1px solid ${COR.linha}` }}>
            {Array.from({ length: 7 }, (_, k) => {
              const em = 2 + (t * 7 + k) * 1.1;
              const s = spring({ frame: f - em, fps, config: { damping: 14, stiffness: 180 } });
              const w = 70 + ((t * 31 + k * 57) % 110);
              const x = ((t * 97 + k * 131) % (caixa.w - 120)) + noise2D("x" + t + k, f * 0.05, 0) * 10;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 6,
                    width: w,
                    height: alt - 20,
                    borderRadius: 8,
                    background: CORES[(t + k) % CORES.length],
                    opacity: 0.85 * s,
                    transform: `scaleX(${s})`,
                    transformOrigin: "0 50%",
                    boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.25)",
                  }}
                />
              );
            })}
          </div>
        ))}
        <div style={{ position: "absolute", left: 20 + cabeca, top: 60, bottom: 0, width: 3, background: COR.vermelho, boxShadow: `0 0 14px ${COR.vermelho}` }} />
      </div>
      <div style={{ position: "absolute", left: v ? 60 : 1010, top: v ? 900 : 300, width: v ? 960 : 820 }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: v ? 96 : 104, color: f >= horas ? COR.vermelho : COR.branco, letterSpacing: 2, textShadow: f >= horas ? `0 0 30px ${COR.vermelho}` : "none" }}>
          {hh}:{mm}:{ss}
        </div>
        <Surge texto="Fazer um vídeo para as redes" em={quando(ID, "Fazer", 0, 6) - 2} tamanho={v ? 56 : 54} peso={600} cor={COR.suave} intervalo={2} style={{ marginTop: 24 }} />
        <Surge texto="leva horas." em={horas - 4} tamanho={v ? 130 : 136} peso={900} destaque={{ horas: COR.vermelho }} intervalo={3} style={{ marginTop: 6 }} />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} nome="tique" em={4 + i * 6} volume={0.2} />
      ))}
      <Sfx nome="impacto" em={horas - 2} volume={0.35} />
    </AbsoluteFill>
  );
};
