import React, { createContext, useContext, useMemo } from "react";
import { arquivoProjeto } from "./arquivos";
import { LinhaTempo, montarLinha, Quadro, quadroDe } from "./linhaTempo";
import { Tema, temaDe, TEMAS } from "./temas";
import { Projeto } from "./tipos";

export type VideoCtx = {
  projeto: Projeto;
  linha: LinhaTempo;
  quadro: Quadro;
  tema: Tema;
  arquivo: (p?: string) => string | null;
  imagem: (chave?: string) => string | null;
  imagemBorrada: (chave?: string) => string | null;
  creditoImagem: (chave?: string) => string | null;
  todosCreditos: () => string[];
};

const Ctx = createContext<VideoCtx | null>(null);

export const ProvedorVideo: React.FC<{ projeto: Projeto; arquivos?: Record<string, string>; children: React.ReactNode }> = ({ projeto, arquivos, children }) => {
  const valor = useMemo<VideoCtx>(() => {
    const imgs = projeto.imagens ?? {};
    const arquivo = (p?: string) => arquivoProjeto(projeto.id, p, arquivos);
    return {
      projeto,
      linha: montarLinha(projeto),
      quadro: quadroDe(projeto),
      tema: projeto.visual === "aula" ? TEMAS.aula : temaDe(projeto.tema),
      arquivo,
      imagem: (chave) => (chave && imgs[chave] ? arquivo(imgs[chave].arquivo) : null),
      imagemBorrada: (chave) => (chave && imgs[chave]?.borrada ? arquivo(imgs[chave].borrada) : null),
      creditoImagem: (chave) => {
        const i = chave ? imgs[chave] : undefined;
        if (!i || !i.autor) return null;
        return `${i.rotulo ?? chave} · Foto: ${i.autor} (${i.licenca}) via Wikimedia Commons`;
      },
      todosCreditos: () => Object.values(imgs).filter((i) => i.autor).map((i) => `${i.rotulo}: ${i.autor} — ${i.licenca}`),
    };
  }, [projeto, arquivos]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
};

export const useVideo = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVideo fora do ProvedorVideo");
  return v;
};

export const useCor = (): Tema => useVideo().tema;
export const useQuadro = (): Quadro => useVideo().quadro;

// "amarelo", "vermelho"... → cor do tema atual (ou uma cor CSS direta)
export const corDe = (t: Tema, nome?: string) => (nome && ((t as any)[nome] || (nome.startsWith("#") ? nome : null))) || t.amarelo;
