// Efeitos que valem para os dois modos: títulos, emojis, sons, barra de progresso, enquete final.
// Os tempos vêm em segundos "do conteúdo" e são convertidos pela linha do tempo.
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { arquivoGlobal } from "../arquivos";
import { corDe, useQuadro, useVideo } from "../contexto";
import { FONTE } from "../fontes";
import { FPS } from "../linhaTempo";
import CATALOGO from "../estilos-ia.json";

// Trilhas de fundo (efeitos.musica)
export const ARQUIVO_MUSICA: Record<string, string> = Object.fromEntries(
  Object.entries(CATALOGO.musica).filter(([, v]) => "arquivo" in v).map(([k, v]) => [k, (v as any).arquivo])
);

export const SONS: Record<string, string> = {
  whoosh: "Whoosh", pop: "Pop", ding: "Ding", carimbo: "Impacto", tique: "Tique",
};

// Converte [i, f] do conteúdo em {de, dur} na saída; null se começa num trecho cortado
const useJanela = () => {
  const { linha } = useVideo();
  return (i: number, durSeg: number) => {
    const de = linha.paraSaida(i);
    if (de === null) return null;
    return { de, dur: Math.max(1, Math.round(durSeg * FPS)) };
  };
};

const TituloTela: React.FC<{ texto: string; sub?: string; posicao: number; cor?: string; dur: number }> = ({ texto, sub, posicao, cor, dur }) => {
  const f = useCurrentFrame();
  const { tema } = useVideo();
  const c = corDe(tema, cor ?? "destaque");
  const m = spring({ frame: f, fps: FPS, config: { damping: 13, stiffness: 140, mass: 0.8 } });
  const m2 = spring({ frame: f - 6, fps: FPS, config: { damping: 13 } });
  const saida = interpolate(f, [dur - 7, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const escuro = /^#(F|E|D)/i.test(c);
  const { altura } = useQuadro();
  return (
    <AbsoluteFill style={{ top: (posicao / 100) * altura - 80, bottom: "auto", alignItems: "center", opacity: saida }}>
      <div style={{ transform: `skewX(-8deg) scaleX(${m})`, background: c, padding: "14px 40px", borderRadius: 14, boxShadow: `0 0 60px ${c}66`, maxWidth: 980 }}>
        <div style={{ transform: "skewX(8deg)", fontFamily: FONTE, fontWeight: 900, fontSize: 72, color: escuro ? "#111" : "#fff", letterSpacing: -1, textAlign: "center", lineHeight: 1.05, opacity: m }}>
          {texto}
        </div>
      </div>
      {sub && (
        <div style={{ marginTop: 14, fontFamily: FONTE, fontWeight: 700, fontSize: 40, color: "#fff", background: "rgba(0,0,0,.6)", padding: "8px 22px", borderRadius: 10, opacity: m2, transform: `translateY(${(1 - m2) * 20}px)` }}>
          {sub}
        </div>
      )}
    </AbsoluteFill>
  );
};

const EmojiTela: React.FC<{ emoji: string; x: number; y: number; tamanho: number; dur: number }> = ({ emoji, x, y, tamanho, dur }) => {
  const f = useCurrentFrame();
  const m = spring({ frame: f, fps: FPS, config: { damping: 8, stiffness: 160, mass: 0.6 } });
  const saida = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const balanco = Math.sin(f / 5) * 6;
  const { largura, altura } = useQuadro();
  return (
    <div style={{ position: "absolute", left: (x / 100) * largura - tamanho / 2, top: (y / 100) * altura - tamanho / 2, width: tamanho, height: tamanho, fontSize: tamanho * 0.85, lineHeight: 1, textAlign: "center", transform: `scale(${m * saida}) rotate(${balanco}deg)`, filter: "drop-shadow(0 10px 18px rgba(0,0,0,.5))" }}>
      {emoji}
    </div>
  );
};

const Barra: React.FC = () => {
  const f = useCurrentFrame();
  const { linha, tema } = useVideo();
  const barra = tema.bandeira ? `linear-gradient(90deg, ${tema.verde}, ${tema.amarelo}, ${tema.azul})` : tema.destaque;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "rgba(255,255,255,.15)" }}>
      <div style={{ width: `${Math.min(100, (f / linha.duracao) * 100)}%`, height: "100%", background: barra, boxShadow: `0 0 20px ${tema.destaque}` }} />
    </div>
  );
};

export const EnqueteFinal: React.FC<{ pergunta: string; opcoes: string[] }> = ({ pergunta, opcoes }) => {
  const f = useCurrentFrame();
  const { tema } = useVideo();
  const m = spring({ frame: f, fps: FPS, config: { damping: 12 } });
  const cores = [tema.verde, tema.vermelho, tema.azul, tema.amarelo];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(0,0,0,${0.55 * m})` }}>
      <Audio src={arquivoGlobal("sfx/pop.mp3")} volume={0.5} />
      <div style={{ width: 920, padding: "40px 40px", borderRadius: 36, background: "rgba(255,255,255,0.97)", transform: `scale(${m})`, boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
        <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 60, color: "#111", textAlign: "center", marginBottom: 24, lineHeight: 1.1 }}>{pergunta}</div>
        {opcoes.map((o, i) => {
          const mi = spring({ frame: f - 10 - i * 6, fps: FPS, config: { damping: 12 } });
          const pulso = 1 + Math.max(0, Math.sin((f - i * 15) / 6)) * 0.03;
          const c = cores[i % cores.length];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16, padding: "22px 26px", borderRadius: 20, background: `${c}1F`, border: `4px solid ${c}`, transform: `scale(${mi * pulso})` }}>
              <div style={{ width: 70, height: 70, borderRadius: 99, background: c, color: "#fff", display: "grid", placeItems: "center", fontFamily: FONTE, fontWeight: 900, fontSize: 44, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 44, color: "#111" }}>{o}</div>
            </div>
          );
        })}
        <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 32, color: "#555", textAlign: "center", marginTop: 22 }}>
          Comente {opcoes.map((_, i) => <b key={i}>{i ? " ou " : ""}{i + 1}</b>)} aqui embaixo
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Trilha que abaixa enquanto alguém fala (ducking) e volta nas pausas, como numa mesa de som
const useVolumeTrilha = () => {
  const { projeto, linha } = useVideo();
  const base = projeto.efeitos.volumeTrilha;
  const fala = React.useMemo(() => {
    const m = new Uint8Array(linha.duracao + 1);
    for (const w of linha.palavras) for (let q = Math.max(0, w.ini - 4); q <= Math.min(linha.duracao, w.fim + 8); q++) m[q] = 1;
    return m;
  }, [linha]);
  return (q: number) => {
    if (projeto.efeitos.abaixarTrilha === false) return base;
    let soma = 0; // média de 9 frames: sobe e desce sem degrau
    for (let d = -4; d <= 4; d++) soma += fala[Math.max(0, Math.min(fala.length - 1, q + d))];
    return base * (1 - 0.55 * (soma / 9));
  };
};

export const CamadaEfeitos: React.FC = () => {
  const { projeto, linha } = useVideo();
  const ef = projeto.efeitos;
  const janela = useJanela();
  const volumeTrilha = useVolumeTrilha();
  const sfx = ef.sfxAuto !== false;
  const fimConteudo = linha.duracao - (ef.enquete ? Math.round(ef.enquete.dur * FPS) : 0);
  const aula = projeto.visual === "aula"; // videoaula: trilha bem baixa e progresso próprio (ModoAula)
  return (
    <>
      {ef.trilha && <Audio src={arquivoGlobal(ARQUIVO_MUSICA[ef.musica ?? "tensao"] ?? "sfx/trilha.mp3")} volume={projeto.modo === "bruto" ? volumeTrilha : aula ? Math.min(0.04, ef.volumeTrilha) : ef.volumeTrilha} loop />}
      {ef.titulos.map((t) => {
        const j = janela(t.i, t.f - t.i);
        return j && <Sequence key={t.id} from={j.de} durationInFrames={j.dur} layout="none">{sfx && <Audio src={arquivoGlobal("sfx/whoosh.mp3")} volume={0.25} />}<TituloTela texto={t.texto} sub={t.sub} posicao={t.posicao ?? 14} cor={t.cor} dur={j.dur} /></Sequence>;
      })}
      {ef.emojis.map((e) => {
        const j = janela(e.i, e.dur);
        return j && <Sequence key={e.id} from={j.de} durationInFrames={j.dur} layout="none">{sfx && <Audio src={arquivoGlobal("sfx/pop.mp3")} volume={0.3} />}<EmojiTela emoji={e.emoji} x={e.x} y={e.y} tamanho={e.tamanho ?? 200} dur={j.dur} /></Sequence>;
      })}
      {ef.sons.map((s) => {
        const j = janela(s.i, 2);
        return j && <Sequence key={s.id} from={j.de} layout="none"><Audio src={arquivoGlobal(`sfx/${s.som}.mp3`)} volume={s.volume ?? 0.6} /></Sequence>;
      })}
      {ef.enquete && (
        <Sequence from={fimConteudo} layout="none">
          <EnqueteFinal pergunta={ef.enquete.pergunta} opcoes={ef.enquete.opcoes} />
        </Sequence>
      )}
      {ef.barraProgresso && !aula && <Barra />}
    </>
  );
};
