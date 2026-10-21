import { AbsoluteFill } from "remotion";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Caixa, Titulo } from "../componentes/Base";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const Tecnologia = () => {
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const itens = [
    { nome: "React", papel: "interface do aplicativo", em: quando("tecnologia", "React", 0, 30) },
    { nome: "TypeScript", papel: "código seguro e tipado", em: quando("tecnologia", "TypeScript", 0, 50) },
    { nome: "Remotion", papel: "animação e render do vídeo", em: quando("tecnologia", "Remotion", 0, 100) },
    { nome: "Whisper", papel: "transcrição da fala", em: quando("tecnologia", "Whisper", 0, 150) },
    { nome: "OpenCV", papel: "reconhecimento do rosto", em: quando("tecnologia", "OpenCV", 0, 200) },
    { nome: "Claude", papel: "roteiro e desenvolvimento", em: quando("tecnologia", "OpenCV", 0, 200) + 40 },
  ];
  const cols = v ? 2 : 3;
  const w = v ? 455 : 540;
  const h = v ? 290 : 230;
  return (
    <AbsoluteFill>
      <Titulo n={9} rotulo="Tecnologias" texto="As ferramentas por trás do projeto" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1600 }} />
      {itens.map((it, i) => (
        <Caixa key={it.nome} em={it.em - 6} style={{ position: "absolute", left: M + (i % cols) * (w + (v ? 30 : 40)), top: (v ? 520 : 400) + Math.floor(i / cols) * (h + (v ? 30 : 40)), width: w, height: h, padding: "0 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 44 : 48, color: COR.texto }}>{it.nome}</div>
          <div style={{ fontFamily: MONO, fontSize: v ? 22 : 24, color: COR.suave, marginTop: 10 }}>{it.papel}</div>
        </Caixa>
      ))}
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
