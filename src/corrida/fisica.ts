// Física das bolinhas do modo "corrida": gravidade, quique na placa, colisão entre bolinhas e com as laterais.
// Calculada uma vez para o vídeo inteiro (determinística: mesma semente → mesmo vídeo, na prévia e no render).
// O ritmo da corrida (quando cada placa quebra) vem de simular.ts; aqui cada batida na placa é que faz a vida cair na tela.
import { Corrida } from "../tipos";
import { rng, Simulacao } from "./simular";

export const MAX_BOLAS = 170; // bolinhas desenhadas por pista (cada uma representa bolas/MAX_BOLAS quando há milhões)
const G = 2600; // gravidade (px/s²)
const PASSOS = 4; // subpassos por quadro
const RESTITUICAO = 0.72;

export type Geometria = { largura: number; altura: number; placas: number[] }; // por pista, em coordenadas locais da pista
export type FisicaPista = {
  pos: Float32Array; // [quadro][bola] → x, y
  n: Uint16Array; // bolinhas visíveis por quadro
  raio: Float32Array; // raio por quadro
  golpes: Uint16Array; // batidas na placa por quadro
  hpTela: Float64Array; // vida mostrada na placa atual (cai a cada batida)
  parede: Uint8Array; // placa atual NA TELA: só quebra quando uma bolinha de fato bate nela
  quebras: number[]; // quadro em que cada placa quebrou na tela
  fim: number | null; // quadro em que a pista terminou na tela
};

export const raioPara = (bolas: number) => (bolas <= 1.5 ? 15 : bolas < 12 ? 11 : bolas < 60 ? 8 : 6.5);

export const fisica = (c: Corrida, sim: Simulacao, geo: Geometria): FisicaPista[] => {
  const Q = sim.quadros.length;
  const h = 1 / 30 / PASSOS;
  return c.pistas.map((_, i) => {
    const r = rng(c.semente * 31 + i * 977);
    const pos = new Float32Array(Q * MAX_BOLAS * 2);
    const n = new Uint16Array(Q), raio = new Float32Array(Q), golpes = new Uint16Array(Q), hpTela = new Float64Array(Q);
    const bx: number[] = [], by: number[] = [], vx: number[] = [], vy: number[] = [];
    const chao = geo.altura - 14;
    let hp = c.paredes[0], paredeTela = 0, fim: number | null = null;
    const parede = new Uint8Array(Q), quebras: number[] = [];
    for (let f = 0; f < Q; f++) {
      const e = sim.quadros[f][i];
      const acabou = fim !== null;
      const alvo = acabou ? bx.length : Math.min(MAX_BOLAS, Math.max(1, Math.round(e.bolas)));
      // bolinhas novas: no começo caem do topo; depois "nascem" das que já existem (a regra multiplicando)
      while (bx.length < alvo) {
        if (!bx.length || f === 0) {
          bx.push(20 + r() * (geo.largura - 40)); by.push(10 + r() * 70); vx.push((r() - 0.5) * 150); vy.push(r() * 120);
        } else {
          const k = Math.floor(r() * bx.length);
          bx.push(bx[k] + (r() - 0.5) * 10); by.push(by[k] - 4); vx.push((r() - 0.5) * 500); vy.push(-300 - r() * 500);
        }
      }
      const rr = raioPara(acabou ? MAX_BOLAS : e.bolas);
      const placa = acabou ? chao : geo.placas[paredeTela];
      let bateu = 0;
      const jaBateu = new Uint8Array(bx.length);
      for (let s = 0; s < PASSOS; s++) {
        for (let b = 0; b < bx.length; b++) {
          vy[b] += G * h;
          if (!acabou && s === 0) { vx[b] += (r() - 0.5) * 70; vy[b] += (r() - 0.5) * 70; } // agitação: a massa nunca fica parada
          vx[b] *= 0.999;
          bx[b] += vx[b] * h;
          by[b] += vy[b] * h;
          if (bx[b] < rr) { bx[b] = rr; vx[b] = Math.abs(vx[b]) * 0.8; }
          if (bx[b] > geo.largura - rr) { bx[b] = geo.largura - rr; vx[b] = -Math.abs(vx[b]) * 0.8; }
          if (by[b] < rr) { by[b] = rr; vy[b] = Math.abs(vy[b]) * 0.5; }
          if (by[b] > placa - rr) {
            by[b] = placa - rr;
            if (vy[b] > 0) {
              if (vy[b] > 120 && !jaBateu[b] && !acabou) { jaBateu[b] = 1; bateu++; }
              // quica: perde energia, mas a placa "devolve" um pouco (as bolinhas seguem martelando)
              vy[b] = -(vy[b] * RESTITUICAO) - (acabou ? 0 : 90 + r() * 200);
              vx[b] += (r() - 0.5) * 140;
            }
          }
        }
        // colisão entre bolinhas (grade de células do tamanho do diâmetro)
        const cel = rr * 2, mapa = new Map<number, number[]>();
        for (let b = 0; b < bx.length; b++) {
          const k = Math.floor(bx[b] / cel) * 4096 + Math.floor((by[b] + 4096) / cel);
          const l = mapa.get(k);
          if (l) l.push(b); else mapa.set(k, [b]);
        }
        for (let b = 0; b < bx.length; b++) {
          const cx = Math.floor(bx[b] / cel), cy = Math.floor((by[b] + 4096) / cel);
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            const l = mapa.get((cx + dx) * 4096 + cy + dy);
            if (!l) continue;
            for (const o of l) {
              if (o <= b) continue;
              const ddx = bx[o] - bx[b], ddy = by[o] - by[b], d2 = ddx * ddx + ddy * ddy, min = rr * 2;
              if (d2 >= min * min || d2 === 0) continue;
              const d = Math.sqrt(d2), nx = ddx / d, ny = ddy / d, sobra = (min - d) / 2;
              bx[b] -= nx * sobra; by[b] -= ny * sobra; bx[o] += nx * sobra; by[o] += ny * sobra;
              const rel = (vx[o] - vx[b]) * nx + (vy[o] - vy[b]) * ny;
              if (rel < 0) {
                const j = -rel * 0.9;
                vx[b] -= j * nx; vy[b] -= j * ny; vx[o] += j * nx; vy[o] += j * ny;
              }
            }
          }
        }
      }
      // vida na tela: cai a cada batida; a placa quebra na batida em que a corrida (simular.ts) já a deu por vencida
      if (bateu && !acabou) {
        const vencida = e.fim !== null || e.parede > paredeTela;
        hp = vencida ? 0 : e.hp;
        if (vencida) {
          quebras.push(f);
          paredeTela++;
          for (let b = 0; b < bx.length; b++) vy[b] = Math.max(vy[b], 700); // atravessam a placa estourada e despencam
          if (paredeTela >= c.paredes.length) fim = f;
          else hp = c.paredes[paredeTela];
        }
      }
      for (let b = 0; b < bx.length; b++) {
        pos[(f * MAX_BOLAS + b) * 2] = bx[b];
        pos[(f * MAX_BOLAS + b) * 2 + 1] = by[b];
      }
      n[f] = bx.length; raio[f] = rr; golpes[f] = bateu; hpTela[f] = hp; parede[f] = paredeTela;
    }
    return { pos, n, raio, golpes, hpTela, parede, quebras, fim };
  });
};
