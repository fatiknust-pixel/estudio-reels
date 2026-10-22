import React, { useRef, useState } from "react";
import { FONTES } from "../../src/fontes";
import { TEMAS } from "../../src/temas";
import CATALOGO from "../../src/estilos-ia.json";
import { EstiloIA, LEGENDA_CINEMA, LEGENDA_PADRAO, LEGENDA_REELS } from "../../src/tipos";
import { anexarFundo, consultarFundo, LEGENDA_HORIZONTAL, lerMetaVideo } from "../lib/projetos";
import { ESTILOS } from "../estilos";
import { DINAMICAS } from "../estilosIA";
import { Alternar, avisar, avisarErro, Deslizar, Escolha } from "../ui";
import { useEditor } from "./contexto";

const ESTILO_IA_PADRAO: EstiloIA = { dinamica: "padrao", transicao: "faixas", fundo: "grade" };

const CORES = ["#FFFFFF", "#FFD60A", "#30D158", "#00F5A0", "#0A84FF", "#FF3B30", "#FF2E88", "#BF5AF2", "#FF9F0A", "#111111"];

const Cores: React.FC<{ valor: string; mudar: (c: string) => void }> = ({ valor, mudar }) => (
  <div className="cores">
    {CORES.map((c) => (
      <button key={c} className={"cor" + (c.toLowerCase() === valor.toLowerCase() ? " on" : "")} style={{ background: c }} aria-label={c} onClick={() => mudar(c)} />
    ))}
    <input type="color" value={valor} onChange={(e) => mudar(e.target.value)} aria-label="Outra cor" />
  </div>
);

// Gameplay (ou outro vídeo) rodando no fundo do Modo 1; as fotos entram por cima como cartões
const FundoGameplay: React.FC = () => {
  const { projeto: p, alterar } = useEditor();
  const entrada = useRef<HTMLInputElement>(null);
  const [fase, setFase] = useState<string | null>(null);
  const g = p.fundoVideo;
  const escolher = async (f?: File) => {
    if (!f) return;
    try {
      const url = URL.createObjectURL(f);
      const meta = await lerMetaVideo(url);
      URL.revokeObjectURL(url);
      const novo = await anexarFundo(p, f, meta, meta.tocavel, (t, fr) => setFase(`${t}${fr !== undefined ? ` ${Math.round(fr * 100)}%` : "…"}`));
      alterar((x) => { x.fundoVideo = novo; });
      avisar("Gameplay enviada ✓ — a Action prepara em 1–3 min");
    } catch (e) {
      avisarErro(e);
    } finally {
      setFase(null);
    }
  };
  const verificar = async () => {
    try {
      const r = await consultarFundo(p);
      if (r) alterar((x) => { x.fundoVideo = { ...x.fundoVideo!, ...r, volume: x.fundoVideo?.volume, inicio: x.fundoVideo?.inicio, erro: r.erro ?? undefined }; });
      avisar(r?.pronto ? "Gameplay pronta ✓" : r?.erro ? "A gameplay deu erro" : "Ainda preparando…");
    } catch (e) {
      avisarErro(e);
    }
  };
  return (
    <>
      <h3>Gameplay no fundo</h3>
      <input ref={entrada} type="file" accept="video/*" hidden onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = ""; }} />
      {g && (
        <>
          <p className="pequeno suave" style={{ marginTop: 0 }}>
            {g.erro ? `⚠️ ${g.erro}` : g.pronto ? `✓ Pronta (${Math.round(g.duracao)} s, repete até o fim do vídeo)` : "⏳ Preparando (a prévia aparece quando a Action terminar)"}
          </p>
          <Deslizar rotulo="Volume da gameplay" valor={Math.round((g.volume ?? 0) * 100)} min={0} max={100} mudar={(v) => alterar((x) => { x.fundoVideo!.volume = v / 100; }, "vol-fundo")} fmt={(v) => (v ? `${v}%` : "sem som")} />
        </>
      )}
      <div className="linha">
        <button className="btn cresce" disabled={!!fase} onClick={() => entrada.current?.click()}>{fase ?? (g ? "🎮 Trocar gameplay" : "🎮 Escolher gameplay")}</button>
        {g && !g.pronto && <button className="btn" onClick={verificar} disabled={!!fase}>Verificar</button>}
        {g && <button className="btn perigo" onClick={() => alterar((x) => { x.fundoVideo = undefined; })} disabled={!!fase}>Tirar</button>}
      </div>
      <p className="pequeno suave">Roda sem som atrás de tudo. As imagens entram por cima como cartões e as animações do Claude ficam por cima. Usa até 10 min do vídeo.</p>
    </>
  );
};

export const PainelEstilo: React.FC = () => {
  const { projeto: p, alterar } = useEditor();
  const L = p.legenda;
  const leg = (k: keyof typeof L, v: any) => alterar((x) => { (x.legenda as any)[k] = v; }, `leg-${k}`);

  return (
    <div>
      {p.modo === "bruto" && (
        <>
          <h3 style={{ marginTop: 0 }}>Estilo pronto</h3>
          <div className="estilos">
            {ESTILOS.map((e) => (
              <button
                key={e.id}
                className={"estilo-op" + (p.estilo === e.id ? " on" : "")}
                disabled={!e.pronto}
                onClick={() =>
                  alterar((x) => {
                    x.estilo = e.id;
                    x.tema = e.tema;
                    x.legenda = { ...x.legenda, modo: "reels", ...e.legenda };
                    x.efeitos = { ...x.efeitos, ...(e.efeitos ?? {}) };
                    if (x.video && e.video) x.video = { ...x.video, ...e.video };
                  })
                }
              >
                <span className="e">{e.emoji}</span>
                <b>{e.nome}</b>
                <small>{e.descricao}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {p.modo === "ia" && (
        <>
          <h3 style={{ marginTop: 0 }}>Dinâmica de edição</h3>
          <div className="estilos">
            {DINAMICAS.map((d) => (
              <button key={d.id} className={"estilo-op" + ((p.estiloIA?.dinamica ?? "padrao") === d.id ? " on" : "")} onClick={() => alterar((x) => { x.estiloIA = { ...ESTILO_IA_PADRAO, ...x.estiloIA, dinamica: d.id as any }; })}>
                <span className="e">{d.emoji}</span>
                <b>{d.nome}</b>
                <small>{d.descricao}</small>
              </button>
            ))}
          </div>
          <label className="campo"><span>Estilo da legenda</span>
            <Escolha opcoes={Object.entries(CATALOGO.legenda).map(([k, v]) => [k, v.nome] as [string, string])} valor={p.estiloIA?.legenda ?? ""} mudar={(v) => alterar((x) => {
              x.estiloIA = { ...ESTILO_IA_PADRAO, ...x.estiloIA, legenda: v as any };
              x.legenda = { ...x.legenda, ...(CATALOGO.legenda as any)[v].preset };
            })} />
          </label>
          <label className="campo"><span>Transição entre cenas</span>
            <Escolha opcoes={Object.entries(CATALOGO.transicao).map(([k, v]) => [k, v.nome] as [string, string])} valor={p.estiloIA?.transicao ?? "faixas"} mudar={(v) => alterar((x) => { x.estiloIA = { ...ESTILO_IA_PADRAO, ...x.estiloIA, transicao: v as any }; })} />
          </label>
          <label className="campo"><span>Fundo animado</span>
            <Escolha opcoes={Object.entries(CATALOGO.fundo).map(([k, v]) => [k, v.nome] as [string, string])} valor={p.estiloIA?.fundo ?? "grade"} mudar={(v) => alterar((x) => { x.estiloIA = { ...ESTILO_IA_PADRAO, ...x.estiloIA, fundo: v as any }; })} />
          </label>
          <label className="campo"><span>Música</span>
            <Escolha opcoes={Object.entries(CATALOGO.musica).map(([k, v]) => [k, v.nome] as [string, string])} valor={p.efeitos.trilha ? p.efeitos.musica ?? "tensao" : "nenhuma"} mudar={(v) => alterar((x) => {
              if (v === "nenhuma") x.efeitos.trilha = false;
              else Object.assign(x.efeitos, { trilha: true, musica: v });
            })} />
          </label>
        </>
      )}

      <h3>Formato do vídeo</h3>
      <Escolha
        opcoes={[["9:16", "📱 Vertical 9:16"], ["16:9", "🖥️ Horizontal 16:9"]]}
        valor={p.formato ?? "9:16"}
        mudar={(v) => alterar((x) => {
          if ((x.formato ?? "9:16") === v) return;
          x.formato = v as "9:16" | "16:9";
          // ajusta a legenda ao novo quadro
          if (x.legenda.modo !== "cinema") Object.assign(x.legenda, v === "16:9" ? LEGENDA_HORIZONTAL : { posicao: LEGENDA_PADRAO.posicao, tamanho: Math.max(x.legenda.tamanho, LEGENDA_PADRAO.tamanho) });
        })}
      />
      <p className="pequeno suave">Vertical para Reels, TikTok e Shorts; horizontal para YouTube. A prévia e o MP4 exportado seguem o formato.</p>

      <h3>Tema de cores</h3>
      <div className="temas">
        {Object.entries(TEMAS).map(([k, t]) => (
          <button key={k} className={"tema" + (p.tema === k ? " on" : "")} onClick={() => alterar((x) => { x.tema = k; })}>
            <span className="pinta"><i style={{ background: t.fundo }} /><i style={{ background: t.brilhoA }} /><i style={{ background: t.destaque }} /></span>
            {t.nome}
          </button>
        ))}
      </div>

      {p.modo === "ia" && p.visual !== "aula" && <FundoGameplay />}

      <h3>Legenda</h3>
      <Alternar rotulo="Mostrar legenda" valor={L.mostrar} mudar={(v) => leg("mostrar", v)} />
      <label className="campo"><span>Tipo de legenda</span>
        <Escolha opcoes={[["reels", "Palavra por palavra"], ["cinema", "Filme e série (embaixo)"]]} valor={L.modo ?? "reels"} mudar={(v) => alterar((x) => {
          Object.assign(x.legenda, v === "cinema" ? LEGENDA_CINEMA : LEGENDA_REELS(x.formato === "16:9"));
        })} />
      </label>
      <label className="campo"><span>Fonte</span></label>
      <div className="fontes-esc">
        {Object.entries(FONTES).map(([k, f]) => (
          <button key={k} className={"fonte-op" + (L.fonte === k ? " on" : "")} style={{ fontFamily: `'${f.familia}'`, fontWeight: f.peso }} onClick={() => leg("fonte", k)}>
            {f.nome}
          </button>
        ))}
      </div>
      <label className="campo"><span>Cor do texto</span><Cores valor={L.cor} mudar={(c) => leg("cor", c)} /></label>
      <label className="campo"><span>Cor do destaque (palavra falada e palavras ⭐)</span><Cores valor={L.corDestaque} mudar={(c) => leg("corDestaque", c)} /></label>
      <Deslizar rotulo="Palavras por tela" valor={L.palavrasPorTela} min={1} max={8} mudar={(v) => leg("palavrasPorTela", v)} />
      <Deslizar rotulo="Tamanho" valor={L.tamanho} min={48} max={160} mudar={(v) => leg("tamanho", v)} />
      <Deslizar rotulo="Posição na tela" valor={L.posicao} min={15} max={88} mudar={(v) => leg("posicao", v)} fmt={(v) => (v < 35 ? "alto" : v < 60 ? "meio" : "baixo") + ` (${v}%)`} />
      <Deslizar rotulo="Contorno" valor={L.contorno} min={0} max={20} mudar={(v) => leg("contorno", v)} />
      <label className="campo"><span>Fundo</span>
        <Escolha opcoes={[["nenhum", "Nenhum"], ["caixa", "Caixa"], ["palavra", "Palavra ativa"]]} valor={L.fundo} mudar={(v) => leg("fundo", v)} />
      </label>
      <label className="campo"><span>Animação</span>
        <Escolha opcoes={[["pop", "Pop"], ["subir", "Subir"], ["nenhuma", "Nenhuma"]]} valor={L.animacao} mudar={(v) => leg("animacao", v)} />
      </label>
      <Alternar rotulo="LETRAS MAIÚSCULAS" valor={L.maiusculas} mudar={(v) => leg("maiusculas", v)} />

      {p.modo === "bruto" && p.video && (
        <>
          <h3>Vídeo</h3>
          <label className="campo"><span>Enquadramento (quando o vídeo e o quadro têm orientações diferentes)</span>
            <Escolha opcoes={[["preencher", `Preencher ${p.formato === "16:9" ? "16:9" : "9:16"}`], ["ajustar", "Inteiro + fundo desfocado"]]} valor={p.video.enquadramento} mudar={(v) => alterar((x) => { x.video!.enquadramento = v; })} />
          </label>
          {p.video.enquadramento === "preencher" && !!p.video.foco?.length && (
            <Alternar rotulo="Seguir o rosto automaticamente" valor={p.video.seguirRosto !== false} mudar={(v) => alterar((x) => { x.video!.seguirRosto = v; })} />
          )}
          {p.video.enquadramento === "preencher" && p.video.largura > p.video.altura * (p.formato === "16:9" ? 1.78 : 0.75) && (p.video.seguirRosto === false || !p.video.foco?.length) && (
            <Deslizar rotulo="Foco horizontal" valor={p.video.focoX} min={0} max={100} mudar={(v) => alterar((x) => { x.video!.focoX = v; }, "foco")} fmt={(v) => `${v}%`} />
          )}
          <Deslizar rotulo="Volume do vídeo" valor={Math.round(p.video.volume * 100)} min={0} max={150} mudar={(v) => alterar((x) => { x.video!.volume = v / 100; }, "vol")} fmt={(v) => `${v}%`} />
        </>
      )}
    </div>
  );
};
