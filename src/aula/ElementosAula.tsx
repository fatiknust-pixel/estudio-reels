// Elementos do visual "Videoaula": fundo branco, texto preto, um acento por elemento (laranja, amarelo,
// vermelho, verde) e só movimentos que explicam — ícones que se desenham, marca-texto, números que contam.
// Cada elemento ocupa uma "vaga" do slide (largura w × altura h) e se ajusta a ela.
import React from "react";
import { Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useVideo } from "../contexto";
import { familiaDe } from "../fontes";
import { ElementoTempo } from "../linhaTempo";
import { Icone } from "../componentes/Icone";

export const A = {
  preto: "#111111", texto: "#1F1F1F", suave: "#6B6B6B", linha: "#E7E7E7", papel: "#F6F6F4",
  laranja: "#FF6B00", amarelo: "#FFC400", vermelho: "#E5332A", verde: "#1E9E5A",
};
export const FONTE_AULA = familiaDe("poppins").familia;

// "amarelo", "vermelho"… do roteiro → cor do visual (azul/roxo viram o laranja da série)
export const corAula = (nome?: string) =>
  ({ amarelo: A.amarelo, vermelho: A.vermelho, verde: A.verde, cinza: A.suave, azul: A.laranja, roxo: A.laranja } as Record<string, string>)[nome ?? ""] ?? A.laranja;

const useEntrada = (atraso = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - atraso, fps, config: { damping: 200, stiffness: 120, mass: 0.9 } });
};
// 0 → 1 em `dur` frames, suave (para traços que se desenham)
const useTraco = (atraso = 0, dur = 22) => {
  const f = useCurrentFrame();
  return interpolate(f, [atraso, atraso + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
};

const txt = (tam: number, peso = 600, cor = A.texto): React.CSSProperties => ({ fontFamily: FONTE_AULA, fontSize: tam, fontWeight: peso, color: cor, lineHeight: 1.2 });
const Sobe: React.FC<{ m: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ m, children, style }) => (
  <div style={{ opacity: m, transform: `translateY(${(1 - m) * 18}px)`, ...style }}>{children}</div>
);
const Rotulo: React.FC<{ u: number; cor?: string; children: React.ReactNode }> = ({ u, cor = A.laranja, children }) => (
  <div style={{ ...txt(20 * u, 700, cor), letterSpacing: 3 * u, textTransform: "uppercase" }}>{children}</div>
);

// Manchete do slide (elemento "titulo")
export const Manchete: React.FC<{ e: ElementoTempo }> = ({ e }) => {
  const m = useEntrada();
  const barra = useTraco(6, 18);
  return (
    <Sobe m={m}>
      <div style={{ ...txt(66, 800, A.preto), letterSpacing: -1 }}>{e.texto}</div>
      <div style={{ width: 150 * barra, height: 8, borderRadius: 4, background: corAula(e.cor), marginTop: 14 }} />
      {e.sub && <div style={{ ...txt(30, 500, A.suave), marginTop: 14 }}>{e.sub}</div>}
    </Sobe>
  );
};

const Pergunta: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const circulo = useTraco(0, 20);
  const D = 120 * u;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 * u, textAlign: "center" }}>
      <div style={{ position: "relative", width: D, height: D }}>
        <svg width={D} height={D} viewBox="0 0 64 64" style={{ position: "absolute", inset: 0 }}>
          <circle cx="32" cy="32" r="29" fill="none" stroke={A.laranja} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circulo} transform="rotate(-90 32 32)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", ...txt(72 * u, 800, A.laranja), opacity: circulo }}>?</div>
      </div>
      <Sobe m={m}><div style={{ ...txt(60 * u, 800, A.preto), letterSpacing: -1 }}>{e.texto}</div></Sobe>
    </div>
  );
};

// "carimbo" vira um destaque com marca-texto
const Destaque: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const marca = useTraco(4, 16);
  const icone = useTraco(0, 18);
  const c = corAula(e.cor ?? "amarelo");
  const alerta = c === A.vermelho;
  return (
    <Sobe m={m} style={{ display: "flex", alignItems: "center", gap: 18 * u }}>
      {alerta && <Icone nome="alerta" tamanho={70 * u} cor={A.vermelho} espessura={4} progresso={icone} />}
      <div style={{ position: "relative", padding: `${4 * u}px ${18 * u}px` }}>
        <div style={{ position: "absolute", left: 0, top: "18%", bottom: "8%", width: `${marca * 100}%`, background: alerta ? "#FFDCD9" : c === A.amarelo ? "#FFE58A" : `${c}33`, borderRadius: 6 }} />
        <div style={{ position: "relative", ...txt(56 * u, 800, alerta ? A.vermelho : A.preto), whiteSpace: "nowrap" }}>{e.texto}</div>
      </div>
    </Sobe>
  );
};

const Tag: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const c = corAula(e.cor);
  const D = 104 * u;
  return (
    <Sobe m={m} style={{ display: "flex", alignItems: "center", gap: 26 * u }}>
      <div style={{ width: D, height: D, borderRadius: 99, background: `${c}18`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icone nome={e.icone ?? "documento"} tamanho={D * 0.58} cor={c} espessura={4} progresso={useTraco(2, 22)} />
      </div>
      <div style={{ ...txt(46 * u, 700, A.preto) }}>{e.texto}</div>
    </Sobe>
  );
};

const ItemIcone: React.FC<{ i: number; ic: string; rot: string; u: number; n: number }> = ({ i, ic, rot, u, n }) => {
  const atraso = i * 9;
  const m = useEntrada(atraso);
  const p = useTraco(atraso, 24);
  const seta = ic === "seta";
  const T = (n > 4 ? 96 : 130) * u;
  if (seta) return <div style={{ opacity: p }}><Icone nome="seta" tamanho={T * 0.6} cor={A.suave} espessura={3.5} progresso={p} /></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * u, maxWidth: 260 * u }}>
      <Icone nome={ic} tamanho={T} cor={i % 2 ? A.preto : A.laranja} espessura={3} progresso={p} />
      {rot && <Sobe m={m}><div style={{ ...txt(30 * u, 600, A.texto), textAlign: "center" }}>{rot}</div></Sobe>}
    </div>
  );
};
const Icones: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const itens = (e.itens ?? []) as [string, string][];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 * u }}>
      {itens.map(([ic, rot], i) => <ItemIcone key={i} i={i} ic={ic} rot={rot} u={u} n={itens.length} />)}
    </div>
  );
};

const casas = (v: number) => (String(v).split(".")[1] ?? "").length;
const Contador: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const f = useCurrentFrame();
  const m = useEntrada();
  const t = interpolate(f, [4, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const dec = Math.max(casas(e.de), casas(e.ate));
  const valor = (e.de + (e.ate - e.de) * t).toFixed(dec).replace(".", ",");
  const moeda = /^(US\$|R\$|€|\$)$/.test(String(e.unidade ?? "").trim());
  return (
    <Sobe m={m} style={{ textAlign: "center" }}>
      {e.rotulo && <Rotulo u={u} cor={A.suave}>{e.rotulo}</Rotulo>}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12 * u, marginTop: 6 * u }}>
        {moeda && <span style={txt(54 * u, 700, A.laranja)}>{e.unidade}</span>}
        <span style={{ ...txt(150 * u, 800, A.preto), letterSpacing: -4 * u, fontVariantNumeric: "tabular-nums" }}>{valor}</span>
        {!moeda && e.unidade && <span style={txt(44 * u, 700, A.laranja)}>{e.unidade}</span>}
      </div>
    </Sobe>
  );
};

const Definicao: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const m2 = useEntrada(10);
  const barra = useTraco(0, 14);
  return (
    <div style={{ display: "flex", gap: 28 * u, maxWidth: 1000 * u }}>
      <div style={{ width: 8 * u, borderRadius: 4, background: A.laranja, transform: `scaleY(${barra})`, transformOrigin: "top" }} />
      <div>
        <Sobe m={m}><Rotulo u={u}>Definição</Rotulo></Sobe>
        <Sobe m={m}><div style={{ ...txt(56 * u, 800, A.preto), margin: `${8 * u}px 0 ${14 * u}px`, letterSpacing: -1 }}>{e.palavra}</div></Sobe>
        <Sobe m={m2}><div style={{ ...txt(34 * u, 500, "#333"), lineHeight: 1.35 }}>{e.significado}</div></Sobe>
      </div>
    </div>
  );
};

const Check: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const p = useTraco(0, 18);
  const risco = useTraco(14, 14);
  const c = e.ok ? A.verde : A.vermelho;
  const D = 92 * u;
  return (
    <Sobe m={m} style={{ display: "flex", alignItems: "center", gap: 26 * u }}>
      <div style={{ width: D, height: D, borderRadius: 99, border: `${4 * u}px solid ${c}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icone nome={e.ok ? "check" : "x"} tamanho={D * 0.62} cor={c} espessura={6} progresso={p} />
      </div>
      <div>
        <div style={{ position: "relative", display: "inline-block", ...txt(46 * u, 700, A.preto) }}>
          {e.texto}
          {!e.ok && <div style={{ position: "absolute", left: 0, top: "52%", height: 5 * u, width: `${risco * 100}%`, background: A.vermelho, borderRadius: 3 }} />}
        </div>
        {e.nota && <div style={{ ...txt(28 * u, 500, A.suave), marginTop: 4 * u }}>{e.nota}</div>}
      </div>
    </Sobe>
  );
};

// O prompt (ou comando) sendo digitado
const Comentario: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const f = useCurrentFrame();
  const m = useEntrada();
  const texto = [...String(e.texto)];
  const n = Math.floor(interpolate(f, [8, 8 + texto.length * 1.1], [0, texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Sobe m={m} style={{ width: "100%", maxWidth: 1100 * u }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 * u, marginBottom: 12 * u }}>
        <Icone nome="terminal" tamanho={30 * u} cor={A.laranja} espessura={4} />
        <Rotulo u={u}>Prompt</Rotulo>
      </div>
      <div style={{ border: `${2 * u}px solid ${A.preto}`, borderRadius: 16 * u, background: A.papel, padding: `${24 * u}px ${30 * u}px`, ...txt(36 * u, 500, A.preto), lineHeight: 1.4 }}>
        {texto.slice(0, n).join("")}
        <span style={{ display: "inline-block", width: 3 * u, height: 38 * u, marginLeft: 4 * u, verticalAlign: "middle", background: A.laranja, opacity: f % 20 < 10 ? 1 : 0 }} />
      </div>
    </Sobe>
  );
};

const Enquete: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Sobe m={m} style={{ width: "100%", maxWidth: 1000 * u }}>
      <div style={{ display: "inline-block", background: A.laranja, borderRadius: 8 * u, padding: `${6 * u}px ${16 * u}px`, ...txt(22 * u, 800, "#fff"), letterSpacing: 3 * u }}>QUIZ</div>
      <div style={{ ...txt(46 * u, 800, A.preto), margin: `${16 * u}px 0 ${20 * u}px` }}>{e.pergunta}</div>
      {((e.opcoes ?? []) as string[]).map((o, i) => {
        const mi = spring({ frame: f - 10 - i * 8, fps, config: { damping: 200 } });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 * u, marginTop: 14 * u, padding: `${16 * u}px ${20 * u}px`, borderRadius: 14 * u, border: `${2 * u}px solid ${A.linha}`, opacity: mi, transform: `translateX(${(1 - mi) * 30}px)` }}>
            <div style={{ width: 54 * u, height: 54 * u, borderRadius: 99, background: i === 0 ? A.laranja : A.preto, display: "grid", placeItems: "center", ...txt(28 * u, 800, "#fff"), flexShrink: 0 }}>{i + 1}</div>
            <div style={txt(36 * u, 600, A.preto)}>{o}</div>
          </div>
        );
      })}
    </Sobe>
  );
};

const Seguir: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const sub = useTraco(8, 16);
  return (
    <Sobe m={m} style={{ display: "flex", alignItems: "center", gap: 22 * u }}>
      <Icone nome="play" tamanho={86 * u} cor={A.laranja} espessura={4} progresso={useTraco(0, 22)} />
      <div>
        <div style={txt(44 * u, 800, A.preto)}>{e.texto}</div>
        <div style={{ height: 5 * u, width: `${sub * 100}%`, background: A.laranja, borderRadius: 3, marginTop: 6 * u }} />
      </div>
    </Sobe>
  );
};

const Placar: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const f = useCurrentFrame();
  const m = useEntrada();
  const total = e.sim + e.nao || 1;
  const dec: number = e.decimais ?? 0;
  const g = (v: number) => interpolate(f, [8, 34], [0, v / total], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const barra = (rot: string, v: number, c: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * u, marginTop: 16 * u }}>
      <div style={{ width: 220 * u, ...txt(30 * u, 600, A.texto) }}>{rot}</div>
      <div style={{ flex: 1, height: 44 * u, background: A.papel, borderRadius: 8 * u, overflow: "hidden" }}>
        <div style={{ width: `${g(v) * 100}%`, height: "100%", background: c }} />
      </div>
      <div style={{ width: 130 * u, textAlign: "right", ...txt(40 * u, 800, c) }}>{(g(v) * total).toFixed(dec).replace(".", ",")}{dec ? "%" : ""}</div>
    </div>
  );
  return (
    <Sobe m={m} style={{ width: "100%", maxWidth: 1000 * u }}>
      <Rotulo u={u} cor={A.suave}>{e.rotulo}</Rotulo>
      {barra(e.rotuloSim ?? "Sim", e.sim, A.laranja)}
      {barra(e.rotuloNao ?? "Não", e.nao, A.preto)}
    </Sobe>
  );
};

const Linha: React.FC<{ e: ElementoTempo; u: number; w: number }> = ({ e, u, w }) => {
  const itens = (e.itens ?? []) as [string, string][];
  const prog = useTraco(4, 30);
  const W = Math.min(w - 80, 1300 * u);
  return (
    <div style={{ position: "relative", width: W, height: 170 * u }}>
      <div style={{ position: "absolute", top: 30 * u, left: 0, width: W * prog, height: 4 * u, background: A.preto, borderRadius: 2 }} />
      {itens.map(([data, rot], i) => {
        const x = itens.length > 1 ? (W * i) / (itens.length - 1) : W / 2;
        const on = prog >= (itens.length > 1 ? i / (itens.length - 1) : 0) - 0.01;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)", textAlign: "center", opacity: on ? 1 : 0 }}>
            <div style={{ width: 36 * u, height: 36 * u, margin: `${14 * u}px auto 0`, borderRadius: 99, background: A.laranja, border: `${5 * u}px solid #fff`, boxShadow: `0 0 0 ${2 * u}px ${A.laranja}` }} />
            <div style={{ ...txt(32 * u, 800, A.preto), marginTop: 10 * u, whiteSpace: "nowrap" }}>{data}</div>
            <div style={{ ...txt(24 * u, 500, A.suave), whiteSpace: "nowrap" }}>{rot}</div>
          </div>
        );
      })}
    </div>
  );
};

const Mapa: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const seta = useTraco(8, 20);
  const m2 = useEntrada(22);
  const caixa = (t: string, c: string, mm: number) => (
    <Sobe m={mm}><div style={{ border: `${3 * u}px solid ${c}`, borderRadius: 14 * u, padding: `${18 * u}px ${28 * u}px`, ...txt(38 * u, 700, A.preto), textAlign: "center", maxWidth: 380 * u }}>{t}</div></Sobe>
  );
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 * u }}>
        {caixa(e.de, A.preto, m)}
        <Icone nome="seta" tamanho={90 * u} cor={A.laranja} espessura={4} progresso={seta} />
        {caixa(e.para, A.laranja, m2)}
      </div>
      {e.legenda && <Sobe m={m2}><div style={{ ...txt(28 * u, 500, A.suave), marginTop: 18 * u }}>{e.legenda}</div></Sobe>}
    </div>
  );
};

const Relogio: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const corte = useTraco(16, 22);
  return (
    <Sobe m={m} style={{ width: "100%", maxWidth: 900 * u }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * u, ...txt(38 * u, 700, A.preto) }}>
        <Icone nome="relogio" tamanho={50 * u} cor={A.laranja} espessura={4} progresso={useTraco(0, 18)} /> {e.rotulo}
      </div>
      <div style={{ ...txt(26 * u, 500, A.suave), marginTop: 18 * u }}>{e.antes ?? "Antes"}</div>
      <div style={{ height: 36 * u, borderRadius: 8 * u, background: A.preto, marginTop: 6 * u }} />
      <div style={{ ...txt(26 * u, 500, A.suave), marginTop: 16 * u }}>{e.depois ?? "Depois"}</div>
      <div style={{ height: 36 * u, width: `${(1 - corte * 0.5) * 100}%`, borderRadius: 8 * u, background: A.laranja, marginTop: 6 * u }} />
    </Sobe>
  );
};

const Pessoa: React.FC<{ e: ElementoTempo; u: number }> = ({ e, u }) => {
  const m = useEntrada();
  const anel = useTraco(0, 22);
  const src = useVideo().imagem(e.imagem);
  const D = 230 * u;
  const iniciais = String(e.nome ?? "").split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 * u }}>
      <div style={{ position: "relative", width: D + 20 * u, height: D + 20 * u, flexShrink: 0 }}>
        <svg width={D + 20 * u} height={D + 20 * u} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke={A.laranja} strokeWidth={2.2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - anel} transform="rotate(-90 50 50)" />
        </svg>
        <div style={{ position: "absolute", left: 10 * u, top: 10 * u, width: D, height: D, borderRadius: "50%", overflow: "hidden", background: A.papel, display: "grid", placeItems: "center", opacity: m }}>
          {src ? <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }} /> : <div style={txt(90 * u, 800, A.suave)}>{iniciais}</div>}
        </div>
      </div>
      <Sobe m={m}>
        <div style={txt(48 * u, 800, A.preto)}>{e.nome}</div>
        <div style={{ ...txt(30 * u, 500, A.suave), marginTop: 6 * u }}>{e.cargo}</div>
      </Sobe>
    </div>
  );
};

const MAPA_AULA: Record<string, React.FC<{ e: ElementoTempo; u: number; w: number }>> = {
  pergunta: Pergunta, carimbo: Destaque, tag: Tag, icones: Icones, contador: Contador, definicao: Definicao,
  check: Check, comentario: Comentario, enquete: Enquete, seguir: Seguir, placar: Placar, linha: Linha,
  mapa: Mapa, relogio: Relogio, pessoa: Pessoa, titulo: ({ e, u }) => <Destaque e={e} u={u} />,
};

// Um elemento dentro da sua vaga: entra subindo e some suave antes de dar lugar ao próximo
export const ElementoAula: React.FC<{ e: ElementoTempo; w: number; h: number }> = ({ e, w, h }) => {
  const f = useCurrentFrame();
  const C = MAPA_AULA[e.tipo];
  if (!C) return null;
  const dur = e.sai - e.entra;
  const saida = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // escala do elemento pelo tamanho da vaga (1 = vaga de 620 × 430)
  const u = Math.max(0.7, Math.min(1.3, Math.min(w / 620, h / 430)));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: saida }}>
      <C e={e} u={u} w={w} />
    </div>
  );
};
