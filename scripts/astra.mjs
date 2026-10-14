// Converte o formato do Astra (conteudo/<id>/roteiro.json + narracao.json + imagens.json gerado)
// em um projeto do Estúdio (projetos/<id>/projeto.json).
// Uso: node scripts/astra.mjs <pasta-roteiro> <narracao.json> <imagens.json> <id> [saida.json] [cena1,cena2...]
import fs from "node:fs";

export const LEGENDA_PADRAO = {
  fonte: "montserrat", tamanho: 92, cor: "#FFFFFF", corDestaque: "#FFD60A", posicao: 70, palavrasPorTela: 3,
  maiusculas: true, contorno: 10, fundo: "nenhum", animacao: "pop", mostrar: true,
};
export const EFEITOS_PADRAO = {
  barraProgresso: true, trilha: true, volumeTrilha: 0.1, somTransicao: true,
  titulos: [], emojis: [], sons: [], zooms: [], enquete: null,
};

export const deAstra = ({ id, roteiro, narracao, imagens, so, anterior }) => {
  const agora = new Date().toISOString();
  const cenas = roteiro.cenas.filter((c) => !so || so.includes(c.id));
  const narr = {};
  for (const c of cenas) if (narracao?.cenas?.[c.id]) narr[c.id] = narracao.cenas[c.id];
  const imgs = {};
  for (const [k, v] of Object.entries(imagens ?? {})) {
    if (k.startsWith("_")) continue;
    imgs[k] = { arquivo: v.arquivo, rotulo: v.rotulo, autor: v.autor, licenca: v.licenca, pagina: v.pagina };
  }
  return {
    versao: 1,
    id,
    titulo: roteiro.titulo,
    modo: "ia",
    estilo: "documentario",
    tema: roteiro.tema ?? anterior?.tema ?? "padrao",
    criadoEm: anterior?.criadoEm ?? agora,
    atualizadoEm: agora,
    status: "pronto",
    legenda: {
      ...LEGENDA_PADRAO,
      ...(anterior?.legenda ?? {}),
      ...(roteiro.legenda?.palavrasPorTela ? { palavrasPorTela: roteiro.legenda.palavrasPorTela } : {}),
      ...(roteiro.legenda?.corDestaque ? { corDestaque: roteiro.legenda.corDestaque } : {}),
    },
    efeitos: anterior?.efeitos ?? EFEITOS_PADRAO,
    pedido: anterior?.pedido,
    voz: { edge: roteiro.voz?.edge ?? "pt-BR-AntonioNeural", velocidade: roteiro.voz?.velocidade ?? "+5%" },
    cenas: cenas.map((c) => ({ id: c.id, texto: c.texto, fundo: c.fundo || undefined, fontes: c.fontes ?? [], elementos: c.elementos ?? [] })),
    narracao: narr,
    imagens: imgs,
    fontesPesquisa: roteiro.fontesPesquisa ?? anterior?.fontesPesquisa ?? [],
  };
};

if (process.argv[1]?.endsWith("astra.mjs")) {
  const [roteiroArq, narrArq, imgsArq, id, saida, so] = process.argv.slice(2);
  const ler = (a) => (a && fs.existsSync(a) ? JSON.parse(fs.readFileSync(a, "utf8")) : {});
  const p = deAstra({ id, roteiro: ler(roteiroArq), narracao: ler(narrArq), imagens: ler(imgsArq), so: so?.split(",") });
  const txt = JSON.stringify(p, null, 1) + "\n";
  if (saida) fs.writeFileSync(saida, txt);
  else process.stdout.write(txt);
}
