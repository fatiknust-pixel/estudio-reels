import { loadFont } from "@remotion/fonts";
import { staticFile, useVideoConfig } from "remotion";

// Fontes embutidas no projeto (public/fonts): Montserrat (a mesma dos vídeos do app) e IBM Plex Mono (código).
for (const peso of ["600", "700", "800", "900"]) {
  loadFont({ family: "Montserrat", url: staticFile(`fonts/montserrat-latin-${peso}-normal.woff2`), weight: peso, format: "woff2" });
}
for (const peso of ["500", "600"]) {
  loadFont({ family: "IBM Plex Mono", url: staticFile(`fonts/ibm-plex-mono-latin-${peso}-normal.woff2`), weight: peso, format: "woff2" });
}

export const SANS = "Montserrat, system-ui, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, monospace";

// Paleta do Estúdio Reels: fundo quase preto, roxo do ícone e amarelo de destaque (#FFD60A)
export const COR = {
  noite: "#05060A",
  fundo: "#0B0D14",
  marinho: "#2A1659",
  azul: "#8B5CF6",
  claro: "#C9B8FF",
  ciano: "#FFD60A",
  branco: "#F5F6FA",
  suave: "rgba(245,246,250,0.66)",
  linha: "rgba(201,184,255,0.16)",
  verde: "#30D158",
  vermelho: "#FF5A52",
  ambar: "#FFB547",
  card: "#1A1F2E",
} as const;

/** Formato do vídeo atual: vertical (9:16) ou horizontal (16:9). */
export const useFormato = () => {
  const { width, height } = useVideoConfig();
  return { v: height > width, W: width, H: height };
};
