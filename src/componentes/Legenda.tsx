import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useQuadro, useVideo } from "../contexto";
import { familiaDe } from "../fontes";
import { PalavraTempo } from "../linhaTempo";

// Texto escuro sobre cores claras (amarelo, branco…)
const corClara = (hex: string) => {
  const m = hex.replace("#", "").match(/^(..)(..)(..)/);
  if (!m) return false;
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
};

// Agrupa palavras em "telas" de N palavras, quebrando também nas pausas da fala e na troca de cena.
export const agrupar = (palavras: PalavraTempo[], n: number) => {
  const telas: PalavraTempo[][] = [];
  let atual: PalavraTempo[] = [];
  palavras.forEach((w, i) => {
    const anterior = palavras[i - 1];
    if (atual.length >= n || (anterior && (w.ini - anterior.fim > 7 || w.cena !== anterior.cena))) {
      telas.push(atual);
      atual = [];
    }
    atual.push(w);
  });
  if (atual.length) telas.push(atual);
  return telas;
};

// Legenda palavra por palavra: cada palavra surge quando é falada e a palavra atual fica destacada.
export const Legenda: React.FC = () => {
  const f = useCurrentFrame();
  const { linha, projeto } = useVideo();
  const q = useQuadro();
  const L = projeto.legenda;
  const telas = useMemo(() => agrupar(linha.palavras, Math.max(1, L.palavrasPorTela)), [linha, L.palavrasPorTela]);
  if (!L.mostrar) return null;
  const idx = telas.findIndex((t, i) => f >= t[0].ini && f < (telas[i + 1]?.[0].ini ?? t[t.length - 1].fim + 12));
  const tela = telas[idx];
  if (!tela || f > tela[tela.length - 1].fim + 12) return null;

  const { familia, peso } = familiaDe(L.fonte);
  const maior = Math.max(...tela.map((w) => w.p.length));
  // palavra muito longa: diminui a fonte para caber na largura segura (no 16:9, a coluna da esquerda)
  const largura = Math.min(960, q.texto - 100);
  const tamanho = Math.min(L.tamanho, largura / Math.max(1, maior * 0.62));
  const centro = (L.posicao / 100) * q.altura;

  return (
    <AbsoluteFill style={{ top: centro - 200, bottom: "auto", height: 400, ...(q.horizontal ? { right: "auto", width: q.texto } : {}), alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: `0 ${Math.round(tamanho * 0.32)}px`, maxWidth: largura,
          ...(L.fundo === "caixa" ? { background: "rgba(0,0,0,.72)", padding: "18px 34px", borderRadius: 28 } : {}),
        }}
      >
        {tela.map((w, i) => {
          if (f < w.ini) return null;
          const ativa = f >= w.ini && (f < w.fim + 2 || i === tela.length - 1 || f < tela[i + 1].ini);
          const k = Math.min(1, (f - w.ini) / 4);
          const pop = L.animacao === "pop" ? (ativa ? 1.04 + (1 - k) * 0.18 : 1) : 1;
          const sobe = L.animacao === "nenhuma" ? 0 : (1 - k) * 22;
          const destaque = w.destaque;
          const cor = destaque || (ativa && L.fundo !== "palavra") ? L.corDestaque : L.cor;
          const caixaPalavra = L.fundo === "palavra" && ativa;
          return (
            <span
              key={i}
              style={{
                fontFamily: familia,
                fontWeight: peso,
                fontSize: tamanho * (destaque ? 1.14 : 1),
                lineHeight: 1.15,
                textTransform: L.maiusculas ? "uppercase" : "none",
                color: caixaPalavra ? (corClara(L.corDestaque) ? "#111" : "#fff") : cor,
                transform: `scale(${pop}) translateY(${sobe}px) rotate(${destaque && ativa ? -2 : 0}deg)`,
                display: "inline-block",
                WebkitTextStroke: L.contorno && !caixaPalavra ? `${L.contorno}px #000` : undefined,
                paintOrder: "stroke fill",
                textShadow: "0 8px 22px rgba(0,0,0,0.8)",
                ...(caixaPalavra ? { background: L.corDestaque, borderRadius: 18, padding: "0 14px", margin: "0 6px" } : {}),
              }}
            >
              {w.p}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
