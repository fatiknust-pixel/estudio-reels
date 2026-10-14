// Estilos prontos do Modo 2. Cada um ajusta legenda, efeitos, tema e enquadramento.
import { Efeitos, EstiloLegenda, VideoFonte } from "../src/tipos";

export type EstiloPronto = {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  tema: string;
  legenda: Partial<EstiloLegenda>;
  efeitos?: Partial<Efeitos>;
  video?: Partial<VideoFonte>;
  pronto: boolean; // já disponível no app
};

export const ESTILOS: EstiloPronto[] = [
  {
    id: "impacto",
    nome: "Legenda impacto",
    emoji: "💥",
    descricao: "Palavras grandes, 1–2 por vez, com pop e destaque amarelo nas palavras-chave.",
    tema: "padrao",
    legenda: { fonte: "montserrat", tamanho: 104, cor: "#FFFFFF", corDestaque: "#FFD60A", posicao: 66, palavrasPorTela: 2, maiusculas: true, contorno: 12, fundo: "nenhum", animacao: "pop", mostrar: true },
    efeitos: { barraProgresso: true, trilha: false, somTransicao: true },
    video: { enquadramento: "preencher" },
    pronto: true,
  },
];

export const estiloDe = (id: string) => ESTILOS.find((e) => e.id === id);
