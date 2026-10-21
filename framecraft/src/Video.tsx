import { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { cena, FPS, NARRACAO } from "./dados";
import { Fundo } from "./componentes/Base";
import { Moldura } from "./componentes/Moldura";
import { Legenda } from "./componentes/Legenda";
import { Abertura } from "./cenas/Abertura";
import { Problema } from "./cenas/Problema";
import { Solucao } from "./cenas/Solucao";
import { Modos } from "./cenas/Modos";
import { IA } from "./cenas/IA";
import { Bruto } from "./cenas/Bruto";
import { Editor } from "./cenas/Editor";
import { Arquitetura } from "./cenas/Arquitetura";
import { Tecnologia } from "./cenas/Tecnologia";
import { Autoria } from "./cenas/Autoria";
import { Final } from "./cenas/Final";

const CENAS: { id: string; C: React.FC; legenda?: boolean }[] = [
  { id: "abertura", C: Abertura, legenda: false },
  { id: "problema", C: Problema },
  { id: "solucao", C: Solucao },
  { id: "modos", C: Modos },
  { id: "ia", C: IA },
  { id: "bruto", C: Bruto },
  { id: "editor", C: Editor },
  { id: "arquitetura", C: Arquitetura },
  { id: "tecnologia", C: Tecnologia },
  { id: "autoria", C: Autoria },
  { id: "final", C: Final, legenda: false },
];

// Transição única e discreta entre todas as cenas
const TRANSICAO = linearTiming({ durationInFrames: NARRACAO.transicao, easing: Easing.inOut(Easing.cubic) });

/** Trilha baixa, que abaixa ainda mais enquanto a narração fala. */
const useVolumeTrilha = () =>
  useMemo(() => {
    const n = NARRACAO.total + 120;
    const alvo = new Float32Array(n).fill(0.26);
    for (const { id } of CENAS) {
      const c = cena(id);
      for (const w of c.palavras) {
        const a = Math.floor(c.inicio + c.falaEm + w.i * FPS) - 6;
        const b = Math.ceil(c.inicio + c.falaEm + w.f * FPS) + 10;
        for (let i = Math.max(0, a); i < Math.min(n, b); i++) alvo[i] = 0.12;
      }
    }
    const v = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      let k = 0;
      for (let j = i - 12; j <= i + 12; j++) if (j >= 0 && j < n) (s += alvo[j]), k++;
      v[i] = s / k;
    }
    return v;
  }, []);

export const Video = () => {
  const vol = useVolumeTrilha();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo />
      <TransitionSeries>
        {CENAS.flatMap(({ id, C, legenda }, i) => {
          const c = cena(id);
          const itens: React.ReactNode[] = [];
          if (i > 0) itens.push(<TransitionSeries.Transition key={"t" + id} presentation={fade()} timing={TRANSICAO} />);
          itens.push(
            <TransitionSeries.Sequence key={id} durationInFrames={c.quadros}>
              <C />
              {legenda !== false && <Legenda id={id} />}
              <Sequence from={c.falaEm} layout="none">
                <Audio src={staticFile(c.audio)} volume={1} />
              </Sequence>
            </TransitionSeries.Sequence>,
          );
          return itens;
        })}
      </TransitionSeries>
      <Moldura />
      <Audio src={staticFile("sfx/trilha.mp3")} volume={(q) => vol[Math.min(vol.length - 1, q)]} />
    </AbsoluteFill>
  );
};
