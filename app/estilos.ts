// Estilos prontos do Modo 2. Cada um ajusta legenda, efeitos, tema e enquadramento no app,
// e a Action (scripts/processar_bruto.py + sugestões do Claude) aplica o resto: destaques, zooms, cortes.
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
  limitePausa: number; // padrão do corte automático de pausas (s)
  pronto: boolean;
};

export const ESTILOS: EstiloPronto[] = [
  {
    id: "impacto",
    nome: "Legenda impacto",
    emoji: "💥",
    descricao: "Palavras grandes, 1–2 por vez, com pop, destaque amarelo e zoom nas palavras-chave.",
    tema: "padrao",
    legenda: { fonte: "montserrat", tamanho: 104, cor: "#FFFFFF", corDestaque: "#FFD60A", posicao: 66, palavrasPorTela: 2, maiusculas: true, contorno: 12, fundo: "nenhum", animacao: "pop", mostrar: true },
    efeitos: { barraProgresso: true, trilha: false, somTransicao: true },
    video: { enquadramento: "preencher" },
    limitePausa: 0.5,
    pronto: true,
  },
  {
    id: "cortes-rapidos",
    nome: "Cortes rápidos",
    emoji: "⚡",
    descricao: "Sem respiro: pausas cortadas no talo, enquadramento que alterna a cada corte e 1 palavra por vez.",
    tema: "neon",
    legenda: { fonte: "anton", tamanho: 128, cor: "#FFFFFF", corDestaque: "#00F5A0", posicao: 58, palavrasPorTela: 1, maiusculas: true, contorno: 12, fundo: "nenhum", animacao: "pop", mostrar: true },
    efeitos: { barraProgresso: true, trilha: false, somTransicao: true },
    video: { enquadramento: "preencher" },
    limitePausa: 0.3,
    pronto: true,
  },
  {
    id: "podcast",
    nome: "Corte de podcast",
    emoji: "🎙️",
    descricao: "Vídeo deitado inteiro com fundo desfocado, legenda em caixa e título do assunto no topo.",
    tema: "padrao",
    legenda: { fonte: "poppins", tamanho: 72, cor: "#FFFFFF", corDestaque: "#FFD60A", posicao: 74, palavrasPorTela: 4, maiusculas: false, contorno: 0, fundo: "caixa", animacao: "subir", mostrar: true },
    efeitos: { barraProgresso: true, trilha: false, somTransicao: false },
    video: { enquadramento: "ajustar" },
    limitePausa: 0.7,
    pronto: true,
  },
  {
    id: "documentario",
    nome: "Documentário",
    emoji: "🎞️",
    descricao: "Ritmo calmo: zoom lento contínuo, trilha suave, legenda discreta em minúsculas.",
    tema: "documentario",
    legenda: { fonte: "inter", tamanho: 66, cor: "#FFF4E1", corDestaque: "#E8C27A", posicao: 80, palavrasPorTela: 5, maiusculas: false, contorno: 6, fundo: "nenhum", animacao: "subir", mostrar: true },
    efeitos: { barraProgresso: false, trilha: true, volumeTrilha: 0.08, somTransicao: false },
    video: { enquadramento: "preencher" },
    limitePausa: 0.9,
    pronto: true,
  },
  {
    id: "noticia",
    nome: "Notícia",
    emoji: "📰",
    descricao: "Cara de telejornal: faixa vermelha, palavra ativa em destaque e chamada de URGENTE.",
    tema: "noticia",
    legenda: { fonte: "montserrat", tamanho: 80, cor: "#FFFFFF", corDestaque: "#E10600", posicao: 76, palavrasPorTela: 3, maiusculas: true, contorno: 8, fundo: "palavra", animacao: "pop", mostrar: true },
    efeitos: { barraProgresso: true, trilha: false, somTransicao: true },
    video: { enquadramento: "preencher" },
    limitePausa: 0.5,
    pronto: true,
  },
  {
    id: "tutorial",
    nome: "Tutorial",
    emoji: "🧑‍🏫",
    descricao: "Passo a passo: títulos “PASSO 1, 2, 3…”, legenda em caixa legível e destaques nos termos.",
    tema: "oceano",
    legenda: { fonte: "poppins", tamanho: 76, cor: "#FFFFFF", corDestaque: "#48CAE4", posicao: 76, palavrasPorTela: 3, maiusculas: false, contorno: 0, fundo: "caixa", animacao: "pop", mostrar: true },
    efeitos: { barraProgresso: true, trilha: false, somTransicao: true },
    video: { enquadramento: "preencher" },
    limitePausa: 0.5,
    pronto: true,
  },
];

export const estiloDe = (id: string) => ESTILOS.find((e) => e.id === id);
