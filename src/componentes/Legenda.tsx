import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useQuadro, useVideo } from "../contexto";
import { FONTES, familiaDe } from "../fontes";
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
const LegendaReels: React.FC = () => {
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

// Agrupa palavras em frases curtas (até `maxCaracteres`), quebrando nas pausas e na troca de cena.
const agruparFrases = (palavras: PalavraTempo[], maxCaracteres: number) => {
  const blocos: PalavraTempo[][] = [];
  let atual: PalavraTempo[] = [];
  let tam = 0;
  palavras.forEach((w, i) => {
    const anterior = palavras[i - 1];
    if (atual.length && (tam + w.p.length + 1 > maxCaracteres || (anterior && (w.ini - anterior.fim > 9 || w.cena !== anterior.cena)))) {
      blocos.push(atual);
      atual = [];
      tam = 0;
    }
    atual.push(w);
    tam += w.p.length + 1;
  });
  if (atual.length) blocos.push(atual);
  return blocos;
};

// Legenda de filmes e séries: a frase inteira aparece embaixo (até 2 linhas) e some quando termina de ser falada.
const LegendaCinema: React.FC = () => {
  const f = useCurrentFrame();
  const { linha, projeto } = useVideo();
  const q = useQuadro();
  const L = projeto.legenda;
  const largura = Math.min(q.largura - 140, 1500);
  const maxCaracteres = Math.max(16, Math.floor((largura / (L.tamanho * 0.55)) * 1.8));
  const blocos = useMemo(() => agruparFrases(linha.palavras, maxCaracteres), [linha, maxCaracteres]);
  if (!L.mostrar) return null;
  const idx = blocos.findIndex((t, i) => f >= t[0].ini && f < (blocos[i + 1]?.[0].ini ?? Infinity));
  const bloco = blocos[idx];
  if (!bloco || f > bloco[bloco.length - 1].fim + 8) return null;

  const { familia } = familiaDe(L.fonte);
  const pesos = (FONTES[L.fonte] ?? FONTES.montserrat).arquivos.map(([p]) => Number(p));
  const peso = Math.min(...pesos); // o corte mais fino disponível: letra de legenda é leve
  const aparece = Math.min(1, (f - bloco[0].ini + 1) / 4);
  const texto = bloco.map((w) => w.p).join(" ");
  const sombra = "0 0 4px #000, 0 2px 6px #000, 0 0 14px rgba(0,0,0,.85)";
  return (
    <AbsoluteFill style={{ top: "auto", height: 320, bottom: q.altura - (L.posicao / 100) * q.altura, alignItems: "center", justifyContent: "flex-end", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: largura, textAlign: "center", fontFamily: familia, fontWeight: peso, fontSize: L.tamanho, lineHeight: 1.25, color: L.cor, opacity: aparece,
          textTransform: L.maiusculas ? "uppercase" : "none", textShadow: sombra,
          WebkitTextStroke: L.contorno ? `${L.contorno}px #000` : undefined, paintOrder: "stroke fill",
          ...(L.fundo === "caixa" ? { background: "rgba(0,0,0,.62)", padding: "6px 24px", borderRadius: 8 } : {}),
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

export const Legenda: React.FC = () => {
  const { projeto } = useVideo();
  return projeto.legenda.modo === "cinema" ? <LegendaCinema /> : <LegendaReels />;
};
