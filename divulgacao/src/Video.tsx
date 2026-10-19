import { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionPresentation, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { iris } from "@remotion/transitions/iris";
import { cena, FPS, NARRACAO } from "./dados";
import { Fundo } from "./componentes/Fundo";
import { Legenda } from "./componentes/Legenda";
import { Abertura } from "./cenas/Abertura";
import { Tarefas } from "./cenas/Tarefas";
import { Revelacao } from "./cenas/Revelacao";
import { IA } from "./cenas/IA";
import { Bruto } from "./cenas/Bruto";
import { Editor } from "./cenas/Editor";
import { Tecnologia } from "./cenas/Tecnologia";
import { Autor } from "./cenas/Autor";
import { Final } from "./cenas/Final";

const CENAS: { id: string; C: React.FC; legenda?: boolean }[] = [
  { id: "abertura", C: Abertura },
  { id: "tarefas", C: Tarefas },
  { id: "revelacao", C: Revelacao, legenda: false },
  { id: "ia", C: IA },
  { id: "bruto", C: Bruto },
  { id: "editor", C: Editor },
  { id: "tecnologia", C: Tecnologia },
  { id: "autor", C: Autor },
  { id: "final", C: Final, legenda: false },
];

// Transição que entra em cada cena (índice = cena que chega)
const suave = { durationInFrames: NARRACAO.transicao, easing: Easing.inOut(Easing.cubic) };
const transicoes = (width: number, height: number): (TransitionPresentation<any> | null)[] => [
  null,
  slide({ direction: "from-right" }),
  fade(),
  slide({ direction: "from-bottom" }),
  slide({ direction: "from-right" }),
  wipe({ direction: "from-left" }),
  iris({ width, height }),
  slide({ direction: "from-bottom" }),
  fade(),
];

/** Zoom lento e contínuo dentro de cada cena: a imagem nunca fica parada. */
const Movimento: React.FC<{ quadros: number; children: React.ReactNode }> = ({ quadros, children }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, quadros], [1, 1.045]);
  return <AbsoluteFill style={{ transform: `scale(${z})` }}>{children}</AbsoluteFill>;
};

/** Volume da trilha: abaixa enquanto alguém fala (ducking), suavizado. */
const useVolumeTrilha = () =>
  useMemo(() => {
    const n = NARRACAO.total + 120;
    const alvo = new Float32Array(n).fill(0.4);
    for (const { id } of CENAS) {
      const c = cena(id);
      for (const w of c.palavras) {
        const a = Math.floor(c.inicio + c.falaEm + w.i * FPS) - 4;
        const b = Math.ceil(c.inicio + c.falaEm + w.f * FPS) + 8;
        for (let i = Math.max(0, a); i < Math.min(n, b); i++) alvo[i] = 0.17;
      }
    }
    const v = new Float32Array(n);
    const janela = 10;
    for (let i = 0; i < n; i++) {
      let s = 0;
      let k = 0;
      for (let j = i - janela; j <= i + janela; j++) {
        if (j >= 0 && j < n) {
          s += alvo[j];
          k++;
        }
      }
      v[i] = s / k;
    }
    return v;
  }, []);

export const Video = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const TRANSICOES = useMemo(() => transicoes(width, height), [width, height]);
  const vol = useVolumeTrilha();
  const prob = cena("abertura");
  const rev = cena("revelacao");
  const alerta = interpolate(f, [prob.inicio, prob.inicio + 30, rev.inicio, rev.inicio + 10], [0, 0.6, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brilho = interpolate(f, [rev.inicio + 10, rev.inicio + 40, rev.inicio + 120], [0, 1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo alerta={alerta} brilho={brilho} />
      <TransitionSeries>
        {CENAS.flatMap(({ id, C, legenda }, i) => {
          const c = cena(id);
          const itens: React.ReactNode[] = [];
          const t = TRANSICOES[i];
          if (t) itens.push(<TransitionSeries.Transition key={"t" + id} presentation={t} timing={linearTiming(suave)} />);
          itens.push(
            <TransitionSeries.Sequence key={id} durationInFrames={c.quadros}>
              <Movimento quadros={c.quadros}>
                <C />
              </Movimento>
              {legenda !== false && <Legenda id={id} />}
              <Sequence from={c.falaEm} layout="none">
                <Audio src={staticFile(c.audio)} volume={1} />
              </Sequence>
            </TransitionSeries.Sequence>,
          );
          return itens;
        })}
      </TransitionSeries>
      <Audio src={staticFile("sfx/trilha.mp3")} volume={(q) => vol[Math.min(vol.length - 1, q)]} />
    </AbsoluteFill>
  );
};
