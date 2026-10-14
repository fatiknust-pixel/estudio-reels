import React, { useRef, useState } from "react";
import { calcularTrechos, FPS } from "../../src/linhaTempo";
import { Corte, novoId, Palavra } from "../../src/tipos";
import { CampoTempo, Deslizar, fmtTempo } from "../ui";
import { useEditor, useFrame } from "./contexto";

// Cortes automáticos das pausas entre palavras (mantém uma margem para não “comer” sílabas)
export const cortesDePausas = (palavras: Palavra[], duracao: number, limite: number, margem = 0.12): Corte[] => {
  const ws = palavras.filter((w) => w.p.trim()).sort((a, b) => a.i - b.i);
  const cortes: Corte[] = [];
  if (!ws.length) return cortes;
  if (ws[0].i - margem > 0.2) cortes.push({ id: novoId("c"), i: 0, f: ws[0].i - margem, motivo: "início" });
  for (let k = 1; k < ws.length; k++) {
    const vao = ws[k].i - ws[k - 1].f;
    if (vao > limite) cortes.push({ id: novoId("c"), i: ws[k - 1].f + margem, f: ws[k].i - margem, motivo: "pausa" });
  }
  const ult = ws[ws.length - 1].f + margem * 2;
  if (duracao - ult > 0.3) cortes.push({ id: novoId("c"), i: ult, f: duracao, motivo: "fim" });
  return cortes;
};

export const PainelCortes: React.FC = () => {
  const { projeto: p, alterar, irPara, tempoAgora } = useEditor();
  const f = useFrame();
  const [marca, setMarca] = useState<number | null>(null);
  const [limite, setLimite] = useState(0.5);
  const barra = useRef<HTMLDivElement>(null);
  const dur = p.video?.duracao ?? 0;
  const cortes = [...(p.cortes ?? [])].sort((a, b) => a.i - b.i);
  const final = calcularTrechos(dur, p.cortes).reduce((s, t) => s + t.fim - t.ini, 0);
  const pct = (t: number) => `${(t / Math.max(0.001, dur)) * 100}%`;
  const agora = f / FPS; // nesta aba a prévia mostra o original sem cortes

  const tocarBarra = (e: React.PointerEvent) => {
    const r = barra.current!.getBoundingClientRect();
    irPara(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
  };

  return (
    <div>
      <p className="pequeno suave" style={{ marginTop: 0 }}>
        Nesta aba a prévia mostra o <b>vídeo original</b>; o que fica vermelho será cortado. Em outras abas você vê o resultado final.
      </p>
      <div className="cartao">
        <div className="linha pequeno"><span className="cresce">Original {fmtTempo(dur)}</span><b>Final {fmtTempo(final)}</b><span className="suave">(−{fmtTempo(dur - final)})</span></div>
        <div className="linha-tempo" ref={barra} onPointerDown={tocarBarra} onPointerMove={(e) => e.buttons && tocarBarra(e)} role="slider" aria-label="Linha do tempo" aria-valuenow={Math.round(agora)}>
          {(p.palavras ?? []).map((w, k) => <div key={k} className="fala" style={{ left: pct(w.i), width: pct(Math.max(0.03, w.f - w.i)) }} />)}
          {cortes.map((c) => <div key={c.id} className="corte" style={{ left: pct(c.i), width: pct(c.f - c.i) }} />)}
          {marca !== null && <div className="marca" style={{ left: pct(marca) }} />}
          <div className="cabeca" style={{ left: pct(agora) }} />
        </div>
        <div className="linha">
          {marca === null ? (
            <button className="btn cresce" onClick={() => setMarca(tempoAgora())}>⟦ Marcar início do corte</button>
          ) : (
            <>
              <button className="btn prim cresce" onClick={() => {
                const t = tempoAgora();
                alterar((x) => { (x.cortes ??= []).push({ id: novoId("c"), i: Math.min(marca, t), f: Math.max(marca, t), motivo: "manual" }); });
                setMarca(null);
              }}>✂️ Cortar até aqui ⟧</button>
              <button className="btn" onClick={() => setMarca(null)}>Cancelar</button>
            </>
          )}
        </div>
      </div>

      <div className="cartao">
        <b>⚡ Cortes automáticos</b>
        <p className="pequeno suave">Tira silêncios entre frases (e antes/depois da fala) usando a transcrição.</p>
        <Deslizar rotulo="Cortar pausas maiores que" valor={limite} min={0.25} max={1.5} passo={0.05} mudar={setLimite} fmt={(v) => `${v.toFixed(2)}s`} />
        <div className="linha">
          <button className="btn prim cresce" disabled={!p.palavras?.length} onClick={() =>
            alterar((x) => {
              const manter = (x.cortes ?? []).filter((c) => !["pausa", "início", "fim"].includes(c.motivo ?? ""));
              x.cortes = [...manter, ...cortesDePausas(x.palavras ?? [], dur, limite)];
            })
          }>Cortar pausas</button>
          <button className="btn perigo" disabled={!cortes.length} onClick={() => confirm("Remover todos os cortes?") && alterar((x) => { x.cortes = []; })}>Limpar</button>
        </div>
      </div>

      <h3>Cortes ({cortes.length})</h3>
      {!cortes.length && <div className="vazio-lista">Nenhum corte. Use os botões acima ou, na aba 💬 Legendas, toque numa palavra → “Cortar esta palavra”.</div>}
      {cortes.map((c) => (
        <div className="elem" key={c.id}>
          <div className="linha">
            <b className="cresce">{fmtTempo(c.i)} → {fmtTempo(c.f)} <span className="pequeno suave">({(c.f - c.i).toFixed(1)}s{c.motivo ? ` · ${c.motivo}` : ""})</span></b>
            <button className="btn mini" onClick={() => irPara(Math.max(0, c.i - 1), true)}>▶</button>
            <button className="btn mini perigo" onClick={() => alterar((x) => { x.cortes = (x.cortes ?? []).filter((y) => y.id !== c.id); })}>🗑</button>
          </div>
          <div className="linha" style={{ marginTop: 6, flexWrap: "wrap" }}>
            <CampoTempo rotulo="de" valor={c.i} passo={0.05} agora={tempoAgora} mudar={(v) => alterar((x) => { x.cortes!.find((y) => y.id === c.id)!.i = v; })} />
            <CampoTempo rotulo="até" valor={c.f} passo={0.05} agora={tempoAgora} mudar={(v) => alterar((x) => { x.cortes!.find((y) => y.id === c.id)!.f = v; })} />
          </div>
        </div>
      ))}
    </div>
  );
};
