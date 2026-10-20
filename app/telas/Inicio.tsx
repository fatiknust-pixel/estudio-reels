import React, { useEffect, useState } from "react";
import { temToken } from "../lib/github";
import { DEMOS, ItemLista, listarProjetos } from "../lib/projetos";
import { avisarErro, ir } from "../ui";

const quando = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export const Selo: React.FC<{ status?: string }> = ({ status }) => {
  if (status === "processando") return <span className="selo proc">processando</span>;
  if (status === "erro") return <span className="selo erro">erro</span>;
  if (status === "pronto") return <span className="selo ok">pronto</span>;
  return <span className="selo">rascunho</span>;
};

export const Inicio: React.FC = () => {
  const [lista, setLista] = useState<ItemLista[] | null>(null);
  const token = temToken();
  useEffect(() => {
    listarProjetos(setLista).catch((e) => {
      setLista((l) => l ?? []);
      avisarErro(e);
    });
  }, []);

  return (
    <div className="tela">
      <div className="topo">
        <div className="marca" style={{ flex: 1 }}>
          <img src="./icones/icone.svg" alt="" />
          <h1>Estúdio Reels</h1>
        </div>
        <button className="btn icone chato" aria-label="Configurações" onClick={() => ir("/config")}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg></button>
      </div>

      {!token && (
        <div className="aviso">
          Para criar vídeos e exportar, conecte seu GitHub em <a href="#/config">Configurações</a>. Os exemplos abaixo funcionam sem isso.
        </div>
      )}

      <div className="modos">
        <button className="modo" onClick={() => ir("/novo/ia")}>
          <div className="emoji">🤖</div>
          <div>
            <b>Vídeo gerado por IA</b>
            <span>Você dá o tema; o Claude pesquisa fontes, escreve o roteiro, e sai com voz, imagens e animações.</span>
          </div>
        </button>
        <button className="modo b" onClick={() => ir("/novo/bruto")}>
          <div className="emoji">🎬</div>
          <div>
            <b>Editar vídeo bruto</b>
            <span>Escolha um vídeo da galeria e um estilo viral: legendas, cortes de pausas, zooms e destaques.</span>
          </div>
        </button>
      </div>

      <h2>Meus projetos</h2>
      <div className="lista">
        {lista === null && <div className="vazio-lista">Carregando…</div>}
        {lista?.length === 0 && <div className="vazio-lista">Nenhum projeto ainda. Comece por um dos modos acima.</div>}
        {lista?.map((p) => (
          <button key={p.id} className="item" onClick={() => ir(`/editor/${encodeURIComponent(p.id)}`)}>
            <span style={{ fontSize: 22 }}>{p.modo === "ia" ? "🤖" : "🎬"}</span>
            <span className="tit">
              {p.titulo}
              <small>{quando(p.atualizadoEm)}{p.noGitHub ? "" : " · só neste aparelho"}</small>
            </span>
            <Selo status={p.status} />
          </button>
        ))}
      </div>

      <h2>Exemplos</h2>
      <div className="lista">
        {Object.values(DEMOS).map((p) => (
          <button key={p.id} className="item" onClick={() => ir(`/editor/${p.id}`)}>
            <span style={{ fontSize: 22 }}>{p.modo === "ia" ? "🤖" : "🎬"}</span>
            <span className="tit">
              {p.titulo}
              <small>{p.modo === "ia" ? "Modo 1 · roteiro, voz, imagens e elementos animados" : "Modo 2 · legenda impacto, cortes, zoom e emojis"}</small>
            </span>
            <span className="selo">abrir</span>
          </button>
        ))}
      </div>
    </div>
  );
};
