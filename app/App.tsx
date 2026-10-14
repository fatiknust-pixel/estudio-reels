import React from "react";
import { createRoot } from "react-dom/client";
import "./estilo.css";
import { Avisos, useRota } from "./ui";
import { Inicio } from "./telas/Inicio";
import { Config } from "./telas/Config";
import { Editor } from "./telas/Editor";
import { NovoBruto } from "./telas/NovoBruto";
import { NovoIA } from "./telas/NovoIA";
import { pedirPersistencia } from "./lib/local";

pedirPersistencia();

const App: React.FC = () => {
  const rota = useRota();
  const partes = rota.split("/").filter(Boolean);
  let tela: React.ReactNode;
  if (partes[0] === "config") tela = <Config />;
  else if (partes[0] === "editor" && partes[1]) tela = <Editor key={partes[1]} id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === "novo" && partes[1] === "bruto") tela = <NovoBruto />;
  else if (partes[0] === "novo" && partes[1] === "ia") tela = <NovoIA />;
  else tela = <Inicio />;
  return (
    <>
      {tela}
      <Avisos />
    </>
  );
};

createRoot(document.getElementById("app")!).render(<App />);
