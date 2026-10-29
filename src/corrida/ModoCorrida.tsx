// Modo "corrida" (estilo "ball race"): pistas neon, placas com vida, bolinhas com física de verdade martelando cada placa.
import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arquivoGlobal } from "../arquivos";
import { Corrida, RegraPista } from "../tipos";
import { fisica, MAX_BOLAS } from "./fisica";
import { fmtNum, rng, simular } from "./simular";

const FONTE = "'Poppins', 'Montserrat', sans-serif";
const TOPO_PISTAS = 360, BASE_PISTAS = 1660; // faixa das pistas no quadro 1080×1920
const MARGEM = 16, VAO = 18;
const ESTILHACOS = 26, DUR_ESTILHACO = 26; // pedaços da placa quando quebra e quantos quadros duram

const textoRegra = (r: RegraPista) => (r.tipo === "multiplica" ? `×${r.valor} BALLS!` : r.tipo === "forca" ? `×${r.valor} POWER!` : `+${fmtNum(r.valor)}!`);

// "#rrggbb" + alfa (0–1) → rgba
const rgba = (hex: string, a: number) => {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
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
  const n = c.pistas.length;
  const larg = (1080 - MARGEM * 2 - VAO * (n - 1)) / n;
  const altPista = BASE_PISTAS - TOPO_PISTAS;
  const yPlaca = (k: number) => 130 + (k * (altPista - 190)) / (c.paredes.length - 1); // na pista
  const { sim, fis } = useMemo(() => {
    const sim = simular(c, fps);
    return { sim, fis: fisica(c, sim, { largura: larg, altura: altPista, placas: c.paredes.map((_, k) => yPlaca(k)) }) };
  }, [c, fps]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = Math.min(f, sim.quadros.length - 1);
  // o que está na tela vem da física: placa atual, quebras e chegada de cada pista
  const est = fis.map((fp) => ({ parede: fp.parede[q], fim: fp.fim !== null && q >= fp.fim ? fp.fim : null }));
  const fins = fis.map((fp) => fp.fim ?? Infinity);
  const vencedora = fins.indexOf(Math.min(...fins)), fimVencedora = fins[vencedora];
  const quebras = fis.flatMap((fp, pista) => fp.quebras.map((quadro, parede) => ({ pista, parede, quadro })));
  const venceu = f >= fimVencedora;
  const entraVit = spring({ frame: f - fimVencedora, fps, config: { damping: 12 } });

  // sons de batida: um "tic" a cada 3 quadros enquanto alguma pista está martelando (mais alto com mais batidas)
  const tics = useMemo(() => {
    const out: { q: number; v: number }[] = [];
    let ultimo = -99;
    for (let k = 0; k < sim.quadros.length; k++) {
      const g = fis.reduce((s, p) => s + p.golpes[k], 0);
      if (g && k - ultimo >= 3) { out.push({ q: k, v: Math.min(0.75, 0.35 + g / 150) }); ultimo = k; }
    }
    return out;
  }, [sim, fis]);

  // desenho das placas, bolinhas e estilhaços
  const tela = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = tela.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 1080, altPista);
    c.pistas.forEach((p, i) => {
      const e = est[i], fp = fis[i], ox = MARGEM + i * (larg + VAO);
      ctx.save();
      ctx.beginPath();
      ctx.rect(ox, 0, larg, altPista);
      ctx.clip();
      // placas ainda inteiras
      if (e.fim === null) {
        for (let k = e.parede; k < c.paredes.length; k++) {
          const atual = k === e.parede;
          const golpe = atual ? fp.golpes[q] : 0;
          const tremor = golpe ? (rng(q * 13 + i)() - 0.5) * Math.min(6, 2 + golpe / 10) : 0;
          const y = yPlaca(k) + tremor, x0 = ox + 12, w = larg - 24;
          const frac = atual ? Math.max(0, fp.hpTela[q] / c.paredes[k]) : 1;
          ctx.fillStyle = rgba(p.cor, 0.18);
          ctx.beginPath(); ctx.roundRect(x0, y, w, 12, 6); ctx.fill();
          ctx.shadowColor = p.cor;
          ctx.shadowBlur = atual ? (golpe ? 30 : 16) : 0;
          ctx.fillStyle = atual ? (golpe ? "#ffffff" : p.cor) : rgba(p.cor, 0.45);
          ctx.beginPath(); ctx.roundRect(x0, y, Math.max(6, w * frac), 12, 6); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      // estilhaços das placas quebradas há pouco
      for (const qb of quebras) {
        if (qb.pista !== i || f < qb.quadro || f > qb.quadro + DUR_ESTILHACO) continue;
        const t = (f - qb.quadro) / fps, rr = rng(qb.quadro * 7 + qb.parede * 131 + i);
        ctx.fillStyle = p.cor;
        ctx.globalAlpha = 1 - (f - qb.quadro) / DUR_ESTILHACO;
        for (let s = 0; s < ESTILHACOS; s++) {
          const x = ox + 12 + rr() * (larg - 24) + (rr() - 0.5) * 500 * t;
          const y = yPlaca(qb.parede) + (-250 - rr() * 450) * t + 1800 * t * t;
          ctx.fillRect(x, y, 6 + rr() * 10, 4 + rr() * 5);
        }
        ctx.globalAlpha = 1;
      }
      // bolinhas: brilho somado (onde há muitas, vira uma massa luminosa)
      const nb = fp.n[q], rb = fp.raio[q];
      ctx.globalCompositeOperation = "lighter";
      for (let b = 0; b < nb; b++) {
        const x = ox + fp.pos[(q * MAX_BOLAS + b) * 2], y = fp.pos[(q * MAX_BOLAS + b) * 2 + 1];
        ctx.fillStyle = rgba(p.cor, 0.13);
        ctx.beginPath(); ctx.arc(x, y, rb * 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.cor;
        ctx.beginPath(); ctx.arc(x, y, rb, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath(); ctx.arc(x - rb * 0.3, y - rb * 0.3, rb * 0.42, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    });
  });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #1d1240 0%, #0b0818 55%, #07060f 100%)", fontFamily: FONTE, color: "#fff" }}>
      {c.musica !== false && <Audio src={arquivoGlobal("sfx/trilha-epica.mp3")} volume={0.45} loop />}
      {tics.map((t) => (
        <Sequence key={`t${t.q}`} from={t.q} durationInFrames={6} layout="none">
          <Audio src={arquivoGlobal("sfx/corrida-bate.mp3")} volume={t.v} />
        </Sequence>
      ))}
      {quebras.map((qb) => (
        <Sequence key={`${qb.pista}-${qb.parede}`} from={qb.quadro} durationInFrames={20} layout="none">
          <Audio src={arquivoGlobal(qb.parede === c.paredes.length - 1 ? "sfx/ding.mp3" : "sfx/corrida-quebra.mp3")} volume={qb.parede === c.paredes.length - 1 ? 1 : 0.8} />
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

      {/* pistas: moldura, números de vida e avisos (as bolinhas e placas vão no canvas por cima) */}
      {c.pistas.map((p, i) => {
        const e = est[i], fp = fis[i];
        const ganhou = venceu && i === vencedora;
        const ultimaQuebra = quebras.filter((qb) => qb.pista === i && qb.quadro <= f).pop();
        const idadeQuebra = ultimaQuebra ? f - ultimaQuebra.quadro : 999;
        return (
          <div key={i} style={{ position: "absolute", left: MARGEM + i * (larg + VAO), top: TOPO_PISTAS, width: larg, height: altPista, borderRadius: 22, border: `2px solid ${ganhou ? p.cor : "#2a2450"}`, background: "#0e0b20cc", boxShadow: ganhou ? `0 0 40px ${p.cor}` : "none" }}>
            {e.fim === null && c.paredes.map((hp, k) => {
              if (k < e.parede) return null;
              const atual = k === e.parede;
              const golpe = atual && fp.golpes[q] > 0;
              return (
                <div key={k} style={{ position: "absolute", left: 0, right: 0, top: yPlaca(k) - 46, textAlign: "center", fontSize: 32, fontWeight: 800, color: atual ? "#fff" : "#cfcae8", transform: golpe ? "scale(1.06)" : undefined, textShadow: atual ? `0 0 12px ${p.cor}` : undefined }}>
                  {fmtNum(atual ? fp.hpTela[q] : hp)}
                </div>
              );
            })}
            {ultimaQuebra && idadeQuebra < 30 && e.fim === null && (
              <div style={{ position: "absolute", width: "100%", top: yPlaca(ultimaQuebra.parede) - 60 - idadeQuebra * 2.5, textAlign: "center", fontSize: 42, fontWeight: 800, color: "#fff", textShadow: `0 0 18px ${p.cor}, 0 0 4px ${p.cor}`, opacity: interpolate(idadeQuebra, [0, 4, 22, 30], [0, 1, 1, 0]), transform: `scale(${interpolate(idadeQuebra, [0, 5], [0.6, 1], { extrapolateRight: "clamp" })})` }}>
                {textoRegra(p.regra)}
              </div>
            )}
            {e.fim !== null && (
              <div style={{ position: "absolute", top: "32%", width: "100%", textAlign: "center", transform: `scale(${i === vencedora ? entraVit : 0.8})` }}>
                <div style={{ fontSize: 110 }}>{i === vencedora ? "🏆" : "✅"}</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: p.cor }}>{i === vencedora ? "WINNER!" : "DONE"}</div>
              </div>
            )}
          </div>
        );
      })}
      <canvas ref={tela} width={1080} height={altPista} style={{ position: "absolute", left: 0, top: TOPO_PISTAS, width: 1080, height: altPista, pointerEvents: "none" }} />

      {/* rodapé: mascotes, balão de seguir e barra de progresso */}
      <Mascote cor="#3fb6ff" x={-20} lado={1} />
      <Mascote cor="#b07bff" x={910} lado={-1} />
      <div style={{ position: "absolute", left: 190, top: 1690, padding: "14px 30px", borderRadius: 26, background: "#fff", color: "#111", textAlign: "center", boxShadow: "0 8px 24px #0008", opacity: venceu ? 0 : 1 }}>
        <div style={{ fontSize: 38, fontWeight: 800 }}>Leave a follow!</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: "#555" }}>{c.canal}</div>
      </div>
      {venceu && (
        <div style={{ position: "absolute", left: 160, right: 160, top: 1680, padding: "14px 20px", borderRadius: 26, background: c.pistas[vencedora].cor, color: "#111", textAlign: "center", transform: `scale(${entraVit})`, fontWeight: 800 }}>
          <div style={{ fontSize: 30 }}>WINNER</div>
          <div style={{ fontSize: 48 }}>{c.pistas[vencedora].nome}</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1880, height: 6, borderRadius: 3, background: "#ffffff22" }}>
        <div style={{ width: `${(f / durationInFrames) * 100}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
      </div>
    </AbsoluteFill>
  );
};
