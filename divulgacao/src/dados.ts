import narracao from "./gerado/narracao.json";
import marcas from "../public/telas/marcas.json";

export type Palavra = { p: string; i: number; f: number };
export type Cena = {
  audio: string;
  duracao: number;
  palavras: Palavra[];
  inicio: number;
  quadros: number;
  falaEm: number;
};

export const NARRACAO = narracao as unknown as {
  fps: number;
  transicao: number;
  bpm: number;
  total: number;
  cenas: Record<string, Cena>;
};

export const FPS = NARRACAO.fps;
export const BATIDA = Math.round((FPS * 60) / NARRACAO.bpm);

export const cena = (id: string): Cena => NARRACAO.cenas[id];

const normal = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** Quadro (dentro da cena) em que a palavra começa a ser falada. `n` = qual ocorrência. */
export const quando = (id: string, palavra: string, n = 0, reserva = 30): number => {
  const c = cena(id);
  const alvo = normal(palavra);
  let k = 0;
  for (const w of c.palavras) {
    if (normal(w.p) === alvo) {
      if (k === n) return Math.round(c.falaEm + w.i * FPS);
      k++;
    }
  }
  return reserva;
};

/** Quadro em que a fala da cena termina. */
export const fimFala = (id: string) => {
  const c = cena(id);
  const ult = c.palavras[c.palavras.length - 1];
  return Math.round(c.falaEm + (ult ? ult.f : c.duracao) * FPS);
};

export type Retangulo = [number, number, number, number];
export const MARCAS = marcas as unknown as Record<
  string,
  { largura: number; altura: number; el: Record<string, Retangulo[]> }
>;
