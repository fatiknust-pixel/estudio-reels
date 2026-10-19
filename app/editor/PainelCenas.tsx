import React, { useState } from "react";
import { normalizar } from "../../src/linhaTempo";
import { Cena, ElementoCena, NarracaoCena } from "../../src/tipos";
import { useEditor, useFrame } from "./contexto";

// A voz precisa ser refeita quando o texto da cena não bate mais com a narração gerada
export const vozDesatualizada = (c: Cena, n?: NarracaoCena) => {
  if (!n) return true;
  if (n.texto !== undefined) return n.texto.trim() !== c.texto.trim();
  return normalizar(c.texto) !== n.palavras.map((w) => normalizar(w.p)).join("");
};

const MODELOS: Record<string, ElementoCena> = {
  titulo: { tipo: "titulo", texto: "TÍTULO", sub: "", em: 0, posicao: "topo" },
  pergunta: { tipo: "pergunta", texto: "PERGUNTA?", posicao: "alto" },
  carimbo: { tipo: "carimbo", texto: "FALSO", cor: "vermelho", posicao: "alto" },
  tag: { tipo: "tag", texto: "Destaque", icone: "alerta", posicao: "meio" },
  pessoa: { tipo: "pessoa", imagem: "", nome: "Nome", cargo: "Cargo", posicao: "alto" },
  contador: { tipo: "contador", de: 0, ate: 100, unidade: "unidades", rotulo: "", posicao: "alto" },
  definicao: { tipo: "definicao", palavra: "TERMO", significado: "O que significa", posicao: "meio" },
  icones: { tipo: "icones", itens: [["documento", "Antes"], ["seta", ""], ["check", "Depois"]], posicao: "alto" },
  linha: { tipo: "linha", itens: [["2020", "Começo"], ["2024", "Hoje"]], posicao: "meio" },
  placar: { tipo: "placar", sim: 7, nao: 4, rotulo: "Votação", rotuloSim: "Sim", rotuloNao: "Não", posicao: "meio" },
  mapa: { tipo: "mapa", de: "Origem", para: "Destino", legenda: "", posicao: "alto" },
  relogio: { tipo: "relogio", rotulo: "Prazo", antes: "Antes", depois: "Depois", posicao: "alto" },
  check: { tipo: "check", ok: true, texto: "Verdade", nota: "explicação", posicao: "alto" },
  comentario: { tipo: "comentario", texto: "Comenta aqui 👇", posicao: "meio" },
  enquete: { tipo: "enquete", pergunta: "E aí?", opcoes: ["Sim", "Não"], posicao: "alto" },
  seguir: { tipo: "seguir", texto: "SIGA PARA MAIS", posicao: "meio2" },
};
const POSICOES = ["topo", "alto", "alto2", "meio", "meio2"];
const CAMPOS_FIXOS = new Set(["tipo", "posicao", "em"]);

const EditorElemento: React.FC<{ e: ElementoCena; mudar: (f: (e: ElementoCena) => void, chave?: string) => void; remover: () => void; palavras: string[]; imagens: string[] }> = ({ e, mudar, remover, palavras, imagens }) => {
  const [avancado, setAvancado] = useState(false);
  const [json, setJson] = useState("");
  const campos = Object.entries(e).filter(([k]) => !CAMPOS_FIXOS.has(k));
  return (
    <div className="elem">
      <div className="cab">
        <span className="cresce">{e.tipo}</span>
        <select value={e.posicao ?? "alto"} onChange={(ev) => mudar((x) => { x.posicao = ev.target.value; })} style={{ width: 100, minHeight: 34, padding: 4 }} aria-label="Posição">
          {POSICOES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <button className="btn mini" onClick={() => { setJson(JSON.stringify(e, null, 1)); setAvancado(!avancado); }}>{"{ }"}</button>
        <button className="btn mini perigo" onClick={remover}>🗑</button>
      </div>
      <label className="campo" style={{ margin: "8px 0" }}>
        <span className="pequeno">Aparece na palavra</span>
        <select value={String(e.em ?? "")} onChange={(ev) => mudar((x) => { x.em = ev.target.value === "" ? 0 : ev.target.value; })}>
          <option value="">(início da cena)</option>
          {e.em !== undefined && e.em !== 0 && !palavras.includes(String(e.em)) && <option value={String(e.em)}>{String(e.em)}</option>}
          {[...new Set(palavras)].map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </label>
      {!avancado ? (
        campos.map(([k, v]) => {
          if (k === "imagem") {
            return (
              <label className="campo" key={k} style={{ margin: "6px 0" }}><span className="pequeno">{k}</span>
                <select value={v} onChange={(ev) => mudar((x) => { x[k] = ev.target.value; })}>
                  <option value="">(nenhuma)</option>
                  {imagens.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
            );
          }
          if (typeof v === "string" || typeof v === "number") {
            return (
              <label className="campo" key={k} style={{ margin: "6px 0" }}><span className="pequeno">{k}</span>
                <input type={typeof v === "number" ? "number" : "text"} value={v} onChange={(ev) => mudar((x) => { x[k] = typeof v === "number" ? parseFloat(ev.target.value) || 0 : ev.target.value; }, `${e.tipo}-${k}`)} />
              </label>
            );
          }
          if (typeof v === "boolean") {
            return (
              <label className="alternar" key={k}><span className="pequeno">{k}</span><input type="checkbox" checked={v} onChange={(ev) => mudar((x) => { x[k] = ev.target.checked; })} /></label>
            );
          }
          if (Array.isArray(v) && v.every((s) => typeof s === "string")) {
            return (
              <div key={k} style={{ margin: "6px 0" }}>
                <span className="pequeno suave">{k}</span>
                {v.map((s: string, i: number) => (
                  <input key={i} type="text" style={{ marginTop: 4 }} value={s} onChange={(ev) => mudar((x) => { x[k][i] = ev.target.value; }, `${e.tipo}-${k}-${i}`)} />
                ))}
              </div>
            );
          }
          return <p key={k} className="pequeno suave">{k}: edite em {"{ }"}</p>;
        })
      ) : (
        <>
          <textarea value={json} onChange={(ev) => setJson(ev.target.value)} style={{ fontFamily: "monospace", fontSize: 13, minHeight: 160 }} />
          <button className="btn mini" onClick={() => {
            try {
              const novo = JSON.parse(json);
              mudar((x) => { Object.keys(x).forEach((k) => delete x[k]); Object.assign(x, novo); });
              setAvancado(false);
            } catch {
              alert("JSON inválido");
            }
          }}>Aplicar</button>
        </>
      )}
    </div>
  );
};

export const PainelCenas: React.FC = () => {
  const { projeto: p, alterar, linha, irParaFrame, atualizarIA } = useEditor();
  const [pedindo, setPedindo] = useState(false);
  const f = useFrame();
  const [novoTipo, setNovoTipo] = useState("titulo");
  const cenas = p.cenas ?? [];
  const imagens = Object.keys(p.imagens ?? {});
  const atual = linha.cenas.findIndex((c) => f >= c.inicio && f < c.inicio + c.duracao);
  const desatualizadas = cenas.filter((c) => vozDesatualizada(c, p.narracao?.[c.id])).length;
  const mudarCena = (k: number, fn: (c: Cena) => void, chave?: string) => alterar((x) => fn(x.cenas![k]), chave);

  return (
    <div>
      {desatualizadas > 0 && (
        <div className="aviso pequeno">
          🎙️ {desatualizadas} cena(s) com texto diferente da narração (a prévia usa uma estimativa). A voz nova é gerada no GitHub — também acontece sozinha ao exportar.
          {p.status !== "processando" && (
            <button className="btn mini prim" style={{ marginTop: 8, display: "flex" }} disabled={pedindo} onClick={async () => { setPedindo(true); await atualizarIA(); setPedindo(false); }}>
              🎙️ Gerar voz agora
            </button>
          )}
        </div>
      )}
      {cenas.map((c, k) => {
        const n = p.narracao?.[c.id];
        const palavras = (n?.palavras ?? []).map((w) => w.p);
        return (
          <details key={c.id} className={"cena-ed" + (k === atual ? " atual" : "")}>
            <summary>
              <span className="selo">{k + 1}</span>
              <b>{c.texto.slice(0, 60) || c.id}</b>
              {vozDesatualizada(c, n) && <span title="voz desatualizada">🎙️</span>}
              <button className="btn mini" onClick={(e) => { e.preventDefault(); irParaFrame(linha.cenas[k]?.inicio ?? 0); }}>▶</button>
            </summary>
            <div className="corpo">
              <label className="campo"><span>Texto falado (narração e legenda)</span>
                <textarea value={c.texto} onChange={(e) => mudarCena(k, (x) => { x.texto = e.target.value; }, `txt${c.id}`)} />
              </label>
              <label className="campo"><span>Imagem de fundo</span>
                <select value={c.fundo ?? ""} onChange={(e) => mudarCena(k, (x) => { x.fundo = e.target.value || undefined; })}>
                  <option value="">(sem imagem — fundo animado)</option>
                  {imagens.map((i) => <option key={i} value={i}>{p.imagens![i].rotulo ?? i}</option>)}
                </select>
              </label>
              {imagens.length > 1 && (
                <div className="campo">
                  <span className="pequeno suave">Galeria — fotos que se sucedem durante a cena (estilo documentário), na ordem em que você tocar</span>
                  <div className="chips" style={{ marginTop: 6 }}>
                    {imagens.map((i) => {
                      const pos = (c.galeria ?? []).indexOf(i);
                      return (
                        <button key={i} className={"chip" + (pos >= 0 ? " on" : "")} style={{ fontWeight: 500 }}
                          onClick={() => mudarCena(k, (x) => {
                            const g = x.galeria ?? [];
                            x.galeria = pos >= 0 ? g.filter((y) => y !== i) : [...g, i];
                            if (!x.galeria.length) x.galeria = undefined;
                          })}>
                          {pos >= 0 ? `${pos + 1}. ` : "+ "}{p.imagens![i].rotulo ?? i}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="campo">
                <span className="pequeno suave">Fontes mostradas na tela</span>
                {(c.fontes ?? []).map((t, i) => (
                  <div className="linha" key={i} style={{ marginTop: 4 }}>
                    <input className="cresce" type="text" value={t} onChange={(e) => mudarCena(k, (x) => { x.fontes![i] = e.target.value; }, `fo${c.id}${i}`)} />
                    <button className="btn mini perigo" onClick={() => mudarCena(k, (x) => { x.fontes!.splice(i, 1); })}>🗑</button>
                  </div>
                ))}
                <button className="btn mini" style={{ marginTop: 6 }} onClick={() => mudarCena(k, (x) => { (x.fontes ??= []).push("Nova fonte"); })}>+ fonte</button>
              </div>
              <span className="pequeno suave">Elementos animados</span>
              {c.elementos.map((e, i) => (
                <EditorElemento
                  key={i} e={e} palavras={palavras} imagens={imagens}
                  mudar={(fn, chave) => mudarCena(k, (x) => fn(x.elementos[i]), chave && `${c.id}-${i}-${chave}`)}
                  remover={() => mudarCena(k, (x) => { x.elementos.splice(i, 1); })}
                />
              ))}
              <div className="linha" style={{ marginTop: 6 }}>
                <select className="cresce" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} aria-label="Tipo do novo elemento">
                  {Object.keys(MODELOS).map((t) => <option key={t}>{t}</option>)}
                </select>
                <button className="btn" onClick={() => mudarCena(k, (x) => { x.elementos.push(structuredClone(MODELOS[novoTipo])); })}>+ elemento</button>
              </div>
              <div className="linha" style={{ marginTop: 12 }}>
                <button className="btn mini" disabled={k === 0} onClick={() => alterar((x) => { const cs = x.cenas!; [cs[k - 1], cs[k]] = [cs[k], cs[k - 1]]; })}>↑ subir</button>
                <button className="btn mini" disabled={k === cenas.length - 1} onClick={() => alterar((x) => { const cs = x.cenas!; [cs[k + 1], cs[k]] = [cs[k], cs[k + 1]]; })}>↓ descer</button>
                <span className="cresce" />
                <button className="btn mini perigo" onClick={() => confirm("Apagar esta cena?") && alterar((x) => { x.cenas!.splice(k, 1); })}>Apagar cena</button>
              </div>
            </div>
          </details>
        );
      })}
      <button className="btn largo" onClick={() => alterar((x) => { (x.cenas ??= []).push({ id: `cena-${Date.now().toString(36)}`, texto: "Escreva aqui o que a voz vai falar.", fontes: [], elementos: [] }); })}>
        + Nova cena
      </button>
      {!!p.fontesPesquisa?.length && (
        <>
          <h3>Fontes da pesquisa</h3>
          <ul className="pequeno" style={{ paddingLeft: 18, lineHeight: 1.5 }}>
            {p.fontesPesquisa.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.titulo}</a></li>)}
          </ul>
        </>
      )}
    </div>
  );
};
