import { AbsoluteFill } from "remotion";
import { useFormato } from "../tema";
import { Titulo } from "../componentes/Base";
import { Celular, Tela } from "../componentes/Celular";
import { Passos } from "../componentes/Passos";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const Bruto = () => {
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const lar = v ? 480 : 370;
  const itens = [
    { nome: "Transcrição", sub: "palavra por palavra (Whisper)", em: quando("bruto", "transcreve", 0, 40) },
    { nome: "Cortes", sub: "pausas removidas automaticamente", em: quando("bruto", "corta", 0, 100) },
    { nome: "Enquadramento", sub: "acompanha o rosto (OpenCV)", em: quando("bruto", "acompanha", 0, 160) },
    { nome: "Destaques", sub: "zoom e legendas no que importa", em: quando("bruto", "zoom", 0, 220) },
  ];
  return (
    <AbsoluteFill>
      <Titulo n={6} rotulo="Modo 2 · Vídeo bruto" texto="Do vídeo gravado ao vídeo editado" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1000 }} />
      <Passos itens={itens} esq={M} topo={v ? 450 : 360} largura={v ? 460 : 900} alto={v ? 240 : 120} vao={20} />
      <Celular largura={lar} em={10} style={{ left: v ? 1080 - 70 - lar : 1230, top: v ? 450 : 140 }}>
        <Tela src="novo-bruto" />
      </Celular>
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
