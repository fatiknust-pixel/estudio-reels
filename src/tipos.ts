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
  modo?: "reels" | "cinema"; // reels (padrão): palavra por palavra; cinema: frases embaixo, como legenda de filmes e séries
};

// Vídeo de fundo do modo IA (a "gameplay"). arquivo/previa ficam em projetos/<id>/ (a release "brutos" guarda o do render).
export type FundoVideo = { arquivo: string; previa?: string; duracao: number; largura: number; altura: number; inicio?: number; volume?: number; pronto?: boolean; erro?: string };

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
  musica?: "tensao" | "leve" | "epica"; // qual trilha (padrão: tensão)
  abaixarTrilha?: boolean; // trilha abaixa enquanto alguém fala (padrão: ligado)
};

// ----- Modo 1 (IA): estilo de edição (ritmo e movimento, não só cores) — catálogo em src/estilos-ia.json -----
export type Dinamica = "padrao" | "energetica" | "cinema" | "jornal" | "glitch" | "colagem" | "minimal";
export type EstiloIA = {
  dinamica: Dinamica;
  legenda?: "karaoke" | "palavra" | "caixa" | "discreta" | "cinema";
  transicao: "faixas" | "zoom" | "deslize" | "flash" | "circulo";
  fundo: "grade" | "ondas" | "pontos" | "raios" | "limpo" | "bandeira";
  formato?: string;
};
// No pedido: "auto" deixa o Claude escolher (sem repetir o vídeo anterior)
export type PedidoEstilo = Partial<Record<"dinamica" | "legenda" | "transicao" | "fundo" | "musica" | "formato" | "fonte" | "paleta", string>>;

// ----- Modo 1 (IA): cenas no formato do roteiro.json do Astra -----
export type ElementoCena = { tipo: string; em?: string | number; posicao?: string; [k: string]: any };
export type Cena = {
  id: string;
  texto: string;
  fundo?: string;
  galeria?: string[]; // várias fotos que se sucedem na cena (estilo documentário); chaves de imagens
  galeriaEm?: (string | number)[]; // quando cada foto entra: palavra (ou nº da palavra) da fala da cena; a 1ª entra no começo. Sem isso, tempos iguais
  fontes?: string[];
  elementos: ElementoCena[];
};
export type NarracaoCena = { hash?: string; texto?: string; audio: string; duracao: number; palavras: Palavra[] };
// arquivo vazio = ainda não baixada. wiki/commons/arquivoCommons/busca dizem onde procurar no Wikimedia.
export type ImagemInfo = {
  arquivo: string; rotulo?: string; autor?: string; licenca?: string; pagina?: string; titulo?: string;
  wiki?: string; commons?: string; arquivoCommons?: string; busca?: string; propria?: boolean;
  // medidas por scripts/enquadrar.py: tamanho da foto, rostos achados e o centro do assunto (% da foto)
  largura?: number; altura?: number; rostos?: number; foco?: { x: number; y: number };
  borrada?: string; // miniatura já desfocada e escurecida (fundo das fotos que aparecem inteiras), gerada por enquadrar.py
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
  pedido?: { idioma?: string; tema: string; tom: string; duracao: number; estilo?: PedidoEstilo; genero?: { id: string; nome: string; instrucoes: string; galeria?: boolean }; lote?: { indice: number; total: number; outros: string[] } };
  estiloIA?: EstiloIA;
  formato?: "9:16" | "16:9"; // quadro do vídeo: vertical (padrão) ou horizontal
  genero?: string; // gênero do vídeo (catálogo src/generos.json), escolhido no pedido do Modo 1
  fundoVideo?: FundoVideo; // modo IA: gameplay (ou outro vídeo) rodando no fundo; as fotos entram por cima como cartões
  idioma?: string; // idioma do vídeo (src/idiomas.ts); padrão pt-BR
  publicacao?: { titulos: string[]; descricao: string; tags: string[] }; // títulos, descrição e tags prontos para postar (escritos pelo Claude)
  visual?: "aula"; // modo IA: "aula" = videoaula com fundo branco e ícones simples (sem dinâmica de Reels)
  voz?: { edge: string; velocidade: string; tratamento?: boolean; tom?: string; fluida?: boolean }; // tom: ex. "-2Hz" (mais grave); fluida: frases lidas uma a uma, com pausas pela pontuação // tratamento: equalização, compressor e -16 LUFS
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

// Legenda de filmes e séries: frases de até 2 linhas na parte de baixo, sem destaque nem animação.
// "posicao" aqui é onde fica a borda de baixo da legenda (% da altura).
export const LEGENDA_CINEMA: Partial<EstiloLegenda> = {
  modo: "cinema", fonte: "montserrat", tamanho: 60, cor: "#FFFFFF", posicao: 91, palavrasPorTela: 8, maiusculas: false, contorno: 0, fundo: "nenhum", animacao: "nenhuma",
};
// Volta ao palavra por palavra (valores de LEGENDA_PADRAO; no 16:9 maior posição/tamanho menor)
export const LEGENDA_REELS = (horizontal: boolean): Partial<EstiloLegenda> => ({
  modo: "reels", fonte: LEGENDA_PADRAO.fonte, tamanho: horizontal ? 78 : LEGENDA_PADRAO.tamanho, cor: LEGENDA_PADRAO.cor, posicao: horizontal ? 82 : LEGENDA_PADRAO.posicao,
  palavrasPorTela: LEGENDA_PADRAO.palavrasPorTela, maiusculas: LEGENDA_PADRAO.maiusculas, contorno: LEGENDA_PADRAO.contorno, fundo: LEGENDA_PADRAO.fundo, animacao: LEGENDA_PADRAO.animacao,
});

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
