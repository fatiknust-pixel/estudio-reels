import React, { useCallback, useEffect, useState } from "react";
import * as gh from "../lib/github";
import { quadroDe } from "../../src/linhaTempo";
import { estaSujo, exportar, listarExportes } from "../lib/projetos";
import { avisar, avisarErro, ir } from "../ui";
import { useEditor } from "./contexto";

const tamanho = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const NOME_STATUS: Record<string, string> = { queued: "na fila", in_progress: "renderizando…", completed: "terminou", waiting: "esperando", requested: "pedido", pending: "pendente" };

const copiar = async (texto: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    avisar("Copiado ✓");
  } catch {
    avisarErro(new Error("Não consegui copiar: segure o texto e copie na mão."));
  }
};

// Descrição pronta para colar no YouTube: a que o Claude escreveu + fontes + créditos das fotos (exigidos pelas licenças)
const descricaoCompleta = (p: ReturnType<typeof useEditor>["projeto"]) => {
  const fontes = (p.fontesPesquisa ?? []).map((f) => `• ${f.titulo}: ${f.url}`);
  const creditos = Object.values(p.imagens ?? {}).filter((i) => i.autor).map((i) => `• ${i.rotulo ?? i.titulo}: ${i.autor} — ${i.licenca}${i.pagina ? ` (${i.pagina})` : ""}`);
  return [p.publicacao?.descricao ?? "", fontes.length ? `Fontes:\n${fontes.join("\n")}` : "", creditos.length ? `Imagens (Wikimedia Commons e outras fontes livres):\n${creditos.join("\n")}` : ""].filter(Boolean).join("\n\n");
};

export const PainelExportar: React.FC<{ salvar: () => Promise<void> }> = ({ salvar }) => {
  const { projeto: p, ehDemo, atualizarIA, enviarNarracao } = useEditor();
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
        {p.modo === "ia" && (
          <label className="btn largo" style={{ marginTop: 8 }} aria-disabled={!!ocupado || p.status === "processando"}>
            🎤 {p.voz?.propria ? "Trocar minha narração" : "Usar minha voz gravada"}
            <input type="file" accept="audio/*,video/*" hidden disabled={!!ocupado || p.status === "processando"} onChange={async (e) => {
              const arq = e.target.files?.[0];
              e.target.value = "";
              if (!arq) return;
              setOcupado("Enviando…");
              await enviarNarracao(arq, (t, f) => setOcupado(f === undefined ? `${t}…` : `${t} ${Math.round(f * 100)}%`));
              setOcupado(null);
            }} />
          </label>
        )}
        {p.modo === "ia" && p.voz?.propria && (
          <button className="btn largo" style={{ marginTop: 8 }} disabled={!!ocupado || p.status === "processando"} onClick={async () => { setOcupado("Pedindo…"); await atualizarIA({ voz: { ...p.voz!, propria: false } }); setOcupado(null); }}>
            🤖 Voltar para a voz da IA
          </button>
        )}
        {p.modo === "ia" && (
          <p className="pequeno suave">Grave lendo o texto das cenas, na ordem, num arquivo só (celular serve). O GitHub tira o ruído, ajusta o volume e sincroniza legenda e imagens com a sua fala. Se mudar o texto de uma cena depois, grave de novo.</p>
        )}
        {ocupado && <p className="pequeno">{ocupado}</p>}
      </div>

      {p.publicacao && (
        <>
          <h3>Para postar no YouTube</h3>
          <div className="cartao">
            <p className="pequeno suave" style={{ marginTop: 0 }}>Títulos sugeridos (toque para copiar):</p>
            <div className="lista">
              {p.publicacao.titulos.map((t, i) => (
                <button key={i} className="item" onClick={() => copiar(t)}><span className="tit">{t}<small>{t.length} caracteres</small></span><span className="selo">copiar</span></button>
              ))}
            </div>
            <div className="linha" style={{ marginTop: 10, flexWrap: "wrap" }}>
              <button className="btn cresce" onClick={() => copiar(descricaoCompleta(p))}>Copiar descrição (com fontes e créditos)</button>
              <button className="btn" onClick={() => copiar(p.publicacao!.tags.join(", "))}>Copiar tags</button>
            </div>
          </div>
        </>
      )}

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
