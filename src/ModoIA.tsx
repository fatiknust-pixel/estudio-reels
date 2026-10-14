// Modo 1 — vídeo gerado por IA: cenas do roteiro (formato Astra) com narração, fundo, fontes e elementos animados.
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { arquivoGlobal } from "./arquivos";
import { useCor, useVideo } from "./contexto";
import { Elemento } from "./componentes/Elementos";
import { Fundo } from "./componentes/Fundo";
import { FONTE } from "./fontes";
import { CenaTempo } from "./linhaTempo";

// Fontes confiáveis da cena, no topo da tela
const Fontes: React.FC<{ fontes: string[] }> = ({ fontes }) => {
  const f = useCurrentFrame();
  const COR = useCor();
  if (!fontes.length) return null;
  return (
    <div style={{ position: "absolute", top: 70, left: 40, right: 140, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 26, color: "#111", background: COR.destaque, padding: "6px 14px", borderRadius: 8, opacity: interpolate(f, [4, 10], [0, 1], { extrapolateRight: "clamp" }) }}>FONTES</div>
      {fontes.map((t, i) => {
        const m = spring({ frame: f - 8 - i * 4, fps: 30, config: { damping: 14 } });
        return (
          <div key={i} style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 25, color: "#fff", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.25)", padding: "6px 14px", borderRadius: 8, opacity: m, transform: `translateY(${(1 - m) * -20}px)` }}>
            {t}
          </div>
        );
      })}
    </div>
  );
};

// Faixas diagonais que cruzam a tela na troca de cena
const Transicao: React.FC = () => {
  const f = useCurrentFrame();
  const COR = useCor();
  if (f > 12) return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {COR.transicao.map((c, i) => {
        const x = interpolate(f, [0 + i, 10 + i], [-1600, 1600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={i} style={{ position: "absolute", top: -400, left: x, width: 260, height: 2800, background: c, transform: "rotate(18deg)", opacity: 0.9 }} />;
      })}
    </AbsoluteFill>
  );
};

const Creditos: React.FC = () => {
  const lista = useVideo().todosCreditos();
  if (!lista.length) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 160, top: 1530, fontFamily: FONTE, fontWeight: 600, fontSize: 17, lineHeight: 1.35, color: "rgba(255,255,255,.5)" }}>
      Imagens (Wikimedia Commons): {lista.join(" · ")}
    </div>
  );
};

const Cena: React.FC<{ c: CenaTempo; ultima: boolean }> = ({ c, ultima }) => {
  const f = useCurrentFrame();
  const { creditoImagem, arquivo, projeto } = useVideo();
  const credito = creditoImagem(c.fundo);
  const audio = arquivo(c.audio);
  const zoom = interpolate(f, [0, 10], [1.08, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Fundo chave={c.fundo} indice={c.indice} duracao={c.duracao} />
      </AbsoluteFill>
      {audio && <Sequence from={2} layout="none"><Audio src={audio} /></Sequence>}
      {c.indice > 0 && projeto.efeitos.somTransicao && <Audio src={arquivoGlobal("sfx/whoosh.mp3")} volume={0.5} />}
      {c.elementos.map((e) => (
        <Sequence key={e.indice} from={e.entra} durationInFrames={Math.max(1, e.sai - e.entra)}>
          <Elemento e={e} />
        </Sequence>
      ))}
      <Fontes fontes={c.fontes} />
      {credito && !ultima && (
        <div style={{ position: "absolute", left: 40, right: 160, top: 1530, fontFamily: FONTE, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,.55)" }}>{credito}</div>
      )}
      {ultima && <Creditos />}
      <Transicao />
    </AbsoluteFill>
  );
};

export const ModoIA: React.FC = () => {
  const { linha } = useVideo();
  return (
    <>
      {linha.cenas.map((c, i) => (
        <Sequence key={c.id} from={c.inicio} durationInFrames={c.duracao} name={c.id}>
          <Cena c={c} ultima={i === linha.cenas.length - 1} />
        </Sequence>
      ))}
    </>
  );
};
