import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { ImagemInfo } from "./tipos";

// Enquadramento das fotos (medidas por scripts/enquadrar.py: largura, altura e foco = onde está o assunto).
// - "cobrir": a foto preenche a caixa e o corte é escolhido para deixar o foco dentro (rosto no terço de cima).
// - "caber": a foto não combina com a caixa (cortaria demais): aparece inteira, sobre ela mesma desfocada.
// Sem medidas (vídeos antigos), cobre como antes: pelo terço de cima.
export type Enquadre = { modo: "cobrir" | "caber"; pos: string; origem: string };

const trava = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const enquadrarFoto = (info: ImagemInfo | undefined, W: number, H: number, opcoes: { redonda?: boolean } = {}): Enquadre => {
  if (!info?.largura || !info?.altura) return { modo: "cobrir", pos: "50% 28%", origem: "50% 28%" };
  const rosto = (info.rostos ?? 0) > 0;
  const fx = (info.foco?.x ?? 50) / 100;
  const fy = (info.foco?.y ?? (rosto ? 35 : 45)) / 100;
  const ri = info.largura / info.altura;
  const rb = W / H;
  const visivel = Math.min(ri / rb, rb / ri); // fração da foto que sobra na caixa quando ela é coberta
  // rosto no foco aguenta corte maior; foto sem rosto perde detalhe do assunto mais cedo
  if (!opcoes.redonda && visivel < (rosto ? 0.5 : 0.68)) return { modo: "caber", pos: "50% 50%", origem: "50% 50%" };
  const s = Math.max(W / info.largura, H / info.altura);
  const sw = info.largura * s;
  const sh = info.altura * s;
  const ex = sw - W;
  const ey = sh - H;
  const alvoY = rosto ? 0.4 : 0.5; // onde o foco fica na caixa (de cima para baixo)
  const tx = ex > 0 ? trava(fx * sw - W * 0.5, 0, ex) : 0;
  const ty = ey > 0 ? trava(fy * sh - H * alvoY, 0, ey) : 0;
  const px = ex > 0 ? (tx / ex) * 100 : 50;
  const py = ey > 0 ? (ty / ey) * 100 : 50;
  // o zoom lento sai do foco, para o rosto não escapar do quadro
  const ox = trava(((fx * sw - tx) / W) * 100, 15, 85);
  const oy = trava(((fy * sh - ty) / H) * 100, 15, 85);
  return { modo: "cobrir", pos: `${px.toFixed(1)}% ${py.toFixed(1)}%`, origem: `${ox.toFixed(1)}% ${oy.toFixed(1)}%` };
};

// Movimento lento de câmera (efeito Ken Burns) de cada foto: t vai de 0 a 1 durante o tempo em que a foto está na tela.
// Os tipos se alternam de foto em foto: aproximar, arrastar para um lado, afastar, arrastar para o outro, aproximar na diagonal.
// A amplitude é pequena (≈ 10% de zoom, ≈ 3% de arrasto) e o zoom nunca fica abaixo do necessário para as bordas da foto não aparecerem.
export type Movimento = { zoom: number; tx: number; ty: number }; // tx/ty em % da caixa
export const movimentoFoto = (n: number, t: number): Movimento => {
  const e = t * t * (3 - 2 * t); // começa e termina devagar
  switch (((n % 5) + 5) % 5) {
    case 0: return { zoom: 1.02 + 0.1 * e, tx: 0, ty: 0 }; // aproxima
    case 1: return { zoom: 1.08, tx: -3 + 6 * e, ty: 0 }; // arrasta da esquerda para a direita
    case 2: return { zoom: 1.12 - 0.1 * e, tx: 0, ty: 0 }; // afasta
    case 3: return { zoom: 1.08, tx: 3 - 6 * e, ty: 0 }; // arrasta da direita para a esquerda
    default: return { zoom: 1.03 + 0.09 * e, tx: -1.5 + 3 * e, ty: 1.5 - 3 * e }; // aproxima na diagonal
  }
};

// Foto numa caixa W×H (px). "zoom" = escala atual (1 = sem zoom). Posicione/anime a caixa por fora.
export const FotoEnquadrada: React.FC<{ src: string; fundo?: string | null; info?: ImagemInfo; w: number; h: number; zoom?: number; tx?: number; ty?: number; style?: React.CSSProperties; redonda?: boolean }> = ({ src, fundo, info, w, h, zoom = 1, tx = 0, ty = 0, style, redonda }) => {
  const e = enquadrarFoto(info, w, h, { redonda });
  if (e.modo === "cobrir") {
    return <Img src={src} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: e.pos, transformOrigin: e.origem, transform: `translate(${tx}%, ${ty}%) scale(${zoom})`, ...style }} />;
  }
  // Foto inteira sobre um fundo da própria foto. O fundo vem pronto (miniatura já desfocada e escurecida por
  // enquadrar.py): blur em CSS numa camada que anima (zoom da câmera, fusão) derruba o Safari do iPhone.
  // Sem a miniatura (vídeos antigos), usa a foto cobrindo, só escurecida.
  const { filter: _filtro, ...resto } = style ?? {};
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0c0c0e", ...resto }}>
      {fundo ? (
        <Img src={fundo} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Img src={src} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
      )}
      <Img src={src} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "contain", transform: `translate(${tx * 0.5}%, ${ty * 0.5}%) scale(${1 + (zoom - 1) * 0.5})` }} />
    </AbsoluteFill>
  );
};
