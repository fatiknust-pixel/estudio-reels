import React, { useEffect, useRef, useState } from "react";
import GENEROS from "../../src/generos.json";
import { TEMAS } from "../../src/temas";
import { CampoEstilo, DINAMICAS, estilosDoLote, OPCOES_ESTILO, PALETAS } from "../estilosIA";
import { temToken } from "../lib/github";
import { criarIA, lerMetaVideo, MetaVideo, novoFundo, novoIdProjeto, projetoIA } from "../lib/projetos";
import { Alternar, fmtTempo, avisar, avisarErro, Escolha, ir } from "../ui";

const TONS = ["Explicativo e neutro", "Polêmico, mas factual", "Bem-humorado", "Inspirador", "Urgente (notícia)", "Didático (passo a passo)", "Curiosidades"];
const DURACOES: [number, string][] = [[30, "30 s"], [45, "45 s"], [60, "1 min"], [90, "1:30"], [120, "2 min"], [180, "3 min"], [300, "5 min"], [480, "8 min"], [600, "10 min"], [720, "12 min"]];
type Genero = (typeof GENEROS.generos)[number];
const FORMATOS: [string, string][] = [["9:16", "📱 Vertical 9:16 (Reels, TikTok)"], ["16:9", "🖥️ Horizontal 16:9 (YouTube, aulas)"]];
const VISUAIS: [string, string][] = [["reels", "🎬 Reels (dinâmico)"], ["aula", "📚 Videoaula (fundo branco, ícones simples)"]];
const VOZES: [string, string][] = [["pt-BR-AntonioNeural", "Antonio (masc.)"], ["pt-BR-FranciscaNeural", "Francisca (fem.)"], ["pt-BR-ThalitaMultilingualNeural", "Thalita (fem.)"]];
const IDEIAS = ["Por que o real perdeu valor desde 1994?", "Como funciona a delação premiada", "5 mitos sobre o sono que a ciência derrubou", "O que muda com a reforma tributária"];
const MAX_LOTE = 5;

const ESTILO_INICIAL = Object.fromEntries(["dinamica", "legenda", "transicao", "fundo", "musica", "formato", "fonte", "paleta"].map((c) => [c, "auto"])) as Record<CampoEstilo, string>;

export const NovoIA: React.FC = () => {
  const [texto, setTexto] = useState("");
  const [tom, setTom] = useState(TONS[0]);
  const [tomLivre, setTomLivre] = useState("");
  const [estilo, setEstilo] = useState(ESTILO_INICIAL);
  const [variar, setVariar] = useState(true);
  const [duracao, setDuracao] = useState(60);
  const [voz, setVoz] = useState(VOZES[0][0]);
  const [formato, setFormato] = useState("9:16");
  const [genero, setGenero] = useState<Genero | null>(null);
  const [visual, setVisual] = useState("reels");
  const [enviando, setEnviando] = useState<string | null>(null);
  // gameplay de fundo (opcional): roda sem som atrás de tudo; as fotos e as animações entram por cima
  const entradaFundo = useRef<HTMLInputElement>(null);
  const [fundo, setFundo] = useState<{ arquivo: File; url: string; meta: MetaVideo & { tocavel: boolean } } | null>(null);
  useEffect(() => () => { if (fundo) URL.revokeObjectURL(fundo.url); }, [fundo]);
  const escolherFundo = async (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFundo({ arquivo: f, url, meta: await lerMetaVideo(url) });
  };
  const token = temToken();

  // um tema por linha = um vídeo
  const temas = texto.split("\n").map((t) => t.trim().replace(/\s+/g, " ")).filter((t) => t.length >= 5);
  const n = temas.length;
  const demais = n > MAX_LOTE;
  const mudarEstilo = (c: CampoEstilo, v: string) => setEstilo((e) => ({ ...e, [c]: v }));

  // Gênero = ponto de partida: formato, duração, tom e estilo do gênero (tudo continua editável)
  const escolherGenero = (g: Genero | null) => {
    setGenero(g);
    if (!g) {
      setEstilo(ESTILO_INICIAL);
      setTomLivre("");
      return;
    }
    setFormato(g.formato);
    setDuracao(g.duracao);
    setTomLivre(g.tom);
    setEstilo({ ...ESTILO_INICIAL, ...g.estilo } as Record<CampoEstilo, string>);
  };
  const linhas = texto.split("\n").map((t) => t.trim()).filter(Boolean);
  const adicionarTema = (t: string) => {
    if (linhas.includes(t) || linhas.length >= MAX_LOTE) return;
    setTexto([...linhas, t].join("\n"));
  };
  const sortearTemas = () => {
    if (!genero) return;
    const livres = genero.temas.filter((t) => !linhas.includes(t)).sort(() => Math.random() - 0.5);
    setTexto([...linhas, ...livres].slice(0, Math.max(3, linhas.length)).slice(0, MAX_LOTE).join("\n"));
  };

  const gerar = async () => {
    const estilos = estilosDoLote(estilo, n, variar);
    try {
      let primeiro = "";
      for (let i = 0; i < n; i++) {
        setEnviando(n > 1 ? `Enviando ${i + 1} de ${n}…` : "Enviando…");
        const id = novoIdProjeto("ia");
        primeiro ||= id;
        const e = estilos[i];
        const p = projetoIA(
          id,
          temas[i].slice(0, 70),
          {
            tema: temas[i],
            tom: tomLivre.trim() || tom,
            duracao,
            estilo: e,
            ...(genero ? { genero: { id: genero.id, nome: genero.nome, instrucoes: genero.instrucoes, galeria: genero.galeria } } : {}),
            ...(n > 1 ? { lote: { indice: i + 1, total: n, outros: temas.filter((_, j) => j !== i) } } : {}),
          },
          e.paleta !== "auto" ? e.paleta : "padrao",
          voz,
          formato as "9:16" | "16:9",
          visual === "aula" ? "aula" : undefined
        );
        const comFundo = fundo && visual !== "aula";
        if (comFundo) p.fundoVideo = novoFundo(fundo.meta);
        const prefixo = n > 1 ? `${i + 1} de ${n}: ` : "";
        await criarIA(p, comFundo ? { arquivo: fundo.arquivo, tocavel: fundo.meta.tocavel } : undefined, (texto, fracao) => setEnviando(`${prefixo}${texto}${fracao !== undefined ? ` ${Math.round(fracao * 100)}%` : "…"}`));
      }
      if (n === 1) ir(`/editor/${primeiro}`);
      else {
        avisar(`${n} vídeos pedidos ✓ — ficam prontos ao mesmo tempo, em uns 5–10 min`);
        ir("/");
      }
    } catch (err) {
      avisarErro(err);
      setEnviando(null);
    }
  };

  return (
    <div className="tela">
      <div className="topo">
        <button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")} disabled={!!enviando}>←</button>
        <h1>Vídeo gerado por IA</h1>
      </div>
      {!token && <div className="aviso">Conecte o GitHub em <a href="#/config">Configurações</a> — o Claude roda no GitHub Actions com a sua assinatura.</div>}

      <h2 style={{ marginTop: 6 }}>Gênero do vídeo</h2>
      <p className="pequeno suave" style={{ marginTop: -4 }}>Modelos prontos de canal dark: narração com imagens e animações, sem aparecer. Escolha um gênero ou crie livre.</p>
      <div className="generos">
        <button className={"genero-op" + (!genero ? " on" : "")} onClick={() => escolherGenero(null)}>
          <span className="e">✨</span>
          <b>Livre</b>
        </button>
        {GENEROS.generos.map((g) => (
          <button key={g.id} className={"genero-op" + (genero?.id === g.id ? " on" : "")} onClick={() => escolherGenero(g)}>
            <span className="e">{g.emoji}</span>
            <b>{g.nome}</b>
          </button>
        ))}
      </div>
      <div className="cartao pequeno" style={{ marginTop: 8 }}>
        {genero ? (
          <>
            <b>{genero.emoji} {genero.nome}</b> — {genero.descricao}
            <div className="suave" style={{ marginTop: 4 }}>
              {genero.formato === "16:9" ? "🖥️ Horizontal 16:9" : "📱 Vertical 9:16"} · {DURACOES.find(([d]) => d === genero.duracao)?.[1] ?? `${genero.duracao}s`}
              {genero.galeria ? " · 🖼️ várias fotos por cena" : ""} · tudo abaixo vem ajustado e você pode mudar
            </div>
          </>
        ) : (
          <><b>✨ Livre</b> — você escreve o tema e escolhe tudo (ou deixa em Automático).</>
        )}
      </div>

      <label className="campo">
        <span>Tema do vídeo <span className="pequeno">— um por linha para criar até {MAX_LOTE} vídeos de uma vez</span></span>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={"Ex.: O Lula foi inocentado ou condenado?\nComo funciona a delação premiada"} maxLength={2000} rows={4} />
      </label>
      {genero ? (
        <div className="cartao">
          <div className="linha" style={{ marginBottom: 8 }}>
            <b className="cresce">{genero.emoji} Temas prontos de {genero.nome}</b>
            <button className="btn mini" onClick={sortearTemas}>🎲 Sortear</button>
          </div>
          <div className="chips">
            {genero.temas.map((t) => (
              <button key={t} className={"chip" + (linhas.includes(t) ? " on" : "")} style={{ fontWeight: 500 }} disabled={!linhas.includes(t) && linhas.length >= MAX_LOTE}
                onClick={() => (linhas.includes(t) ? setTexto(linhas.filter((l) => l !== t).join("\n")) : adicionarTema(t))}>
                {linhas.includes(t) ? "✓ " : "+ "}{t}
              </button>
            ))}
          </div>
          <p className="pequeno suave" style={{ marginBottom: 0 }}>Toque para adicionar (cada um vira um vídeo) ou escreva o seu próprio tema no campo acima.</p>
        </div>
      ) : (
        !texto && (
          <div className="chips" style={{ marginTop: -4 }}>
            {IDEIAS.map((i) => <button key={i} className="chip" style={{ fontWeight: 500 }} onClick={() => setTexto(i)}>{i}</button>)}
          </div>
        )
      )}
      {n > 1 && !demais && <div className="aviso pequeno">📦 {n} vídeos serão criados, um para cada linha.</div>}
      {demais && <div className="aviso erro pequeno">São {n} temas — o máximo é {MAX_LOTE} vídeos por vez. Apague {n - MAX_LOTE} linha(s).</div>}

      <h3>Tom</h3>
      <Escolha opcoes={TONS.map((t) => [t, t] as [string, string])} valor={tomLivre ? "" : tom} mudar={(t) => { setTom(t); setTomLivre(""); }} />
      <input type="text" style={{ marginTop: 8 }} value={tomLivre} onChange={(e) => setTomLivre(e.target.value)} placeholder="…ou descreva o tom do seu jeito" />

      <h3>Duração</h3>
      <Escolha opcoes={DURACOES} valor={duracao} mudar={setDuracao} />

      <h3>Visual</h3>
      <Escolha opcoes={VISUAIS} valor={visual} mudar={(v) => { setVisual(v); if (v === "aula") setFormato("16:9"); }} />

      <h3>Formato</h3>
      <Escolha opcoes={FORMATOS} valor={formato} mudar={setFormato} />

      {visual !== "aula" && (
        <>
          <h3>Gameplay no fundo (opcional)</h3>
          <input ref={entradaFundo} type="file" accept="video/*" hidden onChange={(e) => { escolherFundo(e.target.files?.[0]); e.target.value = ""; }} />
          {fundo ? (
            <div className="item" style={{ cursor: "default" }}>
              <span className="tit">
                {fundo.arquivo.name}
                <small>{fundo.meta.duracao ? `${fmtTempo(fundo.meta.duracao, false)} · ` : ""}{(fundo.arquivo.size / 1024 / 1024).toFixed(0)} MB{fundo.meta.duracao > 600 ? " · usa os primeiros 10 min" : ""}</small>
              </span>
              <button className="btn mini" onClick={() => setFundo(null)} disabled={!!enviando}>Tirar</button>
            </div>
          ) : (
            <button className="btn largo" onClick={() => entradaFundo.current?.click()}>🎮 Escolher vídeo de gameplay</button>
          )}
          <p className="pequeno suave">A gameplay roda sem som atrás de tudo (repete se for curta). As imagens entram por cima como cartões, no tempo da fala, e as animações do Claude e a legenda ficam por cima. {n > 1 ? "Com vários vídeos, a gameplay é enviada uma vez para cada um." : ""}</p>
        </>
      )}

      <h3>Voz</h3>
      <Escolha opcoes={VOZES} valor={voz} mudar={setVoz} />

      <h2>Estilo da edição</h2>
      <p className="pequeno suave" style={{ marginTop: -4 }}>
        Muda o ritmo e o movimento do vídeo, não só as cores. Em <b>Automático</b> o Claude escolhe o que combina com o tema, sem repetir o vídeo anterior.
      </p>
      {n > 1 && (
        <div className="cartao">
          <Alternar rotulo={<>🎲 Variar estilo entre os vídeos <span className="pequeno suave">(cada um ganha dinâmica, legenda, transição e formato diferentes)</span></>} valor={variar} mudar={setVariar} />
        </div>
      )}

      <h3>Dinâmica</h3>
      <div className="estilos">
        <button className={"estilo-op" + (estilo.dinamica === "auto" ? " on" : "")} onClick={() => mudarEstilo("dinamica", "auto")}>
          <span className="e">✨</span>
          <b>Automático</b>
          <small>O Claude escolhe pelo tema{n > 1 && variar ? "; no lote, uma diferente para cada vídeo" : ""}.</small>
        </button>
        {DINAMICAS.map((d) => (
          <button key={d.id} className={"estilo-op" + (estilo.dinamica === d.id ? " on" : "")} onClick={() => mudarEstilo("dinamica", d.id)}>
            <span className="e">{d.emoji}</span>
            <b>{d.nome}</b>
            <small>{d.descricao}</small>
          </button>
        ))}
      </div>

      <div className="grade2" style={{ marginTop: 6 }}>
        {OPCOES_ESTILO.map(({ campo, rotulo, opcoes }) => (
          <label className="campo" key={campo} style={{ margin: "6px 0" }}>
            <span>{rotulo}</span>
            <select value={estilo[campo]} onChange={(e) => mudarEstilo(campo, e.target.value)}>
              <option value="auto">Automático</option>
              {opcoes.map(([v, nome]) => <option key={v} value={v}>{nome}</option>)}
            </select>
          </label>
        ))}
      </div>

      <h3>Tema de cores</h3>
      <div className="temas">
        <button className={"tema" + (estilo.paleta === "auto" ? " on" : "")} onClick={() => mudarEstilo("paleta", "auto")}>
          <span className="pinta"><i style={{ border: "1px dashed var(--suave)" }} /></span>
          Automático
        </button>
        {PALETAS.map((k) => {
          const t = TEMAS[k];
          return (
            <button key={k} className={"tema" + (estilo.paleta === k ? " on" : "")} onClick={() => mudarEstilo("paleta", k)}>
              <span className="pinta"><i style={{ background: t.fundo }} /><i style={{ background: t.brilhoA }} /><i style={{ background: t.destaque }} /></span>
              {t.nome}
            </button>
          );
        })}
      </div>

      <div className="cartao" style={{ marginTop: 18 }}>
        <div className="passos">
          <div>🔎 O Claude pesquisa fontes confiáveis e escreve o roteiro (gancho, cenas, fontes na tela, pergunta e CTA)</div>
          <div>🎙️ Narração com voz neural e legenda palavra por palavra</div>
          <div>🖼️ Imagens do Wikimedia Commons com créditos</div>
          <div>✏️ Tudo fica pronto para revisar no editor (leva uns 3–8 min{n > 1 ? "; os vídeos do lote são feitos ao mesmo tempo" : ""})</div>
        </div>
        <button className="btn prim largo" disabled={!token || n === 0 || demais || !!enviando} onClick={gerar}>
          {enviando ?? (n > 1 ? `✨ Gerar ${n} vídeos com IA` : "✨ Gerar com IA")}
        </button>
      </div>
    </div>
  );
};
