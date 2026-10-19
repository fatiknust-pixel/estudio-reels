import { Audio, Sequence, staticFile } from "remotion";

// Efeito sonoro posicionado em um quadro da cena
export const Sfx: React.FC<{ nome: string; em: number; volume?: number; duracao?: number }> = ({
  nome,
  em,
  volume = 0.6,
  duracao = 120,
}) => (
  <Sequence from={Math.max(0, Math.round(em))} durationInFrames={duracao} layout="none">
    <Audio src={staticFile(`sfx/${nome}.mp3`)} volume={volume} />
  </Sequence>
);
