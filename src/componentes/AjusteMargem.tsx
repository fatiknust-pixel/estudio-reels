import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";

// Margem de referência para tudo que aparece escrito na tela (fora a legenda): o conteúdo mede sua largura natural
// (texto, moldura, borda) e, se passar da largura do espaço onde está, é reduzido na mesma proporção — nunca fica
// maior que a margem. Com "altura", vale também para a altura do espaço. Não mexe em nada que já cabe.
// A medida usa offsetWidth/offsetHeight (tamanho de layout, sem as animações de escala e rotação).
// Margem lateral da tela (px): o texto escrito na tela nunca passa dela
export const MARGEM_TELA = 50;

// "cheio": o conteúdo usa a largura toda do espaço (width: 100%, como nas vagas da videoaula); aí a medida é do que
// passa para fora do primeiro elemento. Sem "cheio", o conteúdo tem a largura do próprio texto.
export const AjusteMargem: React.FC<{ children: React.ReactNode; origem?: string; altura?: boolean; cheio?: boolean; extra?: number; onAltura?: (h: number) => void; style?: React.CSSProperties }> = ({ children, origem = "50% 0%", altura, cheio, extra = 1, onAltura, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  const medir = useCallback(() => {
    const el = ref.current;
    const pai = el?.parentElement;
    if (!el || !pai) return;
    const alvo = cheio && el.firstElementChild instanceof HTMLElement ? el.firstElementChild : el;
    const w = cheio ? Math.max(alvo.offsetWidth, alvo.scrollWidth) : el.offsetWidth;
    const h = cheio ? Math.max(alvo.offsetHeight, alvo.scrollHeight) : el.offsetHeight;
    const kw = w > 0 && pai.clientWidth > 0 ? pai.clientWidth / w : 1;
    const kh = altura && h > 0 && pai.clientHeight > 0 ? pai.clientHeight / h : 1;
    const novo = Math.min(1, kw, kh);
    setK((a) => (Math.abs(a - novo) < 0.002 ? a : novo));
    onAltura?.(h * novo); // altura que o conteúdo ocupa de verdade, já reduzido
  }, [cheio, altura, onAltura]);
  useLayoutEffect(medir);
  // As fontes carregam depois da primeira medida (a fonte provisória é mais estreita): mede de novo quando
  // elas chegam e segura o quadro do render até a medida certa estar na tela.
  const [espera] = useState(() => delayRender("AjusteMargem"));
  useEffect(() => {
    let vivo = true;
    const liberar = () => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(espera)));
    const fontes = (document as any).fonts;
    if (fontes?.ready) {
      fontes.ready.then(() => {
        if (!vivo) return;
        medir();
        liberar();
      });
    } else liberar();
    return () => {
      vivo = false;
      continueRender(espera);
    };
  }, [espera, medir]);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", ...(cheio ? { width: "100%" } : {}), transform: k * extra < 1 ? `scale(${k * extra})` : undefined, transformOrigin: origem, ...style }}>
      {children}
    </div>
  );
};
