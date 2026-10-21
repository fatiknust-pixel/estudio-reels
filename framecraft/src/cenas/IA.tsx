import { AbsoluteFill } from "remotion";
import { useFormato } from "../tema";
import { Titulo } from "../componentes/Base";
import { Celular, Tela } from "../componentes/Celular";
import { Passos } from "../componentes/Passos";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const IA = () => {
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const lar = v ? 480 : 370;
  const itens = [
    { nome: "Tema", sub: "eu digito o assunto", em: quando("ia", "tema", 0, 40) },
    { nome: "Roteiro", sub: "o Claude pesquisa e escreve", em: quando("ia", "Claude", 0, 100) },
    { nome: "Voz", sub: "narração gerada automaticamente", em: quando("ia", "voz", 0, 160) },
    { nome: "Imagens", sub: "com os créditos das fontes", em: quando("ia", "imagens", 0, 200) },
    { nome: "Animações", sub: "montadas e prontas para editar", em: quando("ia", "animações", 0, 240) },
  ];
  return (
    <AbsoluteFill>
      <Titulo n={5} rotulo="Modo 1 · IA" texto="Do tema ao vídeo pronto" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1000 }} />
      <Passos itens={itens} esq={M} topo={v ? 450 : 330} largura={v ? 460 : 900} alto={v ? 190 : 108} vao={v ? 18 : 16} />
      <Celular largura={lar} em={10} style={{ left: v ? 1080 - 70 - lar : 1230, top: v ? 450 : 140 }}>
        <Tela src="novo-ia" />
      </Celular>
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
