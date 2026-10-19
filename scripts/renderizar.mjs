// Renderiza o MP4 (1080x1920, ou 1920x1080 no formato 16:9) de um projeto (usado pela Action "Exportar" e localmente).
// Uso: node scripts/renderizar.mjs <id> [saida.mp4]
// - Copia projetos/<id>/ para public/projetos/<id>/ (de onde o Remotion lê áudio/imagens/vídeo).
// - Modo bruto: se o vídeo não estiver na pasta, baixa da release "brutos" (<id>--fonte.mp4) com o gh.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [id, saidaArg] = process.argv.slice(2);
if (!id) {
  console.error("Uso: node scripts/renderizar.mjs <id> [saida.mp4]");
  process.exit(1);
}
const origem = path.join(RAIZ, "projetos", id);
const destino = path.join(RAIZ, "public", "projetos", id);
const projeto = JSON.parse(fs.readFileSync(path.join(origem, "projeto.json"), "utf8"));

fs.mkdirSync(destino, { recursive: true });
fs.cpSync(origem, destino, { recursive: true });

if (projeto.modo === "bruto" && projeto.video) {
  const alvo = path.join(destino, projeto.video.arquivo);
  if (!fs.existsSync(alvo)) {
    console.log(`Baixando vídeo original (${id}--fonte.mp4) da release "brutos"…`);
    const tmp = fs.mkdtempSync(path.join(RAIZ, "out-"));
    execFileSync("gh", ["release", "download", "brutos", "-p", `${id}--fonte.mp4`, "-D", tmp], { stdio: "inherit" });
    fs.renameSync(path.join(tmp, `${id}--fonte.mp4`), alvo);
    fs.rmSync(tmp, { recursive: true });
  }
}

// Modo 1: garante voz das cenas editadas e imagens pedidas (na cópia do render, sem commit)
if (projeto.modo === "ia") {
  const copia = path.join(destino, "projeto.json");
  execFileSync("python3", ["scripts/voz.py", copia], { stdio: "inherit", cwd: RAIZ });
  execFileSync("node", ["scripts/imagens.mjs", copia], { stdio: "inherit", cwd: RAIZ });
  Object.assign(projeto, JSON.parse(fs.readFileSync(copia, "utf8")));
}

delete projeto.previaCortes;
const saida = saidaArg ?? path.join(RAIZ, "out", `${id}.mp4`);
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.mkdirSync(path.join(RAIZ, "out"), { recursive: true });
const props = path.join(RAIZ, "out", `props-${id}.json`);
fs.writeFileSync(props, JSON.stringify({ projeto }));

const args = ["remotion", "render", "src/index.ts", "Reels", saida, `--props=${props}`, "--concurrency=4"];
if (process.env.CHROMIUM_PATH) args.push(`--browser-executable=${process.env.CHROMIUM_PATH}`);
console.log("npx " + args.join(" "));
execFileSync("npx", args, { stdio: "inherit", cwd: RAIZ });
console.log(`✓ ${saida}`);
