// Paletas. O projeto escolhe uma com "tema": "<chave>". (Padrão e Brasil vêm do Astra.)
export type Tema = {
  nome: string;
  fundo: string; // cor de base do quadro
  brilhoA: string; // brilho do gradiente (cenas pares)
  brilhoB: string; // brilho do gradiente (cenas ímpares)
  texto: string;
  suave: string;
  amarelo: string;
  vermelho: string;
  verde: string;
  azul: string;
  cinza: string;
  roxo: string;
  destaque: string; // palavra ativa da legenda, anel das fotos, barra de progresso
  transicao: [string, string, string]; // faixas que cruzam a tela entre cenas
  bandeira?: boolean; // desenha o losango e o círculo da bandeira no fundo
};

const base = {
  texto: "#FFFFFF", suave: "rgba(255,255,255,0.75)", amarelo: "#FFD60A", vermelho: "#FF3B30",
  verde: "#30D158", azul: "#0A84FF", cinza: "#8E8E93", roxo: "#BF5AF2",
};

export const TEMAS: Record<string, Tema> = {
  padrao: {
    ...base, nome: "Noite (padrão)", fundo: "#0B0F1A", brilhoA: "#12305C", brilhoB: "#3A1C71",
    destaque: "#FFD60A", transicao: ["#FFD60A", "#FF3B30", "#FFFFFF"],
  },
  brasil: {
    ...base, nome: "Brasil", fundo: "#011733", brilhoA: "#006B35", brilhoB: "#0B3A8C", suave: "rgba(255,255,255,0.78)",
    amarelo: "#FFDF00", verde: "#00A859", azul: "#2F6FE4", cinza: "#9AA5B8", roxo: "#2F6FE4",
    destaque: "#FFDF00", transicao: ["#00A859", "#FFDF00", "#2F6FE4"], bandeira: true,
  },
  neon: {
    ...base, nome: "Neon", fundo: "#07040F", brilhoA: "#4A0E5C", brilhoB: "#0E3B5C", amarelo: "#F9F871",
    vermelho: "#FF2E88", verde: "#00F5A0", azul: "#00C2FF", roxo: "#B026FF",
    destaque: "#00F5A0", transicao: ["#FF2E88", "#00C2FF", "#F9F871"],
  },
  noticia: {
    ...base, nome: "Notícia", fundo: "#0A0A0C", brilhoA: "#5C0A0A", brilhoB: "#1F1F28", amarelo: "#FFFFFF",
    destaque: "#E10600", vermelho: "#E10600", transicao: ["#E10600", "#FFFFFF", "#1F1F28"],
  },
  documentario: {
    ...base, nome: "Documentário", fundo: "#14110C", brilhoA: "#3D3020", brilhoB: "#24302A", amarelo: "#E8C27A",
    vermelho: "#C8553D", verde: "#7FA37A", azul: "#6E8FA6", suave: "rgba(255,244,225,0.75)",
    destaque: "#E8C27A", transicao: ["#E8C27A", "#14110C", "#FFF4E1"],
  },
  oceano: {
    ...base, nome: "Oceano", fundo: "#03141F", brilhoA: "#005F73", brilhoB: "#0A9396", amarelo: "#E9D8A6",
    vermelho: "#EE6C4D", verde: "#94D2BD", azul: "#48CAE4",
    destaque: "#48CAE4", transicao: ["#94D2BD", "#48CAE4", "#E9D8A6"],
  },
  fogo: {
    ...base, nome: "Fogo", fundo: "#140504", brilhoA: "#7A1C03", brilhoB: "#5E0B2B", amarelo: "#FFB703",
    vermelho: "#FB5607", verde: "#8AC926", azul: "#3A86FF",
    destaque: "#FFB703", transicao: ["#FB5607", "#FFB703", "#FFFFFF"],
  },
  pordosol: {
    ...base, nome: "Pôr do sol", fundo: "#1A0B1E", brilhoA: "#5A1F3D", brilhoB: "#6B3A12", suave: "rgba(255,255,255,0.78)",
    amarelo: "#FFB547", vermelho: "#FF5E5B", verde: "#4ADE80", azul: "#A78BFA", cinza: "#B8A6B0", roxo: "#E879F9",
    destaque: "#FFB547", transicao: ["#FF5E5B", "#FFB547", "#E879F9"],
  },
  grafite: {
    ...base, nome: "Grafite", fundo: "#111111", brilhoA: "#2A2A2A", brilhoB: "#1F2A2E", suave: "rgba(255,255,255,0.72)",
    amarelo: "#FF7A1A", vermelho: "#FF4040", verde: "#3DDC97", azul: "#4AA3FF", cinza: "#9CA3AF", roxo: "#4AA3FF",
    destaque: "#FF7A1A", transicao: ["#FF7A1A", "#FFFFFF", "#2A2A2A"],
  },
  claro: {
    ...base, nome: "Claro", fundo: "#F4F1EA", brilhoA: "#FFE8A3", brilhoB: "#CDE7F0", texto: "#111111",
    suave: "rgba(17,17,17,0.7)", amarelo: "#FFB800", destaque: "#FF4D00", transicao: ["#FF4D00", "#111111", "#FFB800"],
  },
};

export const temaDe = (chave?: string) => TEMAS[chave ?? "padrao"] ?? TEMAS.padrao;
