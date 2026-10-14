// Converte um Projeto numa linha do tempo em frames (a mesma na prévia e no render).
import { Corte, ElementoCena, Palavra, Projeto } from "./tipos";

export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
const FOLGA_INICIO = 2; // frames antes da voz começar (entra a transição)
const FOLGA_FIM = 0.18; // respiro depois da última palavra

export type PalavraTempo = { p: string; ini: number; fim: number; destaque?: boolean; idx: number; cena?: number }; // frames na saída
export type ElementoTempo = ElementoCena & { entra: number; sai: number; indice: number }; // frames relativos à cena
export type CenaTempo = {
  id: string;
  indice: number;
  inicio: number;
  duracao: number;
  texto: string;
  audio?: string;
  fundo?: string;
  fontes: string[];
  palavras: PalavraTempo[]; // frames relativos à cena
  elementos: ElementoTempo[];
};
// Trecho do vídeo bruto que fica no resultado
export type Trecho = { ini: number; fim: number; saida: number }; // ini/fim no original (s), saida no resultado (s)

export type LinhaTempo = {
  duracao: number; // frames
  palavras: PalavraTempo[]; // frames absolutos na saída (legenda)
  cenas: CenaTempo[]; // modo IA
  trechos: Trecho[]; // modo bruto
  // tempo do conteúdo (s) → frame na saída (null se o instante foi cortado)
  paraSaida: (t: number) => number | null;
  // frame na saída → tempo do conteúdo (s)
  paraConteudo: (frame: number) => number;
};

export const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ªº]/g, "");

const acharPalavra = (palavras: PalavraTempo[], alvo: string | number | undefined) => {
  if (alvo === undefined) return 0;
  if (typeof alvo === "number") return palavras[alvo]?.ini ?? 0;
  const n = normalizar(alvo);
  const w =
    palavras.find((x) => normalizar(x.p) === n) ??
    palavras.find((x) => normalizar(x.p).startsWith(n)) ??
    palavras.find((x) => normalizar(x.p).includes(n));
  return w ? Math.max(0, w.ini - 3) : 0;
};

// Junta cortes sobrepostos e devolve os trechos mantidos
export const calcularTrechos = (duracao: number, cortes: Corte[] = []): Trecho[] => {
  const cs = cortes
    .map((c) => ({ i: Math.max(0, Math.min(c.i, c.f)), f: Math.min(duracao, Math.max(c.i, c.f)) }))
    .filter((c) => c.f - c.i > 0.01)
    .sort((a, b) => a.i - b.i);
  const juntos: { i: number; f: number }[] = [];
  for (const c of cs) {
    const u = juntos[juntos.length - 1];
    if (u && c.i <= u.f) u.f = Math.max(u.f, c.f);
    else juntos.push({ ...c });
  }
  const trechos: Trecho[] = [];
  let pos = 0;
  let saida = 0;
  for (const c of juntos) {
    if (c.i - pos > 0.04) {
      trechos.push({ ini: pos, fim: c.i, saida });
      saida += c.i - pos;
    }
    pos = c.f;
  }
  if (duracao - pos > 0.04) trechos.push({ ini: pos, fim: duracao, saida });
  return trechos;
};

const linhaBruto = (p: Projeto): LinhaTempo => {
  const dur = p.video?.duracao ?? 0;
  const trechos = calcularTrechos(dur, p.cortes);
  const paraSaidaSeg = (t: number) => {
    for (const tr of trechos) if (t >= tr.ini && t < tr.fim) return tr.saida + (t - tr.ini);
    return null;
  };
  const totalSeg = trechos.reduce((s, t) => s + (t.fim - t.ini), 0);
  const palavras: PalavraTempo[] = [];
  (p.palavras ?? []).forEach((w: Palavra, idx) => {
    if (!w.p.trim()) return; // palavra escondida
    const meio = (w.i + w.f) / 2;
    const ini = paraSaidaSeg(w.i) ?? paraSaidaSeg(meio);
    if (ini === null) return; // palavra cortada
    const fim = paraSaidaSeg(Math.max(w.i, w.f - 0.001)) ?? ini + (w.f - w.i);
    palavras.push({ p: w.p, ini: Math.round(ini * FPS), fim: Math.max(Math.round(ini * FPS) + 1, Math.round(fim * FPS)), destaque: w.destaque, idx });
  });
  return {
    duracao: Math.max(1, Math.round(totalSeg * FPS)),
    palavras,
    cenas: [],
    trechos,
    paraSaida: (t) => {
      const s = paraSaidaSeg(t);
      return s === null ? null : Math.round(s * FPS);
    },
    paraConteudo: (frame) => {
      const s = frame / FPS;
      for (const tr of trechos) if (s >= tr.saida && s < tr.saida + (tr.fim - tr.ini)) return tr.ini + (s - tr.saida);
      const u = trechos[trechos.length - 1];
      return u ? u.fim : 0;
    },
  };
};

const linhaIA = (p: Projeto): LinhaTempo => {
  let cursor = 0;
  const cenas: CenaTempo[] = (p.cenas ?? []).map((c, indice) => {
    const n = p.narracao?.[c.id];
    const fala = n?.palavras?.length ? Math.min(n.duracao, n.palavras[n.palavras.length - 1].f) : n?.duracao;
    const durSeg = n ? (fala ?? 0) + FOLGA_FIM : Math.max(3, c.texto.split(/\s+/).length / 2.8);
    const duracao = Math.ceil(durSeg * FPS) + FOLGA_INICIO;
    // sem narração ainda: palavras estimadas pelo texto, para a prévia já mostrar a legenda
    const fonte: Palavra[] = n?.palavras?.length
      ? n.palavras
      : c.texto.split(/\s+/).filter(Boolean).map((t, i, arr) => ({ p: t.replace(/[.,!?;:]+$/, ""), i: (i * durSeg) / arr.length, f: ((i + 0.9) * durSeg) / arr.length }));
    const palavras: PalavraTempo[] = fonte
      .map((w, idx) => ({
        p: w.p, destaque: w.destaque, idx, cena: indice,
        ini: Math.round(w.i * FPS) + FOLGA_INICIO,
        fim: Math.round(w.f * FPS) + FOLGA_INICIO,
      }))
      .filter((w) => w.p.trim()); // palavras escondidas na legenda
    const base = (c.elementos ?? []).map((e, i) => ({ ...e, indice: i, entra: acharPalavra(palavras, e.em), sai: duracao }));
    // um elemento sai quando outro (não-carimbo) ocupa a mesma posição
    for (const e of base) {
      const prox = base
        .filter((o) => o !== e && (o.posicao ?? "alto") === (e.posicao ?? "alto") && o.tipo !== "carimbo" && o.entra > e.entra)
        .sort((a, b) => a.entra - b.entra)[0];
      if (prox) e.sai = prox.entra;
    }
    const cena: CenaTempo = {
      id: c.id, indice, inicio: cursor, duracao, texto: c.texto, audio: n?.audio,
      fundo: c.fundo, fontes: c.fontes ?? [], palavras, elementos: base,
    };
    cursor += duracao;
    return cena;
  });
  const duracao = Math.max(1, cursor);
  return {
    duracao,
    palavras: cenas.flatMap((c) => c.palavras.map((w) => ({ ...w, ini: w.ini + c.inicio, fim: w.fim + c.inicio }))),
    cenas,
    trechos: [],
    paraSaida: (t) => Math.round(t * FPS),
    paraConteudo: (frame) => frame / FPS,
  };
};

// Duração extra no fim para a enquete final
export const framesEnquete = (p: Projeto) => (p.efeitos.enquete ? Math.round(p.efeitos.enquete.dur * FPS) : 0);

export const montarLinha = (p: Projeto): LinhaTempo => {
  const l = p.modo === "bruto" ? linhaBruto(p) : linhaIA(p);
  return { ...l, duracao: l.duracao + framesEnquete(p) };
};
