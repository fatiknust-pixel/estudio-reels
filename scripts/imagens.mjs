// Baixa as imagens que faltam de um projeto.json do Modo 1, com autor e licença, em imagens/<chave>-<hash>.jpg.
// Fontes, nesta ordem: Wikipédia do idioma do vídeo (foto principal do artigo), Wikimedia Commons (escolhe, entre vários
// resultados, a de maior resolução), Pixabay (com PIXABAY_API_KEY), Openverse (só licenças que permitem uso comercial e
// modificação) e, para espaço, a biblioteca de imagens da NASA. Também refaz as que têm "busca" (pedida no app).
// Uso: node scripts/imagens.mjs <projeto.json> [--midia PASTA] [--candidatos PASTA | --escolhas PASTA/escolhas.json]
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const arq = args[0].endsWith(".json") ? args[0] : path.join(args[0], "projeto.json");
const midia = args.includes("--midia") ? args[args.indexOf("--midia") + 1] : path.dirname(arq);
const UA = "EstudioReels/1.0 (https://github.com/fatiknust-pixel/estudio-reels)";

const api = async (host, params) => {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params });
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${host} respondeu ${r.status}`);
  return r.json();
};
let LINGUA = "pt";
// miniatura de 480 px de um arquivo do Commons (as URLs de thumb trazem a largura: .../1920px-Nome.jpg)
const miniCommons = (u = "") => u.replace(/\/\d+px-([^/]+)$/, "/480px-$1");
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
    titulo: p.title, chaveUso: p.title, url: ii.thumburl || ii.url, previa: miniCommons(ii.thumburl || ii.url), pagina: ii.descriptionurl,
    autor: limparHtml(m.Artist?.value) || "Desconhecido", licenca: limparHtml(m.LicenseShortName?.value) || "ver página",
    texto: sem(p.title) + " " + textoMeta(m),
  };
}
// Wikipédia do idioma do vídeo (pt, en, es…) e, se o artigo não existir ou não tiver foto, a em inglês
async function viaWiki(artigo, extra = "") {
  const toks = palavras(`${artigo} ${extra}`);
  for (const host of [...new Set([`${LINGUA}.wikipedia.org`, "en.wikipedia.org"])]) {
    const j = await api(host, { action: "query", titles: artigo, prop: "pageimages", piprop: "name", redirects: "1" });
    const nome = j.query?.pages?.[0]?.pageimage;
    const info = nome ? await infoArquivo(nome) : null;
    if (info && acertos(info.texto, toks) >= 1) return info; // a foto principal de um artigo genérico costuma não ter relação com a fala
    if (info) console.warn(`  wiki "${artigo}": foto principal (${info.titulo}) não combina — descartada`);
  }
  return null;
}
// Relevância: a foto só vale se o título, a descrição ou as categorias do Commons falam do assunto pedido.
// Sem isso, a busca devolvia a foto "maior" qualquer (ponte errada, ilha de satélite, escavadeira a vapor…).
const PARADAS = new Set("the and for with from over under view photo photograph image picture file aerial the una uno los las del que con por para como das dos uma uns pela pelo sobre entre".split(" "));
const sem = (t = "") => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const palavras = (q = "") => [...new Set(sem(q).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !PARADAS.has(w)))];
const textoMeta = (m = {}) => sem([m.ImageDescription?.value, m.ObjectName?.value, (m.Categories?.value ?? "").replace(/\|/g, " ")].map(limparHtml).join(" "));
const acertos = (texto, toks) => toks.filter((w) => texto.includes(w)).length;
const usadas = new Set(); // a mesma foto não entra em duas chaves do mesmo vídeo
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const tipoOk = (mime) => /image\/(jpeg|png|webp)/.test(mime ?? "");

// Uma consulta devolve vários candidatos já com tamanho e licença: escolhe o de maior resolução (≥ 1280 px é o ideal),
// com leve preferência pela ordem de relevância da busca e por JPEG.
async function viaCommons(busca) {
  const toks = palavras(busca);
  // da busca completa para o núcleo (os nomes próprios do começo): uma busca comprida demais não acha nada
  const variantes = [...new Set([toks, toks.slice(0, 4), toks.slice(0, 2)].filter((t) => t.length).map((t) => t.join(" ")))];
  for (const v of variantes) {
    const alvo = palavras(v);
    const j = await api("commons.wikimedia.org", {
      action: "query", generator: "search", gsrsearch: `${v} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "15",
      prop: "imageinfo", iiprop: "url|size|extmetadata|mime", iiurlwidth: LARGURA_FOTO,
    });
    const paginas = [...(j.query?.pages ?? [])].sort((x, y) => (x.index ?? 99) - (y.index ?? 99));
    let melhor = null;
    for (const pg of paginas) {
      const ii = pg.imageinfo?.[0];
      if (!ii || !tipoOk(ii.mime) || usadas.has(pg.title) || (ii.width ?? 0) < 640) continue;
      const texto = sem(pg.title) + " " + textoMeta(ii.extmetadata);
      const n = acertos(texto, alvo);
      if (n < Math.max(1, Math.ceil(alvo.length * 0.6))) continue; // não fala do assunto pedido
      const larg = ii.width ?? 0;
      const nota = n * 12 + (larg >= 1600 ? 30 : larg >= 1280 ? 20 : larg >= 800 ? 10 : 0) - (pg.index ?? 0) + (ii.mime === "image/jpeg" ? 4 : 0);
      if (!melhor || nota > melhor.nota) melhor = { nota, pg, ii };
    }
    if (!melhor) continue;
    const m = melhor.ii.extmetadata || {};
    return {
      titulo: melhor.pg.title, chaveUso: melhor.pg.title, url: melhor.ii.thumburl || melhor.ii.url, pagina: melhor.ii.descriptionurl,
      autor: limparHtml(m.Artist?.value) || "Desconhecido", licenca: limparHtml(m.LicenseShortName?.value) || "ver página",
    };
  }
  return null;
}

// Openverse (api.openverse.org): sem chave o limite é baixo, então só entra quando o Commons não achou. license_type garante
// licenças que permitem uso comercial e modificação (sem NC/ND), necessário para canal monetizado.
async function viaOpenverse(busca) {
  const r = await fetch("https://api.openverse.org/v1/images/?" + new URLSearchParams({ q: busca, license_type: "commercial,modification", page_size: "10", extension: "jpg,png", mature: "false" }), { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const j = await r.json();
  const toks = palavras(busca);
  for (const it of j.results ?? []) {
    if (acertos(sem(`${it.title ?? ""} ${(it.tags ?? []).map((t) => t.name).join(" ")}`), toks) < Math.max(1, Math.ceil(toks.length * 0.6))) continue;
    if (!it.url || usadas.has(it.url) || (it.width ?? 9999) < 1000 || (it.filesize && it.filesize > 8e6)) continue;
    const lic = String(it.license ?? "").toLowerCase();
    if (/nc|nd/.test(lic)) continue;
    const licenca = lic === "cc0" ? "CC0 (domínio público)" : lic === "pdm" ? "Domínio público" : `CC ${lic.toUpperCase()} ${it.license_version ?? ""}`.trim();
    return { titulo: it.title || busca, chaveUso: it.url, url: it.url, previa: it.thumbnail, pagina: it.foreign_landing_url, autor: it.creator || "Desconhecido", licenca };
  }
  return null;
}

// Pixabay (só com PIXABAY_API_KEY): fotos reais, licença Pixabay (uso comercial, sem crédito obrigatório). Devolve várias.
async function pixabay(busca, n = 4) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key || !busca) return [];
  const r = await fetch("https://pixabay.com/api/?" + new URLSearchParams({ key, q: busca.slice(0, 100), image_type: "photo", safesearch: "true", per_page: "20", min_width: "1000", lang: LINGUA }), { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  return ((await r.json()).hits ?? []).filter((h) => h.largeImageURL && !usadas.has(h.largeImageURL)).slice(0, n)
    .map((h) => ({ titulo: h.tags || busca, chaveUso: h.largeImageURL, url: h.largeImageURL, previa: h.webformatURL, pagina: h.pageURL, autor: h.user || "Pixabay", licenca: "Licença Pixabay" }));
}
const viaPixabay = async (busca) => (await pixabay(busca, 1))[0] ?? null;

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
    return { titulo: d.title, chaveUso: alvo, url: encodeURI(alvo.replace(/^http:/, "https:")), previa: encodeURI(alvo.replace(/^http:/, "https:").replace(/~(large|medium|orig)\.jpg$/i, "~small.jpg")), pagina: `https://images.nasa.gov/details/${d.nasa_id}`, autor: d.photographer || d.secondary_creator || d.center || "NASA", licenca: "Domínio público (NASA)" };
  }
  return null;
}

const p = JSON.parse(fs.readFileSync(arq, "utf8"));
LINGUA = String(p.idioma ?? p.pedido?.idioma ?? "pt-BR").split("-")[0].toLowerCase();
// fotos na largura do quadro: 1920 px no horizontal (16:9), 1080 px no vertical
const LARGURA_FOTO = p.formato === "16:9" ? "1920" : "1080";
fs.mkdirSync(path.join(midia, "imagens"), { recursive: true });

// ---------- escolha visual (o Claude olha as candidatas) ----------
// --candidatos PASTA: junta até 8 fotos reais por chave (Commons, Wikipédia, Pixabay, Openverse, NASA) e monta uma folha
// <chave>.jpg com todas lado a lado + <chave>.json (fontes e licenças) + indice.json (o que cada foto precisa mostrar).
// --escolhas ARQ: { chave: n } (n = posição na folha, 1 = a primeira; 0 = nenhuma serve) baixa a escolhida em resolução cheia.
// As chaves sem escolha seguem a busca automática de sempre.
async function commonsLista(busca, n) {
  const toks = palavras(busca);
  if (!toks.length) return [];
  const j = await api("commons.wikimedia.org", {
    action: "query", generator: "search", gsrsearch: `${toks.slice(0, 6).join(" ")} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "12",
    prop: "imageinfo", iiprop: "url|size|extmetadata|mime", iiurlwidth: LARGURA_FOTO,
  });
  return [...(j.query?.pages ?? [])].sort((x, y) => (x.index ?? 99) - (y.index ?? 99))
    .filter((pg) => { const ii = pg.imageinfo?.[0]; return ii && tipoOk(ii.mime) && !usadas.has(pg.title) && (ii.width ?? 0) >= 800; })
    .slice(0, n).map((pg) => { const ii = pg.imageinfo[0], m = ii.extmetadata || {}; return { titulo: pg.title, chaveUso: pg.title, url: ii.thumburl || ii.url, previa: miniCommons(ii.thumburl || ii.url), pagina: ii.descriptionurl, autor: limparHtml(m.Artist?.value) || "Desconhecido", licenca: limparHtml(m.LicenseShortName?.value) || "ver página" }; });
}
async function juntarCandidatas(cfg) {
  const termo = cfg.commons || cfg.wiki || cfg.rotulo || cfg.busca;
  const tentativas = [
    cfg.arquivoCommons && (async () => [await infoArquivo(cfg.arquivoCommons)]),
    cfg.wiki && (async () => [await viaWiki(cfg.wiki, cfg.commons)]),
    cfg.busca && (() => commonsLista(cfg.busca, 4)),
    cfg.commons && (() => commonsLista(cfg.commons, 4)),
    cfg.wiki && (() => commonsLista(cfg.wiki, 2)),
    termo && (() => pixabay(cfg.commons || termo, 3)),
    termo && (async () => [await viaOpenverse(termo)]),
    termo && (cfg.fonte === "nasa" || /espa[cç]o|space|nasa|galax|planet|lua\b|moon|marte|mars|foguete|rocket|astronaut/i.test(termo)) && (async () => [await viaNasa(termo)]),
  ].filter(Boolean);
  const lista = [];
  for (const t of tentativas) {
    try {
      for (const c of (await t()) ?? []) if (c && !lista.some((x) => x.url === c.url)) lista.push(c);
    } catch (e) {
      console.warn(`  ${e.message}`);
    }
    if (lista.length >= 8) break;
    await pausa(120);
  }
  return lista.slice(0, 8);
}
// O que a foto precisa mostrar: o trecho da fala em que ela aparece (galeria + galeriaEm) ou a fala da cena (fundo)
function contexto(chave) {
  for (const c of p.cenas ?? []) {
    const pal = String(c.texto ?? "").split(/\s+/).filter(Boolean);
    const k = (c.galeria ?? []).indexOf(chave);
    if (k >= 0) {
      const pos = (c.galeriaEm ?? []).map((m, i) => (i === 0 ? 0 : typeof m === "number" ? m : Math.max(0, pal.findIndex((w) => sem(w).replace(/[^a-z0-9]/g, "") === sem(String(m)).replace(/[^a-z0-9]/g, "")))));
      const ini = pos[k] ?? Math.floor((k * pal.length) / c.galeria.length);
      const fim = pos[k + 1] ?? (k + 1 < c.galeria.length ? Math.floor(((k + 1) * pal.length) / c.galeria.length) : pal.length);
      return pal.slice(ini, Math.max(fim, ini + 4)).join(" ");
    }
    if (c.fundo === chave) return c.texto;
  }
  return "";
}
const arg = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const pastaCand = arg("--candidatos");
const arqEscolhas = arg("--escolhas");
if (pastaCand) {
  const { execFileSync } = await import("node:child_process");
  fs.mkdirSync(pastaCand, { recursive: true });
  const indice = [];
  const baixarPrevia = async (c) => {
    for (const u of [c.previa, c.url].filter(Boolean)) {
      try {
        const r = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
        if (!r.ok || !/^image\//.test(r.headers.get("content-type") ?? "image/jpeg")) continue;
        const bytes = Buffer.from(await r.arrayBuffer());
        if (bytes.length >= 4000) return bytes;
      } catch {}
    }
    return null;
  };
  const umaChave = async (chave, cfg) => {
    const lista = await juntarCandidatas(cfg);
    const tmp = fs.mkdtempSync(path.join(pastaCand, ".tmp-"));
    const ok = [];
    const baixadas = await Promise.all(lista.map(baixarPrevia));
    lista.forEach((c, i) => {
      if (!baixadas[i]) return;
      ok.push(c);
      fs.writeFileSync(path.join(tmp, `c${ok.length}.img`), baixadas[i]);
    });
    if (ok.length) {
      // folha 4 colunas, na ordem 1..N (esquerda → direita, de cima para baixo)
      const linhas = Math.ceil(ok.length / 4);
      const entradas = ok.flatMap((_, i) => ["-i", path.join(tmp, `c${i + 1}.img`)]);
      const fonte = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; // número no canto de cada foto (se a fonte existir)
      const num = (i) => (fs.existsSync(fonte) ? `,drawtext=fontfile=${fonte}:text=${i + 1}:x=10:y=8:fontsize=40:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=8` : "");
      const esc = ok.map((_, i) => `[${i}:v]scale=480:320:force_original_aspect_ratio=decrease,pad=480:320:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1${num(i)}[v${i}]`);
      const brancos = Array.from({ length: linhas * 4 - ok.length }, (_, i) => `color=white:s=480x320:d=1[b${i}]`);
      const todos = [...ok.map((_, i) => `[v${i}]`), ...brancos.map((_, i) => `[b${i}]`)];
      const pos = todos.map((_, i) => `${(i % 4) * 490}_${Math.floor(i / 4) * 330}`).join("|");
      const filtro = [...esc, ...brancos, `${todos.join("")}xstack=inputs=${todos.length}:layout=${pos}:fill=white`].join(";");
      try {
        execFileSync("ffmpeg", ["-v", "error", "-y", ...entradas, "-filter_complex", filtro, "-frames:v", "1", "-q:v", "4", path.join(pastaCand, `${chave}.jpg`)]);
        fs.writeFileSync(path.join(pastaCand, `${chave}.json`), JSON.stringify(ok, null, 1));
        indice.push({ chave, folha: `${chave}.jpg`, candidatas: ok.length, mostrar: cfg.rotulo || cfg.wiki || cfg.commons || "", fala: contexto(chave), busca: cfg.commons || cfg.wiki || "" });
        console.log(`▦ ${chave}: ${ok.length} candidatas`);
      } catch (e) {
        console.warn(`  ${chave}: folha falhou (${e.message.split("\n")[0]})`);
      }
    } else console.warn(`  ${chave}: nenhuma candidata`);
    fs.rmSync(tmp, { recursive: true, force: true });
  };
  const pendentes = Object.entries(p.imagens ?? {}).filter(([, cfg]) => !((cfg.arquivo && fs.existsSync(path.join(midia, cfg.arquivo)) && !cfg.busca) || (cfg.propria && !cfg.busca)));
  for (let i = 0; i < pendentes.length; i += 4) await Promise.all(pendentes.slice(i, i + 4).map(([chave, cfg]) => umaChave(chave, cfg)));
  indice.sort((a, b) => pendentes.findIndex(([k]) => k === a.chave) - pendentes.findIndex(([k]) => k === b.chave));
  fs.writeFileSync(path.join(pastaCand, "indice.json"), JSON.stringify(indice, null, 1));
  console.log(`${indice.length} folhas de candidatas em ${pastaCand}`);
  process.exit(0);
}
if (arqEscolhas && fs.existsSync(arqEscolhas)) {
  const escolhas = JSON.parse(fs.readFileSync(arqEscolhas, "utf8"));
  for (const [chave, n] of Object.entries(escolhas)) {
    const cfg = p.imagens?.[chave];
    const arqLista = path.join(path.dirname(arqEscolhas), `${chave}.json`);
    if (!cfg || !fs.existsSync(arqLista)) continue;
    if (Number(n) === 0) {
      // nenhuma serve: fica sem foto (a cena usa o fundo animado) em vez de mostrar algo sem relação com a fala
      p.imagens[chave] = { ...cfg, busca: undefined, semFoto: true };
      console.log(`∅ ${chave}: nenhuma candidata mostra o assunto`);
      continue;
    }
    const info = JSON.parse(fs.readFileSync(arqLista, "utf8"))[Number(n) - 1];
    if (!info || usadas.has(info.chaveUso)) continue;
    try {
      const r = await fetch(info.url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error(`download ${r.status}`);
      const bytes = Buffer.from(await r.arrayBuffer());
      const rel = `imagens/${chave}-${crypto.createHash("sha1").update(info.url).digest("hex").slice(0, 8)}.jpg`;
      fs.writeFileSync(path.join(midia, rel), bytes);
      usadas.add(info.chaveUso);
      p.imagens[chave] = { ...cfg, largura: undefined, altura: undefined, rostos: undefined, foco: undefined, borrada: undefined, arquivo: rel, autor: info.autor, licenca: info.licenca, pagina: info.pagina, titulo: info.titulo, busca: undefined, propria: undefined, semFoto: undefined };
      console.log(`✓ ${chave} ← escolhida (${n}): ${info.titulo} (${info.licenca})`);
    } catch (e) {
      console.warn(`  ${chave}: ${e.message} — segue a busca automática`);
    }
  }
}
let falhas = 0;
for (const [chave, cfg] of Object.entries(p.imagens ?? {})) {
  const existe = cfg.arquivo && fs.existsSync(path.join(midia, cfg.arquivo));
  if (existe && !cfg.busca) { console.log(`= ${chave}`); if (cfg.titulo) usadas.add(cfg.titulo); continue; }
  if (cfg.propria && !cfg.busca) { console.log(`= ${chave} (foto própria)`); continue; }
  if (cfg.semFoto && !cfg.busca) { console.log(`∅ ${chave} (nenhuma foto real mostra o assunto)`); continue; }
  // Fontes em ordem; se uma acha mas o download falha, tenta a seguinte.
  const termo = cfg.commons || cfg.wiki || cfg.rotulo;
  const fontes = [
    cfg.busca && (() => viaCommons(cfg.busca)),
    cfg.arquivoCommons && (() => infoArquivo(cfg.arquivoCommons)),
    cfg.fonte === "nasa" && termo && (() => viaNasa(termo)),
    cfg.commons && (() => viaCommons(cfg.commons)), // a busca específica escrita para esta fala vem antes do artigo genérico
    cfg.wiki && (() => viaWiki(cfg.wiki, cfg.commons)),
    cfg.wiki && (() => viaCommons(cfg.wiki)),
    cfg.rotulo && (() => viaCommons(cfg.rotulo)),
    termo && (() => viaPixabay(cfg.commons || termo)),
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
      p.imagens[chave] = { ...cfg, largura: undefined, altura: undefined, rostos: undefined, foco: undefined, borrada: undefined, arquivo: rel, autor: info.autor, licenca: info.licenca, pagina: info.pagina, titulo: info.titulo, busca: undefined, propria: undefined, semFoto: undefined };
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
