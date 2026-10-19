import React, { useState } from "react";
import { TEMAS } from "../../src/temas";
import { CampoEstilo, DINAMICAS, estilosDoLote, OPCOES_ESTILO, PALETAS } from "../estilosIA";
import { temToken } from "../lib/github";
import { criarIA, novoIdProjeto, projetoIA } from "../lib/projetos";
import { Alternar, avisar, avisarErro, Escolha, ir } from "../ui";

const TONS = ["Explicativo e neutro", "Polêmico, mas factual", "Bem-humorado", "Inspirador", "Urgente (notícia)", "Didático (passo a passo)", "Curiosidades"];
const DURACOES: [number, string][] = [[30, "30 s"], [45, "45 s"], [60, "1 min"], [90, "1:30"], [120, "2 min"]];
const FORMATOS: [string, string][] = [["9:16", "📱 Vertical 9:16 (Reels, TikTok)"], ["16:9", "🖥️ Horizontal 16:9 (YouTube, aulas)"]];
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
  const [enviando, setEnviando] = useState<string | null>(null);
  const token = temToken();

  // um tema por linha = um vídeo
  const temas = texto.split("\n").map((t) => t.trim().replace(/\s+/g, " ")).filter((t) => t.length >= 5);
  const n = temas.length;
  const demais = n > MAX_LOTE;
  const mudarEstilo = (c: CampoEstilo, v: string) => setEstilo((e) => ({ ...e, [c]: v }));

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
            ...(n > 1 ? { lote: { indice: i + 1, total: n, outros: temas.filter((_, j) => j !== i) } } : {}),
          },
          e.paleta !== "auto" ? e.paleta : "padrao",
          voz,
          formato as "9:16" | "16:9"
        );
        await criarIA(p);
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

      <label className="campo">
        <span>Tema do vídeo <span className="pequeno">— um por linha para criar até {MAX_LOTE} vídeos de uma vez</span></span>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={"Ex.: O Lula foi inocentado ou condenado?\nComo funciona a delação premiada"} maxLength={2000} rows={4} />
      </label>
      {!texto && (
        <div className="chips" style={{ marginTop: -4 }}>
          {IDEIAS.map((i) => <button key={i} className="chip" style={{ fontWeight: 500 }} onClick={() => setTexto(i)}>{i}</button>)}
        </div>
      )}
      {n > 1 && !demais && <div className="aviso pequeno">📦 {n} vídeos serão criados, um para cada linha.</div>}
      {demais && <div className="aviso erro pequeno">São {n} temas — o máximo é {MAX_LOTE} vídeos por vez. Apague {n - MAX_LOTE} linha(s).</div>}

      <h3>Tom</h3>
      <Escolha opcoes={TONS.map((t) => [t, t] as [string, string])} valor={tomLivre ? "" : tom} mudar={(t) => { setTom(t); setTomLivre(""); }} />
      <input type="text" style={{ marginTop: 8 }} value={tomLivre} onChange={(e) => setTomLivre(e.target.value)} placeholder="…ou descreva o tom do seu jeito" />

      <h3>Duração</h3>
      <Escolha opcoes={DURACOES} valor={duracao} mudar={setDuracao} />

      <h3>Formato</h3>
      <Escolha opcoes={FORMATOS} valor={formato} mudar={setFormato} />

      <h3>Voz</h3>
      <Escolha opcoes={VOZES} valor={voz} mudar={setVoz} />

      <h2>🎬 Estilo da edição</h2>
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
        <button className={"tema" + (estilo.paleta === "auto" ? " on" : "")} style={{ background: "linear-gradient(135deg, #3A1C71, #12305C 50%, #5A1F3D)", color: "#fff" }} onClick={() => mudarEstilo("paleta", "auto")}>
          <span style={{ display: "block", height: 6, borderRadius: 3, background: "linear-gradient(90deg, #FFD60A, #00F5A0, #FF2E88)", marginBottom: 6 }} />
          Automático
        </button>
        {PALETAS.map((k) => {
          const t = TEMAS[k];
          return (
            <button key={k} className={"tema" + (estilo.paleta === k ? " on" : "")} style={{ background: `linear-gradient(135deg, ${t.brilhoA}, ${t.fundo} 70%)`, color: t.texto }} onClick={() => mudarEstilo("paleta", k)}>
              <span style={{ display: "block", height: 6, borderRadius: 3, background: t.destaque, marginBottom: 6 }} />
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
