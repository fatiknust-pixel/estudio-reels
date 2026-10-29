import React from "react";
import { sortearCorrida } from "../../src/corrida/simular";
import { Alternar, Deslizar } from "../ui";
import { useEditor } from "./contexto";

// Modo "corrida": sortear outra corrida, textos da tela, @ do canal e duração
export const PainelCorrida: React.FC = () => {
  const { projeto: p, alterar } = useEditor();
  const c = p.corrida;
  if (!c) return null;
  const mudar = (f: (c: NonNullable<typeof p.corrida>) => void, chave?: string) => alterar((x) => f(x.corrida!), chave);
  return (
    <div>
      <div className="cartao">
        <b>🎲 Sortear outra corrida</b>
        <p className="pequeno suave">Novas regras, cores e paredes. O app escolhe, entre vários sorteios, o que tem mais viradas na liderança.</p>
        <button className="btn prim largo" onClick={() => alterar((x) => { x.corrida = { ...sortearCorrida(undefined, c.canal, c.duracao), musica: c.musica }; })}>🎲 Sortear de novo</button>
      </div>
      <label className="campo"><span>Título</span><input value={c.titulo} onChange={(e) => mudar((k) => { k.titulo = e.target.value; }, "corrida.titulo")} /></label>
      <label className="campo"><span>Subtítulo</span><input value={c.subtitulo} onChange={(e) => mudar((k) => { k.subtitulo = e.target.value; }, "corrida.subtitulo")} /></label>
      <label className="campo">
        <span>@ do canal (balão "Leave a follow!")</span>
        <input value={c.canal} onChange={(e) => { const v = e.target.value; try { localStorage.setItem("corrida.canal", v); } catch {} mudar((k) => { k.canal = v; }, "corrida.canal"); }} />
      </label>
      {c.pistas.map((pi, i) => (
        <div key={i} className="cartao">
          <label className="campo"><span style={{ color: pi.cor }}>Pista {i + 1}</span><input value={pi.nome} onChange={(e) => mudar((k) => { k.pistas[i].nome = e.target.value; }, `corrida.nome${i}`)} /></label>
          <label className="campo"><span>Descrição</span><input value={pi.desc} onChange={(e) => mudar((k) => { k.pistas[i].desc = e.target.value; }, `corrida.desc${i}`)} /></label>
        </div>
      ))}
      <Deslizar rotulo="Duração" valor={c.duracao} min={20} max={90} passo={5} fmt={(v) => `${v} s`} mudar={(v) => mudar((k) => { k.duracao = v; }, "corrida.duracao")} />
      <Alternar rotulo="Música de fundo" valor={c.musica !== false} mudar={(v) => mudar((k) => { k.musica = v; })} />
    </div>
  );
};
