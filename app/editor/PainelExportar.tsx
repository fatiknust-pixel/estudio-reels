import React, { useCallback, useEffect, useState } from "react";
import * as gh from "../lib/github";
import { quadroDe } from "../../src/linhaTempo";
import { estaSujo, exportar, listarExportes } from "../lib/projetos";
import { avisar, avisarErro, ir } from "../ui";
import { useEditor } from "./contexto";

const tamanho = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const NOME_STATUS: Record<string, string> = { queued: "na fila", in_progress: "renderizando…", completed: "terminou", waiting: "esperando", requested: "pedido", pending: "pendente" };

export const PainelExportar: React.FC<{ salvar: () => Promise<void> }> = ({ salvar }) => {
  const { projeto: p, ehDemo, atualizarIA } = useEditor();
  const [execs, setExecs] = useState<gh.Execucao[]>([]);
  const [arquivos, setArquivos] = useState<gh.Asset[] | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const token = gh.temToken();

  const atualizar = useCallback(async () => {
    if (!token || ehDemo) return;
    try {
      const [runs, mp4s] = await Promise.all([gh.listarExecucoes("exportar.yml", 20), listarExportes(p.id)]);
      setExecs(runs.filter((r) => r.display_title.includes(p.id)).slice(0, 5));
      setArquivos(mp4s);
    } catch (e) {
      avisarErro(e);
    }
  }, [p.id, token, ehDemo]);

  useEffect(() => {
    atualizar();
  }, [atualizar]);
  // enquanto houver render rodando, confere a cada 15 s
  const rodando = execs.some((r) => r.status !== "completed");
  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(atualizar, 15000);
    return () => clearInterval(t);
  }, [rodando, atualizar]);

  const baixar = async (a: gh.Asset) => {
    setOcupado(`Baixando ${a.name}…`);
    try {
      const b = await gh.baixarAsset(a);
      const u = URL.createObjectURL(new Blob([b], { type: "video/mp4" }));
      const link = document.createElement("a");
      link.href = u;
      link.download = a.name.replace(/^.*--/, `${p.titulo.replace(/[^\p{L}\p{N} -]+/gu, "").slice(0, 40)} `);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(u), 60000);
    } catch {
      // repositório público: o link direto também funciona
      window.open(a.browser_download_url, "_blank");
    } finally {
      setOcupado(null);
    }
  };

  const compartilhar = async (a: gh.Asset) => {
    setOcupado("Preparando…");
    try {
      const b = await gh.baixarAsset(a);
      const f = new File([b], `${p.id}.mp4`, { type: "video/mp4" });
      if (navigator.canShare?.({ files: [f] })) await navigator.share({ files: [f], title: p.titulo });
      else avisar("Este aparelho não permite compartilhar arquivos daqui. Use Baixar.", true);
    } catch (e: any) {
      if (e?.name !== "AbortError") avisarErro(e);
    } finally {
      setOcupado(null);
    }
  };

  if (ehDemo) {
    return (
      <div className="cartao">
        <b>Este é um exemplo.</b>
        <p className="pequeno suave">Para exportar um MP4, crie um projeto seu na tela inicial — o render roda no GitHub Actions do seu repositório.</p>
        <button className="btn prim largo" onClick={() => ir("/")}>Ir para o início</button>
      </div>
    );
  }
  if (!token) {
    return (
      <div className="aviso">Conecte o GitHub em <a href="#/config">Configurações</a> para salvar e exportar.</div>
    );
  }

  return (
    <div>
      <div className="cartao">
        <b>🎬 Exportar MP4 {quadroDe(p).largura}×{quadroDe(p).altura}</b>
        <p className="pequeno suave">Salva o projeto no GitHub e pede o render ao GitHub Actions. Leva alguns minutos; você pode fechar o app e voltar depois.</p>
        {estaSujo(p.id) && <p className="pequeno">Há alterações ainda não salvas no GitHub — elas vão junto.</p>}
        <button className="btn prim largo" disabled={!!ocupado} onClick={async () => {
          setOcupado("Salvando…");
          try {
            const r = await exportar(p, (m) => setOcupado(m));
            avisar(r ? "Render pedido ✓" : "Render pedido — aparece aqui em instantes");
            await atualizar();
          } catch (e) {
            avisarErro(e);
          } finally {
            setOcupado(null);
          }
        }}>⬇️ Exportar agora</button>
        <button className="btn largo" style={{ marginTop: 8 }} disabled={!!ocupado} onClick={() => salvar()}>💾 Só salvar no GitHub</button>
        {p.modo === "ia" && (
          <button className="btn largo" style={{ marginTop: 8 }} disabled={!!ocupado || p.status === "processando"} onClick={async () => { setOcupado("Pedindo…"); await atualizarIA(); setOcupado(null); }}>
            🎙️ Atualizar voz e imagens
          </button>
        )}
        {ocupado && <p className="pequeno">{ocupado}</p>}
      </div>

      <div className="linha"><h3 className="cresce">Renders</h3><button className="btn mini" onClick={atualizar}>⟳</button></div>
      {!execs.length && <div className="vazio-lista">Nenhum render deste projeto ainda.</div>}
      <div className="lista">
        {execs.map((r) => (
          <a key={r.id} className="item" href={r.html_url} target="_blank" rel="noreferrer">
            <span>{r.status !== "completed" ? "⏳" : r.conclusion === "success" ? "✅" : "❌"}</span>
            <span className="tit">{quando(r.created_at)}<small>{r.status === "completed" ? (r.conclusion === "success" ? "pronto" : `falhou (${r.conclusion}) — toque para ver o log`) : NOME_STATUS[r.status] ?? r.status}</small></span>
          </a>
        ))}
      </div>

      <h3>Vídeos prontos</h3>
      {arquivos === null && <div className="vazio-lista">Carregando…</div>}
      {arquivos?.length === 0 && <div className="vazio-lista">Os MP4 exportados aparecem aqui.</div>}
      <div className="lista">
        {arquivos?.map((a) => (
          <div key={a.id} className="item" style={{ cursor: "default" }}>
            <span>🎞️</span>
            <span className="tit">{quando(a.created_at)}<small>{tamanho(a.size)}</small></span>
            <button className="btn mini" onClick={() => compartilhar(a)}>Compartilhar</button>
            <button className="btn mini prim" onClick={() => baixar(a)}>Baixar</button>
          </div>
        ))}
      </div>
    </div>
  );
};
