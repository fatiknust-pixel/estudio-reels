import React from "react";
import { AbsoluteFill, getRemotionEnvironment, Img, interpolate, OffthreadVideo, Sequence, useCurrentFrame } from "remotion";
import { useQuadro, useVideo } from "../contexto";
import { FPS } from "../linhaTempo";
import { FUSAO } from "./Fundo";

const semErro = (e: Error) => console.warn("gameplay:", e.message);
const naPrevia = getRemotionEnvironment().isPlayer;

// Gameplay (ou qualquer vídeo) no fundo de todo o vídeo, sem som, repetindo quando acaba.
// Vem antes das cenas: as fotos, os elementos animados e a legenda ficam por cima, como num template.
export const GameplayFundo: React.FC = () => {
  const { projeto, linha, arquivo, tema } = useVideo();
  const g = projeto.fundoVideo;
  const src = g ? arquivo(g.arquivo) : null;
  if (!g) return null;
  const inicio = Math.max(0, g.inicio ?? 0);
  const volta = Math.max(FPS, Math.floor((Math.max(2, g.duracao || 0) - inicio) * FPS)); // frames de cada volta
  const voltas = Math.ceil(linha.duracao / volta);
  return (
    <AbsoluteFill style={{ background: tema.fundo }}>
      {src &&
        Array.from({ length: voltas }, (_, n) => (
          <Sequence key={n} from={n * volta} durationInFrames={volta} layout="none">
            <OffthreadVideo
              src={src}
              startFrom={Math.round(inicio * FPS)}
              volume={g.volume ?? 0}
              muted={!g.volume}
              onError={naPrevia ? semErro : undefined}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.82) saturate(1.05)" }}
            />
          </Sequence>
        ))}
      {/* escurece de leve em cima e embaixo, para a legenda e os títulos aparecerem */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)" }} />
    </AbsoluteFill>
  );
};

// Fotos da cena como cartões por cima da gameplay: entram com um pulinho, se sucedem com fusão
// (nos tempos de galeriaEm) e têm um zoom lento dentro do cartão.
export const FotosCartoes: React.FC<{ chave?: string; galeria?: string[]; inicios?: number[]; duracao: number }> = ({ chave, galeria, inicios, duracao }) => {
  const f = useCurrentFrame();
  const { imagem } = useVideo();
  const q = useQuadro();
  const chaves = galeria?.length ? galeria : chave ? [chave] : [];
  // foto que não foi baixada some da fila, e as outras mantêm o tempo marcado (galeriaEm)
  const itens = chaves.map((k, i) => ({ u: imagem(k), ini: inicios?.length === chaves.length ? inicios[i] : (i * duracao) / chaves.length })).filter((x): x is { u: string; ini: number } => !!x.u);
  const fotos = itens.map((x) => x.u);
  if (!fotos.length) return null;
  const largura = q.horizontal ? q.texto - 140 : q.largura - 140;
  const altura = q.horizontal ? Math.round(largura * 0.6) : 780;
  const x = 70;
  const y = q.horizontal ? 90 : 170;
  const entra = interpolate(f, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulo = 0.9 + 0.1 * entra;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: x, top: y, width: largura, height: altura, borderRadius: 30, overflow: "hidden", background: "#000",
          boxShadow: "0 24px 70px rgba(0,0,0,.65), 0 0 0 5px rgba(255,255,255,.92)",
          opacity: entra, transform: `scale(${pulo})`,
        }}
      >
        {fotos.map((u, k) => {
          const ini = k === 0 ? 0 : itens[k].ini;
          const dura = (itens[k + 1]?.ini ?? duracao) - ini;
          if (f < ini - FUSAO || f > ini + dura + FUSAO) return null;
          const t = Math.max(0, Math.min(1, (f - ini + FUSAO) / (dura + FUSAO)));
          const opacidade = k === 0 ? 1 : interpolate(f, [ini - FUSAO, ini], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const escala = k % 2 ? 1.14 - t * 0.08 : 1.04 + t * 0.1;
          return (
            <Img
              key={k}
              src={u}
              style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 28%", opacity: opacidade, transform: `scale(${escala})`, filter: "saturate(1.08) contrast(1.04)" }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
