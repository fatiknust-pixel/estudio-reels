// Canais (um vídeo por dia). Cada canal é canais/<id>.json: nome, nicho, gênero, idioma, voz, ativo e a fila de ideias.
//   diario [--canal ID] [--forcar]  cria o projeto do próximo vídeo de cada canal ativo (1 por dia) e escreve no GITHUB_OUTPUT:
//                                   projetos=<ids separados por vírgula> e faltam=<canais com menos de 3 ideias na fila>
//   ideias <canal> <arquivo.json>   acrescenta à fila as ideias que o Claude escreveu (lista de {titulo, angulo})
// Uso: node scripts/canal.mjs diario | ideias <canal> <arquivo>
import fs from "node:fs";
import path from "node:path";

const [cmd, ...args] = process.argv.slice(2);
const DIR = "canais";
const generos = JSON.parse(fs.readFileSync("src/generos.json", "utf8")).generos;
const ler = (id) => JSON.parse(fs.readFileSync(path.join(DIR, `${id}.json`), "utf8"));
const gravar = (c) => fs.writeFileSync(path.join(DIR, `${c.id}.json`), JSON.stringify(c, null, 1) + "\n");
const saida = (k, v) => { console.log(`${k}=${v}`); if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };
// o "dia" do canal é o de Brasília (UTC-3): o vídeo roda de manhã e não repete no mesmo dia
const hoje = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function projetoDe(c, ideia, anteriores) {
  const g = generos.find((x) => x.id === c.genero) ?? generos[0];
  const agora = new Date().toISOString();
  const id = `${c.id}-${hoje().replace(/-/g, "")}`.slice(0, 60);
  const tema = ideia.angulo ? `${ideia.titulo} — ângulo: ${ideia.angulo}` : ideia.titulo;
  const paleta = g.estilo?.paleta && g.estilo.paleta !== "auto" ? g.estilo.paleta : "padrao";
  return {
    versao: 1, id, titulo: ideia.titulo.slice(0, 70), modo: "ia", estilo: "documentario", tema: paleta, criadoEm: agora, atualizadoEm: agora, status: "processando",
    pedido: {
      tema, tom: g.tom, duracao: c.duracao ?? g.duracao, estilo: { ...g.estilo },
      ...(c.idioma && c.idioma !== "pt-BR" ? { idioma: c.idioma } : {}),
      genero: { id: g.id, nome: g.nome, instrucoes: g.instrucoes, galeria: g.galeria },
      canal: { id: c.id, nome: c.nome, nicho: c.nicho, anteriores },
    },
    formato: g.formato ?? "16:9", idioma: c.idioma ?? "pt-BR", genero: g.id,
    voz: { edge: c.voz, velocidade: "-4%", tom: "-2Hz", tratamento: true, fluida: true },
    cenas: [], narracao: {}, imagens: {},
    processamento: { workflow: "gerar-ia.yml", pedidoEm: agora },
  };
}

if (cmd === "diario") {
  const so = args.includes("--canal") ? args[args.indexOf("--canal") + 1] : null;
  const forcar = args.includes("--forcar");
  const criados = [], faltam = [];
  for (const f of fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((n) => n.endsWith(".json")) : []) {
    const c = ler(f.replace(/\.json$/, ""));
    if (so ? c.id !== so : !c.ativo) continue;
    c.ideias ??= [];
    const pendentes = c.ideias.filter((i) => i.estado === "pendente");
    if (pendentes.length < 4) faltam.push(c.id);
    if (!forcar && c.ultimaGeracao === hoje()) { console.log(`= ${c.id}: já gerou hoje`); continue; }
    const ideia = pendentes[0];
    if (!ideia) { console.warn(`! ${c.id}: sem ideias na fila`); continue; }
    const anteriores = c.ideias.filter((i) => i.estado === "gerado").slice(-12).map((i) => i.titulo);
    const p = projetoDe(c, ideia, anteriores);
    if (fs.existsSync(path.join("projetos", p.id))) p.id += "-" + Math.random().toString(36).slice(2, 5); // 2º vídeo no mesmo dia (forçado)
    fs.mkdirSync(path.join("projetos", p.id), { recursive: true });
    // mesmos padrões de src/tipos.ts (LEGENDA_PADRAO + LEGENDA_CINEMA e EFEITOS_PADRAO); estilo-ia.mjs ajusta depois, pelo roteiro
    p.legenda = { fonte: "montserrat", tamanho: 60, cor: "#FFFFFF", corDestaque: "#FFD60A", posicao: 91, palavrasPorTela: 8, maiusculas: false, contorno: 0, fundo: "nenhum", animacao: "nenhuma", mostrar: true, modo: "cinema" };
    p.efeitos = { barraProgresso: true, trilha: true, volumeTrilha: 0.1, somTransicao: true, titulos: [], emojis: [], sons: [], zooms: [], enquete: null };
    fs.writeFileSync(path.join("projetos", p.id, "projeto.json"), JSON.stringify(p, null, 1) + "\n");
    Object.assign(ideia, { estado: "gerado", projeto: p.id, em: hoje() });
    c.ultimaGeracao = hoje();
    gravar(c);
    criados.push(p.id);
    console.log(`✓ ${c.id}: "${ideia.titulo}" → ${p.id}`);
  }
  saida("projetos", criados.join(","));
  saida("faltam", faltam.join(","));
} else if (cmd === "ideias") {
  const c = ler(args[0]);
  const novas = JSON.parse(fs.readFileSync(args[1], "utf8"));
  const lista = Array.isArray(novas) ? novas : novas.ideias;
  const ja = new Set((c.ideias ?? []).map((i) => norm(i.titulo)));
  let n = 0;
  for (const i of lista ?? []) {
    const titulo = String(i?.titulo ?? "").trim().slice(0, 120);
    if (titulo.length < 8 || ja.has(norm(titulo))) continue;
    ja.add(norm(titulo));
    (c.ideias ??= []).push({ titulo, ...(i.angulo ? { angulo: String(i.angulo).slice(0, 300) } : {}), estado: "pendente" });
    n++;
  }
  gravar(c);
  console.log(`${n} ideia(s) nova(s) em ${c.id}`);
  if (!n) process.exit(1);
} else {
  console.error("Uso: node scripts/canal.mjs diario [--canal ID] [--forcar] | ideias <canal> <arquivo.json>");
  process.exit(2);
}
