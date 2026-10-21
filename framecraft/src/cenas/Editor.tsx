import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Titulo } from "../componentes/Base";
import { Celular, Tela } from "../componentes/Celular";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const Editor = () => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const lar = v ? 480 : 370;
  const abas = [
    { nome: "Cenas", tela: "editor-cenas", em: 0 },
    { nome: "Legendas", tela: "editor-legendas", em: quando("editor", "legendas", 0, 70) },
    { nome: "Estilo", tela: "editor-estilo", em: quando("editor", "cores", 0, 100) },
    { nome: "Efeitos", tela: "editor-efeitos", em: quando("editor", "efeitos", 0, 150) },
    { nome: "Exportar", tela: "editor-exportar", em: quando("editor", "exportar", 0, 220) },
  ];
  const atual = abas.reduce((a, x, i) => (f >= x.em ? i : a), 0);
  return (
    <AbsoluteFill>
      <Titulo n={7} rotulo="O editor" texto="Ajuste tudo com prévia ao vivo" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1000 }} />
      <Celular largura={lar} em={4} style={{ left: v ? 540 - lar / 2 : 1230, top: v ? 380 : 140 }}>
        {abas.map((a, i) => (
          <Tela key={a.tela} src={a.tela} opacidade={interpolate(f, [a.em - 6, a.em + 6, (abas[i + 1]?.em ?? 9999) - 6, (abas[i + 1]?.em ?? 9999) + 6], [i === 0 ? 1 : 0, 1, 1, i === abas.length - 1 ? 1 : 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        ))}
      </Celular>
      <div style={{ position: "absolute", left: M, top: v ? 1470 : 420, width: v ? 940 : 800, display: "flex", flexDirection: v ? "row" : "column", flexWrap: "wrap", gap: v ? 14 : 18 }}>
        {abas.map((a, i) => (
          <div key={a.nome} style={{ fontFamily: v ? MONO : SANS, fontWeight: 600, fontSize: v ? 28 : 40, padding: v ? "14px 26px" : "10px 0", color: i === atual ? COR.texto : COR.apagado, border: v ? `1.5px solid ${i === atual ? COR.destaque : COR.linha}` : "none", borderRadius: 10, display: "flex", alignItems: "center", gap: 20 }}>
            {!v && <span style={{ width: 36 * (i === atual ? 1 : 0.35), height: 3, background: i === atual ? COR.destaque : COR.linha }} />}
            {a.nome}
          </div>
        ))}
      </div>
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
