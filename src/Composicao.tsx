import React from "react";
import { AbsoluteFill, CalculateMetadataFunction } from "remotion";
import { ProvedorVideo } from "./contexto";
import { CamadaEfeitos } from "./componentes/Efeitos";
import { Legenda } from "./componentes/Legenda";
import { carregarFontes, FONTES } from "./fontes";
import { montarLinha, quadroDe } from "./linhaTempo";
import { ModoBruto } from "./ModoBruto";
import { ModoIA } from "./ModoIA";
import { LegendaAula, ModoAula } from "./aula/ModoAula";
import { temaDe } from "./temas";
import { Projeto } from "./tipos";

carregarFontes();

export type PropsVideo = { projeto: Projeto; arquivos?: Record<string, string> };

export const Composicao: React.FC<PropsVideo> = ({ projeto, arquivos }) => (
  <ProvedorVideo projeto={projeto} arquivos={arquivos}>
    <AbsoluteFill style={{ background: projeto.visual === "aula" ? "#FFFFFF" : temaDe(projeto.tema).fundo, overflow: "hidden", ["--fonte" as any]: `'${FONTES[projeto.legenda.fonte]?.familia ?? "Montserrat"}'` }}>
      {projeto.modo === "bruto" ? <ModoBruto /> : projeto.visual === "aula" ? <ModoAula /> : <ModoIA />}
      {projeto.visual === "aula" ? <LegendaAula /> : <Legenda />}
      <CamadaEfeitos />
    </AbsoluteFill>
  </ProvedorVideo>
);

export const calcularMetadados: CalculateMetadataFunction<PropsVideo> = ({ props }) => {
  const q = quadroDe(props.projeto);
  return { durationInFrames: montarLinha(props.projeto).duracao, width: q.largura, height: q.altura };
};
