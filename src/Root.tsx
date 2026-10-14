import React from "react";
import { Composition } from "remotion";
import { calcularMetadados, Composicao, PropsVideo } from "./Composicao";
import { ALTURA, FPS, LARGURA } from "./linhaTempo";
import demo from "../app/demos/demo-bruto.json";

// Uma composição só: o projeto chega por --props (render) ou pelo editor (prévia).
export const Root: React.FC = () => (
  <Composition
    id="Reels"
    component={Composicao}
    defaultProps={{ projeto: demo } as unknown as PropsVideo}
    calculateMetadata={calcularMetadados}
    durationInFrames={300}
    fps={FPS}
    width={LARGURA}
    height={ALTURA}
  />
);
