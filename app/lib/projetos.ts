// Projetos: rascunho no aparelho + cópia oficial no GitHub (projetos/<id>/projeto.json).
import { EFEITOS_PADRAO, LEGENDA_PADRAO, Projeto } from "../../src/tipos";
import { EstiloPronto } from "../estilos";
import demoBruto from "../demos/demo-bruto.json";
import demoIA from "../demos/demo-ia.json";
import * as gh from "./github";
import { local } from "./local";

export const DEMOS: Record<string, Projeto> = {
  "demo-bruto": demoBruto as unknown as Projeto,
  "demo-ia": demoIA as unknown as Projeto,
};
export const ehDemo = (id: string) => id in DEMOS;

const pasta = (id: string) => `projetos/${id}`;

// ---------- alterações ainda não enviadas ----------
const CHAVE_SUJOS = "estudio-reels:sujos";
const lerSujos = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SUJOS) || "{}");
  } catch {
    return {};
  }
};
const gravarSujos = (s: Record<string, string[]>) => {
  try {
    localStorage.setItem(CHAVE_SUJOS, JSON.stringify(s));
  } catch {}
};
export const estaSujo = (id: string) => id in lerSujos();
export const marcarSujo = (id: string, arquivoPendente?: string) => {
  const s = lerSujos();
  const lista = s[id] ?? [];
  if (arquivoPendente && !lista.includes(arquivoPendente)) lista.push(arquivoPendente);
  s[id] = lista;
  gravarSujos(s);
};
const limparSujo = (id: string) => {
  const s = lerSujos();
  delete s[id];
  gravarSujos(s);
};

// ---------- lista ----------
export type ItemLista = { id: string; titulo: string; modo: Projeto["modo"]; status?: string; atualizadoEm: string; noGitHub: boolean; noAparelho: boolean };

export const listarProjetos = async (aoAtualizar: (l: ItemLista[]) => void) => {
  const mapa = new Map<string, ItemLista>();
  const emitir = () => aoAtualizar([...mapa.values()].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)));
  for (const p of await local.projetos()) {
    if (ehDemo(p.id)) continue;
    mapa.set(p.id, { id: p.id, titulo: p.titulo, modo: p.modo, status: p.status, atualizadoEm: p.atualizadoEm, noGitHub: false, noAparelho: true });
  }
  emitir();
  if (!gh.temToken()) return;
  const pastas = (await gh.listarPasta("projetos")).filter((x) => x.type === "dir");
  await Promise.all(
    pastas.map(async (d) => {
      try {
        const p = await gh.lerJSON<Projeto>(`${d.path}/projeto.json`);
        const l = mapa.get(p.id);
        const usarLocal = l && estaSujo(p.id);
        mapa.set(p.id, {
          id: p.id, titulo: usarLocal ? l!.titulo : p.titulo, modo: p.modo, status: p.status,
          atualizadoEm: usarLocal ? l!.atualizadoEm : p.atualizadoEm, noGitHub: true, noAparelho: !!l,
        });
      } catch {
        mapa.set(d.name, { id: d.name, titulo: d.name, modo: "bruto", status: "processando", atualizadoEm: "", noGitHub: true, noAparelho: false });
      }
    })
  );
  emitir();
};

// ---------- abrir / salvar ----------
export const carregarProjeto = async (id: string): Promise<{ projeto: Projeto; origem: "demo" | "aparelho" | "github" }> => {
  if (ehDemo(id)) {
    const salvo = await local.projeto(id);
    return { projeto: salvo ?? structuredClone(DEMOS[id]), origem: "demo" };
  }
  const doAparelho = await local.projeto(id);
  if (doAparelho && (estaSujo(id) || !gh.temToken())) return { projeto: doAparelho, origem: "aparelho" };
  try {
    const remoto = await gh.lerJSON<Projeto>(`${pasta(id)}/projeto.json`);
    await local.salvarProjeto(remoto);
    return { projeto: remoto, origem: "github" };
  } catch (e) {
    if (doAparelho) return { projeto: doAparelho, origem: "aparelho" };
    throw e;
  }
};

export const recarregarDoGitHub = async (id: string) => {
  limparSujo(id);
  return carregarProjeto(id);
};

export const salvarRascunho = async (p: Projeto) => {
  await local.salvarProjeto(p);
  marcarSujo(p.id);
};

export const salvarNoGitHub = async (p: Projeto, aviso?: (msg: string) => void) => {
  if (ehDemo(p.id)) throw new Error("Exemplos não vão para o GitHub. Crie um projeto seu para exportar.");
  const pendentes = lerSujos()[p.id] ?? [];
  for (const caminho of pendentes) {
    const b = await local.arquivo(p.id, caminho);
    if (!b) continue;
    aviso?.(`Enviando ${caminho}…`);
    await gh.salvarArquivo(`${pasta(p.id)}/${caminho}`, b, `Estúdio: ${p.id}/${caminho}`);
  }
  aviso?.("Salvando projeto…");
  const final = { ...p, atualizadoEm: new Date().toISOString() };
  await gh.salvarArquivo(`${pasta(p.id)}/projeto.json`, JSON.stringify(final, null, 1) + "\n", `Estúdio: salva ${p.titulo}`);
  await local.salvarProjeto(final);
  limparSujo(p.id);
  return final;
};

export const apagarDoAparelho = async (id: string) => {
  await local.apagarProjeto(id);
  limparSujo(id);
};

// ---------- criar ----------
export const novoIdProjeto = (prefixo: string) => {
  const d = new Date();
  const data = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefixo}-${data}-${Math.random().toString(36).slice(2, 6)}`;
};

export type MetaVideo = { duracao: number; largura: number; altura: number };

export const projetoBruto = (id: string, titulo: string, estilo: EstiloPronto, meta: MetaVideo, opcoes: Projeto["processamento"]): Projeto => {
  const agora = new Date().toISOString();
  return {
    versao: 1, id, titulo, modo: "bruto", estilo: estilo.id, tema: estilo.tema, criadoEm: agora, atualizadoEm: agora, status: "processando",
    legenda: { ...LEGENDA_PADRAO, ...estilo.legenda },
    efeitos: { ...structuredClone(EFEITOS_PADRAO), ...structuredClone(estilo.efeitos ?? {}) },
    video: { arquivo: "video.mp4", duracao: meta.duracao, largura: meta.largura, altura: meta.altura, enquadramento: "preencher", focoX: 50, volume: 1, ...(estilo.video ?? {}) },
    palavras: [],
    cortes: [],
    processamento: { ...opcoes, workflow: "processar-bruto.yml" },
  };
};

// Envia o vídeo, salva o projeto e pede a transcrição. "tocavel": o navegador consegue tocar o original.
export const criarBruto = async (p: Projeto, arquivo: File, tocavel: boolean, fase: (texto: string, fracao?: number) => void) => {
  p.processamento = { ...p.processamento, pedidoEm: new Date().toISOString() };
  await local.salvarProjeto(p);
  if (tocavel) await local.salvarArquivo(p.id, p.video!.arquivo, arquivo);
  fase("Enviando o vídeo", 0);
  await gh.enviarEmPartes(`envio/${p.id}`, arquivo, { nome: arquivo.name, tipo: arquivo.type }, (f) => fase("Enviando o vídeo", f));
  fase("Salvando o projeto");
  await salvarNoGitHub(p);
  fase("Pedindo a transcrição");
  await gh.dispararWorkflow("processar-bruto.yml", { projeto: p.id, modelo: p.processamento?.modelo ?? "medium", ia: String(p.processamento?.ia ?? true), etapa: "tudo" });
};

export type PedidoIA = { tema: string; tom: string; duracao: number };

export const projetoIA = (id: string, titulo: string, pedido: PedidoIA, tema: string, voz: string): Projeto => {
  const agora = new Date().toISOString();
  return {
    versao: 1, id, titulo, modo: "ia", estilo: "documentario", tema, criadoEm: agora, atualizadoEm: agora, status: "processando",
    legenda: { ...LEGENDA_PADRAO },
    efeitos: { ...structuredClone(EFEITOS_PADRAO), trilha: true },
    pedido,
    voz: { edge: voz, velocidade: "+5%" },
    cenas: [],
    narracao: {},
    imagens: {},
    processamento: { workflow: "gerar-ia.yml", pedidoEm: agora },
  };
};

export const criarIA = async (p: Projeto) => {
  await local.salvarProjeto(p);
  await salvarNoGitHub(p);
  await gh.dispararWorkflow("gerar-ia.yml", { projeto: p.id });
};

// Modo 1: voz das cenas editadas + imagens pedidas (Action atualizar-ia.yml)
export const pedirAtualizacaoIA = async (p: Projeto, aviso?: (m: string) => void): Promise<Projeto> => {
  const novo: Projeto = { ...p, status: "processando", processamento: { ...p.processamento, workflow: "atualizar-ia.yml", pedidoEm: new Date().toISOString(), erro: undefined } };
  const salvo = await salvarNoGitHub(novo, aviso);
  aviso?.("Pedindo voz e imagens ao GitHub…");
  await gh.dispararWorkflow("atualizar-ia.yml", { projeto: p.id });
  return salvo;
};

// Depois que uma Action termina: traz o que ela gerou sem perder o que você mudou no aparelho
const GERADOS = ["video", "palavras", "gancho", "cenas", "narracao", "imagens", "fontesPesquisa", "voz", "sugestoes", "status", "processamento"] as const;
export const trazerResultado = async (atual: Projeto): Promise<Projeto> => {
  const remoto = await gh.lerJSON<Projeto>(`${pasta(atual.id)}/projeto.json`);
  const novo: Projeto = structuredClone(atual);
  for (const k of GERADOS) (novo as any)[k] = (remoto as any)[k];
  // o processamento do vídeo bruto (e as sugestões da IA) refaz cortes e efeitos
  if (!atual.cortes?.length || atual.modo === "bruto") novo.cortes = remoto.cortes;
  if (atual.modo === "bruto") {
    novo.efeitos = remoto.efeitos;
    novo.titulo = remoto.titulo;
  }
  if (atual.modo === "ia" && remoto.titulo) novo.titulo = remoto.titulo;
  novo.atualizadoEm = remoto.atualizadoEm;
  // arquivos baixados antes podem ter mudado (voz nova, imagem nova): limpa o cache deste projeto
  const pendentes = lerSujos()[atual.id] ?? [];
  await local.limparCache(atual.id, [atual.video?.arquivo ?? "", ...pendentes].filter(Boolean));
  for (const chave of [...urls.keys()]) if (chave.startsWith(`${atual.id}/`) && !chave.endsWith(`/${atual.video?.arquivo}`)) esquecerUrl(atual.id, chave.slice(atual.id.length + 1));
  await local.salvarProjeto(novo);
  if (!estaSujo(atual.id) || JSON.stringify(atual) === JSON.stringify(novo)) limparSujo(atual.id);
  return novo;
};

// ---------- arquivos (áudio, imagens, vídeo) para a prévia ----------
const urls = new Map<string, string>();

const urlDe = async (id: string, caminho: string, doGitHub = true): Promise<string | null> => {
  const chave = `${id}/${caminho}`;
  if (urls.has(chave)) return urls.get(chave)!;
  let b = await local.arquivo(id, caminho);
  if (!b && doGitHub && gh.temToken()) {
    try {
      b = await gh.lerBlob(`${pasta(id)}/${caminho}`);
      await local.salvarArquivo(id, caminho, b);
    } catch {
      return null;
    }
  }
  if (!b) return null;
  const u = URL.createObjectURL(b);
  urls.set(chave, u);
  return u;
};

export const esquecerUrl = (id: string, caminho: string) => {
  const chave = `${id}/${caminho}`;
  const u = urls.get(chave);
  if (u) URL.revokeObjectURL(u);
  urls.delete(chave);
};

// Monta o mapa caminho → URL local. Exemplos usam os arquivos do próprio site (sem mapa).
export const carregarArquivos = async (p: Projeto, aoAtualizar: (m: Record<string, string>) => void) => {
  if (ehDemo(p.id)) return;
  const mapa: Record<string, string> = {};
  const caminhos = new Set<string>();
  if (p.modo === "bruto" && p.video) {
    // vídeo original deste aparelho; senão a versão leve gerada pela Action
    const original = await urlDe(p.id, p.video.arquivo, false);
    const u = original ?? (p.video.previa ? await urlDe(p.id, p.video.previa) : null);
    if (u) mapa[p.video.arquivo] = u;
    aoAtualizar({ ...mapa });
  }
  for (const n of Object.values(p.narracao ?? {})) caminhos.add(n.audio);
  for (const i of Object.values(p.imagens ?? {})) caminhos.add(i.arquivo);
  await Promise.all(
    [...caminhos].map(async (c) => {
      const u = await urlDe(p.id, c);
      if (u) {
        mapa[c] = u;
        aoAtualizar({ ...mapa });
      }
    })
  );
};

// ---------- exportar ----------
export const TAG_EXPORTES = "exportes";

export const exportar = async (p: Projeto, aviso: (m: string) => void) => {
  await salvarNoGitHub(p, aviso);
  aviso("Pedindo o render ao GitHub Actions…");
  return gh.dispararEAchar("exportar.yml", { projeto: p.id }, p.id);
};

export const listarExportes = async (id: string) => {
  const r = await gh.release(TAG_EXPORTES);
  return (r?.assets ?? []).filter((a) => a.name.startsWith(`${id}--`)).sort((a, b) => b.created_at.localeCompare(a.created_at));
};
