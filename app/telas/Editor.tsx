import { Player, PlayerRef } from "@remotion/player";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Composicao } from "../../src/Composicao";
import { FPS, montarLinha, quadroDe } from "../../src/linhaTempo";
import { Projeto } from "../../src/tipos";
import { EditorCtx, ProvedorEditor, useEditor, useFrame, useTocando } from "../editor/contexto";
import { PainelCenas } from "../editor/PainelCenas";
import { PainelCortes } from "../editor/PainelCortes";
import { PainelEfeitos } from "../editor/PainelEfeitos";
import { PainelEstilo } from "../editor/PainelEstilo";
import { PainelExportar } from "../editor/PainelExportar";
import { PainelImagens } from "../editor/PainelImagens";
import { PainelIA } from "../editor/PainelIA";
import { PainelLegendas } from "../editor/PainelLegendas";
import { Processamento } from "../editor/Processamento";
import { arquivoProjeto } from "../../src/arquivos";
import { local } from "../lib/local";
import { carregarArquivos, carregarProjeto, ehDemo, esquecerUrl, marcarSujo, enviarNarracao, pedirAtualizacaoIA, recarregarDoGitHub, salvarNoGitHub, salvarRascunho } from "../lib/projetos";
import { avisar, avisarErro, fmtTempo, ir } from "../ui";

type Aba = "cenas" | "legendas" | "estilo" | "efeitos" | "cortes" | "imagens" | "ia" | "exportar";
const NOMES: Record<Aba, string> = {
  ia: "IA",
  cenas: "Cenas", legendas: "Legendas", estilo: "Estilo", efeitos: "Efeitos", cortes: "Cortes", imagens: "Imagens", exportar: "Exportar",
};

// Histórico para desfazer/refazer
const useHistorico = () => {
  const [estado, setEstado] = useState<{ passado: Projeto[]; atual: Projeto | null; futuro: Projeto[]; chave?: string; quando: number }>({ passado: [], atual: null, futuro: [], quando: 0 });
  const iniciar = useCallback((p: Projeto) => setEstado({ passado: [], atual: p, futuro: [], quando: 0 }), []);
  const alterar = useCallback((f: (p: Projeto) => void, chave?: string) => {
    setEstado((s) => {
      if (!s.atual) return s;
      const novo = structuredClone(s.atual);
      f(novo);
      const agora = Date.now();
      const juntar = chave && s.chave === chave && agora - s.quando < 1200;
      return { passado: juntar ? s.passado : [...s.passado.slice(-60), s.atual], atual: novo, futuro: [], chave, quando: agora };
    });
  }, []);
  const desfazer = () => setEstado((s) => (s.passado.length ? { passado: s.passado.slice(0, -1), atual: s.passado[s.passado.length - 1], futuro: [s.atual!, ...s.futuro], quando: 0 } : s));
  const refazer = () => setEstado((s) => (s.futuro.length ? { passado: [...s.passado, s.atual!], atual: s.futuro[0], futuro: s.futuro.slice(1), quando: 0 } : s));
  return { projeto: estado.atual, iniciar, alterar, desfazer, refazer, podeDesfazer: estado.passado.length > 0, podeRefazer: estado.futuro.length > 0 };
};

const Controles: React.FC<{ duracao: number }> = ({ duracao }) => {
  const { player, linha } = useEditor();
  const f = useFrame();
  const tocando = useTocando();
  return (
    <div className="ed-controles">
      <button className="btn icone" aria-label={tocando ? "Pausar" : "Tocar"} onClick={() => player.current?.toggle()}>{tocando
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>}</button>
      <input type="range" min={0} max={duracao - 1} value={f} aria-label="Posição" onChange={(e) => player.current?.seekTo(parseInt(e.target.value))} />
      <span className="tempo" title={`no original: ${fmtTempo(linha.paraConteudo(f))}`}>{fmtTempo(f / FPS)} / {fmtTempo(duracao / FPS, false)}</span>
    </div>
  );
};

export const Editor: React.FC<{ id: string }> = ({ id }) => {
  const h = useHistorico();
  const p = h.projeto;
  const [arquivos, setArquivos] = useState<Record<string, string> | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba | null>(null);
  const [salvando, setSalvando] = useState(false);
  const ref = useRef<PlayerRef>(null);
  const primeiro = useRef(true);
  const demo = ehDemo(id);

  const abrir = useCallback(async (recarregar = false) => {
    try {
      const { projeto } = recarregar ? await recarregarDoGitHub(id) : await carregarProjeto(id);
      primeiro.current = true;
      h.iniciar(projeto);
      setAba((a) => a ?? (projeto.modo === "ia" ? "cenas" : "legendas"));
      if (demo) setArquivos({ __publico: "1" });
      else {
        setArquivos({});
        carregarArquivos(projeto, (m) => setArquivos((a) => ({ ...a, ...m }))).catch(avisarErro);
      }
    } catch (e: any) {
      setErro(e?.message ?? String(e));
    }
  }, [id]);
  useEffect(() => {
    abrir();
  }, [abrir]);

  // rascunho salvo no aparelho a cada alteração
  useEffect(() => {
    if (!p) return;
    if (primeiro.current) {
      primeiro.current = false;
      return;
    }
    const t = setTimeout(() => salvarRascunho(p).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [p]);

  // na aba Cortes a prévia mostra o vídeo original inteiro, com os trechos cortados marcados
  const previa = useMemo(() => {
    if (!p) return null;
    if (aba === "cortes" && p.modo === "bruto") return { ...p, cortes: [], gancho: null, previaCortes: p.cortes ?? [] } as Projeto;
    return p;
  }, [p, aba]);
  const linha = useMemo(() => (previa ? montarLinha(previa) : null), [previa]);
  const props = useMemo(() => (previa ? { projeto: previa, arquivos } : null), [previa, arquivos]);
  const quadro = useMemo(() => (previa ? quadroDe(previa) : null), [previa]);

  if (erro) {
    return (
      <div className="tela">
        <div className="topo"><button className="btn icone chato" onClick={() => ir("/")} aria-label="Voltar">←</button><h1>Projeto</h1></div>
        <div className="aviso erro">Não consegui abrir este projeto: {erro}</div>
      </div>
    );
  }
  if (!p || !linha || !props || !quadro || !aba) return <div className="carregando">Abrindo projeto…</div>;

  const ctx: EditorCtx = {
    projeto: p,
    alterar: h.alterar,
    linha,
    player: ref,
    arquivos,
    urlArquivo: (c) => arquivoProjeto(p.id, c, arquivos),
    definirArquivo: async (caminho, b) => {
      await local.salvarArquivo(p.id, caminho, b);
      if (!demo) marcarSujo(p.id, caminho);
      esquecerUrl(p.id, caminho);
      const u = URL.createObjectURL(b);
      setArquivos((a) => ({ ...(a ?? {}), [caminho]: u }));
    },
    ehDemo: demo,
    atualizarIA: async (mudar) => {
      if (demo) return avisar("No exemplo a voz não é refeita. Crie um projeto seu.", true);
      try {
        const salvo = await pedirAtualizacaoIA(mudar ? { ...p, ...mudar } : p, (m) => avisar(m));
        primeiro.current = true;
        h.iniciar(salvo);
        avisar("Pedido ✓ — a voz nova aparece em ~1 min");
      } catch (e) {
        avisarErro(e);
      }
    },
    enviarNarracao: async (arquivo, fase) => {
      if (demo) return avisar("No exemplo a voz não é trocada. Crie um projeto seu.", true);
      try {
        const salvo = await enviarNarracao(p, arquivo, fase);
        primeiro.current = true;
        h.iniciar(salvo);
        avisar("Narração enviada ✓ — limpar, transcrever e cortar leva ~5 min");
      } catch (e) {
        avisarErro(e);
      }
    },
    tempoAgora: () => linha.paraConteudo(ref.current?.getCurrentFrame() ?? 0),
    irPara: (t, tocar) => {
      let fr = linha.paraSaida(t);
      if (fr === null) {
        const tr = linha.trechos.find((x) => x.ini >= t);
        fr = tr ? Math.round(tr.saida * FPS) : 0;
      }
      ref.current?.seekTo(Math.max(0, Math.min(linha.duracao - 1, fr)));
      if (tocar) ref.current?.play();
    },
    irParaFrame: (fr) => ref.current?.seekTo(Math.max(0, Math.min(linha.duracao - 1, fr))),
  };

  const abas: Aba[] = p.modo === "ia" ? ["cenas", "legendas", "estilo", "efeitos", "imagens", "exportar"] : ["legendas", "estilo", "efeitos", "cortes", "ia", "exportar"];

  const salvar = async () => {
    setSalvando(true);
    try {
      const final = await salvarNoGitHub(p, (m) => avisar(m));
      h.alterar((x) => {
        x.atualizadoEm = final.atualizadoEm;
      });
      avisar("Salvo no GitHub ✓");
    } catch (e) {
      avisarErro(e);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ProvedorEditor value={ctx}>
      <div className="editor">
        <div className="ed-topo">
          <button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")}>←</button>
          <input
            className="titulo"
            style={{ background: "transparent", border: "none", minHeight: 40, padding: "0 4px" }}
            value={p.titulo}
            aria-label="Título do projeto"
            onChange={(e) => h.alterar((x) => { x.titulo = e.target.value; }, "titulo")}
          />
          <button className="btn icone chato" aria-label="Desfazer" disabled={!h.podeDesfazer} onClick={h.desfazer}>↶</button>
          <button className="btn icone chato" aria-label="Refazer" disabled={!h.podeRefazer} onClick={h.refazer}>↷</button>
          {!demo && <button className="btn icone chato" aria-label="Recarregar do GitHub" title="Descartar rascunho e recarregar do GitHub" onClick={() => confirm("Descartar as alterações não salvas e recarregar do GitHub?") && abrir(true)}>⟳</button>}
        </div>
        {!demo && (p.status === "processando" || p.status === "erro") && (
          <Processamento
            projeto={p}
            aoConcluir={(novo) => {
              primeiro.current = true; // não conta como alteração sua
              h.iniciar(novo);
              setArquivos({});
              carregarArquivos(novo, (m) => setArquivos((a) => ({ ...a, ...m }))).catch(avisarErro);
            }}
          />
        )}
        <div className="ed-corpo">
          <div className="ed-previa">
            <div className={quadro.horizontal ? "player horizontal" : "player"}>
              <Player
                ref={ref}
                component={Composicao}
                inputProps={props}
                durationInFrames={linha.duracao}
                fps={FPS}
                compositionWidth={quadro.largura}
                compositionHeight={quadro.altura}
                style={{ width: "100%", height: "100%" }}
                clickToPlay
                doubleClickToFullscreen
                allowFullscreen
                spaceKeyToPlayOrPause
                acknowledgeRemotionLicense
                numberOfSharedAudioTags={30}
              />
            </div>
            <Controles duracao={linha.duracao} />
          </div>
          <div className="ed-lado">
            <div className="abas" role="tablist">
              {abas.map((a) => (
                <button key={a} role="tab" aria-selected={a === aba} className={"aba" + (a === aba ? " on" : "")} onClick={() => setAba(a)}>{NOMES[a]}</button>
              ))}
            </div>
            <div className="painel" role="tabpanel">
              {demo && aba !== "exportar" && <div className="aviso pequeno">Exemplo: mexa à vontade — as mudanças ficam só neste aparelho.</div>}
              {aba === "cenas" && <PainelCenas />}
              {aba === "legendas" && <PainelLegendas />}
              {aba === "estilo" && <PainelEstilo />}
              {aba === "efeitos" && <PainelEfeitos />}
              {aba === "cortes" && <PainelCortes />}
              {aba === "imagens" && <PainelImagens />}
              {aba === "ia" && <PainelIA aoPedir={(salvo) => { primeiro.current = true; h.iniciar(salvo); }} />}
              {aba === "exportar" && <PainelExportar salvar={salvar} />}
            </div>
          </div>
        </div>
        {aba !== "exportar" && !demo && (
          <div className="ed-rodape">
            <button className="btn" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "💾 Salvar"}</button>
            <button className="btn prim" onClick={() => setAba("exportar")}>⬇️ Exportar</button>
          </div>
        )}
      </div>
    </ProvedorEditor>
  );
};
