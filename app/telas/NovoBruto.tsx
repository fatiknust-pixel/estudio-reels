import React, { useEffect, useRef, useState } from "react";
import { ESTILOS, EstiloPronto } from "../estilos";
import { temToken } from "../lib/github";
import { criarBruto, MetaVideo, novoIdProjeto, projetoBruto } from "../lib/projetos";
import { Alternar, avisarErro, Deslizar, Escolha, fmtTempo, ir } from "../ui";

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(b > 100 * 1024 * 1024 ? 0 : 1)} MB`;

// Lê duração e tamanho do vídeo no próprio aparelho (e se o navegador consegue tocá-lo)
const lerMeta = (url: string) =>
  new Promise<MetaVideo & { tocavel: boolean }>((ok) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const fim = setTimeout(() => ok({ duracao: 0, largura: 1080, altura: 1920, tocavel: false }), 15000);
    v.onloadedmetadata = () => {
      clearTimeout(fim);
      ok({ duracao: v.duration, largura: v.videoWidth || 1080, altura: v.videoHeight || 1920, tocavel: v.videoWidth > 0 });
    };
    v.onerror = () => {
      clearTimeout(fim);
      ok({ duracao: 0, largura: 1080, altura: 1920, tocavel: false });
    };
    v.src = url;
  });

export const NovoBruto: React.FC = () => {
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<(MetaVideo & { tocavel: boolean }) | null>(null);
  const [estilo, setEstilo] = useState<EstiloPronto>(ESTILOS[0]);
  const [titulo, setTitulo] = useState("");
  const [cortarPausas, setCortarPausas] = useState(true);
  const [limite, setLimite] = useState(0.5);
  const [modelo, setModelo] = useState<"medium" | "small">("medium");
  const [ia, setIa] = useState(true);
  const [formato, setFormato] = useState<"9:16" | "16:9">("9:16");
  const [fase, setFase] = useState<{ texto: string; fracao?: number } | null>(null);
  const token = temToken();

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const escolher = async (f?: File) => {
    if (!f) return;
    const u = URL.createObjectURL(f);
    setArquivo(f);
    setUrl(u);
    setMeta(null);
    if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 60) || "Meu vídeo");
    setMeta(await lerMeta(u));
  };

  const criar = async () => {
    if (!arquivo || !meta) return;
    const id = novoIdProjeto("v");
    const p = projetoBruto(id, titulo.trim() || "Meu vídeo", estilo, meta, { cortarPausas, limitePausa: limite, idioma: "pt", modelo, ia }, formato);
    try {
      await criarBruto(p, arquivo, meta.tocavel, (texto, fracao) => setFase({ texto, fracao }));
      ir(`/editor/${id}`);
    } catch (e) {
      setFase(null);
      avisarErro(e);
    }
  };

  return (
    <div className="tela">
      <div className="topo">
        <button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")} disabled={!!fase}>←</button>
        <h1>Editar vídeo bruto</h1>
      </div>

      {!token && <div className="aviso">Conecte o GitHub em <a href="#/config">Configurações</a> — a transcrição roda no GitHub Actions.</div>}

      <input ref={entrada} type="file" accept="video/*" hidden onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = ""; }} />
      {!arquivo ? (
        <button className="modo b" onClick={() => entrada.current?.click()}>
          <div className="emoji">📱</div>
          <div><b>Escolher vídeo da galeria</b><span>Grave falando para a câmera — a legenda, os cortes e os efeitos vêm depois.</span></div>
        </button>
      ) : (
        <div className="cartao" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <video src={url ?? undefined} muted playsInline preload="metadata" style={{ width: 84, aspectRatio: "9/16", objectFit: "cover", borderRadius: 10, background: "#000" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{arquivo.name}</b>
            <span className="pequeno suave">
              {mb(arquivo.size)}
              {meta ? (meta.duracao ? ` · ${fmtTempo(meta.duracao, false)} · ${meta.largura}×${meta.altura}` : " · (formato que este navegador não mostra; o GitHub converte)") : " · lendo…"}
            </span>
            <div><button className="btn mini" style={{ marginTop: 6 }} disabled={!!fase} onClick={() => entrada.current?.click()}>Trocar</button></div>
          </div>
        </div>
      )}
      {arquivo && arquivo.size > 1.5 * 1024 ** 3 && <div className="aviso erro">Vídeo muito grande (máx. ~1,5 GB). Exporte do celular em resolução menor.</div>}
      {meta && meta.duracao > 600 && <div className="aviso">Vídeo longo ({fmtTempo(meta.duracao, false)}): o envio e a transcrição vão demorar mais.</div>}

      <h2>Formato</h2>
      <Escolha opcoes={[["9:16", "📱 Vertical 9:16 (Reels, TikTok, Shorts)"], ["16:9", "🖥️ Horizontal 16:9 (YouTube)"]]} valor={formato} mudar={setFormato} />
      {meta && meta.duracao > 0 && (meta.largura > meta.altura) !== (formato === "16:9") && (
        <p className="pequeno suave">O vídeo foi gravado {meta.largura > meta.altura ? "deitado" : "em pé"}: no {formato} ele preenche a tela cortando as bordas (dá para trocar por "inteiro + fundo desfocado" no editor).</p>
      )}

      <h2>Estilo</h2>
      <div className="estilos">
        {ESTILOS.map((e) => (
          <button key={e.id} className={"estilo-op" + (estilo.id === e.id ? " on" : "")} disabled={!e.pronto || !!fase} onClick={() => { setEstilo(e); setLimite(e.limitePausa); }}>
            <span className="e">{e.emoji}</span>
            <b>{e.nome}</b>
            <small>{e.pronto ? e.descricao : "em breve"}</small>
          </button>
        ))}
      </div>

      <label className="campo"><span>Título do projeto</span><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: 3 erros ao investir" /></label>

      <div className="cartao">
        <Alternar rotulo={<>🤖 Sugestões da IA <span className="pequeno suave">(gancho, cortes de enrolação, zooms, destaques)</span></>} valor={ia} mudar={setIa} />
        <Alternar rotulo="Cortar pausas automaticamente" valor={cortarPausas} mudar={setCortarPausas} />
        {cortarPausas && <Deslizar rotulo="Pausas maiores que" valor={limite} min={0.25} max={1.5} passo={0.05} mudar={setLimite} fmt={(v) => `${v.toFixed(2)}s`} />}
        <label className="campo"><span>Transcrição</span>
          <Escolha opcoes={[["medium", "Precisa (mais lenta)"], ["small", "Rápida"]]} valor={modelo} mudar={setModelo} />
        </label>
        <p className="pequeno suave" style={{ marginBottom: 0 }}>Tudo pode ser ajustado depois no editor.</p>
      </div>

      {fase ? (
        <div className="cartao">
          <b>{fase.texto}…</b>
          {fase.fracao !== undefined && (
            <>
              <div className="barra-prog" style={{ marginTop: 10 }}><div style={{ width: `${Math.round(fase.fracao * 100)}%` }} /></div>
              <p className="pequeno suave">{Math.round(fase.fracao * 100)}% — mantenha o app aberto até terminar o envio.</p>
            </>
          )}
        </div>
      ) : (
        <button className="btn prim largo" disabled={!token || !arquivo || !meta || arquivo.size > 1.5 * 1024 ** 3} onClick={criar}>
          ⬆️ Enviar e transcrever
        </button>
      )}
    </div>
  );
};
