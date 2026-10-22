// Baixa as imagens que faltam (Wikipédia / Wikimedia Commons) de um projeto.json do Modo 1,
// com autor e licença, em imagens/<chave>-<hash>.jpg. Também refaz as que têm "busca" (pedida no app).
// Uso: node scripts/imagens.mjs <projeto.json> [--midia PASTA]
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const arq = args[0].endsWith(".json") ? args[0] : path.join(args[0], "projeto.json");
const midia = args.includes("--midia") ? args[args.indexOf("--midia") + 1] : path.dirname(arq);
const UA = "EstudioReels/1.0 (https://github.com/fatiknust-pixel/estudio-reels)";

const api = async (host, params) => {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params });
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${host} respondeu ${r.status}`);
  return r.json();
};
const limparHtml = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function infoArquivo(titulo) {
  const j = await api("commons.wikimedia.org", {
    action: "query", titles: titulo.startsWith("File:") ? titulo : `File:${titulo}`,
    prop: "imageinfo", iiprop: "url|extmetadata|mime", iiurlwidth: LARGURA_FOTO,
  });
  const p = j.query?.pages?.[0];
  const ii = p?.imageinfo?.[0];
  if (!ii || !/image\/(jpeg|png|webp)/.test(ii.mime)) return null;
  const m = ii.extmetadata || {};
  return {
    titulo: p.title, url: ii.thumburl || ii.url, pagina: ii.descriptionurl,
    autor: limparHtml(m.Artist?.value) || "Desconhecido", licenca: limparHtml(m.LicenseShortName?.value) || "ver página",
  };
}
async function viaWiki(artigo) {
  const j = await api("pt.wikipedia.org", { action: "query", titles: artigo, prop: "pageimages", piprop: "name", redirects: "1" });
  const nome = j.query?.pages?.[0]?.pageimage;
  return nome ? infoArquivo(nome) : null;
}
async function viaCommons(busca) {
  const j = await api("commons.wikimedia.org", { action: "query", list: "search", srsearch: `${busca} filetype:bitmap`, srnamespace: "6", srlimit: "8" });
  for (const r of j.query?.search || []) {
    const info = await infoArquivo(r.title);
    if (info) return info;
  }
  return null;
}

const p = JSON.parse(fs.readFileSync(arq, "utf8"));
// fotos na largura do quadro: 1920 px no horizontal (16:9), 1080 px no vertical
const LARGURA_FOTO = p.formato === "16:9" ? "1920" : "1080";
fs.mkdirSync(path.join(midia, "imagens"), { recursive: true });
let falhas = 0;
for (const [chave, cfg] of Object.entries(p.imagens ?? {})) {
  const existe = cfg.arquivo && fs.existsSync(path.join(midia, cfg.arquivo));
  if (existe && !cfg.busca) { console.log(`= ${chave}`); continue; }
  if (cfg.propria && !cfg.busca) { console.log(`= ${chave} (foto própria)`); continue; }
  let info = null;
  try {
    if (cfg.busca) info = await viaCommons(cfg.busca);
    if (!info && cfg.arquivoCommons) info = await infoArquivo(cfg.arquivoCommons);
    if (!info && cfg.wiki) info = await viaWiki(cfg.wiki);
    if (!info && cfg.commons) info = await viaCommons(cfg.commons);
    // último recurso: procura no Commons pelo nome do artigo e pelo rótulo da imagem
    if (!info && cfg.wiki) info = await viaCommons(cfg.wiki);
    if (!info && cfg.rotulo) info = await viaCommons(cfg.rotulo);
    if (!info) { console.warn(`! ${chave}: nenhuma imagem encontrada (o vídeo usa o fundo animado)`); falhas++; continue; }
    const r = await fetch(info.url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`download ${r.status}`);
    const rel = `imagens/${chave}-${crypto.createHash("sha1").update(info.url).digest("hex").slice(0, 8)}.jpg`;
    fs.writeFileSync(path.join(midia, rel), Buffer.from(await r.arrayBuffer()));
    p.imagens[chave] = { ...cfg, arquivo: rel, autor: info.autor, licenca: info.licenca, pagina: info.pagina, titulo: info.titulo, busca: undefined, propria: undefined };
    console.log(`✓ ${chave} ← ${info.titulo} (${info.licenca}, ${info.autor})`);
  } catch (e) {
    console.warn(`! ${chave}: ${e.message}`);
    falhas++;
  }
}
fs.writeFileSync(arq, JSON.stringify(p, null, 1) + "\n");
console.log(falhas ? `${falhas} imagem(ns) sem download` : "Imagens prontas");
