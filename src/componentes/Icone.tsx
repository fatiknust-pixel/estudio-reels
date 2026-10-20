import React from "react";

// Ícones vetoriais simples (traço), desenhados à mão para não depender de emoji/fonte.
const P: Record<string, React.ReactNode> = {
  predio: (<><rect x="14" y="8" width="36" height="50" rx="2" /><path d="M22 18h6M36 18h6M22 28h6M36 28h6M22 38h6M36 38h6M28 58V48h8v10" /></>),
  casa: (<><path d="M8 30 32 10l24 20" /><path d="M14 26v30h36V26" /><path d="M27 56V42h10v14" /></>),
  seta: (<path d="M8 32h44M38 18l14 14-14 14" />),
  contrato: (<><path d="M16 6h24l10 10v42H16z" /><path d="M40 6v10h10M22 28h20M22 36h20M22 44h12" /><path d="M36 50c3-4 6 2 10-2" /></>),
  documento: (<><path d="M16 6h24l10 10v42H16z" /><path d="M40 6v10h10M22 28h20M22 36h20M22 44h20" /></>),
  dinheiro: (<><rect x="6" y="16" width="52" height="32" rx="4" /><circle cx="32" cy="32" r="8" /><path d="M14 24v16M50 24v16" /></>),
  lavagem: (<><rect x="12" y="6" width="40" height="52" rx="4" /><circle cx="32" cy="36" r="13" /><path d="M20 14h6M36 14h8" /><path d="M24 38c4-4 8 4 16 0" /></>),
  martelo: (<><path d="M30 10l14 14M24 16l14 14M27 13l14 14" /><path d="M34 26 12 48" /><path d="M8 58h28" /></>),
  balanca: (<><path d="M32 8v48M18 56h28M12 16h40" /><path d="M12 16 4 34h16zM52 16l-8 18h16z" /></>),
  obra: (<><path d="M8 56h48M14 56V30l14-10v36M28 34h22v22" /><path d="M36 42h6M36 48h6" /><path d="M40 20l10-10 4 4-10 10" /></>),
  relogio: (<><circle cx="32" cy="34" r="22" /><path d="M32 20v14l10 6M26 6h12" /></>),
  check: (<path d="M12 34l13 13 27-29" />),
  x: (<path d="M16 16l32 32M48 16 16 48" />),
  pin: (<><path d="M32 58S14 38 14 26a18 18 0 0 1 36 0c0 12-18 32-18 32z" /><circle cx="32" cy="26" r="6" /></>),
  mais: (<path d="M32 14v36M14 32h36" />),
  urna: (<><rect x="10" y="22" width="44" height="34" rx="4" /><path d="M20 22V10h24v12" /><rect x="18" y="30" width="16" height="10" rx="2" /><path d="M40 32h6M40 38h6M40 44h6M18 48h16" /></>),
  alvo: (<><circle cx="32" cy="32" r="24" /><circle cx="32" cy="32" r="14" /><circle cx="32" cy="32" r="4" /><path d="M32 2v10M32 52v10M2 32h10M52 32h10" /></>),
  alerta: (<><path d="M32 6 60 56H4z" /><path d="M32 24v14M32 46v2" /></>),
  celular: (<><rect x="18" y="4" width="28" height="56" rx="5" /><path d="M28 52h8" /><path d="M24 16h16M24 24h16M24 32h10" /></>),
  tornozeleira: (<><path d="M14 30c0-10 8-16 18-16s18 6 18 16v6c0 10-8 16-18 16S14 46 14 36z" /><rect x="24" y="24" width="16" height="16" rx="3" /><circle cx="32" cy="32" r="2" /><path d="M4 22l6 4M60 22l-6 4" /></>),
  cruz: (<><rect x="8" y="8" width="48" height="48" rx="10" /><path d="M32 20v24M20 32h24" /></>),
  balao: (<><path d="M8 12h48v32H28l-12 10V44H8z" /><path d="M18 24h28M18 32h18" /></>),
  // tecnologia e aulas
  cerebro: (<><path d="M32 12c-4-6-16-4-16 6-6 2-8 10-3 14-4 6 0 14 8 14 2 6 9 8 11 2z" /><path d="M32 12c4-6 16-4 16 6 6 2 8 10 3 14 4 6 0 14-8 14-2 6-9 8-11 2z" /><path d="M32 12v36" /></>),
  chip: (<><rect x="18" y="18" width="28" height="28" rx="3" /><rect x="26" y="26" width="12" height="12" /><path d="M24 10v8M32 10v8M40 10v8M24 46v8M32 46v8M40 46v8M10 24h8M10 32h8M10 40h8M46 24h8M46 32h8M46 40h8" /></>),
  robo: (<><rect x="14" y="22" width="36" height="28" rx="6" /><circle cx="25" cy="35" r="3" /><circle cx="39" cy="35" r="3" /><path d="M26 44h12M32 22v-8M8 32v8M56 32v8" /><circle cx="32" cy="10" r="3" /></>),
  chat: (<><path d="M8 14h36v24H22l-10 8v-8H8z" /><path d="M48 24h8v22h-4v6l-8-6H30v-4" /></>),
  lupa: (<><circle cx="27" cy="27" r="16" /><path d="M39 39l15 15" /></>),
  engrenagem: (<><circle cx="32" cy="32" r="9" /><circle cx="32" cy="32" r="18" /><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7" /></>),
  raio: (<path d="M36 4 14 36h16l-4 24 24-34H34z" />),
  nuvem: (<path d="M18 48h28a12 12 0 0 0 0-24 16 16 0 0 0-30 4 10 10 0 0 0 2 20z" />),
  livro: (<><path d="M8 12h18a6 6 0 0 1 6 6v36a5 5 0 0 0-5-5H8z" /><path d="M56 12H38a6 6 0 0 0-6 6v36a5 5 0 0 1 5-5h19z" /></>),
  codigo: (<path d="M22 18 8 32l14 14M42 18l14 14-14 14M36 12 28 52" />),
  grafico: (<><path d="M8 8v48h48" /><path d="M16 44l12-14 10 8 16-20" /><path d="M46 18h8v8" /></>),
  cadeado: (<><rect x="14" y="28" width="36" height="28" rx="4" /><path d="M22 28v-8a10 10 0 0 1 20 0v8M32 38v8" /></>),
  pessoa: (<><circle cx="32" cy="20" r="10" /><path d="M12 56c0-12 9-20 20-20s20 8 20 20" /></>),
  lampada: (<><path d="M24 44c0-6-8-10-8-20a16 16 0 0 1 32 0c0 10-8 14-8 20z" /><path d="M24 50h16M27 56h10" /></>),
  pasta: (<path d="M6 16h18l6 6h28v30H6z" />),
  globo: (<><circle cx="32" cy="32" r="24" /><path d="M8 32h48M32 8c-8 8-8 40 0 48M32 8c8 8 8 40 0 48" /></>),
  imagem: (<><rect x="8" y="12" width="48" height="40" rx="4" /><circle cx="22" cy="24" r="4" /><path d="M8 44l14-12 10 8 8-6 16 12" /></>),
  video: (<><rect x="6" y="16" width="38" height="32" rx="4" /><path d="M44 28l14-8v24l-14-8" /></>),
  microfone: (<><rect x="24" y="6" width="16" height="30" rx="8" /><path d="M16 30a16 16 0 0 0 32 0M32 46v10M24 56h16" /></>),
  chave: (<><circle cx="20" cy="32" r="10" /><path d="M30 32h26M48 32v8M54 32v6" /></>),
  escudo: (<><path d="M32 6 10 14v16c0 14 10 22 22 28 12-6 22-14 22-28V14z" /><path d="M22 32l7 7 13-14" /></>),
  camadas: (<><path d="M32 8 6 22l26 14 26-14z" /><path d="M6 32l26 14 26-14M6 42l26 14 26-14" /></>),
  terminal: (<><rect x="6" y="10" width="52" height="44" rx="4" /><path d="M16 24l8 8-8 8M30 40h14" /></>),
  plug: (<path d="M24 6v12M40 6v12M16 18h32v10a16 16 0 0 1-32 0zM32 44v14" />),
  calendario: (<><rect x="8" y="12" width="48" height="44" rx="4" /><path d="M8 24h48M20 6v12M44 6v12M18 34h6M30 34h6M42 34h6M18 44h6M30 44h6" /></>),
  email: (<><rect x="6" y="14" width="52" height="36" rx="4" /><path d="M6 18l26 18 26-18" /></>),
  estrela: (<path d="M32 6l8 17 18 2-13 12 4 18-17-9-17 9 4-18L6 25l18-2z" />),
  ferramenta: (<path d="M40 8a14 14 0 0 0-14 18L8 44l12 12 18-18A14 14 0 0 0 56 24l-8 8-8-2-2-8z" />),
  lista: (<><path d="M24 16h30M24 32h30M24 48h30" /><circle cx="12" cy="16" r="3" /><circle cx="12" cy="32" r="3" /><circle cx="12" cy="48" r="3" /></>),
  play: (<><circle cx="32" cy="32" r="24" /><path d="M26 22l16 10-16 10z" /></>),
  olho: (<><path d="M4 32s10-18 28-18 28 18 28 18-10 18-28 18S4 32 4 32z" /><circle cx="32" cy="32" r="8" /></>),
  moeda: (<><circle cx="32" cy="32" r="22" /><path d="M38 24c-2-3-12-4-12 2s12 4 12 10-10 6-13 2M32 16v6M32 42v6" /></>),
};

export const NOMES_ICONES = Object.keys(P);

// Traço que se desenha (0 → 1): cada forma ganha pathLength 1 e o contorno avança junto
const desenhar = (no: React.ReactNode, p: number): React.ReactNode =>
  React.Children.map(no, (filho) => {
    if (!React.isValidElement(filho)) return filho;
    const el = filho as React.ReactElement<any>;
    if (el.type === React.Fragment) return desenhar(el.props.children, p);
    return React.cloneElement(el, { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p });
  });

export const Icone: React.FC<{ nome: string; tamanho?: number; cor?: string; espessura?: number; progresso?: number }> = ({ nome, tamanho = 64, cor = "#fff", espessura = 4, progresso }) => {
  const forma = P[nome] ?? P.documento;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round">
      {progresso === undefined || progresso >= 1 ? forma : desenhar(forma, Math.max(0, progresso))}
    </svg>
  );
};
