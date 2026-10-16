import React, { useState } from "react";
import { SONS } from "../../src/componentes/Efeitos";
import { novoId } from "../../src/tipos";
import { Alternar, CampoTempo, Deslizar, Escolha, fmtTempo } from "../ui";
import { useEditor } from "./contexto";

const EMOJIS = ["😱", "🤯", "😂", "🤔", "🔥", "💥", "✅", "❌", "⚠️", "💰", "📈", "📉", "👀", "👇", "👉", "❤️", "💡", "🚀", "🎯", "⏰", "🧠", "😮", "🙌", "💯"];

const Bloco: React.FC<{ titulo: string; acao?: React.ReactNode; children: React.ReactNode }> = ({ titulo, acao, children }) => (
  <div className="cartao">
    <div className="linha" style={{ marginBottom: 6 }}>
      <b className="cresce">{titulo}</b>
      {acao}
    </div>
    {children}
  </div>
);

export const PainelEfeitos: React.FC = () => {
  const { projeto: p, alterar, tempoAgora, irPara } = useEditor();
  const ef = p.efeitos;
  const [emoji, setEmoji] = useState("🔥");
  const set = (f: (e: typeof ef) => void, chave?: string) => alterar((x) => f(x.efeitos), chave);
  const bruto = p.modo === "bruto";

  return (
    <div>
      <div className="cartao">
        <Alternar rotulo="Barra de progresso no topo" valor={ef.barraProgresso} mudar={(v) => set((e) => { e.barraProgresso = v; })} />
        <Alternar rotulo="Trilha de fundo" valor={ef.trilha} mudar={(v) => set((e) => { e.trilha = v; })} />
        {ef.trilha && <Deslizar rotulo="Volume da trilha" valor={Math.round(ef.volumeTrilha * 100)} min={0} max={40} mudar={(v) => set((e) => { e.volumeTrilha = v / 100; }, "trilha")} fmt={(v) => `${v}%`} />}
        {bruto && ef.trilha && <Alternar rotulo="Trilha abaixa quando alguém fala" valor={ef.abaixarTrilha !== false} mudar={(v) => set((e) => { e.abaixarTrilha = v; })} />}
        <Alternar rotulo="Sons automáticos (zooms, emojis, títulos)" valor={ef.sfxAuto !== false} mudar={(v) => set((e) => { e.sfxAuto = v; })} />
        {!bruto && <Alternar rotulo="Som de transição entre cenas" valor={ef.somTransicao} mudar={(v) => set((e) => { e.somTransicao = v; })} />}
      </div>

      <Bloco titulo="🏷️ Títulos na tela" acao={<button className="btn mini" onClick={() => { const t = tempoAgora(); set((e) => { e.titulos.push({ id: novoId("t"), texto: "TÍTULO", i: t, f: t + 2.5, posicao: 14 }); }); }}>+ no tempo atual</button>}>
        {!ef.titulos.length && <p className="pequeno suave">Faixa de título animada (ex.: “3 ERROS QUE…”).</p>}
        {ef.titulos.map((t, k) => (
          <div className="elem" key={t.id}>
            <div className="linha">
              <input className="cresce" type="text" value={t.texto} onChange={(e) => set((x) => { x.titulos[k].texto = e.target.value; }, `tt${t.id}`)} />
              <button className="btn mini" onClick={() => irPara(t.i, true)}>▶</button>
              <button className="btn mini perigo" onClick={() => set((x) => { x.titulos.splice(k, 1); })}>🗑</button>
            </div>
            <input type="text" style={{ marginTop: 6 }} placeholder="Subtítulo (opcional)" value={t.sub ?? ""} onChange={(e) => set((x) => { x.titulos[k].sub = e.target.value || undefined; }, `ts${t.id}`)} />
            <div className="linha" style={{ marginTop: 6, flexWrap: "wrap" }}>
              <CampoTempo rotulo="de" valor={t.i} mudar={(v) => set((x) => { x.titulos[k].i = v; })} agora={tempoAgora} />
              <CampoTempo rotulo="até" valor={t.f} mudar={(v) => set((x) => { x.titulos[k].f = v; })} agora={tempoAgora} />
            </div>
            <Deslizar rotulo="Altura" valor={t.posicao ?? 14} min={5} max={85} mudar={(v) => set((x) => { x.titulos[k].posicao = v; }, `tp${t.id}`)} fmt={(v) => `${v}%`} />
          </div>
        ))}
      </Bloco>

      <Bloco titulo="😀 Emojis" acao={<button className="btn mini" onClick={() => { const t = tempoAgora(); set((e) => { e.emojis.push({ id: novoId("e"), emoji, i: t, dur: 1.5, x: 75, y: 38 }); }); }}>+ {emoji} no tempo atual</button>}>
        <div className="emojis" style={{ marginBottom: 8 }}>
          {EMOJIS.map((e) => <button key={e} className={e === emoji ? "on" : ""} onClick={() => setEmoji(e)}>{e}</button>)}
        </div>
        {ef.emojis.map((e, k) => (
          <div className="elem" key={e.id}>
            <div className="linha">
              <span style={{ fontSize: 28 }}>{e.emoji}</span>
              <span className="cresce pequeno suave">{fmtTempo(e.i)} · {e.dur.toFixed(1)}s</span>
              <button className="btn mini" onClick={() => set((x) => { x.emojis[k].emoji = emoji; })}>trocar por {emoji}</button>
              <button className="btn mini" onClick={() => irPara(e.i, true)}>▶</button>
              <button className="btn mini perigo" onClick={() => set((x) => { x.emojis.splice(k, 1); })}>🗑</button>
            </div>
            <div className="linha" style={{ marginTop: 6, flexWrap: "wrap" }}>
              <CampoTempo rotulo="em" valor={e.i} mudar={(v) => set((x) => { x.emojis[k].i = v; })} agora={tempoAgora} />
              <CampoTempo rotulo="dura" valor={e.dur} mudar={(v) => set((x) => { x.emojis[k].dur = Math.max(0.3, v); })} />
            </div>
            <div className="grade2">
              <Deslizar rotulo="Horizontal" valor={e.x} min={5} max={95} mudar={(v) => set((x) => { x.emojis[k].x = v; }, `ex${e.id}`)} fmt={(v) => `${v}%`} />
              <Deslizar rotulo="Vertical" valor={e.y} min={5} max={95} mudar={(v) => set((x) => { x.emojis[k].y = v; }, `ey${e.id}`)} fmt={(v) => `${v}%`} />
            </div>
          </div>
        ))}
      </Bloco>

      <Bloco titulo="🔊 Sons" acao={<button className="btn mini" onClick={() => { const t = tempoAgora(); set((e) => { e.sons.push({ id: novoId("s"), som: "pop", i: t }); }); }}>+ no tempo atual</button>}>
        {!ef.sons.length && <p className="pequeno suave">Whoosh, pop, ding… para marcar cortes e destaques.</p>}
        {ef.sons.map((s, k) => (
          <div className="elem" key={s.id}>
            <Escolha opcoes={Object.entries(SONS) as [string, string][]} valor={s.som} mudar={(v) => set((x) => { x.sons[k].som = v; })} />
            <div className="linha" style={{ marginTop: 6 }}>
              <CampoTempo rotulo="em" valor={s.i} mudar={(v) => set((x) => { x.sons[k].i = v; })} agora={tempoAgora} />
              <span className="cresce" />
              <button className="btn mini" onClick={() => irPara(Math.max(0, s.i - 0.5), true)}>▶</button>
              <button className="btn mini perigo" onClick={() => set((x) => { x.sons.splice(k, 1); })}>🗑</button>
            </div>
          </div>
        ))}
      </Bloco>

      {bruto && (
        <Bloco titulo="🔍 Zooms" acao={<button className="btn mini" onClick={() => { const t = tempoAgora(); set((e) => { e.zooms.push({ id: novoId("z"), i: t, f: t + 1.2, escala: 1.25 }); }); }}>+ no tempo atual</button>}>
          {!ef.zooms.length && <p className="pequeno suave">Aproxima o rosto em momentos de ênfase (“punch-in”) ou lentamente (suave).</p>}
          {ef.zooms.map((z, k) => (
            <div className="elem" key={z.id}>
              <div className="linha" style={{ flexWrap: "wrap" }}>
                <CampoTempo rotulo="de" valor={z.i} mudar={(v) => set((x) => { x.zooms[k].i = v; })} agora={tempoAgora} />
                <CampoTempo rotulo="até" valor={z.f} mudar={(v) => set((x) => { x.zooms[k].f = v; })} agora={tempoAgora} />
              </div>
              <Deslizar rotulo="Aproximação" valor={Math.round(z.escala * 100)} min={105} max={200} mudar={(v) => set((x) => { x.zooms[k].escala = v / 100; }, `z${z.id}`)} fmt={(v) => `${v}%`} />
              <div className="linha">
                <Alternar rotulo="Lento" valor={!!z.suave} mudar={(v) => set((x) => { x.zooms[k].suave = v; if (v) x.zooms[k].seco = false; })} />
                <Alternar rotulo="Seco" valor={!!z.seco} mudar={(v) => set((x) => { x.zooms[k].seco = v; if (v) x.zooms[k].suave = false; })} />
                <span className="cresce" />
                <button className="btn mini" onClick={() => irPara(Math.max(0, z.i - 0.3), true)}>▶</button>
                <button className="btn mini perigo" onClick={() => set((x) => { x.zooms.splice(k, 1); })}>🗑</button>
              </div>
            </div>
          ))}
        </Bloco>
      )}

      <Bloco titulo="🗳️ Enquete no final" acao={<input type="checkbox" role="switch" aria-label="Enquete no final" style={{ width: 50, height: 28, accentColor: "var(--acc)" }} checked={!!ef.enquete} onChange={(e) => set((x) => { x.enquete = e.target.checked ? { pergunta: "E você, o que acha?", opcoes: ["Concordo", "Discordo"], dur: 3 } : null; })} />}>
        {!ef.enquete ? (
          <p className="pequeno suave">Termina com uma pergunta e opções para o público comentar 1 ou 2 (aumenta comentários).</p>
        ) : (
          <>
            <label className="campo"><span>Pergunta</span><input type="text" value={ef.enquete.pergunta} onChange={(e) => set((x) => { x.enquete!.pergunta = e.target.value; }, "enq-p")} /></label>
            {ef.enquete.opcoes.map((o, k) => (
              <div className="linha" key={k} style={{ marginBottom: 6 }}>
                <b style={{ width: 20 }}>{k + 1}</b>
                <input className="cresce" type="text" value={o} onChange={(e) => set((x) => { x.enquete!.opcoes[k] = e.target.value; }, `enq-${k}`)} />
                {ef.enquete!.opcoes.length > 2 && <button className="btn mini perigo" onClick={() => set((x) => { x.enquete!.opcoes.splice(k, 1); })}>🗑</button>}
              </div>
            ))}
            {ef.enquete.opcoes.length < 4 && <button className="btn mini" onClick={() => set((x) => { x.enquete!.opcoes.push("Outra opção"); })}>+ opção</button>}
            <Deslizar rotulo="Duração" valor={ef.enquete.dur} min={2} max={6} passo={0.5} mudar={(v) => set((x) => { x.enquete!.dur = v; }, "enq-d")} fmt={(v) => `${v}s`} />
          </>
        )}
      </Bloco>
    </div>
  );
};
