import { loadFont } from "@remotion/fonts";
import { arquivoGlobal } from "./arquivos";

// Fontes embutidas em public/fonts (funcionam offline, na prévia e no render).
export const FONTES: Record<string, { nome: string; familia: string; peso: number; arquivos: [string, string][] }> = {
  montserrat: { nome: "Montserrat", familia: "Montserrat", peso: 900, arquivos: [["600", "montserrat-latin-600-normal"], ["700", "montserrat-latin-700-normal"], ["800", "montserrat-latin-800-normal"], ["900", "montserrat-latin-900-normal"]] },
  anton: { nome: "Anton", familia: "Anton", peso: 400, arquivos: [["400", "anton-latin-400-normal"]] },
  bebas: { nome: "Bebas Neue", familia: "Bebas Neue", peso: 400, arquivos: [["400", "bebas-neue-latin-400-normal"]] },
  poppins: { nome: "Poppins", familia: "Poppins", peso: 800, arquivos: [["600", "poppins-latin-600-normal"], ["800", "poppins-latin-800-normal"]] },
  inter: { nome: "Inter", familia: "Inter", peso: 800, arquivos: [["800", "inter-latin-800-normal"]] },
  oswald: { nome: "Oswald", familia: "Oswald", peso: 700, arquivos: [["700", "oswald-latin-700-normal"]] },
  raleway: { nome: "Raleway", familia: "Raleway", peso: 800, arquivos: [["800", "raleway-latin-800-normal"]] },
  playfair: { nome: "Playfair", familia: "Playfair Display", peso: 800, arquivos: [["800", "playfair-display-latin-800-normal"]] },
  robotoslab: { nome: "Roboto Slab", familia: "Roboto Slab", peso: 800, arquivos: [["800", "roboto-slab-latin-800-normal"]] },
  bangers: { nome: "Bangers", familia: "Bangers", peso: 400, arquivos: [["400", "bangers-latin-400-normal"]] },
};

let carregadas = false;
export const carregarFontes = () => {
  if (carregadas) return;
  carregadas = true;
  for (const f of Object.values(FONTES)) {
    for (const [peso, arq] of f.arquivos) {
      loadFont({ family: f.familia, url: arquivoGlobal(`fonts/${arq}.woff2`), weight: peso, format: "woff2" }).catch(() => {});
    }
  }
};

// A família de cada vídeo vem da variável --fonte, definida na raiz da composição (fonte da legenda).
export const FONTE = "var(--fonte), Montserrat, 'Arial Black', Arial, sans-serif";
export const familiaDe = (chave?: string) => {
  const f = FONTES[chave ?? "montserrat"] ?? FONTES.montserrat;
  return { familia: `'${f.familia}', 'Arial Black', Arial, sans-serif`, peso: f.peso };
};

// Posições verticais (px) dos elementos animados, respeitando a área segura do TikTok/Reels
export const POSICAO: Record<string, number> = {
  topo: 210,
  alto: 420,
  alto2: 640,
  meio: 880,
  meio2: 1090,
};
