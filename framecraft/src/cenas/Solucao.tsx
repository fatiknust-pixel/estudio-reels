import { AbsoluteFill } from "remotion";
import { useFormato } from "../tema";
import { Glossario, Titulo } from "../componentes/Base";
import { Celular, Tela } from "../componentes/Celular";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const Solucao = () => {
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const lar = v ? 470 : 370;
  return (
    <AbsoluteFill>
      <Titulo n={3} rotulo="A solução" texto="Tudo em um só aplicativo" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1100 }} />
      <Celular largura={lar} em={quando("solucao", "lugar", 0, 40) - 20} style={{ left: v ? 540 - lar / 2 : 1230, top: v ? 390 : 140 }}>
        <Tela src="inicio" />
      </Celular>
      <div style={{ position: "absolute", left: M, top: v ? 1470 : 400, width: v ? 940 : 900, display: "flex", flexDirection: "column", gap: v ? 18 : 34 }}>
        <Glossario termo="Instalável" explica="funciona como app, direto do celular" em={quando("solucao", "aplicativo", 0, 80)} />
        <Glossario termo="Sem servidor" explica="usa o GitHub como base e para renderizar" em={quando("solucao", "servidor", 0, 120)} />
        <Glossario termo="Prévia ao vivo" explica="vê o resultado antes de exportar" em={quando("solucao", "servidor", 0, 120) + 24} />
      </div>
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
