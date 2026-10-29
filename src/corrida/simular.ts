// Simulação do modo "corrida": calculada quadro a quadro a partir das regras (a mesma na prévia e no render).
import { Corrida, PistaCorrida, RegraPista } from "../tipos";

export const VIAGEM = 0.3; // segundos que a massa de bolinhas leva de uma parede até a próxima
const FOLGA_FIM = 7; // segundos de vídeo depois que a vencedora termina (a física chega ~1–2 s depois do planejado)

// Gerador pseudoaleatório com semente (mulberry32): o mesmo sorteio sempre dá o mesmo vídeo
export const rng = (semente: number) => {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const fmtNum = (n: number) => Math.max(0, Math.ceil(n)).toLocaleString("pt-BR");

// Estado de uma pista num quadro
export type EstadoPista = { parede: number; hp: number; bolas: number; forca: number; viagem: number; fim: number | null };
export type Simulacao = { quadros: EstadoPista[][]; quebras: { pista: number; parede: number; quadro: number }[]; vencedora: number; fimVencedora: number };

const aplicar = (r: RegraPista, s: { bolas: number; forca: number }) => {
  if (r.tipo === "multiplica") s.bolas *= r.valor;
  else if (r.tipo === "forca") s.forca *= r.valor;
  else s.bolas += r.valor;
};

// Roda a corrida com a escala de dano k (dano por segundo = bolas × força × k)
const rodar = (c: Corrida, k: number, fps: number, total: number, guardar: boolean) => {
  const dt = 1 / fps;
  const st = c.pistas.map((p) => ({ parede: 0, hp: c.paredes[0], bolas: p.bolas, forca: p.forca, viagem: 0, fim: null as number | null }));
  const quadros: EstadoPista[][] = [];
  const quebras: Simulacao["quebras"] = [];
  for (let f = 0; f < total; f++) {
    st.forEach((s, i) => {
      if (s.fim !== null) return;
      if (s.viagem < 1) {
        s.viagem = Math.min(1, s.viagem + dt / VIAGEM);
        return;
      }
      s.hp -= s.bolas * s.forca * k * dt;
      if (s.hp > 0) return;
      quebras.push({ pista: i, parede: s.parede, quadro: f });
      aplicar(c.pistas[i].regra, s);
      s.parede++;
      if (s.parede >= c.paredes.length) {
        s.fim = f;
        s.hp = 0;
      } else {
        s.hp = c.paredes[s.parede];
        s.viagem = 0;
      }
    });
    if (guardar) quadros.push(st.map((s) => ({ ...s })));
  }
  const fins = st.map((s) => s.fim ?? Infinity);
  const vencedora = fins.indexOf(Math.min(...fins));
  return { quadros, quebras, vencedora, fimVencedora: fins[vencedora] };
};

// Escala de dano para a vencedora terminar FOLGA_FIM segundos antes do fim do vídeo
const escala = (c: Corrida, fps: number) => {
  const total = Math.round(c.duracao * fps);
  const alvo = total - FOLGA_FIM * fps;
  let lo = -12, hi = 12; // log10 de k
  for (let i = 0; i < 40; i++) {
    const meio = (lo + hi) / 2;
    const r = rodar(c, 10 ** meio, fps, total, false);
    if (r.fimVencedora > alvo) lo = meio; else hi = meio;
  }
  return 10 ** hi;
};

export const simular = (c: Corrida, fps: number): Simulacao => {
  const total = Math.round(c.duracao * fps);
  return rodar(c, escala(c, fps), fps, total, true);
};

// ---------- sorteio de uma corrida ----------
const CORES = ["#B57BFF", "#5BC8FF", "#FFC83D", "#FF6B8B", "#4DFFB0", "#FF9F43"];
const ORDENS = ["thousand", "ten-thousand", "hundred-thousand", "million", "ten-million", "hundred-million", "billion", "ten-billion", "hundred-billion"];
const ordem = (n: number) => ORDENS[Math.max(0, Math.min(ORDENS.length - 1, Math.floor(Math.log10(n)) - 3))];

const pista = (tipo: RegraPista["tipo"], r: () => number, cor: string): PistaCorrida => {
  const pega = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  if (tipo === "multiplica") {
    const v = pega([2, 3, 4]), bolas = pega([100, 200, 300, 500]);
    return { nome: `×${v} BALLS`, desc: `starts with ${fmtNum(bolas)}`, cor, bolas, forca: 1, regra: { tipo, valor: v } };
  }
  if (tipo === "forca") {
    const v = pega([10, 20, 30]);
    return { nome: `×${v} POWER`, desc: `one ball · hit ×${v}`, cor, bolas: 1, forca: 1, regra: { tipo, valor: v } };
  }
  const v = pega([5000, 10000, 50000]);
  return { nome: `+${fmtNum(v)} BALLS`, desc: `+${fmtNum(v)} every wall`, cor, bolas: v, forca: 1, regra: { tipo, valor: v } };
};

// Nota de "emoção": a liderança troca de mãos e a última não fica para trás demais quando a vencedora termina
const emocao = (c: Corrida) => {
  const s = simular({ ...c, duracao: 30 }, 10);
  const prog = (e: EstadoPista) => (e.fim !== null ? c.paredes.length : e.parede + (e.viagem < 1 ? 0 : 1 - e.hp / c.paredes[e.parede]));
  let trocas = 0, lider = -1;
  s.quadros.forEach((q, f) => {
    if (f < 20) return;
    const p = q.map(prog), l = p.indexOf(Math.max(...p));
    if (lider >= 0 && l !== lider) trocas++;
    lider = l;
  });
  const fim = s.quadros[Math.min(s.quadros.length - 1, s.fimVencedora)];
  const ultima = Math.min(...fim.map(prog)) / c.paredes.length;
  return Math.min(trocas, 4) + (ultima > 0.4 ? 2 : 0) + (s.vencedora !== 0 ? 1 : 0);
};

export const sortearCorrida = (semente = Math.floor(Math.random() * 1e9), canal = "@seucanal", duracao = 45): Corrida => {
  let melhor: Corrida | null = null, nota = -1;
  for (let t = 0; t < 30 && nota < 6; t++) {
    const r = rng(semente + t * 7919);
    const tipos: RegraPista["tipo"][] = ["multiplica", "forca", "soma"].sort(() => r() - 0.5) as RegraPista["tipo"][];
    const cores = [...CORES].sort(() => r() - 0.5);
    const base = Math.round(800 + r() * 1200), cresce = 4.5 + r() * 1.2;
    const paredes = Array.from({ length: 8 }, (_, i) => Math.round(base * cresce ** i));
    const c: Corrida = {
      titulo: "MEGA RACE · 3 LANES", subtitulo: `${ordem(paredes[paredes.length - 1])}-HP walls`, canal, duracao,
      paredes, pistas: tipos.map((tp, i) => pista(tp, r, cores[i])), semente: semente + t * 7919, musica: true,
    };
    const n = emocao(c);
    if (n > nota) { melhor = c; nota = n; }
  }
  return melhor!;
};
