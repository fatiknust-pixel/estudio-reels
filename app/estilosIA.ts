// Estilo de edição do Modo 1 no app: opções (do catálogo src/estilos-ia.json) e o sorteio do lote.
import CATALOGO from "../src/estilos-ia.json";
import { FONTES } from "../src/fontes";
import { TEMAS } from "../src/temas";

export type CampoEstilo = "dinamica" | "legenda" | "transicao" | "fundo" | "musica" | "formato" | "fonte" | "paleta";

const nomes = (o: Record<string, { nome: string }>) => Object.entries(o).map(([k, v]) => [k, v.nome] as [string, string]);

export const OPCOES_ESTILO: { campo: CampoEstilo; rotulo: string; opcoes: [string, string][] }[] = [
  { campo: "formato", rotulo: "Formato do roteiro", opcoes: nomes(CATALOGO.formato) },
  { campo: "legenda", rotulo: "Legenda", opcoes: nomes(CATALOGO.legenda) },
  { campo: "transicao", rotulo: "Transição", opcoes: nomes(CATALOGO.transicao) },
  { campo: "fundo", rotulo: "Fundo", opcoes: nomes(CATALOGO.fundo) },
  { campo: "musica", rotulo: "Música", opcoes: nomes(CATALOGO.musica) },
  { campo: "fonte", rotulo: "Fonte", opcoes: CATALOGO.fonte.map((k) => [k, FONTES[k]?.nome ?? k] as [string, string]) },
];

export const DINAMICAS = Object.entries(CATALOGO.dinamica).map(([k, v]) => ({ id: k, ...v }));
export const PALETAS = CATALOGO.paleta.filter((k) => TEMAS[k]);

// Campos que mudam a "cara" do vídeo e são sorteados num lote (sem repetir enquanto der)
export const CAMPOS_SORTEADOS: CampoEstilo[] = ["dinamica", "legenda", "transicao", "formato"];

const valores = (campo: CampoEstilo): string[] =>
  campo === "dinamica" ? DINAMICAS.map((d) => d.id).filter((d) => d !== "padrao") : OPCOES_ESTILO.find((o) => o.campo === campo)!.opcoes.map(([k]) => k);

export const embaralhar = <T,>(a: T[], aleatorio = Math.random): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

// Estilo pedido para cada vídeo do lote: o que você escolheu fica; o que está em "auto" é sorteado sem repetir
export const estilosDoLote = (escolhido: Record<CampoEstilo, string>, n: number, variar: boolean, aleatorio = Math.random) => {
  const sorteio: Partial<Record<CampoEstilo, string[]>> = {};
  if (variar && n > 1) for (const c of CAMPOS_SORTEADOS) if (escolhido[c] === "auto") sorteio[c] = embaralhar(valores(c), aleatorio);
  return Array.from({ length: n }, (_, i) => {
    const e: Record<string, string> = { ...escolhido };
    for (const [c, lista] of Object.entries(sorteio)) e[c] = lista![i % lista!.length];
    return e as Record<CampoEstilo, string>;
  });
};
