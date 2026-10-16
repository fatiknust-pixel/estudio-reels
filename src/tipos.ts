// Formato de um projeto (projetos/<id>/projeto.json). É o mesmo objeto que o editor
// altera, que a prévia (Remotion Player) desenha e que a Action usa para renderizar o MP4.
// Tempos em SEGUNDOS. No modo "bruto" eles são do vídeo original (antes dos cortes),
// assim os efeitos continuam presos à fala mesmo quando você muda os cortes.

export type Palavra = { p: string; i: number; f: number; destaque?: boolean };

export type EstiloLegenda = {
  fonte: string; // chave de FONTES
  tamanho: number; // px no quadro 1080x1920
  cor: string;
  corDestaque: string;
  posicao: number; // centro vertical da legenda, 0–100 (% da altura)
  palavrasPorTela: number;
  maiusculas: boolean;
  contorno: number; // espessura do contorno preto (px)
  fundo: "nenhum" | "caixa" | "palavra"; // caixa atrás da tela / atrás da palavra ativa
  animacao: "pop" | "subir" | "nenhuma";
  mostrar: boolean;
};

export type Titulo = { id: string; texto: string; sub?: string; i: number; f: number; posicao?: number; cor?: string };
export type Emoji = { id: string; emoji: string; i: number; dur: number; x: number; y: number; tamanho?: number };
export type Som = { id: string; som: string; i: number; volume?: number };
export type Zoom = { id: string; i: number; f: number; escala: number; suave?: boolean; seco?: boolean }; // seco = corte sem animação
// Gancho: trecho do vídeo que abre o Reels (antes do começo normal), com um texto chamativo
export type Gancho = { i: number; f: number; texto?: string; ia?: boolean };
export type Corte = { id: string; i: number; f: number; motivo?: string };
export type Enquete = { pergunta: string; opcoes: string[]; dur: number; ia?: boolean };

export type Efeitos = {
  barraProgresso: boolean;
  trilha: boolean;
  volumeTrilha: number;
  somTransicao: boolean;
  titulos: Titulo[];
  emojis: Emoji[];
  sons: Som[];
  zooms: Zoom[];
  enquete?: Enquete | null;
  sfxAuto?: boolean; // sons automáticos em zooms, emojis e títulos (padrão: ligado)
  abaixarTrilha?: boolean; // trilha abaixa enquanto alguém fala (padrão: ligado)
};

// ----- Modo 1 (IA): cenas no formato do roteiro.json do Astra -----
export type ElementoCena = { tipo: string; em?: string | number; posicao?: string; [k: string]: any };
export type Cena = {
  id: string;
  texto: string;
  fundo?: string;
  fontes?: string[];
  elementos: ElementoCena[];
};
export type NarracaoCena = { hash?: string; texto?: string; audio: string; duracao: number; palavras: Palavra[] };
// arquivo vazio = ainda não baixada. wiki/commons/arquivoCommons/busca dizem onde procurar no Wikimedia.
export type ImagemInfo = {
  arquivo: string; rotulo?: string; autor?: string; licenca?: string; pagina?: string; titulo?: string;
  wiki?: string; commons?: string; arquivoCommons?: string; busca?: string; propria?: boolean;
};

// ----- Modo 2 (bruto) -----
export type VideoFonte = {
  arquivo: string; // caminho relativo à pasta do projeto (no render) ou chave do arquivo local
  previa?: string; // versão leve para a prévia no celular
  duracao: number;
  largura: number;
  altura: number;
  enquadramento: "preencher" | "ajustar"; // preencher = corta as laterais; ajustar = fundo desfocado
  focoX: number; // 0–100, qual parte do vídeo horizontal fica no centro
  volume: number;
  // auto-enquadramento: posição do rosto (% do quadro original) ao longo do tempo do original
  foco?: { t: number; x: number; y: number }[];
  seguirRosto?: boolean; // false = usa só focoX
};

export type Projeto = {
  versao: 1;
  id: string;
  titulo: string;
  modo: "ia" | "bruto";
  estilo: string; // estilo pronto (impacto, cortes-rapidos, podcast, documentario, noticia, tutorial)
  tema: string; // chave de TEMAS
  criadoEm: string;
  atualizadoEm: string;
  status?: "rascunho" | "processando" | "pronto" | "erro";
  // opções e situação do processamento feito pelas Actions
  processamento?: { cortarPausas?: boolean; limitePausa?: number; idioma?: string; modelo?: string; ia?: boolean; erro?: string; workflow?: string; pedidoEm?: string };
  legenda: EstiloLegenda;
  efeitos: Efeitos;
  // bruto
  video?: VideoFonte;
  palavras?: Palavra[];
  cortes?: Corte[];
  gancho?: Gancho | null;
  // ia
  pedido?: { tema: string; tom: string; duracao: number };
  voz?: { edge: string; velocidade: string };
  cenas?: Cena[];
  narracao?: Record<string, NarracaoCena>;
  imagens?: Record<string, ImagemInfo>;
  fontesPesquisa?: { titulo: string; url: string }[];
  // sugestões da IA ainda não aplicadas
  sugestoes?: any;
  // só na prévia da aba Cortes: mostra o original inteiro e marca o que será cortado
  previaCortes?: Corte[];
};

export const LEGENDA_PADRAO: EstiloLegenda = {
  fonte: "montserrat",
  tamanho: 92,
  cor: "#FFFFFF",
  corDestaque: "#FFD60A",
  posicao: 70,
  palavrasPorTela: 3,
  maiusculas: true,
  contorno: 10,
  fundo: "nenhum",
  animacao: "pop",
  mostrar: true,
};

export const EFEITOS_PADRAO: Efeitos = {
  barraProgresso: true,
  trilha: true,
  volumeTrilha: 0.1,
  somTransicao: true,
  titulos: [],
  emojis: [],
  sons: [],
  zooms: [],
  enquete: null,
};

export const novoId = (prefixo = "") =>
  prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
