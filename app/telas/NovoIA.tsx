import React from "react";
import { ir } from "../ui";

// Etapa 3: tema, tom, tema de cores e duração → Action com o Claude escreve o roteiro.
export const NovoIA: React.FC = () => (
  <div className="tela">
    <div className="topo"><button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")}>←</button><h1>Vídeo gerado por IA</h1></div>
    <div className="aviso">Em construção (etapa 3). Enquanto isso, abra o exemplo do Modo 1 para testar o editor.</div>
    <button className="btn prim largo" onClick={() => ir("/editor/demo-ia")}>Abrir exemplo</button>
  </div>
);
