// Junta o roteiro escrito pelo Claude (projetos/<id>/roteiro.json + imagens.json, formato Astra)
// a uma cópia de trabalho do projeto. Voz e imagens são geradas depois sobre essa cópia.
// Uso: node scripts/importar-roteiro.mjs projetos/<id> out/projeto.json
import fs from "node:fs";
import path from "node:path";
import { aplicarEstilo } from "./estilo-ia.mjs";

const [pasta, saida] = process.argv.slice(2);
const ler = (a) => JSON.parse(fs.readFileSync(path.join(pasta, a), "utf8"));
const projeto = ler("projeto.json");
const roteiro = ler("roteiro.json");
const imagensCfg = fs.existsSync(path.join(pasta, "imagens.json")) ? ler("imagens.json") : {};

projeto.titulo = roteiro.titulo || projeto.titulo;
projeto.cenas = roteiro.cenas.map((c) => ({ id: c.id, texto: c.texto.trim(), fundo: c.fundo || undefined, galeria: Array.isArray(c.galeria) && c.galeria.length ? c.galeria : undefined, galeriaEm: Array.isArray(c.galeria) && c.galeria.length > 1 && Array.isArray(c.galeriaEm) ? c.galeriaEm : undefined, fontes: c.fontes ?? [], elementos: c.elementos ?? [] }));
projeto.fontesPesquisa = roteiro.fontesPesquisa ?? [];
if (roteiro.publicacao && Array.isArray(roteiro.publicacao.titulos)) projeto.publicacao = { titulos: roteiro.publicacao.titulos.map(String), descricao: String(roteiro.publicacao.descricao ?? ""), tags: (roteiro.publicacao.tags ?? []).map(String) };
if (roteiro.legenda?.palavrasPorTela) projeto.legenda = { ...projeto.legenda, palavrasPorTela: roteiro.legenda.palavrasPorTela };
aplicarEstilo(projeto, roteiro.estilo);
projeto.voz = projeto.voz ?? { edge: "pt-BR-AntonioNeural", velocidade: "+5%" };
const antigas = projeto.imagens ?? {};
projeto.imagens = {};
for (const [k, v] of Object.entries(imagensCfg)) {
  if (k.startsWith("_")) continue;
  const velha = antigas[k];
  const mesma = velha && velha.wiki === v.wiki && velha.commons === v.commons && velha.arquivoCommons === v.arquivo;
  projeto.imagens[k] = mesma ? velha : { arquivo: "", rotulo: v.rotulo ?? k, wiki: v.wiki, commons: v.commons, arquivoCommons: v.arquivo };
}
projeto.narracao = projeto.narracao ?? {};
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, JSON.stringify(projeto, null, 1) + "\n");
console.log(`✓ ${projeto.cenas.length} cenas, ${Object.keys(projeto.imagens).length} imagens → ${saida}`);
