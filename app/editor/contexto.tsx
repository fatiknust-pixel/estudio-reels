import { PlayerRef } from "@remotion/player";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LinhaTempo } from "../../src/linhaTempo";
import { Projeto } from "../../src/tipos";

export type EditorCtx = {
  projeto: Projeto;
  // altera uma cópia do projeto; "chave" junta alterações seguidas (ex.: arrastar um controle) num passo só do desfazer
  alterar: (f: (p: Projeto) => void, chave?: string) => void;
  linha: LinhaTempo; // linha do tempo que está na prévia
  player: React.RefObject<PlayerRef>;
  tempoAgora: () => number; // tempo do conteúdo (s) onde a prévia está
  irPara: (t: number, tocar?: boolean) => void; // vai para um tempo do conteúdo (s)
  irParaFrame: (f: number) => void;
  arquivos?: Record<string, string>;
  urlArquivo: (caminho?: string) => string | null;
  definirArquivo: (caminho: string, b: Blob) => Promise<void>; // arquivo novo (ex.: foto sua), sobe ao salvar
  ehDemo: boolean;
  atualizarIA: () => Promise<void>; // Modo 1: gera voz das cenas editadas e baixa imagens pedidas
};

const Ctx = createContext<EditorCtx | null>(null);
export const ProvedorEditor = Ctx.Provider;
export const useEditor = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("fora do editor");
  return c;
};

// Frame atual da prévia (só os componentes que usam isto re-desenham durante o play)
export const useFrame = () => {
  const { player } = useEditor();
  const [f, setF] = useState(0);
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    setF(p.getCurrentFrame());
    const h = (e: any) => setF(e.detail.frame);
    p.addEventListener("frameupdate", h);
    p.addEventListener("seeked", h);
    return () => {
      p.removeEventListener("frameupdate", h);
      p.removeEventListener("seeked", h);
    };
  }, [player.current]);
  return f;
};

export const useTocando = () => {
  const { player } = useEditor();
  const [t, setT] = useState(false);
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const on = () => setT(true);
    const off = () => setT(false);
    p.addEventListener("play", on);
    p.addEventListener("pause", off);
    p.addEventListener("ended", off);
    return () => {
      p.removeEventListener("play", on);
      p.removeEventListener("pause", off);
      p.removeEventListener("ended", off);
    };
  }, [player.current]);
  return t;
};
