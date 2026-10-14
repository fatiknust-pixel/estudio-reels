import React, { useState } from "react";
import { ConfigGitHub, lerConfig, salvarConfig, testarAcesso } from "../lib/github";
import { avisar, avisarErro, ir } from "../ui";

export const Config: React.FC = () => {
  const [c, setC] = useState<ConfigGitHub>(lerConfig);
  const [ver, setVer] = useState(false);
  const [teste, setTeste] = useState<string | null>(null);
  const mudar = (k: keyof ConfigGitHub, v: string) => setC((x) => ({ ...x, [k]: v.trim() }));
  const salvar = () => {
    salvarConfig(c);
    avisar("Salvo neste aparelho");
  };
  const testar = async () => {
    salvarConfig(c);
    setTeste("Testando…");
    try {
      const r = await testarAcesso();
      setTeste(`✅ Conectado a ${r.nome}${r.privado ? " (privado)" : " (público)"}. ${r.permissoes?.push ? "Pode gravar." : "⚠️ O token não pode gravar."}`);
    } catch (e) {
      setTeste(null);
      avisarErro(e);
    }
  };
  const novoToken = `https://github.com/settings/personal-access-tokens/new?name=Estudio%20Reels&description=App%20Estudio%20Reels&contents=write&actions=write`;
  return (
    <div className="tela">
      <div className="topo">
        <button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")}>←</button>
        <h1>Configurações</h1>
      </div>

      <div className="cartao">
        <h3 style={{ marginTop: 0 }}>GitHub</h3>
        <p className="pequeno suave" style={{ marginTop: 0 }}>
          O token fica salvo <b>só neste aparelho</b> (armazenamento do navegador) e é enviado apenas para api.github.com.
        </p>
        <label className="campo">
          <span>Token pessoal (fine-grained)</span>
          <div className="linha">
            <input className="cresce" type={ver ? "text" : "password"} autoComplete="off" spellCheck={false} value={c.token} onChange={(e) => mudar("token", e.target.value)} placeholder="github_pat_…" />
            <button className="btn icone" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder" : "Mostrar"}>{ver ? "🙈" : "👁️"}</button>
          </div>
        </label>
        <div className="grade2">
          <label className="campo"><span>Dono</span><input type="text" value={c.dono} onChange={(e) => mudar("dono", e.target.value)} /></label>
          <label className="campo"><span>Repositório</span><input type="text" value={c.repo} onChange={(e) => mudar("repo", e.target.value)} /></label>
        </div>
        <label className="campo"><span>Ramo</span><input type="text" value={c.ramo} onChange={(e) => mudar("ramo", e.target.value)} /></label>
        <div className="linha">
          <button className="btn prim cresce" onClick={testar}>Salvar e testar</button>
          <button className="btn" onClick={salvar}>Salvar</button>
        </div>
        {teste && <p className="pequeno">{teste}</p>}
        <button className="btn perigo chato largo" onClick={() => { const v = { ...c, token: "" }; setC(v); salvarConfig(v); avisar("Token apagado deste aparelho"); }}>
          Apagar token deste aparelho
        </button>
      </div>

      <div className="cartao">
        <h3 style={{ marginTop: 0 }}>Como criar o token</h3>
        <ol className="pequeno" style={{ paddingLeft: 18, lineHeight: 1.5 }}>
          <li>Abra <a href={novoToken} target="_blank" rel="noreferrer">GitHub → Fine-grained token</a>.</li>
          <li><b>Repository access:</b> “Only select repositories” → <code>{c.repo}</code>.</li>
          <li><b>Permissions:</b> Contents = Read and write; Actions = Read and write (Metadata fica Read).</li>
          <li>Gere, copie e cole aqui. Escolha uma validade (ex.: 90 dias).</li>
        </ol>
      </div>

      <div className="cartao">
        <h3 style={{ marginTop: 0 }}>Segredos do repositório (uma vez só)</h3>
        <p className="pequeno" style={{ lineHeight: 1.5 }}>
          Para o Modo 1 e as sugestões da IA, as Actions usam o Claude com a sua assinatura. No computador, rode{" "}
          <code>claude setup-token</code> e salve o resultado em <b>Settings → Secrets and variables → Actions</b> do repositório
          como <code>CLAUDE_CODE_OAUTH_TOKEN</code>.
        </p>
      </div>
    </div>
  );
};
