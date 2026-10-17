// Confere projetos/<id>/roteiro.json e imagens.json antes de gerar voz e imagens.
// Uso: node scripts/validar-roteiro.mjs projetos/<id>
// Sai com erro (código 1) se houver problemas que quebram o vídeo; avisos não bloqueiam.
import fs from "node:fs";
import path from "node:path";
import { CAMPOS as CAMPOS_ESTILO, opcoes, recentes } from "./estilo-ia.mjs";

const pasta = process.argv[2];
if (!pasta) {
  console.error("Uso: node scripts/validar-roteiro.mjs projetos/<id>");
  process.exit(2);
}
const erros = [];
const avisos = [];
const ler = (arq) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(pasta, arq), "utf8"));
  } catch (e) {
    erros.push(`${arq}: ${e.code === "ENOENT" ? "não existe" : "JSON inválido — " + e.message}`);
    return null;
  }
};

const CAMPOS = {
  titulo: ["texto"], pergunta: ["texto"], carimbo: ["texto"], tag: ["texto"], pessoa: ["imagem", "nome"],
  icones: ["itens"], contador: ["de", "ate", "unidade"], linha: ["itens"], definicao: ["palavra", "significado"],
  mapa: ["de", "para"], placar: ["sim", "nao", "rotulo"], relogio: ["rotulo"], check: ["ok", "texto"],
  comentario: ["texto"], enquete: ["pergunta", "opcoes"], seguir: ["texto"],
};
const POSICOES = ["topo", "alto", "alto2", "meio", "meio2"];
const ICONES = "predio casa seta contrato documento dinheiro lavagem martelo balanca obra relogio check x pin mais urna alvo alerta celular tornozeleira cruz balao".split(" ");
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ªº]/g, "");

const roteiro = ler("roteiro.json");
const imagens = ler("imagens.json") ?? {};
const projeto = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(pasta, "projeto.json"), "utf8"));
  } catch {
    return {};
  }
})();

if (roteiro) {
  if (!roteiro.titulo) erros.push("roteiro.titulo vazio");
  if (!Array.isArray(roteiro.cenas) || roteiro.cenas.length < 3) erros.push("roteiro.cenas precisa de pelo menos 3 cenas");
  const ids = new Set();
  let palavras = 0;
  let temEnquete = false;
  let temSeguir = false;
  for (const [k, c] of (roteiro.cenas ?? []).entries()) {
    const onde = `cena ${k + 1} (${c.id ?? "sem id"})`;
    if (!c.id || !/^[a-z0-9][a-z0-9-]*$/.test(c.id)) erros.push(`${onde}: id deve ter só minúsculas, números e hífens`);
    if (ids.has(c.id)) erros.push(`${onde}: id repetido`);
    ids.add(c.id);
    if (!c.texto || typeof c.texto !== "string") {
      erros.push(`${onde}: texto vazio`);
      continue;
    }
    const ws = c.texto.split(/\s+/).filter(Boolean);
    palavras += ws.length;
    const normas = ws.map(norm);
    if (c.fundo && !imagens[c.fundo]) erros.push(`${onde}: fundo "${c.fundo}" não está no imagens.json`);
    if (c.fontes && !Array.isArray(c.fontes)) erros.push(`${onde}: fontes deve ser uma lista`);
    for (const [i, e] of (c.elementos ?? []).entries()) {
      const el = `${onde}, elemento ${i + 1} (${e.tipo})`;
      if (!CAMPOS[e.tipo]) {
        erros.push(`${el}: tipo desconhecido (use: ${Object.keys(CAMPOS).join(", ")})`);
        continue;
      }
      for (const campo of CAMPOS[e.tipo]) if (e[campo] === undefined || e[campo] === "") erros.push(`${el}: falta "${campo}"`);
      if (e.posicao && !POSICOES.includes(e.posicao)) erros.push(`${el}: posição "${e.posicao}" inválida (${POSICOES.join(", ")})`);
      if (typeof e.em === "string") {
        const n = norm(e.em);
        if (!normas.some((w) => w === n || w.startsWith(n) || w.includes(n))) erros.push(`${el}: a palavra "${e.em}" (campo em) não aparece no texto da cena`);
      }
      if (e.tipo === "pessoa" && e.imagem && !imagens[e.imagem]) erros.push(`${el}: imagem "${e.imagem}" não está no imagens.json`);
      if (e.icone && !ICONES.includes(e.icone)) avisos.push(`${el}: ícone "${e.icone}" não existe (vira documento)`);
      if (e.tipo === "icones") for (const it of e.itens ?? []) if (!Array.isArray(it) || !ICONES.includes(it[0])) avisos.push(`${el}: item de ícone inválido ${JSON.stringify(it)}`);
      if (e.tipo === "enquete") temEnquete = true;
      if (e.tipo === "seguir") temSeguir = true;
      if (e.tipo === "titulo" && String(e.texto).length > 26) avisos.push(`${el}: título longo (${String(e.texto).length} letras) pode não caber`);
    }
  }
  if (!temEnquete) avisos.push("nenhum elemento 'enquete' (pergunta final para o público)");
  if (!temSeguir) avisos.push("nenhum elemento 'seguir' (CTA)");
  const alvo = Number(projeto?.pedido?.duracao) || 0;
  const estimado = palavras / 2.4;
  console.log(`Palavras: ${palavras} → ~${Math.round(estimado)} s de narração${alvo ? ` (pedido: ${alvo} s)` : ""}`);
  if (alvo && Math.abs(estimado - alvo) > alvo * 0.2) avisos.push(`duração estimada ${Math.round(estimado)} s longe do pedido (${alvo} s): ajuste para ~${Math.round(alvo * 2.4)} palavras`);
  if (!Array.isArray(roteiro.fontesPesquisa) || !roteiro.fontesPesquisa.length) avisos.push("fontesPesquisa vazio — liste as fontes com título e url");
}
// Estilo de edição: valores válidos, pedido respeitado e variedade em relação ao vídeo anterior
if (roteiro) {
  const est = roteiro.estilo;
  const pedido = projeto?.pedido?.estilo ?? {};
  if (!est || typeof est !== "object") erros.push('falta o objeto "estilo" (dinamica, legenda, transicao, fundo, musica, formato, fonte, paleta)');
  else {
    for (const campo of CAMPOS_ESTILO) {
      const v = est[campo];
      if (v === undefined) { erros.push(`estilo.${campo}: faltando (opções: ${opcoes(campo).join(", ")})`); continue; }
      if (!opcoes(campo).includes(v) && !(campo === "paleta" && v === "jornal")) erros.push(`estilo.${campo}: "${v}" não existe (opções: ${opcoes(campo).join(", ")})`);
      const fixo = pedido[campo];
      if (fixo && fixo !== "auto" && fixo !== v) erros.push(`estilo.${campo}: o pedido manda "${fixo}", mas o roteiro tem "${v}"`);
    }
    const anterior = recentes(projeto?.id, 1)[0];
    if (anterior) {
      for (const campo of ["dinamica", "legenda", "transicao", "fundo"]) {
        const livre = !pedido[campo] || pedido[campo] === "auto";
        if (livre && anterior[campo] && anterior[campo] === est[campo]) erros.push(`estilo.${campo}: "${est[campo]}" repete o vídeo anterior (${anterior.id}) — escolha outro`);
      }
    }
  }
}

for (const [k, v] of Object.entries(imagens)) {
  if (k.startsWith("_")) continue;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(k)) erros.push(`imagens.json: chave "${k}" deve ter só minúsculas, números e hífens`);
  if (!v.wiki && !v.commons && !v.arquivo) erros.push(`imagens.json: "${k}" precisa de wiki, commons ou arquivo`);
}

for (const a of avisos) console.log("⚠️  " + a);
for (const e of erros) console.log("❌ " + e);
console.log(erros.length ? `${erros.length} erro(s).` : "✅ Roteiro válido.");
process.exit(erros.length ? 1 : 0);
