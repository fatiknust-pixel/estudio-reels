// Captura as telas do Estúdio Reels (rodando em http://127.0.0.1:5173 com `npm run dev`) para o vídeo de divulgação.
// O GitHub é simulado: as chamadas à API são respondidas com os arquivos deste repositório,
// então o editor abre projetos reais sem token. Só entram projetos do Modo 1 (temas públicos).
// Uso: node divulgacao/scripts/capturar_telas.mjs [http://127.0.0.1:5173]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://127.0.0.1:5173";
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..", "..");
const PASTA = path.join(AQUI, "..", "public", "telas");
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const PROJETOS = ["ia-20261016-9ah6", "ia-20261017-qchm", "ia-20261017-7ovt"];
const PRINCIPAL = PROJETOS[0];
fs.mkdirSync(PASTA, { recursive: true });

const b = await chromium.launch({ executablePath: EXE, args: ["--lang=pt-BR", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, serviceWorkers: "block", locale: "pt-BR" });
await ctx.addInitScript(() => {
  localStorage.setItem("estudio-reels:github", JSON.stringify({ token: "simulado", dono: "fatiknust-pixel", repo: "estudio-reels", ramo: "main" }));
});
// API do GitHub simulada com os arquivos locais
await ctx.route("https://api.github.com/**", async (r) => {
  const u = new URL(r.request().url());
  const m = u.pathname.match(/\/repos\/[^/]+\/[^/]+\/contents\/(.*)$/);
  if (m) {
    const rel = decodeURIComponent(m[1]);
    const alvo = path.join(RAIZ, rel);
    const permitido = rel === "projetos" || PROJETOS.some((id) => rel.startsWith(`projetos/${id}`));
    if (!permitido || !fs.existsSync(alvo)) return r.fulfill({ status: 404, json: { message: "Not Found" } });
    if (fs.statSync(alvo).isDirectory()) {
      const itens = fs.readdirSync(alvo).filter((n) => rel !== "projetos" || PROJETOS.includes(n));
      return r.fulfill({ json: itens.map((n) => ({ name: n, path: `${rel}/${n}`, type: fs.statSync(path.join(alvo, n)).isDirectory() ? "dir" : "file", size: 1 })) });
    }
    if ((r.request().headers()["accept"] || "").includes("raw")) return r.fulfill({ body: fs.readFileSync(alvo) });
    return r.fulfill({ json: { sha: "simulado", path: rel } });
  }
  if (u.pathname.includes("/actions/")) return r.fulfill({ json: { workflow_runs: [], total_count: 0 } });
  return r.fulfill({ status: 404, json: { message: "Not Found" } });
});

const p = await ctx.newPage();
const MARCAS = {};
const foto = async (nome, seletores = []) => {
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(PASTA, nome + ".png") });
  MARCAS[nome] = { largura: 390, altura: 844, el: {} };
  for (const sel of seletores) {
    MARCAS[nome].el[sel] = await p.$$eval(sel, (els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    }));
  }
  console.log("✓", nome);
};
const clicarTexto = async (t) => { await p.getByText(t, { exact: false }).first().click(); await p.waitForTimeout(500); };

await p.goto(BASE + "/#/");
await p.waitForTimeout(3000);
await foto("inicio");

await p.goto(BASE + "/#/novo/ia");
await p.waitForTimeout(1200);
await p.locator("textarea").first().fill("Por que o real perdeu valor desde 1994?");
await foto("novo-ia", ["textarea"]);
await p.mouse.wheel(0, 700);
await foto("novo-ia-opcoes");

await p.goto(BASE + "/#/novo/bruto");
await p.waitForTimeout(1200);
await foto("novo-bruto");

await p.goto(BASE + `/#/editor/${PRINCIPAL}`);
await p.waitForTimeout(7000);
await foto("editor-cenas", [".player", ".player > div", ".abas"]);
for (const [aba, nome] of [["Legendas", "editor-legendas"], ["Estilo", "editor-estilo"], ["Efeitos", "editor-efeitos"], ["Imagens", "editor-imagens"], ["Exportar", "editor-exportar"]]) {
  await p.locator(".abas button", { hasText: aba }).first().click();
  await p.waitForTimeout(900);
  await foto(nome, [".player", ".player > div", ".abas"]);
}
await b.close();
fs.writeFileSync(path.join(PASTA, "marcas.json"), JSON.stringify(MARCAS, null, 1));
console.log("✓ marcas.json");
