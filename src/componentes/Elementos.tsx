import React, { createContext, useCallback, useContext, useState } from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { arquivoGlobal as arquivo } from "../arquivos";
import { ElementoTempo } from "../linhaTempo";
import { corDe, useCor, useVideo } from "../contexto";
import { FONTE, POSICAO } from "../fontes";
import { Icone } from "./Icone";
import { ajusteElemento } from "./Dinamica";
import { FotoEnquadrada } from "../foto";
import { AjusteMargem, MARGEM_TELA } from "./AjusteMargem";

const useMola = (atraso = 0, config = { damping: 13, stiffness: 140, mass: 0.8 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - atraso, fps, config });
};

const sfx = (nome: string, volume = 0.5, atraso = 0) => (
  <Sequence from={atraso} layout="none">
    <Audio src={arquivo(`sfx/${nome}.mp3`)} volume={volume} />
  </Sequence>
);

const Caixa: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { leve } = useVideo();
  return (
    <div style={{ background: `${useCor().fundo}${leve ? "F2" : "D6"}`, border: "2px solid rgba(255,255,255,0.14)", borderRadius: 36, ...(leve ? {} : { boxShadow: "0 30px 80px rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }), ...style }}>
      {children}
    </div>
  );
};

/* ---------- elementos ---------- */

const Titulo: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const m = useMola();
  const m2 = useMola(6);
  const c = corDe(COR, e.cor);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {sfx("whoosh", 0.35)}
      <div style={{ transform: `skewX(-8deg) scaleX(${m})`, background: c, padding: "14px 40px", borderRadius: 14, boxShadow: `0 0 60px ${c}66` }}>
        <div style={{ transform: "skewX(8deg)", fontFamily: FONTE, fontWeight: 900, fontSize: 76, color: c === COR.amarelo ? "#111" : "#fff", letterSpacing: -1, whiteSpace: "nowrap", opacity: m }}>
          {e.texto}
        </div>
      </div>
      {e.sub && (
        <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: "#fff", opacity: m2, transform: `translateY(${(1 - m2) * 30}px)`, textShadow: "0 4px 18px #000" }}>{e.sub}</div>
      )}
    </div>
  );
};

const Pergunta: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const f = useCurrentFrame();
  const m = useMola(0, { damping: 9, stiffness: 160, mass: 0.7 });
  const balanco = Math.sin(f / 4) * 2;
  return (
    <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 120, color: "#fff", transform: `scale(${m}) rotate(${balanco}deg)`, textShadow: "0 10px 40px rgba(0,0,0,.9)", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", letterSpacing: -3 }}>
      {sfx("pop", 0.6)}
      {e.texto}
    </div>
  );
};

const Carimbo: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const escala = interpolate(f, [0, 6], [2.6, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const tremor = f < 12 ? Math.sin(f * 3) * (12 - f) * 0.8 : 0;
  const c = corDe(COR, e.cor);
  return (
    <div style={{ transform: `translate(${tremor}px, 90px) rotate(-10deg) scale(${escala})`, opacity: interpolate(f, [0, 3], [0, 1]) }}>
      {sfx("carimbo", 0.9)}
      <div style={{ border: `12px solid ${c}`, borderRadius: 22, padding: "6px 34px", fontFamily: FONTE, fontWeight: 900, fontSize: 118, color: c, letterSpacing: 4, background: "rgba(0,0,0,0.35)", boxShadow: `0 0 50px ${c}88, inset 0 0 30px ${c}55`, whiteSpace: "nowrap" }}>
        {e.texto}
      </div>
    </div>
  );
};

const Tag: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const m = useMola();
  const c = corDe(COR, e.cor ?? "azul");
  return (
    <div style={{ transform: `translateX(${(1 - m) * 700}px)`, opacity: m }}>
      {sfx("pop", 0.45)}
      <Caixa style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 36px 18px 18px", borderRadius: 999, borderColor: c }}>
        <div style={{ width: 84, height: 84, borderRadius: 99, background: c, display: "grid", placeItems: "center" }}>
          <Icone nome={e.icone ?? "documento"} tamanho={54} cor={c === COR.amarelo ? "#111" : "#fff"} />
        </div>
        <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 46, color: "#fff", whiteSpace: "nowrap" }}>{e.texto}</div>
      </Caixa>
    </div>
  );
};

const Pessoa: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const m2 = useMola(8);
  const { imagem, projeto } = useVideo();
  const src = imagem(e.imagem);
  const iniciais = (e.nome as string).split(" ").map((p) => p[0]).slice(0, 2).join("");
  const D = 340;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      {sfx("whoosh", 0.4)}
      <div style={{ position: "relative", width: D + 40, height: D + 40, transform: `scale(${m})` }}>
        <svg width={D + 40} height={D + 40} style={{ position: "absolute", inset: 0, transform: `rotate(${f * 1.5}deg)` }}>
          <circle cx={(D + 40) / 2} cy={(D + 40) / 2} r={D / 2 + 14} fill="none" stroke={COR.destaque} strokeWidth={8} strokeDasharray="40 22" />
        </svg>
        <div style={{ position: "absolute", left: 20, top: 20, width: D, height: D, borderRadius: "50%", overflow: "hidden", background: `linear-gradient(135deg, ${COR.azul}, ${COR.roxo})`, display: "grid", placeItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
          {src ? (
            <FotoEnquadrada src={src} info={projeto.imagens?.[e.imagem]} w={D} h={D} zoom={1.02 + f * 0.0012} redonda />
          ) : (
            <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 150, color: "#fff" }}>{iniciais}</div>
          )}
        </div>
      </div>
      <div style={{ opacity: m2, transform: `translateY(${(1 - m2) * 40}px)`, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#fff", color: "#111", fontFamily: FONTE, fontWeight: 900, fontSize: 58, padding: "6px 28px", borderRadius: 12 }}>{e.nome}</div>
        <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 36, color: COR.amarelo, marginTop: 10, textShadow: "0 3px 12px #000" }}>{e.cargo}</div>
      </div>
    </div>
  );
};

const Icones: React.FC<{ e: ElementoTempo }> = ({ e }) => (
  <Caixa style={{ display: "flex", alignItems: "center", gap: 26, padding: "34px 40px" }}>
    {(e.itens as [string, string][]).map(([ic, rot], i) => <ItemIcone key={i} i={i} ic={ic} rot={rot} />)}
  </Caixa>
);
const ItemIcone: React.FC<{ i: number; ic: string; rot: string }> = ({ i, ic, rot }) => {
  const COR = useCor();
  const m = useMola(i * 7);
  const seta = ic === "seta";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `scale(${m})`, opacity: m }}>
      {!seta && sfx("pop", 0.35, i * 7)}
      <div style={{ width: seta ? 90 : 170, height: 170, borderRadius: 40, background: seta ? "transparent" : "rgba(255,255,255,0.08)", display: "grid", placeItems: "center", border: seta ? "none" : "3px solid rgba(255,255,255,.2)" }}>
        <Icone nome={ic} tamanho={seta ? 90 : 110} cor={seta ? COR.amarelo : "#fff"} espessura={seta ? 6 : 3.5} />
      </div>
      {rot && <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 32, color: "#fff", maxWidth: 240, textAlign: "center" }}>{rot}</div>}
    </div>
  );
};

const Contador: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const dur = 32;
  const t = interpolate(f, [6, 6 + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const valor = Math.round(e.de + (e.ate - e.de) * t);
  const fim = f >= 6 + dur;
  return (
    <Caixa style={{ padding: "28px 70px", textAlign: "center", transform: `scale(${m})` }}>
      {sfx("pop", 0.4)}
      {e.rotulo && <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: COR.suave }}>{e.rotulo}</div>}
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 230, lineHeight: 1, color: fim ? COR.amarelo : "#fff", transform: `scale(${fim ? 1 + Math.max(0, 0.12 - (f - 6 - dur) * 0.02) : 1})`, fontVariantNumeric: "tabular-nums" }}>
        {valor}
      </div>
      <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 50, color: "#fff", textTransform: "uppercase" }}>{e.unidade}</div>
      <SomFim em={6 + dur} />
    </Caixa>
  );
};
const SomFim: React.FC<{ em: number }> = ({ em }) => sfx("ding", 0.35, em);

const Linha: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const itens = e.itens as [string, string][];
  const prog = interpolate(f, [4, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const W = 820;
  return (
    <Caixa style={{ width: W + 80, padding: "26px 40px 24px" }}>
      <div style={{ position: "relative", height: 130 }}>
        <div style={{ position: "absolute", top: 25, left: 30, right: 30, height: 10, borderRadius: 9, background: "rgba(255,255,255,.15)" }} />
        <div style={{ position: "absolute", top: 25, left: 30, width: (W - 60) * prog, height: 10, borderRadius: 9, background: COR.amarelo }} />
        {itens.map(([data, rot], i) => {
          const x = 30 + ((W - 60) * i) / Math.max(1, itens.length - 1);
          const on = prog >= i / Math.max(1, itens.length - 1) - 0.01;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, margin: "0 auto", borderRadius: 99, background: on ? COR.amarelo : "#333", border: "6px solid #0B0F1A" }} />
              <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 36, color: "#fff", marginTop: 6, whiteSpace: "nowrap" }}>{data}</div>
              <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 28, color: COR.suave, whiteSpace: "nowrap" }}>{rot}</div>
            </div>
          );
        })}
      </div>
    </Caixa>
  );
};

const Definicao: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const letras = Math.floor(interpolate(f, [8, 8 + String(e.significado).length * 0.9], [0, String(e.significado).length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Caixa style={{ width: 900, padding: "40px 50px", transform: `rotate(${(1 - m) * -6}deg) scale(${0.6 + 0.4 * m})`, opacity: m, borderColor: COR.amarelo }}>
      {sfx("whoosh", 0.35)}
      <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: COR.amarelo, letterSpacing: 6 }}>NO DIREITO</div>
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 92, color: "#fff", letterSpacing: -2, margin: "6px 0 14px" }}>{e.palavra}</div>
      <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 48, color: "#fff", minHeight: 120 }}>
        {e.significado.slice(0, letras)}
        <span style={{ opacity: f % 16 < 8 ? 1 : 0, color: COR.amarelo }}>|</span>
      </div>
    </Caixa>
  );
};

const Mapa: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const traco = interpolate(f, [10, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xis = interpolate(f, [4, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ok = spring({ frame: f - 40, fps: 30, config: { damping: 10 } });
  return (
    <Caixa style={{ width: 900, height: 440, position: "relative", transform: `scale(${m})` }}>
      <svg width={900} height={440} style={{ position: "absolute", inset: 0 }}>
        <path d="M200 340 Q 450 40 700 170" fill="none" stroke={COR.amarelo} strokeWidth={8} strokeDasharray={1} pathLength={1} strokeDashoffset={traco} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 200, top: 340, transform: "translate(-50%,-100%)", textAlign: "center" }}>
        <Icone nome="pin" tamanho={110} cor={COR.vermelho} />
        <div style={{ position: "absolute", left: 10, top: 0, transform: `scale(${xis})` }}><Icone nome="x" tamanho={90} cor={COR.vermelho} espessura={9} /></div>
      </div>
      <div style={{ position: "absolute", left: 200, top: 350, transform: "translateX(-50%)", fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: "#fff" }}>{e.de}</div>
      <div style={{ position: "absolute", left: 700, top: 170, transform: `translate(-50%,-100%) scale(${ok})`, textAlign: "center" }}>
        <Icone nome="pin" tamanho={110} cor={COR.verde} />
      </div>
      <div style={{ position: "absolute", left: 700, top: 180, transform: `translateX(-50%) scale(${ok})`, fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: "#fff" }}>{e.para}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: FONTE, fontWeight: 700, fontSize: 32, color: COR.suave }}>{e.legenda ?? ""}</div>
    </Caixa>
  );
};

const Placar: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const total = e.sim + e.nao;
  const dec: number = e.decimais ?? 0;
  const [cSim, cNao] = (e.cores ?? ["verde", "vermelho"]).map((n: string) => corDe(COR, n));
  const g = (v: number) => interpolate(f, [8, 34], [0, v / total], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const barra = (rot: string, v: number, c: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 18 }}>
      <div style={{ width: 230, fontFamily: FONTE, fontWeight: 800, fontSize: 34, color: "#fff" }}>{rot}</div>
      <div style={{ flex: 1, height: 70, background: "rgba(255,255,255,.1)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ width: `${g(v) * 100}%`, height: "100%", background: c, borderRadius: 14 }} />
      </div>
      <div style={{ width: dec ? 170 : 90, fontFamily: FONTE, fontWeight: 900, fontSize: dec ? 58 : 70, color: c, textAlign: "right", whiteSpace: "nowrap" }}>{(g(v) * total).toFixed(dec).replace(".", ",")}{dec ? "%" : ""}</div>
    </div>
  );
  return (
    <Caixa style={{ width: 900, padding: "30px 44px", transform: `scale(${m})` }}>
      {sfx("pop", 0.4)}
      <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 32, color: COR.suave }}>{e.rotulo}</div>
      {barra(e.rotuloSim ?? "Anular", e.sim, cSim)}
      {barra(e.rotuloNao ?? "Manter", e.nao, cNao)}
    </Caixa>
  );
};

const Relogio: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const corte = interpolate(f, [18, 40], [1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const div = spring({ frame: f - 34, fps: 30, config: { damping: 9 } });
  return (
    <Caixa style={{ width: 900, padding: "34px 44px", transform: `scale(${m})` }}>
      {sfx("whoosh", 0.35)}
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONTE, fontWeight: 800, fontSize: 38, color: "#fff" }}>
        <Icone nome="relogio" tamanho={60} cor={COR.amarelo} /> {e.rotulo}
      </div>
      <div style={{ marginTop: 24, fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: COR.suave }}>{e.antes ?? "Réu com menos de 70 anos"}</div>
      <div style={{ height: 56, borderRadius: 12, background: COR.azul, marginTop: 8 }} />
      <div style={{ marginTop: 24, fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: COR.suave }}>{e.depois ?? "Réu com mais de 70 anos"}</div>
      <div style={{ position: "relative", height: 56, marginTop: 8 }}>
        <div style={{ width: `${corte * 100}%`, height: "100%", borderRadius: 12, background: COR.vermelho }} />
        <div style={{ position: "absolute", right: 30, top: -30, transform: `scale(${div}) rotate(-8deg)`, fontFamily: FONTE, fontWeight: 900, fontSize: 96, color: COR.amarelo, textShadow: "0 6px 20px #000" }}>÷2</div>
      </div>
    </Caixa>
  );
};

const Check: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const m = useMola();
  const c = e.ok ? COR.verde : COR.vermelho;
  return (
    <div style={{ transform: `translateX(${(1 - m) * -800}px)` }}>
      {sfx(e.ok ? "ding" : "carimbo", e.ok ? 0.4 : 0.5)}
      <Caixa style={{ width: 900, display: "flex", alignItems: "center", gap: 30, padding: "26px 34px", borderColor: c }}>
        <div style={{ width: 120, height: 120, borderRadius: 26, background: c, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icone nome={e.ok ? "check" : "x"} tamanho={84} espessura={9} />
        </div>
        <div>
          <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 56, color: "#fff", textDecoration: e.ok ? "none" : `line-through ${c} 7px` }}>{e.texto}</div>
          <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: COR.suave }}>{e.nota}</div>
        </div>
      </Caixa>
    </div>
  );
};

const Enquete: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  return (
    <Caixa style={{ width: 900, padding: "36px 40px", transform: `scale(${m})`, background: "rgba(255,255,255,0.96)" }}>
      {sfx("pop", 0.5)}
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 60, color: "#111", textAlign: "center", marginBottom: 24 }}>{e.pergunta}</div>
      {(e.opcoes as string[]).map((o, i) => {
        const mi = spring({ frame: f - 10 - i * 6, fps: 30, config: { damping: 12 } });
        const pulso = 1 + Math.max(0, Math.sin((f - i * 15) / 6)) * 0.03;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16, padding: "22px 26px", borderRadius: 20, background: i === 0 ? "#E8F8EE" : "#FDECEC", border: `4px solid ${i === 0 ? COR.verde : COR.vermelho}`, transform: `scale(${mi * pulso})` }}>
            <div style={{ width: 70, height: 70, borderRadius: 99, background: i === 0 ? COR.verde : COR.vermelho, color: "#fff", display: "grid", placeItems: "center", fontFamily: FONTE, fontWeight: 900, fontSize: 44 }}>{i + 1}</div>
            <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 44, color: "#111" }}>{o}</div>
          </div>
        );
      })}
      <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 32, color: "#555", textAlign: "center", marginTop: 22 }}>Comente <b>1</b> ou <b>2</b> aqui embaixo</div>
    </Caixa>
  );
};

const Comentario: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const COR = useCor();
  const f = useCurrentFrame();
  const m = useMola();
  const letras = Math.floor(interpolate(f, [6, 6 + String(e.texto).length * 1.2], [0, String(e.texto).length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `translateY(${(1 - m) * 200}px)`, opacity: m }}>
      <div style={{ width: 100, height: 100, borderRadius: 99, background: COR.azul, display: "grid", placeItems: "center" }}><Icone nome="balao" tamanho={60} /></div>
      <Caixa style={{ padding: "24px 34px", borderRadius: "36px 36px 36px 8px", minWidth: 620 }}>
        <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 44, color: "#fff" }}>{[...e.texto].slice(0, letras).join("")}<span style={{ opacity: f % 14 < 7 ? 1 : 0 }}>|</span></div>
      </Caixa>
    </div>
  );
};

const Seguir: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const f = useCurrentFrame();
  const m = useMola(0, { damping: 8, stiffness: 150, mass: 0.7 });
  const pulso = 1 + Math.sin(f / 5) * 0.04;
  return (
    <div style={{ transform: `scale(${m * pulso})`, display: "flex", alignItems: "center", gap: 20, background: "#FE2C55", padding: "24px 50px", borderRadius: 24, boxShadow: "0 0 70px #FE2C5599" }}>
      {sfx("ding", 0.5)}
      <Icone nome="mais" tamanho={66} espessura={8} />
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 58, color: "#fff", whiteSpace: "nowrap" }}>{e.texto}</div>
    </div>
  );
};

const MAPA: Record<string, React.FC<{ e: ElementoTempo }>> = {
  titulo: Titulo, pergunta: Pergunta, carimbo: Carimbo, tag: Tag, pessoa: Pessoa, icones: Icones, contador: Contador,
  linha: Linha, definicao: Definicao, mapa: Mapa, placar: Placar, relogio: Relogio, check: Check, enquete: Enquete,
  comentario: Comentario, seguir: Seguir,
};

// ---------- sem sobreposição ----------
// Cada elemento tem uma faixa (posicao) na tela, mas vários podem estar na tela ao mesmo tempo e alguns são altos
// (pessoa, definição, ícones…). A pilha mede a altura real de cada um e empurra para baixo o que bateria no de cima:
// o elemento fica na sua faixa se couber e, senão, logo abaixo do anterior.
const ALTURA_ESTIMADA: Record<string, number> = { titulo: 190, pergunta: 170, carimbo: 170, tag: 110, pessoa: 520, icones: 250, contador: 280, linha: 300, definicao: 260, mapa: 400, placar: 300, relogio: 300, check: 120, enquete: 360, comentario: 200, seguir: 160 };
const EXTRA_ABAIXO: Record<string, number> = { carimbo: 90 }; // o carimbo é desenhado 90 px abaixo da faixa
const ESPACO_ENTRE = 36;
const faixaY = (e: ElementoTempo) => POSICAO[e.posicao ?? "alto"] ?? POSICAO.alto;

type Pilha = { topo: (indice: number) => number | undefined; escala: number; medir: (indice: number, h: number) => void };
const PilhaCtx = createContext<Pilha | null>(null);

// Vídeo sério (canal dark/documentário): sem o que parece propaganda ou rede social na tela
const SOBRIOS_PROIBIDOS = new Set(["enquete", "seguir", "comentario", "carimbo", "check", "tag", "pergunta"]);
export const ehSobrio = (p: { pedido?: { genero?: { galeria?: boolean } } }) => !!p.pedido?.genero?.galeria;

export const PilhaElementos: React.FC<{ elementos: ElementoTempo[] }> = ({ elementos: todos }) => {
  const f = useCurrentFrame();
  const { projeto, quadro: q } = useVideo();
  const elementos = ehSobrio(projeto) ? todos.filter((e) => !SOBRIOS_PROIBIDOS.has(e.tipo)) : todos;
  const [alturas, setAlturas] = useState<Record<number, number>>({});
  const medir = useCallback((i: number, h: number) => setAlturas((a) => (Math.abs((a[i] ?? 0) - h) < 1 ? a : { ...a, [i]: h })), []);
  // limite = onde a pilha pode chegar sem tocar na legenda (em coordenadas do palco, que no 16:9 é reduzido)
  const L = projeto.legenda;
  const cinema = L.modo === "cinema";
  const topoLegenda = cinema ? (L.posicao / 100) * q.altura - 2 * L.tamanho * 1.25 - 30 : (L.posicao / 100) * q.altura - 130;
  const limite = !L.mostrar ? q.altura - 250 : q.palco ? (topoLegenda - q.palco.y) / q.palco.escala : topoLegenda;
  const candidatos = elementos.filter((e) => MAPA[e.tipo] && f >= e.entra && f < e.sai).sort((a, b) => faixaY(a) - faixaY(b) || a.entra - b.entra || a.indice - b.indice);
  // empilha; se não cabe nem reduzindo a 60%, o elemento mais embaixo sai da tela em vez de cobrir a legenda ou outro elemento
  const empilhar = (lista: ElementoTempo[]) => {
    const topos: Record<number, number> = {};
    let fim = -Infinity;
    for (const e of lista) {
      const topo = Math.max(faixaY(e), fim + ESPACO_ENTRE);
      topos[e.indice] = topo;
      fim = topo + (alturas[e.indice] ?? ALTURA_ESTIMADA[e.tipo] ?? 160) + (EXTRA_ABAIXO[e.tipo] ?? 0);
    }
    const inicio = lista.length ? topos[lista[0].indice] : 0;
    const escala = lista.length && fim > limite ? Math.max(0.6, Math.min(1, (limite - inicio) / (fim - inicio))) : 1;
    const cabe = !lista.length || fim <= limite || (limite - inicio) / (fim - inicio) >= 0.6;
    return { topos, inicio, escala, cabe };
  };
  let ativos = candidatos;
  let r = empilhar(ativos);
  while (!r.cabe && ativos.length > 1) {
    ativos = ativos.slice(0, -1);
    r = empilhar(ativos);
  }
  const { topos, inicio, escala } = r;
  if (escala < 1) for (const e of ativos) topos[e.indice] = inicio + (topos[e.indice] - inicio) * escala;
  const visiveis = new Set(ativos.map((e) => e.indice));
  return (
    <PilhaCtx.Provider value={{ topo: (i) => topos[i], escala, medir }}>
      {elementos.map((e) => (
        <Sequence key={e.indice} from={e.entra} durationInFrames={Math.max(1, e.sai - e.entra)}>
          {(f < e.entra || f >= e.sai || visiveis.has(e.indice)) && <Elemento e={e} />}
        </Sequence>
      ))}
    </PilhaCtx.Provider>
  );
};

// Envolve qualquer elemento com posição + animação de saída
export const Elemento: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const f = useCurrentFrame();
  const pilha = useContext(PilhaCtx);
  const aoMedir = useCallback((h: number) => pilha?.medir(e.indice, h), [pilha?.medir, e.indice]);
  const dinamica = useVideo().projeto.estiloIA?.dinamica ?? "padrao";
  const dur = e.sai - e.entra;
  const C = MAPA[e.tipo];
  if (!C) return null;
  const saida = interpolate(f, [dur - 7, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: pilha?.topo(e.indice) ?? faixaY(e), bottom: "auto", left: MARGEM_TELA, right: MARGEM_TELA, width: "auto", alignItems: "center", opacity: saida, transform: `translateY(${(1 - saida) * -40}px) scale(${0.9 + 0.1 * saida})`, ...ajusteElemento(dinamica, e.indice) }}>
      <AjusteMargem onAltura={aoMedir} extra={pilha?.escala ?? 1}>
        <C e={e} />
      </AjusteMargem>
    </AbsoluteFill>
  );
};
