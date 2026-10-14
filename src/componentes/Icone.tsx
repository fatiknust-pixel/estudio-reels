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
};

export const Icone: React.FC<{ nome: string; tamanho?: number; cor?: string; espessura?: number }> = ({ nome, tamanho = 64, cor = "#fff", espessura = 4 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round">
    {P[nome] ?? P.documento}
  </svg>
);
