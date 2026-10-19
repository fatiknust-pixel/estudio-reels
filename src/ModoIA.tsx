// Modo 1 — vídeo gerado por IA: cenas do roteiro (formato Astra) com narração, fundo, fontes e elementos animados.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { arquivoGlobal } from "./arquivos";
import { useCor, useQuadro, useVideo } from "./contexto";
import { Camera, Sobreposicao, useDinamica } from "./componentes/Dinamica";
import { Elemento } from "./componentes/Elementos";
import { Fundo } from "./componentes/Fundo";
import { FONTE } from "./fontes";
import { ALTURA, CenaTempo, LARGURA } from "./linhaTempo";

// Fontes confiáveis da cena, no topo da tela
const Fontes: React.FC<{ fontes: string[] }> = ({ fontes }) => {
  const f = useCurrentFrame();
  const COR = useCor();
  const cinema = useDinamica() === "cinema";
  const q = useQuadro();
  if (!fontes.length) return null;
  return (
    <div style={{ position: "absolute", top: cinema ? 128 : q.horizontal ? 40 : 70, left: 40, right: q.largura - q.texto + 40, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
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

// Troca de cena: faixas diagonais (padrão), clarão branco, ou a entrada da cena (zoom/deslize/círculo, em Cena)
const Transicao: React.FC = () => {
  const f = useCurrentFrame();
  const COR = useCor();
  const tipo = useVideo().projeto.estiloIA?.transicao ?? "faixas";
  const { largura } = useQuadro();
  if (f > 12) return null;
  if (tipo === "flash") {
    return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 8], [0.85, 0], { extrapolateRight: "clamp" }), pointerEvents: "none" }} />;
  }
  if (tipo !== "faixas") return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {COR.transicao.map((c, i) => {
        const x = interpolate(f, [0 + i, 10 + i], [-1600, largura + 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={i} style={{ position: "absolute", top: -400, left: x, width: 260, height: 2800, background: c, transform: "rotate(18deg)", opacity: 0.9 }} />;
      })}
    </AbsoluteFill>
  );
};

const Creditos: React.FC<{ topo: number }> = ({ topo }) => {
  const lista = useVideo().todosCreditos();
  const q = useQuadro();
  if (!lista.length) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: q.horizontal ? q.largura - q.texto : 160, top: topo, fontFamily: FONTE, fontWeight: 600, fontSize: 17, lineHeight: 1.35, color: "rgba(255,255,255,.5)" }}>
      Imagens (Wikimedia Commons): {lista.join(" · ")}
    </div>
  );
};

// Área dos elementos animados: a tela inteira no vertical; no 16:9, o painel da direita
const Palco: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { palco } = useQuadro();
  if (!palco) return <>{children}</>;
  return (
    <div style={{ position: "absolute", left: palco.x, top: palco.y, width: LARGURA, height: ALTURA, transform: `scale(${palco.escala})`, transformOrigin: "0 0" }}>
      {children}
    </div>
  );
};

const Cena: React.FC<{ c: CenaTempo; ultima: boolean }> = ({ c, ultima }) => {
  const f = useCurrentFrame();
  const { creditoImagem, arquivo, projeto } = useVideo();
  const credito = creditoImagem(c.fundo);
  const audio = arquivo(c.audio);
  const transicao = projeto.estiloIA?.transicao ?? "faixas";
  const jornal = projeto.estiloIA?.dinamica === "jornal";
  const q = useQuadro();
  const topoCredito = q.horizontal ? q.altura - (jornal ? 200 : 86) : jornal ? 1672 : 1530;
  const k = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const entrada: React.CSSProperties =
    c.indice === 0 ? {} :
    transicao === "zoom" ? { transform: `scale(${1.35 - 0.35 * k})`, filter: `blur(${(1 - k) * 14}px)` } :
    transicao === "deslize" ? { transform: `translateX(${(1 - k) * q.largura}px)` } :
    transicao === "circulo" ? { clipPath: `circle(${k * 120}% at 50% 50%)` } : {};
  const zoom = transicao === "faixas" || transicao === "flash" ? interpolate(f, [0, 10], [1.08, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={entrada}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Fundo chave={c.fundo} indice={c.indice} duracao={c.duracao} />
      </AbsoluteFill>
      {audio && <Sequence from={2} layout="none"><Audio src={audio} /></Sequence>}
      {c.indice > 0 && projeto.efeitos.somTransicao && <Audio src={arquivoGlobal("sfx/whoosh.mp3")} volume={0.5} />}
      <Palco>
        {c.elementos.map((e) => (
          <Sequence key={e.indice} from={e.entra} durationInFrames={Math.max(1, e.sai - e.entra)}>
            <Elemento e={e} />
          </Sequence>
        ))}
      </Palco>
      <Fontes fontes={c.fontes} />
      {credito && !ultima && (
        <div style={{ position: "absolute", left: 40, right: q.horizontal ? q.largura - q.texto : 160, top: topoCredito, fontFamily: FONTE, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,.55)" }}>{credito}</div>
      )}
      {ultima && <Creditos topo={topoCredito} />}
      <Transicao />
    </AbsoluteFill>
  );
};

export const ModoIA: React.FC = () => {
  const { linha } = useVideo();
  return (
    <>
      <Camera>
      {linha.cenas.map((c, i) => (
        <Sequence key={c.id} from={c.inicio} durationInFrames={c.duracao} name={c.id}>
          <Cena c={c} ultima={i === linha.cenas.length - 1} />
        </Sequence>
      ))}
      </Camera>
      <Sobreposicao />
    </>
  );
};
