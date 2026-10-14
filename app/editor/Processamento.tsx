import React, { useEffect, useRef, useState } from "react";
import { Projeto } from "../../src/tipos";
import * as gh from "../lib/github";
import { trazerResultado } from "../lib/projetos";
import { avisar, avisarErro } from "../ui";

const ETAPAS: Record<string, string> = {
  "processar-bruto.yml": "Transcrevendo e preparando o vídeo no GitHub",
  "gerar-ia.yml": "O Claude está pesquisando e escrevendo o roteiro",
  "atualizar-ia.yml": "Gerando voz e baixando imagens",
};

// Faixa no topo do editor enquanto uma Action trabalha no projeto; quando ela termina, traz o resultado.
export const Processamento: React.FC<{ projeto: Projeto; aoConcluir: (p: Projeto) => void }> = ({ projeto, aoConcluir }) => {
  const wf = projeto.processamento?.workflow ?? "processar-bruto.yml";
  const [exec, setExec] = useState<gh.Execucao | null>(null);
  const [segundos, setSegundos] = useState(0);
  const atual = useRef(projeto);
  atual.current = projeto;

  useEffect(() => {
    if (projeto.status !== "processando" || !gh.temToken()) return;
    let vivo = true;
    const inicio = Date.now();
    const conferir = async () => {
      try {
        const runs = await gh.listarExecucoes(wf, 15);
        // só execuções pedidas depois deste processamento (ignora as antigas do mesmo projeto)
        const desde = new Date(Date.parse(atual.current.processamento?.pedidoEm ?? "2000-01-01") - 60000).toISOString();
        const r = runs.find((x) => x.display_title.includes(projeto.id) && x.created_at >= desde.slice(0, 19));
        if (!vivo) return;
        setExec(r ?? null);
        // terminou: o projeto.json no GitHub já tem o resultado (ou o erro)
        if (r?.status === "completed") {
          const novo = await trazerResultado(atual.current);
          if (!vivo) return;
          if (novo.status === "processando" && r.conclusion !== "success") novo.status = "erro";
          aoConcluir(novo);
          if (novo.status === "pronto") avisar("Pronto! ✨");
        }
      } catch (e) {
        avisarErro(e);
      }
    };
    conferir();
    const t = setInterval(conferir, 10000);
    const s = setInterval(() => setSegundos(Math.round((Date.now() - inicio) / 1000)), 1000);
    return () => {
      vivo = false;
      clearInterval(t);
      clearInterval(s);
    };
  }, [projeto.status, projeto.id, wf]);

  if (projeto.status === "erro") {
    return (
      <div className="aviso erro" style={{ margin: 10 }}>
        ⚠️ {projeto.processamento?.erro ?? "O processamento falhou."}
      </div>
    );
  }
  if (projeto.status !== "processando") return null;
  return (
    <div className="aviso" style={{ margin: "8px 10px 0", display: "flex", gap: 10, alignItems: "center" }}>
      <span className="girando">⏳</span>
      <span style={{ flex: 1 }}>
        <b>{ETAPAS[wf] ?? "Processando no GitHub"}…</b>
        <br />
        <span className="pequeno suave">
          {exec ? (exec.status === "queued" ? "na fila do GitHub" : "rodando") : "aguardando o GitHub"} · {Math.floor(segundos / 60)}:{String(segundos % 60).padStart(2, "0")} · pode fechar o app e voltar depois
        </span>
      </span>
      {exec && <a className="btn mini" href={exec.html_url} target="_blank" rel="noreferrer">log</a>}
    </div>
  );
};
