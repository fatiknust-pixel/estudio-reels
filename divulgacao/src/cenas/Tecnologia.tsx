import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { quando } from "../dados";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Icone, NomeIcone } from "../componentes/Icone";
import { Rotulo } from "../componentes/Texto";
import { Sfx } from "../componentes/Som";

const ID = "tecnologia";
type No = { id: string; t: string; s: string; i: NomeIcone; fala: string; cor: string };
const NOS: No[] = [
  { id: "app", t: "App (PWA)", s: "React + Vite", i: "codigo", fala: "React", cor: "#5CC8FF" },
  { id: "acoes", t: "GitHub Actions", s: "roda tudo na nuvem", i: "nuvem", fala: "GitHub", cor: "#C9B8FF" },
  { id: "claude", t: "Claude", s: "pesquisa e roteiro", i: "roteiro", fala: "Claude", cor: "#FFB547" },
  { id: "whisper", t: "Whisper", s: "transcrição por palavra", i: "legenda", fala: "Whisper", cor: "#30D158" },
  { id: "tts", t: "Voz neural", s: "edge-tts", i: "voz", fala: "GitHub", cor: "#FF5A52" },
  { id: "remotion", t: "Remotion", s: "vídeo em React", i: "anima", fala: "Remotion", cor: "#8B5CF6" },
  { id: "mp4", t: "MP4", s: "1080×1920", i: "video", fala: "Claude", cor: "#FFD60A" },
];
const LIGA: [string, string][] = [["app", "acoes"], ["acoes", "claude"], ["acoes", "whisper"], ["acoes", "tts"], ["acoes", "remotion"], ["remotion", "mp4"]];

// Arquitetura: app → GitHub Actions → serviços de IA e render → MP4. Cada peça acende quando é citada.
export const Tecnologia = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v, W, H } = useFormato();
  const L = v ? 440 : 370;
  const A = v ? 112 : 108;
  const pos: Record<string, { x: number; y: number }> = v
    ? { app: { x: 320, y: 330 }, acoes: { x: 320, y: 530 }, claude: { x: 80, y: 760 }, whisper: { x: 560, y: 760 }, tts: { x: 80, y: 930 }, remotion: { x: 560, y: 930 }, mp4: { x: 560, y: 1150 } }
    : { app: { x: 50, y: 470 }, acoes: { x: 500, y: 470 }, claude: { x: 980, y: 230 }, whisper: { x: 980, y: 390 }, tts: { x: 980, y: 550 }, remotion: { x: 980, y: 710 }, mp4: { x: 1460, y: 710 } };
  const em = (n: No) => {
    if (n.id === "tts") return quando(ID, "Actions", 0, 60) + 2;
    if (n.id === "mp4") return quando(ID, "Claude", 0, 120) + 8;
    return quando(ID, n.fala, 0, 30) - 4;
  };
  const ems: Record<string, number> = Object.fromEntries(NOS.map((n) => [n.id, em(n)]));
  const borda = (id: string, lado: "e" | "d" | "c" | "b") => {
    const p = pos[id];
    if (lado === "d") return { x: p.x + L, y: p.y + A / 2 };
    if (lado === "e") return { x: p.x, y: p.y + A / 2 };
    if (lado === "c") return { x: p.x + L / 2, y: p.y };
    return { x: p.x + L / 2, y: p.y + A };
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 190 : 110, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Rotulo texto="Por trás do app" em={2} cor={COR.ciano} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: v ? 50 : 56, color: COR.branco, opacity: spring({ frame: f - 4, fps }) }}>Arquitetura</div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {LIGA.map(([a, b], k) => {
          const ini = v ? borda(a, "b") : borda(a, "d");
          const fim = v ? borda(b, "c") : borda(b, "e");
          const d = v
            ? `M ${ini.x} ${ini.y} C ${ini.x} ${ini.y + 60}, ${fim.x} ${fim.y - 60}, ${fim.x} ${fim.y}`
            : `M ${ini.x} ${ini.y} C ${ini.x + 90} ${ini.y}, ${fim.x - 90} ${fim.y}, ${fim.x} ${fim.y}`;
          const p = interpolate(f, [ems[b] - 6, ems[b] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (p <= 0) return null;
          const ev = evolvePath(p, d);
          const fluxo = (f * 4) % 40;
          return (
            <g key={k}>
              <path d={d} stroke="rgba(201,184,255,0.25)" strokeWidth={3} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
              {p >= 1 && <path d={d} stroke={COR.ciano} strokeWidth={3} fill="none" strokeDasharray="6 34" strokeDashoffset={-fluxo} opacity={0.85} />}
            </g>
          );
        })}
      </svg>
      {NOS.map((n) => {
        const s = spring({ frame: f - ems[n.id], fps, config: { damping: 13, stiffness: 170 } });
        const brilho = interpolate(f - ems[n.id], [0, 6, 26], [0, 1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const p = pos[n.id];
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: L,
              height: A,
              borderRadius: 22,
              background: "rgba(26,31,46,0.92)",
              border: `2px solid ${n.cor}${s > 0.5 ? "" : "55"}`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 ${10 + brilho * 50}px ${n.cor}${brilho > 0.3 ? "88" : "33"}`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 22px",
              boxSizing: "border-box",
              opacity: s,
              transform: `scale(${0.8 + 0.2 * s})`,
            }}
          >
            <div style={{ width: 62, height: 62, borderRadius: 16, background: `${n.cor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icone nome={n.i} tamanho={36} cor={n.cor} espessura={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: v ? 34 : 32, color: COR.branco, whiteSpace: "nowrap" }}>{n.t}</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: v ? 21 : 20, color: COR.suave, whiteSpace: "nowrap" }}>{n.s}</div>
            </div>
          </div>
        );
      })}
      {NOS.map((n) => (
        <Sfx key={n.id} nome="pop" em={ems[n.id] + 2} volume={0.32} />
      ))}
    </AbsoluteFill>
  );
};
