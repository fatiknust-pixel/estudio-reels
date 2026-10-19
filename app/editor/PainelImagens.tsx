import React, { useRef, useState } from "react";
import { avisar, avisarErro } from "../ui";
import { useEditor } from "./contexto";

// Reduz a foto para no máximo 1080px de largura (JPEG), para subir rápido e caber no repositório
export const reduzirImagem = (arquivo: Blob, max = 1080): Promise<Blob> =>
  new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? ok(b) : erro(new Error("Não consegui converter a imagem"))), "image/jpeg", 0.88);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => erro(new Error("Imagem inválida"));
    img.src = URL.createObjectURL(arquivo);
  });

export const PainelImagens: React.FC = () => {
  const { projeto: p, alterar, urlArquivo, definirArquivo, atualizarIA } = useEditor();
  const pendentes = Object.values(p.imagens ?? {}).filter((i) => i.busca || !i.arquivo).length;
  const entrada = useRef<HTMLInputElement>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const imagens = Object.entries(p.imagens ?? {});
  const usos = (k: string) => (p.cenas ?? []).filter((c) => c.fundo === k || (c.galeria ?? []).includes(k) || c.elementos.some((e) => e.imagem === k)).length;

  const escolherFoto = (chave: string) => {
    setAlvo(chave);
    entrada.current?.click();
  };
  const aoEscolher = async (arq?: File) => {
    if (!arq || !alvo) return;
    try {
      const b = await reduzirImagem(arq);
      const caminho = `imagens/${alvo}-${Date.now().toString(36)}.jpg`;
      await definirArquivo(caminho, b);
      alterar((x) => {
        const atual = x.imagens![alvo] ?? { arquivo: caminho };
        x.imagens![alvo] = { arquivo: caminho, rotulo: atual.rotulo ?? alvo, propria: true };
      });
      avisar("Foto trocada (sobe para o GitHub ao salvar)");
    } catch (e) {
      avisarErro(e);
    }
  };

  return (
    <div>
      <p className="pequeno suave" style={{ marginTop: 0 }}>
        Imagens do Wikimedia Commons, com autor e licença mostrados no vídeo. Troque por uma foto sua, ou peça outra busca (feita pela Action em “Atualizar voz e imagens”).
      </p>
      {pendentes > 0 && p.status !== "processando" && (
        <div className="aviso pequeno">
          🔎 {pendentes} imagem(ns) para buscar no Wikimedia.
          <button className="btn mini prim" style={{ marginTop: 8, display: "flex" }} onClick={() => atualizarIA()}>Buscar agora</button>
        </div>
      )}
      <input ref={entrada} type="file" accept="image/*" hidden onChange={(e) => { aoEscolher(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="imgs">
        {imagens.map(([k, i]) => {
          const u = urlArquivo(i.arquivo);
          return (
            <div className="img-card" key={k}>
              {u ? <img src={u} alt={i.rotulo ?? k} loading="lazy" /> : <div className="vazio">{i.busca ? "aguardando busca…" : "carregando…"}</div>}
              <div className="info">
                <b>{i.rotulo ?? k}</b>
                {i.autor ? <>Foto: {i.autor} ({i.licenca})</> : "Imagem própria"}
                <div>usada em {usos(k)} lugar(es) · <code>{k}</code></div>
                <input type="text" style={{ marginTop: 6, minHeight: 36, fontSize: 13 }} placeholder="Nova busca no Wikimedia…" value={i.busca ?? ""} onChange={(e) => alterar((x) => { x.imagens![k].busca = e.target.value || undefined; }, `busca${k}`)} />
                <div className="linha" style={{ marginTop: 6 }}>
                  <button className="btn mini cresce" onClick={() => escolherFoto(k)}>📷 Minha foto</button>
                  {i.pagina && <a className="btn mini" href={i.pagina} target="_blank" rel="noreferrer" aria-label="Página da imagem">↗</a>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn largo" style={{ marginTop: 12 }} onClick={() => {
        const chave = prompt("Nome curto da imagem (ex.: congresso):")?.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
        if (!chave) return;
        const busca = prompt("O que buscar no Wikimedia Commons? (ou deixe vazio para usar uma foto sua)") ?? "";
        alterar((x) => { (x.imagens ??= {})[chave] = { arquivo: "", rotulo: chave, busca: busca || undefined }; });
      }}>+ Nova imagem</button>
    </div>
  );
};
