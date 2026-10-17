// Estilo de edição do Modo 1: aplica o "estilo" escrito no roteiro.json ao projeto
// e lista o estilo dos vídeos mais recentes (para o Claude não repetir).
// Uso: node scripts/estilo-ia.mjs recentes [id-atual]   → estilo dos 3 vídeos de IA mais recentes
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const CATALOGO = JSON.parse(fs.readFileSync(path.join(RAIZ, "src/estilos-ia.json"), "utf8"));
export const CAMPOS = ["dinamica", "legenda", "transicao", "fundo", "musica", "formato", "fonte", "paleta"];
const ALIAS_PALETA = { jornal: "noticia" };

// Valores aceitos em cada campo
export const opcoes = (campo) => (Array.isArray(CATALOGO[campo]) ? CATALOGO[campo] : Object.keys(CATALOGO[campo] ?? {}));

// roteiro.estilo → campos do projeto (estiloIA, legenda, tema, música)
export const aplicarEstilo = (projeto, estilo = {}) => {
  const e = { ...estilo };
  if (e.paleta) e.paleta = ALIAS_PALETA[e.paleta] ?? e.paleta;
  projeto.estiloIA = {
    dinamica: e.dinamica ?? "padrao",
    legenda: e.legenda,
    transicao: e.transicao ?? "faixas",
    fundo: e.fundo ?? "grade",
    formato: e.formato,
  };
  if (e.legenda && CATALOGO.legenda[e.legenda]) projeto.legenda = { ...projeto.legenda, ...CATALOGO.legenda[e.legenda].preset };
  if (typeof e.maiusculas === "boolean") projeto.legenda.maiusculas = e.maiusculas;
  if (e.fonte && opcoes("fonte").includes(e.fonte)) projeto.legenda.fonte = e.fonte;
  if (e.paleta && opcoes("paleta").includes(e.paleta)) projeto.tema = e.paleta;
  if (e.musica === "nenhuma") projeto.efeitos.trilha = false;
  else if (e.musica && CATALOGO.musica[e.musica]) Object.assign(projeto.efeitos, { trilha: true, musica: e.musica });
  return projeto;
};

// Estilo dos vídeos de IA mais recentes (mais novo primeiro)
export const recentes = (excluir, n = 3) =>
  fs.readdirSync(path.join(RAIZ, "projetos"))
    .filter((d) => d !== excluir && fs.existsSync(path.join(RAIZ, "projetos", d, "projeto.json")))
    .map((d) => JSON.parse(fs.readFileSync(path.join(RAIZ, "projetos", d, "projeto.json"), "utf8")))
    .filter((p) => p.modo === "ia" && p.estiloIA)
    .sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)))
    .slice(0, n)
    .map((p) => ({ id: p.id, titulo: p.titulo, criadoEm: p.criadoEm, ...p.estiloIA, paleta: p.tema, fonte: p.legenda?.fonte, musica: p.efeitos?.trilha ? p.efeitos.musica ?? "tensao" : "nenhuma" }));

if (process.argv[1]?.endsWith("estilo-ia.mjs") && process.argv[2] === "recentes") {
  const lista = recentes(process.argv[3]);
  console.log(lista.length ? JSON.stringify(lista, null, 1) : "Nenhum vídeo de IA anterior com estilo — escolha livremente.");
}
