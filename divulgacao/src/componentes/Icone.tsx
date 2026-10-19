// Ícones em traço (24×24), desenhados em SVG: o render não tem fonte de emoji.
export const ICONES = {
  roteiro: "M6 3h9l3 3v15H6z M9 9h6 M9 13h6 M9 17h4",
  voz: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v3",
  legenda: "M3 6h18v12H3z M7 14h4 M13 14h4 M7 11h10",
  cortes: "M6 4a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M6 15a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M8.2 8l11.8 9 M8.2 16l11.8-9",
  efeitos: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
  pesquisa: "M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13 M15.5 15.5L20 20",
  imagem: "M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M15.5 8.5a1.5 1.5 0 1 0 0 .01",
  anima: "M4 4h16v16H4z M10 8.5v7l6-3.5z",
  relogio: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7v5l3.5 2",
  check: "M5 12.5l4.5 4.5L19 7.5",
  upload: "M12 16V4 M7 9l5-5 5 5 M4 16v4h16v-4",
  codigo: "M8 7l-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16",
  nuvem: "M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4.75 4.75 0 0 1-.5 9.5z",
  video: "M3 6h13v12H3z M16 10l5-3v10l-5-3z",
} as const;

export type NomeIcone = keyof typeof ICONES;

export const Icone: React.FC<{ nome: NomeIcone; tamanho?: number; cor?: string; espessura?: number; style?: React.CSSProperties }> = ({
  nome,
  tamanho = 32,
  cor = "currentColor",
  espessura = 2,
  style,
}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0, ...style }}>
    <path d={ICONES[nome]} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
