// Visual "Videoaula" (16:9): fundo branco, cabeçalho fixo com o número da aula, e cada cena como um
// slide que se monta enquanto a voz explica — manchete no alto e os elementos lado a lado, cada um na
// sua vaga. Sem brilhos, partículas, zoom de câmera ou sons de efeito.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, useCurrentFrame } from "remotion";
import { useVideo } from "../contexto";
import { agrupar } from "../componentes/Legenda";
import { CenaTempo, ElementoTempo } from "../linhaTempo";
import { A, ElementoAula, FONTE_AULA, Manchete } from "./ElementosAula";

const MARGEM = 120;
type Vaga = { x: number; y: number; w: number; h: number };

// Vagas do slide: uma por posição usada na cena, na ordem em que aparecem (leitura da esquerda para a direita)
const vagas = (n: number, area: Vaga): Vaga[] => {
  const gap = 60;
  if (n <= 1) return [{ x: area.x + area.w * 0.12, y: area.y, w: area.w * 0.76, h: area.h }];
  if (n <= 3) {
    const w = (area.w - gap * (n - 1)) / n;
    return Array.from({ length: n }, (_, i) => ({ x: area.x + i * (w + gap), y: area.y, w, h: area.h }));
  }
  const porLinha = Math.ceil(n / 2);
  const w = (area.w - gap * (porLinha - 1)) / porLinha;
  const h = (area.h - 40) / 2;
  return Array.from({ length: n }, (_, i) => ({ x: area.x + (i % porLinha) * (w + gap), y: area.y + Math.floor(i / porLinha) * (h + 40), w, h }));
};

const Cena: React.FC<{ c: CenaTempo }> = ({ c }) => {
  const f = useCurrentFrame();
  const { arquivo } = useVideo();
  const audio = arquivo(c.audio);
  const titulos = c.elementos.filter((e) => e.tipo === "titulo");
  const outros = c.elementos.filter((e) => e.tipo !== "titulo");
  const chaves = useMemo(() => [...new Set([...outros].sort((a, b) => a.entra - b.entra).map((e) => e.posicao ?? "alto"))], [outros]);
  const area: Vaga = titulos.length ? { x: MARGEM, y: 330, w: 1920 - 2 * MARGEM, h: 520 } : { x: MARGEM, y: 190, w: 1920 - 2 * MARGEM, h: 660 };
  const lugares = vagas(chaves.length, area);
  // troca de slide: entra subindo, sai em fade
  const entra = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const sai = interpolate(f, [c.duracao - 6, c.duracao], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dur = (e: ElementoTempo) => Math.max(1, e.sai - e.entra);
  return (
    <AbsoluteFill style={{ opacity: Math.min(entra, sai), transform: `translateY(${(1 - entra) * 16}px)` }}>
      {audio && <Sequence from={2} layout="none"><Audio src={audio} /></Sequence>}
      {titulos.map((e) => (
        <Sequence key={e.indice} from={e.entra} durationInFrames={dur(e)} layout="none">
          <div style={{ position: "absolute", left: MARGEM, top: 165, right: MARGEM }}><Manchete e={e} /></div>
        </Sequence>
      ))}
      {outros.map((e) => {
        const v = lugares[chaves.indexOf(e.posicao ?? "alto")];
        return (
          <Sequence key={e.indice} from={e.entra} durationInFrames={dur(e)} layout="none">
            <div style={{ position: "absolute", left: v.x, top: v.y, width: v.w, height: v.h }}><ElementoAula e={e} w={v.w} h={v.h} /></div>
          </Sequence>
        );
      })}
      {c.fontes.length > 0 && (
        <div style={{ position: "absolute", right: MARGEM, bottom: 28, fontFamily: FONTE_AULA, fontSize: 20, fontWeight: 500, color: A.suave }}>
          Fonte: {c.fontes.join(" · ")}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Número e nome da aula, sempre visíveis
const Cabecalho: React.FC = () => {
  const { projeto } = useVideo();
  const codigo = (projeto.pedido?.tema ?? projeto.titulo).match(/^Aula (\d+\.\d+)/)?.[1];
  const nome = projeto.titulo.replace(/^Aula \d+\.\d+:\s*/, "");
  return (
    <div style={{ position: "absolute", left: MARGEM, right: MARGEM, top: 46, display: "flex", alignItems: "center", gap: 20, fontFamily: FONTE_AULA }}>
      {codigo && <div style={{ background: A.laranja, color: "#fff", fontWeight: 800, fontSize: 26, borderRadius: 10, padding: "6px 16px" }}>{codigo}</div>}
      <div style={{ fontWeight: 600, fontSize: 28, color: A.texto }}>{nome}</div>
      <div style={{ flex: 1, height: 2, background: A.linha, marginLeft: 12 }} />
      <div style={{ fontWeight: 500, fontSize: 22, color: A.suave }}>IA do Zero ao Especialista</div>
    </div>
  );
};

// Linha fina de progresso no pé da tela
const Progresso: React.FC = () => {
  const f = useCurrentFrame();
  const { linha } = useVideo();
  return <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${Math.min(100, (f / linha.duracao) * 100)}%`, background: A.laranja }} />;
};

// Legenda de aula: a frase inteira, centralizada, com a palavra falada em laranja
export const LegendaAula: React.FC = () => {
  const f = useCurrentFrame();
  const { linha, projeto } = useVideo();
  const telas = useMemo(() => agrupar(linha.palavras, Math.max(8, projeto.legenda.palavrasPorTela)), [linha, projeto.legenda.palavrasPorTela]);
  if (!projeto.legenda.mostrar) return null;
  const idx = telas.findIndex((t, i) => f >= t[0].ini && f < (telas[i + 1]?.[0].ini ?? t[t.length - 1].fim + 12));
  const tela = telas[idx];
  if (!tela || f > tela[tela.length - 1].fim + 12) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ maxWidth: 1500, textAlign: "center", fontFamily: FONTE_AULA, fontSize: 42, fontWeight: 600, lineHeight: 1.35, color: A.texto }}>
        {tela.map((w, i) => {
          const ativa = f >= w.ini && (f < w.fim + 2 || i === tela.length - 1 || f < tela[i + 1].ini);
          return <span key={i} style={{ color: ativa ? A.laranja : f >= w.ini ? A.texto : "#9A9A9A" }}>{w.p}{i < tela.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

export const ModoAula: React.FC = () => {
  const { linha, todosCreditos } = useVideo();
  const creditos = todosCreditos();
  const ultima = linha.cenas[linha.cenas.length - 1];
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Cabecalho />
      {linha.cenas.map((c) => (
        <Sequence key={c.id} from={c.inicio} durationInFrames={c.duracao} name={c.id}>
          <Cena c={c} />
        </Sequence>
      ))}
      {ultima && creditos.length > 0 && (
        <Sequence from={ultima.inicio} durationInFrames={ultima.duracao}>
          <div style={{ position: "absolute", left: MARGEM, bottom: 28, right: 760, fontFamily: FONTE_AULA, fontSize: 16, color: A.suave }}>Imagens (Wikimedia Commons): {creditos.join(" · ")}</div>
        </Sequence>
      )}
      <Progresso />
    </AbsoluteFill>
  );
};
