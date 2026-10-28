// Baixa as imagens que faltam de um projeto.json do Modo 1, com autor e licença, em imagens/<chave>-<hash>.jpg.
// Fontes, nesta ordem: Wikipédia do idioma do vídeo (foto principal do artigo), Wikimedia Commons (escolhe, entre vários
// resultados, a de maior resolução), Openverse (só licenças que permitem uso comercial e modificação) e, para espaço, a
// biblioteca de imagens da NASA. Também refaz as que têm "busca" (pedida no app).
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
let LINGUA = "pt";
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
    titulo: p.title, chaveUso: p.title, url: ii.thumburl || ii.url, pagina: ii.descriptionurl,
    autor: limparHtml(m.Artist?.value) || "Desconhecido", licenca: limparHtml(m.LicenseShortName?.value) || "ver página",
  };
}
// Wikipédia do idioma do vídeo (pt, en, es…) e, se o artigo não existir ou não tiver foto, a em inglês
async function viaWiki(artigo) {
  for (const host of [...new Set([`${LINGUA}.wikipedia.org`, "en.wikipedia.org"])]) {
    const j = await api(host, { action: "query", titles: artigo, prop: "pageimages", piprop: "name", redirects: "1" });
    const nome = j.query?.pages?.[0]?.pageimage;
    const info = nome ? await infoArquivo(nome) : null;
    if (info) return info;
  }
  return null;
}
const usadas = new Set(); // a mesma foto não entra em duas chaves do mesmo vídeo
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const tipoOk = (mime) => /image\/(jpeg|png|webp)/.test(mime ?? "");

// Uma consulta devolve vários candidatos já com tamanho e licença: escolhe o de maior resolução (≥ 1280 px é o ideal),
// com leve preferência pela ordem de relevância da busca e por JPEG.
async function viaCommons(busca) {
  const j = await api("commons.wikimedia.org", {
    action: "query", generator: "search", gsrsearch: `${busca} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "12",
    prop: "imageinfo", iiprop: "url|size|extmetadata|mime", iiurlwidth: LARGURA_FOTO,
  });
  const paginas = [...(j.query?.pages ?? [])].sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  let melhor = null;
  for (const pg of paginas) {
    const ii = pg.imageinfo?.[0];
    if (!ii || !tipoOk(ii.mime) || usadas.has(pg.title) || (ii.width ?? 0) < 640) continue;
    const larg = ii.width ?? 0;
    const nota = (larg >= 1600 ? 30 : larg >= 1280 ? 20 : larg >= 800 ? 10 : 0) - (pg.index ?? 0) + (ii.mime === "image/jpeg" ? 4 : 0);
    if (!melhor || nota > melhor.nota) melhor = { nota, pg, ii };
  }
  if (!melhor) return null;
  const m = melhor.ii.extmetadata || {};
  return {
    titulo: melhor.pg.title, chaveUso: melhor.pg.title, url: melhor.ii.thumburl || melhor.ii.url, pagina: melhor.ii.descriptionurl,
    autor: limparHtml(m.Artist?.value) || "Desconhecido", licenca: limparHtml(m.LicenseShortName?.value) || "ver página",
  };
}

// Openverse (api.openverse.org): sem chave o limite é baixo, então só entra quando o Commons não achou. license_type garante
// licenças que permitem uso comercial e modificação (sem NC/ND), necessário para canal monetizado.
async function viaOpenverse(busca) {
  const r = await fetch("https://api.openverse.org/v1/images/?" + new URLSearchParams({ q: busca, license_type: "commercial,modification", page_size: "10", extension: "jpg,png", mature: "false" }), { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const j = await r.json();
  for (const it of j.results ?? []) {
    if (!it.url || usadas.has(it.url) || (it.width ?? 9999) < 1000 || (it.filesize && it.filesize > 8e6)) continue;
    const lic = String(it.license ?? "").toLowerCase();
    if (/nc|nd/.test(lic)) continue;
    const licenca = lic === "cc0" ? "CC0 (domínio público)" : lic === "pdm" ? "Domínio público" : `CC ${lic.toUpperCase()} ${it.license_version ?? ""}`.trim();
    return { titulo: it.title || busca, chaveUso: it.url, url: it.url, pagina: it.foreign_landing_url, autor: it.creator || "Desconhecido", licenca };
  }
  return null;
}

// Biblioteca de imagens da NASA (domínio público; algumas fotos de terceiros aparecem com o autor no campo photographer).
async function viaNasa(busca) {
  const r = await fetch("https://images-api.nasa.gov/search?" + new URLSearchParams({ q: busca, media_type: "image" }), { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const itens = (await r.json()).collection?.items ?? [];
  for (const it of itens.slice(0, 6)) {
    const d = it.data?.[0];
    if (!d || !it.href) continue;
    const arquivos = await (await fetch(it.href, { headers: { "User-Agent": UA } })).json();
    const alvo = arquivos.find((u) => /~large\.jpg$/i.test(u)) ?? arquivos.find((u) => /~medium\.jpg$/i.test(u)) ?? arquivos.find((u) => /~orig\.jpg$/i.test(u));
    if (!alvo || usadas.has(alvo)) continue;
    return { titulo: d.title, chaveUso: alvo, url: encodeURI(alvo.replace(/^http:/, "https:")), pagina: `https://images.nasa.gov/details/${d.nasa_id}`, autor: d.photographer || d.secondary_creator || d.center || "NASA", licenca: "Domínio público (NASA)" };
  }
  return null;
}

const p = JSON.parse(fs.readFileSync(arq, "utf8"));
LINGUA = String(p.idioma ?? p.pedido?.idioma ?? "pt-BR").split("-")[0].toLowerCase();
// fotos na largura do quadro: 1920 px no horizontal (16:9), 1080 px no vertical
const LARGURA_FOTO = p.formato === "16:9" ? "1920" : "1080";
fs.mkdirSync(path.join(midia, "imagens"), { recursive: true });
let falhas = 0;
for (const [chave, cfg] of Object.entries(p.imagens ?? {})) {
  const existe = cfg.arquivo && fs.existsSync(path.join(midia, cfg.arquivo));
  if (existe && !cfg.busca) { console.log(`= ${chave}`); if (cfg.titulo) usadas.add(cfg.titulo); continue; }
  if (cfg.propria && !cfg.busca) { console.log(`= ${chave} (foto própria)`); continue; }
  // Fontes em ordem; se uma acha mas o download falha, tenta a seguinte.
  const termo = cfg.commons || cfg.wiki || cfg.rotulo;
  const fontes = [
    cfg.busca && (() => viaCommons(cfg.busca)),
    cfg.arquivoCommons && (() => infoArquivo(cfg.arquivoCommons)),
    cfg.fonte === "nasa" && termo && (() => viaNasa(termo)),
    cfg.wiki && (() => viaWiki(cfg.wiki)),
    cfg.commons && (() => viaCommons(cfg.commons)),
    cfg.wiki && (() => viaCommons(cfg.wiki)),
    cfg.rotulo && (() => viaCommons(cfg.rotulo)),
    termo && (() => viaOpenverse(termo)),
    termo && cfg.fonte !== "nasa" && /espa[cç]o|space|nasa|galax|planet|plan[eè]te|lua\b|moon|mars|marte|j[úu]piter|satur|estrela|star|nebul|telesc|foguete|rocket|astronaut|sol\b|sun\b/i.test(termo) && (() => viaNasa(termo)),
  ].filter(Boolean);
  let feito = false;
  for (const buscar of fontes) {
    try {
      const info = await buscar();
      if (!info || (info.chaveUso && usadas.has(info.chaveUso))) continue;
      const r = await fetch(info.url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error(`download ${r.status}`);
      if (!/^image\//.test(r.headers.get("content-type") ?? "image/jpeg")) throw new Error("o arquivo não é uma imagem");
      const bytes = Buffer.from(await r.arrayBuffer());
      if (bytes.length < 15000) throw new Error("imagem pequena demais");
      const rel = `imagens/${chave}-${crypto.createHash("sha1").update(info.url).digest("hex").slice(0, 8)}.jpg`;
      fs.writeFileSync(path.join(midia, rel), bytes);
      if (info.chaveUso) usadas.add(info.chaveUso);
      p.imagens[chave] = { ...cfg, largura: undefined, altura: undefined, rostos: undefined, foco: undefined, borrada: undefined, arquivo: rel, autor: info.autor, licenca: info.licenca, pagina: info.pagina, titulo: info.titulo, busca: undefined, propria: undefined };
      console.log(`✓ ${chave} ← ${info.titulo} (${info.licenca}, ${info.autor})`);
      feito = true;
      break;
    } catch (e) {
      console.warn(`  ${chave}: ${e.message} — tentando outra fonte`);
    }
    await pausa(120);
  }
  if (!feito) {
    console.warn(`! ${chave}: nenhuma imagem encontrada (o vídeo usa o fundo animado)`);
    falhas++;
  }
}
fs.writeFileSync(arq, JSON.stringify(p, null, 1) + "\n");
console.log(falhas ? `${falhas} imagem(ns) sem download` : "Imagens prontas");
