import React, { useState } from "react";
import { TEMAS } from "../../src/temas";
import { temToken } from "../lib/github";
import { criarIA, novoIdProjeto, projetoIA } from "../lib/projetos";
import { avisarErro, Escolha, ir } from "../ui";

const TONS = ["Explicativo e neutro", "Polêmico, mas factual", "Bem-humorado", "Inspirador", "Urgente (notícia)", "Didático (passo a passo)", "Curiosidades"];
const DURACOES: [number, string][] = [[30, "30 s"], [45, "45 s"], [60, "1 min"], [90, "1:30"], [120, "2 min"]];
const VOZES: [string, string][] = [["pt-BR-AntonioNeural", "Antonio (masc.)"], ["pt-BR-FranciscaNeural", "Francisca (fem.)"], ["pt-BR-ThalitaMultilingualNeural", "Thalita (fem.)"]];
const IDEIAS = ["Por que o real perdeu valor desde 1994?", "Como funciona a delação premiada", "5 mitos sobre o sono que a ciência derrubou", "O que muda com a reforma tributária"];

export const NovoIA: React.FC = () => {
  const [tema, setTema] = useState("");
  const [tom, setTom] = useState(TONS[0]);
  const [tomLivre, setTomLivre] = useState("");
  const [cores, setCores] = useState("padrao");
  const [duracao, setDuracao] = useState(60);
  const [voz, setVoz] = useState(VOZES[0][0]);
  const [enviando, setEnviando] = useState(false);
  const token = temToken();

  const gerar = async () => {
    setEnviando(true);
    try {
      const id = novoIdProjeto("ia");
      const titulo = tema.trim().replace(/\s+/g, " ").slice(0, 70);
      const p = projetoIA(id, titulo, { tema: tema.trim(), tom: tomLivre.trim() || tom, duracao }, cores, voz);
      await criarIA(p);
      ir(`/editor/${id}`);
    } catch (e) {
      avisarErro(e);
      setEnviando(false);
    }
  };

  return (
    <div className="tela">
      <div className="topo">
        <button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")} disabled={enviando}>←</button>
        <h1>Vídeo gerado por IA</h1>
      </div>
      {!token && <div className="aviso">Conecte o GitHub em <a href="#/config">Configurações</a> — o Claude roda no GitHub Actions com a sua assinatura.</div>}

      <label className="campo">
        <span>Tema do vídeo</span>
        <textarea value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: O Lula foi inocentado ou condenado? Explique as decisões do STF." maxLength={600} />
      </label>
      {!tema && (
        <div className="chips" style={{ marginTop: -4 }}>
          {IDEIAS.map((i) => <button key={i} className="chip" style={{ fontWeight: 500 }} onClick={() => setTema(i)}>{i}</button>)}
        </div>
      )}

      <h3>Tom</h3>
      <Escolha opcoes={TONS.map((t) => [t, t] as [string, string])} valor={tomLivre ? "" : tom} mudar={(t) => { setTom(t); setTomLivre(""); }} />
      <input type="text" style={{ marginTop: 8 }} value={tomLivre} onChange={(e) => setTomLivre(e.target.value)} placeholder="…ou descreva o tom do seu jeito" />

      <h3>Tema de cores</h3>
      <div className="temas">
        {Object.entries(TEMAS).map(([k, t]) => (
          <button key={k} className={"tema" + (cores === k ? " on" : "")} style={{ background: `linear-gradient(135deg, ${t.brilhoA}, ${t.fundo} 70%)`, color: t.texto }} onClick={() => setCores(k)}>
            <span style={{ display: "block", height: 6, borderRadius: 3, background: t.destaque, marginBottom: 6 }} />
            {t.nome}
          </button>
        ))}
      </div>

      <h3>Duração</h3>
      <Escolha opcoes={DURACOES} valor={duracao} mudar={setDuracao} />

      <h3>Voz</h3>
      <Escolha opcoes={VOZES} valor={voz} mudar={setVoz} />

      <div className="cartao" style={{ marginTop: 18 }}>
        <div className="passos">
          <div>🔎 O Claude pesquisa fontes confiáveis e escreve o roteiro (gancho, cenas, fontes na tela, pergunta e CTA)</div>
          <div>🎙️ Narração com voz neural e legenda palavra por palavra</div>
          <div>🖼️ Imagens do Wikimedia Commons com créditos</div>
          <div>✏️ Tudo fica pronto para revisar no editor (leva uns 3–8 min)</div>
        </div>
        <button className="btn prim largo" disabled={!token || tema.trim().length < 5 || enviando} onClick={gerar}>
          {enviando ? "Enviando…" : "✨ Gerar com IA"}
        </button>
      </div>
    </div>
  );
};
