import React, { useState } from "react";
import * as gh from "../lib/github";
import { salvarNoGitHub } from "../lib/projetos";
import { avisar, avisarErro, fmtTempo } from "../ui";
import { useEditor } from "./contexto";

const ehIA = (id?: string) => String(id ?? "").startsWith("ia-");

// Modo 2: o que o Claude sugeriu (já aplicado) — dá para desligar por partes ou pedir de novo.
export const PainelIA: React.FC<{ aoPedir: (p: any) => void }> = ({ aoPedir }) => {
  const { projeto: p, alterar, irPara, ehDemo } = useEditor();
  const [pedindo, setPedindo] = useState(false);
  const s = p.sugestoes;
  const ef = p.efeitos;
  const cortesIA = (p.cortes ?? []).filter((c) => String(c.motivo ?? "").startsWith("IA"));
  const zoomsIA = ef.zooms.filter((z) => ehIA(z.id));
  const emojisIA = ef.emojis.filter((e) => ehIA(e.id));
  const titulosIA = ef.titulos.filter((t) => ehIA(t.id));
  const destaques = (p.palavras ?? []).filter((w) => w.destaque).length;

  const pedir = async () => {
    if (ehDemo) return avisar("No exemplo não dá para chamar o Claude. Crie um projeto seu.", true);
    setPedindo(true);
    try {
      const novo = { ...p, status: "processando" as const, processamento: { ...p.processamento, workflow: "processar-bruto.yml", pedidoEm: new Date().toISOString(), erro: undefined } };
      const salvo = await salvarNoGitHub(novo, (m) => avisar(m));
      await gh.dispararWorkflow("processar-bruto.yml", { projeto: p.id, etapa: "sugestoes", ia: "true", modelo: "medium" });
      aoPedir(salvo);
      avisar("Pedido ao Claude ✓");
    } catch (e) {
      avisarErro(e);
    } finally {
      setPedindo(false);
    }
  };

  const Linha: React.FC<{ titulo: React.ReactNode; info?: React.ReactNode; tirar?: () => void }> = ({ titulo, info, tirar }) => (
    <div className="elem">
      <div className="linha">
        <span className="cresce"><b>{titulo}</b>{info && <><br /><span className="pequeno suave">{info}</span></>}</span>
        {tirar && <button className="btn mini perigo" onClick={tirar}>Tirar</button>}
      </div>
    </div>
  );

  return (
    <div>
      {!s ? (
        <div className="vazio-lista">Este projeto ainda não tem sugestões da IA.</div>
      ) : (
        <>
          <p className="pequeno suave" style={{ marginTop: 0 }}>O Claude leu a transcrição e já aplicou estas sugestões. Tire o que não gostar (↶ desfaz).</p>
          {s.titulo && s.titulo !== p.titulo && (
            <Linha titulo={`Título sugerido: “${s.titulo}”`} tirar={undefined} info={<button className="btn mini" style={{ marginTop: 6 }} onClick={() => alterar((x) => { x.titulo = s.titulo; })}>Usar este título</button>} />
          )}
          {p.gancho && (
            <Linha
              titulo={<>🪝 Gancho: “{p.gancho.texto ?? "sem texto"}”</>}
              info={<>{fmtTempo(p.gancho.i)} → {fmtTempo(p.gancho.f)} toca antes do começo · edite na aba ✂️ Cortes <button className="btn mini" onClick={() => irPara(p.gancho!.i, true)}>▶</button></>}
              tirar={() => alterar((x) => { x.gancho = null; })}
            />
          )}
          {cortesIA.length > 0 && (
            <Linha titulo={`✂️ ${cortesIA.length} corte(s) de enrolação`} info={`${cortesIA.reduce((t, c) => t + c.f - c.i, 0).toFixed(1)}s a menos · ${[...new Set(cortesIA.map((c) => c.motivo!.replace("IA: ", "")))].join(", ")}`}
              tirar={() => alterar((x) => { x.cortes = (x.cortes ?? []).filter((c) => !String(c.motivo ?? "").startsWith("IA")); })} />
          )}
          {destaques > 0 && <Linha titulo={`⭐ ${destaques} palavra(s) em destaque`} info="na legenda (aba 💬 Legendas)" tirar={() => alterar((x) => { (x.palavras ?? []).forEach((w) => delete w.destaque); })} />}
          {zoomsIA.length > 0 && <Linha titulo={`🔍 ${zoomsIA.length} zoom(s) de ênfase`} tirar={() => alterar((x) => { x.efeitos.zooms = x.efeitos.zooms.filter((z) => !ehIA(z.id)); })} />}
          {emojisIA.length > 0 && <Linha titulo={`😀 Emojis: ${emojisIA.map((e) => e.emoji).join(" ")}`} tirar={() => alterar((x) => { x.efeitos.emojis = x.efeitos.emojis.filter((e) => !ehIA(e.id)); })} />}
          {titulosIA.length > 0 && <Linha titulo={`🏷️ Títulos: ${titulosIA.map((t) => t.texto).join(" · ")}`} tirar={() => alterar((x) => { x.efeitos.titulos = x.efeitos.titulos.filter((t) => !ehIA(t.id)); })} />}
          {ef.enquete?.ia && <Linha titulo={`🗳️ Enquete: ${ef.enquete.pergunta}`} info={ef.enquete.opcoes.join(" / ")} tirar={() => alterar((x) => { x.efeitos.enquete = null; })} />}
        </>
      )}
      <button className="btn prim largo" style={{ marginTop: 12 }} disabled={pedindo || p.status === "processando" || !(p.palavras ?? []).length} onClick={pedir}>
        🤖 {s ? "Pedir novas sugestões ao Claude" : "Pedir sugestões ao Claude"}
      </button>
      <p className="pequeno suave">As novas sugestões substituem as anteriores da IA; o que você fez à mão fica.</p>
    </div>
  );
};
