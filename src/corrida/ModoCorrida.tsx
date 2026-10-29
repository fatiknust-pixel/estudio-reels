// Modo "corrida" (estilo "ball race"): pistas neon, paredes com vida, massa de bolinhas que cresce pela regra da pista.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arquivoGlobal } from "../arquivos";
import { Corrida } from "../tipos";
import { EstadoPista, fmtNum, rng, simular } from "./simular";

const FONTE = "'Poppins', 'Montserrat', sans-serif";
const TOPO_PISTAS = 360, BASE_PISTAS = 1660; // faixa das pistas no quadro 1080×1920
const MARGEM = 16, VAO = 18;

// Massa de bolinhas: quantos pontos desenhar e a altura do bloco crescem com o log da quantidade
const Massa: React.FC<{ e: EstadoPista; cor: string; largura: number; y: number; semente: number }> = ({ e, cor, largura, y, semente }) => {
  const f = useCurrentFrame();
  const total = e.bolas;
  const pontos = useMemo(() => {
    const r = rng(semente);
    return Array.from({ length: 170 }, () => ({ x: r(), y: r(), fase: r() * 6.28, tam: 5 + r() * 6 }));
  }, [semente]);
  if (total <= 1.5) {
    // uma bolinha só
    return <div style={{ position: "absolute", left: largura / 2 - 15, top: y - 92, width: 30, height: 30, borderRadius: 15, background: cor, boxShadow: `0 0 24px 8px ${cor}aa` }} />;
  }
  const alt = Math.min(170, 28 + 24 * Math.log10(total));
  const n = Math.min(pontos.length, Math.max(6, Math.round(14 * Math.log10(total + 1) ** 1.6)));
  return (
    <div style={{ position: "absolute", left: 6, top: y - alt - 58, width: largura - 12, height: alt, borderRadius: 18, background: `${cor}55`, boxShadow: `0 0 50px 14px ${cor}77`, overflow: "hidden" }}>
      {pontos.slice(0, n).map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x * 96}%`, top: `${(p.y * 88 + Math.sin(f * 0.35 + p.fase) * 4) | 0}%`, width: p.tam, height: p.tam, borderRadius: p.tam, background: "#fff", opacity: 0.55 + 0.45 * Math.sin(f * 0.2 + p.fase) ** 2 }} />
      ))}
    </div>
  );
};

const Mascote: React.FC<{ cor: string; x: number; lado: 1 | -1 }> = ({ cor, x, lado }) => {
  const f = useCurrentFrame();
  const pulo = Math.abs(Math.sin(f / 9)) * 14;
  return (
    <div style={{ position: "absolute", left: x, top: 1700 - pulo, width: 190, height: 190, borderRadius: 95, background: `radial-gradient(circle at 35% 30%, #fff8, ${cor} 45%, ${cor}cc)`, boxShadow: `0 10px 30px ${cor}88` }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", top: 58, left: 50 + k * 56 + lado * 4, width: 36, height: 42, borderRadius: 20, background: "#fff" }}>
          <div style={{ position: "absolute", top: 12, left: 10 + lado * 4, width: 16, height: 18, borderRadius: 9, background: "#111" }} />
        </div>
      ))}
      <div style={{ position: "absolute", top: 118, left: 70, width: 50, height: 28, borderRadius: "0 0 28px 28px", background: "#222" }}>
        <div style={{ position: "absolute", bottom: 0, left: 13, width: 24, height: 12, borderRadius: 12, background: "#ff6b8b" }} />
      </div>
    </div>
  );
};

export const ModoCorrida: React.FC<{ corrida: Corrida }> = ({ corrida: c }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sim = useMemo(() => simular(c, fps), [c, fps]);
  const est = sim.quadros[Math.min(f, sim.quadros.length - 1)];
  const n = c.pistas.length;
  const larg = (1080 - MARGEM * 2 - VAO * (n - 1)) / n;
  const yParede = (k: number) => TOPO_PISTAS + 120 + (k * (BASE_PISTAS - TOPO_PISTAS - 170)) / (c.paredes.length - 1);
  const venceu = f >= sim.fimVencedora;
  const entraVit = spring({ frame: f - sim.fimVencedora, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #1d1240 0%, #0b0818 55%, #07060f 100%)", fontFamily: FONTE, color: "#fff" }}>
      {c.musica !== false && <Audio src={arquivoGlobal("sfx/trilha-epica.mp3")} volume={0.12} loop />}
      {sim.quebras.map((q) => (
        <Sequence key={`${q.pista}-${q.parede}`} from={q.quadro} durationInFrames={15} layout="none">
          <Audio src={arquivoGlobal(q.parede === c.paredes.length - 1 ? "sfx/ding.mp3" : "sfx/pop.mp3")} volume={0.35} />
        </Sequence>
      ))}

      {/* topo: título, regras de cada pista e subtítulo */}
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "8px 26px", borderRadius: 40, border: "3px solid #8a6dff", background: "#1a1438", fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>{c.titulo}</span>
      </div>
      {c.pistas.map((p, i) => (
        <div key={i} style={{ position: "absolute", top: 150, left: MARGEM + i * (larg + VAO), width: larg, textAlign: "center" }}>
          <div style={{ fontSize: Math.min(56, (larg * 1.75) / Math.max(1, p.nome.length)), fontWeight: 800, color: p.cor, lineHeight: 1.05, textShadow: `0 0 20px ${p.cor}88`, whiteSpace: "nowrap" }}>{p.nome}</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: p.cor, opacity: 0.85, marginTop: 6 }}>{p.desc}</div>
        </div>
      ))}
      <div style={{ position: "absolute", top: 290, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 700, color: "#FFC83D" }}>{c.subtitulo}</div>

      {/* pistas */}
      {c.pistas.map((p, i) => {
        const e = est[i];
        const x = MARGEM + i * (larg + VAO);
        const ganhou = venceu && i === sim.vencedora;
        // altura da massa: parada acima da parede atual; em viagem, desce da anterior até ela
        const yMassa = e.fim !== null ? yParede(c.paredes.length - 1) + 60 : e.parede === 0 ? yParede(0) : interpolate(e.viagem, [0, 1], [yParede(e.parede - 1), yParede(e.parede)]);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: TOPO_PISTAS, width: larg, height: BASE_PISTAS - TOPO_PISTAS, borderRadius: 22, border: `2px solid ${ganhou ? p.cor : "#2a2450"}`, background: "#0e0b20cc", boxShadow: ganhou ? `0 0 40px ${p.cor}` : "none" }}>
            {c.paredes.map((hp, k) => {
              if (k < e.parede || e.fim !== null) return null; // já quebrada
              const atual = k === e.parede && e.viagem >= 1;
              const frac = atual ? Math.max(0, e.hp / hp) : 1;
              const y = yParede(k) - TOPO_PISTAS;
              return (
                <div key={k} style={{ position: "absolute", left: 14, right: 14, top: y }}>
                  <div style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginTop: -46, color: atual ? "#fff" : "#d8d4ee" }}>{fmtNum(atual ? e.hp : hp)}</div>
                  <div style={{ height: 8, borderRadius: 4, background: `${p.cor}33`, marginTop: 4 }}>
                    <div style={{ width: `${frac * 100}%`, height: "100%", borderRadius: 4, background: atual ? p.cor : `${p.cor}66`, boxShadow: atual ? `0 0 14px ${p.cor}` : "none" }} />
                  </div>
                </div>
              );
            })}
            {e.fim === null && <Massa e={e} cor={p.cor} largura={larg} y={yMassa - TOPO_PISTAS} semente={c.semente + i} />}
            {e.fim !== null && (
              <div style={{ position: "absolute", top: "40%", width: "100%", textAlign: "center", transform: `scale(${i === sim.vencedora ? entraVit : 0.8})` }}>
                <div style={{ fontSize: 110 }}>{i === sim.vencedora ? "🏆" : "✅"}</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: p.cor }}>{i === sim.vencedora ? "WINNER!" : "DONE"}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* rodapé: mascotes, balão de seguir e barra de progresso */}
      <Mascote cor="#3fb6ff" x={-20} lado={1} />
      <Mascote cor="#b07bff" x={910} lado={-1} />
      <div style={{ position: "absolute", left: 190, top: 1690, padding: "14px 30px", borderRadius: 26, background: "#fff", color: "#111", textAlign: "center", boxShadow: "0 8px 24px #0008", opacity: venceu ? 0 : 1 }}>
        <div style={{ fontSize: 38, fontWeight: 800 }}>Leave a follow!</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: "#555" }}>{c.canal}</div>
      </div>
      {venceu && (
        <div style={{ position: "absolute", left: 160, right: 160, top: 1680, padding: "14px 20px", borderRadius: 26, background: c.pistas[sim.vencedora].cor, color: "#111", textAlign: "center", transform: `scale(${entraVit})`, fontWeight: 800 }}>
          <div style={{ fontSize: 30 }}>WINNER</div>
          <div style={{ fontSize: 48 }}>{c.pistas[sim.vencedora].nome}</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1880, height: 6, borderRadius: 3, background: "#ffffff22" }}>
        <div style={{ width: `${(f / durationInFrames) * 100}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
      </div>
    </AbsoluteFill>
  );
};
