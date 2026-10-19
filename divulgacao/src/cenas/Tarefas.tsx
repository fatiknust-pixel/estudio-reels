import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { quando } from "../dados";
import { COR, SANS, useFormato } from "../tema";
import { Icone, NomeIcone } from "../componentes/Icone";
import { Sfx } from "../componentes/Som";

const ID = "tarefas";
const ITENS: { p: string; t: string; i: NomeIcone; c: string }[] = [
  { p: "Roteiro", t: "Roteiro", i: "roteiro", c: "#8B5CF6" },
  { p: "narração", t: "Narração", i: "voz", c: "#5CC8FF" },
  { p: "legendas", t: "Legendas", i: "legenda", c: "#FFD60A" },
  { p: "cortes", t: "Cortes", i: "cortes", c: "#FF5A52" },
  { p: "efeitos", t: "Efeitos", i: "efeitos", c: "#30D158" },
];

// Cada tarefa cai na tela quando é falada e a pilha fica cada vez mais bagunçada.
export const Tarefas = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v, W, H } = useFormato();
  const ems = ITENS.map((it, k) => quando(ID, it.p, 0, 6 + k * 12) - 3);
  const caos = interpolate(f, [ems[4], ems[4] + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {ITENS.map((it, k) => {
        const s = spring({ frame: f - ems[k], fps, config: { damping: 11, stiffness: 170 } });
        if (s <= 0.001) return null;
        const pos = v
          ? { x: W / 2 - 330 + (k % 2 ? 80 : -60), y: 330 + k * 210 }
          : { x: 170 + k * 330, y: H / 2 - 120 + (k % 2 ? -90 : 70) };
        const rot = (k % 2 ? 6 : -7) + noise2D("r" + k, f * 0.04, 0) * 3 * (1 + caos * 2);
        const dx = noise2D("x" + k, f * 0.06, 1) * 18 * caos;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: pos.x + dx,
              top: pos.y - (1 - s) * 260,
              width: v ? 660 : 300,
              height: v ? 170 : 240,
              borderRadius: 26,
              background: COR.card,
              border: `2px solid ${it.c}88`,
              boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 40px ${it.c}33`,
              display: "flex",
              flexDirection: v ? "row" : "column",
              alignItems: "center",
              justifyContent: "center",
              gap: v ? 34 : 22,
              transform: `rotate(${rot * s}deg) scale(${0.6 + 0.4 * s})`,
              opacity: Math.min(1, s * 1.4),
            }}
          >
            <div style={{ width: v ? 100 : 96, height: v ? 100 : 96, borderRadius: 24, background: `${it.c}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icone nome={it.i} tamanho={v ? 60 : 58} cor={it.c} />
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: v ? 64 : 46, color: COR.branco }}>{it.t}</div>
          </div>
        );
      })}
      {ems.map((e, k) => (
        <Sfx key={k} nome="pop" em={e + 2} volume={0.5} />
      ))}
      <Sfx nome="glitch" em={ems[4] + 8} volume={0.22} />
    </AbsoluteFill>
  );
};
