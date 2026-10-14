import React from "react";
import { FONTES } from "../../src/fontes";
import { TEMAS } from "../../src/temas";
import { ESTILOS } from "../estilos";
import { Alternar, Deslizar, Escolha } from "../ui";
import { useEditor } from "./contexto";

const CORES = ["#FFFFFF", "#FFD60A", "#30D158", "#00F5A0", "#0A84FF", "#FF3B30", "#FF2E88", "#BF5AF2", "#FF9F0A", "#111111"];

const Cores: React.FC<{ valor: string; mudar: (c: string) => void }> = ({ valor, mudar }) => (
  <div className="cores">
    {CORES.map((c) => (
      <button key={c} className={"cor" + (c.toLowerCase() === valor.toLowerCase() ? " on" : "")} style={{ background: c }} aria-label={c} onClick={() => mudar(c)} />
    ))}
    <input type="color" value={valor} onChange={(e) => mudar(e.target.value)} aria-label="Outra cor" />
  </div>
);

export const PainelEstilo: React.FC = () => {
  const { projeto: p, alterar } = useEditor();
  const L = p.legenda;
  const leg = (k: keyof typeof L, v: any) => alterar((x) => { (x.legenda as any)[k] = v; }, `leg-${k}`);

  return (
    <div>
      {p.modo === "bruto" && (
        <>
          <h3 style={{ marginTop: 0 }}>Estilo pronto</h3>
          <div className="estilos">
            {ESTILOS.map((e) => (
              <button
                key={e.id}
                className={"estilo-op" + (p.estilo === e.id ? " on" : "")}
                disabled={!e.pronto}
                onClick={() =>
                  alterar((x) => {
                    x.estilo = e.id;
                    x.tema = e.tema;
                    x.legenda = { ...x.legenda, ...e.legenda };
                    x.efeitos = { ...x.efeitos, ...(e.efeitos ?? {}) };
                    if (x.video && e.video) x.video = { ...x.video, ...e.video };
                  })
                }
              >
                <span className="e">{e.emoji}</span>
                <b>{e.nome}</b>
                <small>{e.descricao}</small>
              </button>
            ))}
          </div>
        </>
      )}

      <h3>Tema de cores</h3>
      <div className="temas">
        {Object.entries(TEMAS).map(([k, t]) => (
          <button key={k} className={"tema" + (p.tema === k ? " on" : "")} style={{ background: `linear-gradient(135deg, ${t.brilhoA}, ${t.fundo} 70%)`, color: t.texto }} onClick={() => alterar((x) => { x.tema = k; })}>
            <span style={{ display: "block", height: 6, borderRadius: 3, background: t.destaque, marginBottom: 6 }} />
            {t.nome}
          </button>
        ))}
      </div>

      <h3>Legenda</h3>
      <Alternar rotulo="Mostrar legenda" valor={L.mostrar} mudar={(v) => leg("mostrar", v)} />
      <label className="campo"><span>Fonte</span></label>
      <div className="fontes-esc">
        {Object.entries(FONTES).map(([k, f]) => (
          <button key={k} className={"fonte-op" + (L.fonte === k ? " on" : "")} style={{ fontFamily: `'${f.familia}'`, fontWeight: f.peso }} onClick={() => leg("fonte", k)}>
            {f.nome}
          </button>
        ))}
      </div>
      <label className="campo"><span>Cor do texto</span><Cores valor={L.cor} mudar={(c) => leg("cor", c)} /></label>
      <label className="campo"><span>Cor do destaque (palavra falada e palavras ⭐)</span><Cores valor={L.corDestaque} mudar={(c) => leg("corDestaque", c)} /></label>
      <Deslizar rotulo="Palavras por tela" valor={L.palavrasPorTela} min={1} max={8} mudar={(v) => leg("palavrasPorTela", v)} />
      <Deslizar rotulo="Tamanho" valor={L.tamanho} min={48} max={160} mudar={(v) => leg("tamanho", v)} />
      <Deslizar rotulo="Posição na tela" valor={L.posicao} min={15} max={88} mudar={(v) => leg("posicao", v)} fmt={(v) => (v < 35 ? "alto" : v < 60 ? "meio" : "baixo") + ` (${v}%)`} />
      <Deslizar rotulo="Contorno" valor={L.contorno} min={0} max={20} mudar={(v) => leg("contorno", v)} />
      <label className="campo"><span>Fundo</span>
        <Escolha opcoes={[["nenhum", "Nenhum"], ["caixa", "Caixa"], ["palavra", "Palavra ativa"]]} valor={L.fundo} mudar={(v) => leg("fundo", v)} />
      </label>
      <label className="campo"><span>Animação</span>
        <Escolha opcoes={[["pop", "Pop"], ["subir", "Subir"], ["nenhuma", "Nenhuma"]]} valor={L.animacao} mudar={(v) => leg("animacao", v)} />
      </label>
      <Alternar rotulo="LETRAS MAIÚSCULAS" valor={L.maiusculas} mudar={(v) => leg("maiusculas", v)} />

      {p.modo === "bruto" && p.video && (
        <>
          <h3>Vídeo</h3>
          <label className="campo"><span>Enquadramento (para vídeo deitado)</span>
            <Escolha opcoes={[["preencher", "Preencher 9:16"], ["ajustar", "Inteiro + fundo desfocado"]]} valor={p.video.enquadramento} mudar={(v) => alterar((x) => { x.video!.enquadramento = v; })} />
          </label>
          {p.video.enquadramento === "preencher" && p.video.largura > p.video.altura * 0.75 && (
            <Deslizar rotulo="Foco horizontal" valor={p.video.focoX} min={0} max={100} mudar={(v) => alterar((x) => { x.video!.focoX = v; }, "foco")} fmt={(v) => `${v}%`} />
          )}
          <Deslizar rotulo="Volume do vídeo" valor={Math.round(p.video.volume * 100)} min={0} max={150} mudar={(v) => alterar((x) => { x.video!.volume = v / 100; }, "vol")} fmt={(v) => `${v}%`} />
        </>
      )}
    </div>
  );
};
