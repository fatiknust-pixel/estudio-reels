import React from "react";
import { ir } from "../ui";

// Etapa 2: escolher vídeo da galeria + estilo, enviar e transcrever.
export const NovoBruto: React.FC = () => (
  <div className="tela">
    <div className="topo"><button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")}>←</button><h1>Editar vídeo bruto</h1></div>
    <div className="aviso">Em construção (etapa 2). Enquanto isso, abra o exemplo do Modo 2 para testar o editor.</div>
    <button className="btn prim largo" onClick={() => ir("/editor/demo-bruto")}>Abrir exemplo</button>
  </div>
);
