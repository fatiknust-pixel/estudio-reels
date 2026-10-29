// Física das bolinhas do modo "corrida": gravidade e quique de trampolim na placa (cada bolinha sozinha: elas se
// sobrepõem, não se empurram), rebatendo nas laterais.
// Calculada uma vez para o vídeo inteiro (determinística: mesma semente → mesmo vídeo, na prévia e no render).
// O ritmo da corrida (quando cada placa quebra) vem de simular.ts; aqui cada batida na placa é que faz a vida cair na tela.
import { Corrida } from "../tipos";
import { rng, Simulacao } from "./simular";

export const MAX_BOLAS = 170; // bolinhas desenhadas por pista (cada uma representa bolas/MAX_BOLAS quando há milhões)
const G = 2600; // gravidade (px/s²)
const PASSOS = 4; // subpassos por quadro
const TRAMPOLIM = [520, 980]; // velocidade (px/s) com que a placa devolve cada bolinha: quica de ~50 a ~185 px

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
              // trampolim: a placa devolve cada bolinha para cima (altura sorteada, então elas não quicam juntas);
              // depois de terminar a corrida, assentam no fundo da pista
              vy[b] = acabou ? -vy[b] * 0.35 : -(TRAMPOLIM[0] + r() * (TRAMPOLIM[1] - TRAMPOLIM[0]));
              vx[b] = acabou ? vx[b] * 0.6 : vx[b] * 0.7 + (r() - 0.5) * 160;
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
