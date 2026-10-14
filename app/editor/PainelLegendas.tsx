import React, { memo, useMemo, useState } from "react";
import { agrupar } from "../../src/componentes/Legenda";
import { FPS, PalavraTempo } from "../../src/linhaTempo";
import { novoId, Palavra, Projeto } from "../../src/tipos";
import { CampoTempo, fmtTempo } from "../ui";
import { useEditor, useFrame } from "./contexto";

type Sel = { cena?: number; idx: number };

// Onde mora a palavra original (para editar texto/tempo)
const acharPalavra = (p: Projeto, cenaId: string | undefined, idx: number): Palavra | undefined =>
  p.modo === "bruto" ? p.palavras?.[idx] : cenaId ? p.narracao?.[cenaId]?.palavras?.[idx] : undefined;

const TelaLeg = memo(({ tela, atual, sel, escolher, cortadas }: { tela: PalavraTempo[]; atual: boolean; sel: Sel | null; escolher: (w: PalavraTempo) => void; cortadas?: Set<number> }) => (
  <div className={"tela-leg" + (atual ? " atual" : "")}>
    <div className="t">{fmtTempo(tela[0].ini / FPS)}</div>
    {tela.map((w) => (
      <button
        key={`${w.cena}-${w.idx}`}
        className={"pal" + (w.destaque ? " dest" : "") + (sel && sel.idx === w.idx && sel.cena === w.cena ? " sel" : "") + (cortadas?.has(w.idx) ? " cortada" : "")}
        onClick={() => escolher(w)}
      >
        {w.p}
      </button>
    ))}
  </div>
));

export const PainelLegendas: React.FC = () => {
  const { projeto: p, linha, alterar, irParaFrame, tempoAgora } = useEditor();
  const f = useFrame();
  const [sel, setSel] = useState<Sel | null>(null);
  const telas = useMemo(() => agrupar(linha.palavras, Math.max(1, p.legenda.palavrasPorTela)), [linha, p.legenda.palavrasPorTela]);
  const atual = telas.findIndex((t, i) => f >= t[0].ini && f < (telas[i + 1]?.[0].ini ?? Infinity));
  const semNarracao = p.modo === "ia" && linha.cenas.some((c) => !p.narracao?.[c.id]);

  const cenaSel = sel?.cena !== undefined ? linha.cenas[sel.cena] : undefined;
  const w = sel ? acharPalavra(p, cenaSel?.id, sel.idx) : undefined;
  // tempos da palavra: no modo IA são relativos ao começo do áudio da cena
  const desloc = cenaSel ? (cenaSel.inicio + 2) / FPS : 0;

  const mudarPalavra = (f: (w: Palavra) => void, chave?: string) =>
    alterar((x) => {
      const alvo = sel && acharPalavra(x, cenaSel?.id, sel.idx);
      if (alvo) f(alvo);
    }, chave);

  const escolher = (w: PalavraTempo) => {
    setSel({ cena: w.cena, idx: w.idx });
    irParaFrame(w.ini);
  };

  return (
    <div>
      <p className="pequeno suave" style={{ marginTop: 0 }}>
        Toque numa palavra para pular até ela e editar o texto, o tempo ou destacar. Estilo e posição ficam na aba 🎨 Estilo.
      </p>
      {semNarracao && <div className="aviso pequeno">Algumas cenas ainda não têm narração; a legenda delas é uma estimativa até a voz ser gerada.</div>}
      {!telas.length && <div className="vazio-lista">Sem legendas ainda. Elas aparecem depois que a fala for transcrita (ou a narração gerada).</div>}
      <div className="telas">
        {telas.map((t, i) => (
          <TelaLeg key={i} tela={t} atual={i === atual} sel={sel} escolher={escolher} />
        ))}
      </div>

      {sel && (
        <div className="folha">
          {!w ? (
            <p className="pequeno" style={{ margin: 0 }}>Esta palavra é uma estimativa (ainda sem narração) — edite o texto da cena na aba 🎞️ Cenas.</p>
          ) : (
            <>
              <div className="linha">
                <input className="cresce" type="text" value={w.p} aria-label="Texto da palavra" onChange={(e) => mudarPalavra((x) => { x.p = e.target.value; }, `p${sel.idx}`)} />
                <button className={"btn" + (w.destaque ? " prim" : "")} onClick={() => mudarPalavra((x) => { x.destaque = !x.destaque; })} title="Destacar">⭐</button>
                <button className="btn icone chato" onClick={() => setSel(null)} aria-label="Fechar">✕</button>
              </div>
              <div className="linha" style={{ marginTop: 8, flexWrap: "wrap" }}>
                <CampoTempo rotulo="início" valor={w.i} mudar={(v) => mudarPalavra((x) => { x.i = v; }, `i${sel.idx}`)} agora={() => tempoAgora() - desloc} passo={0.05} />
                <CampoTempo rotulo="fim" valor={w.f} mudar={(v) => mudarPalavra((x) => { x.f = v; }, `f${sel.idx}`)} agora={() => tempoAgora() - desloc} passo={0.05} />
              </div>
              <div className="linha" style={{ marginTop: 8 }}>
                {p.modo === "bruto" ? (
                  <button className="btn perigo cresce" onClick={() => {
                    alterar((x) => { (x.cortes ??= []).push({ id: novoId("c"), i: w.i, f: w.f, motivo: "palavra" }); });
                    setSel(null);
                  }}>✂️ Cortar esta palavra do vídeo</button>
                ) : (
                  <button className="btn perigo cresce" onClick={() => { mudarPalavra((x) => { x.p = ""; }); setSel(null); }}>Esconder da legenda</button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
