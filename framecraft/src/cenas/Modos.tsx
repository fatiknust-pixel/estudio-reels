import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Caixa, Titulo } from "../componentes/Base";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

const MODOS = [
  { n: "MODO 1", nome: "Vídeo gerado por IA", desc: "Você dá o tema. O Claude escreve o roteiro e o app gera voz, imagens e animações.", fluxo: "tema  →  vídeo pronto", palavra: "primeiro" },
  { n: "MODO 2", nome: "Vídeo bruto", desc: "Você grava. O app transcreve, corta as pausas, legenda e destaca o que importa.", fluxo: "gravação  →  vídeo editado", palavra: "segundo" },
];

export const Modos = () => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const M = v ? 70 : 110;
  const t = MODOS.map((m, i) => quando("modos", m.palavra, 0, 60 + i * 120));
  const atual = t.reduce((a, x, i) => (f >= x ? i : a), -1);
  const w = v ? 940 : 820;
  const h = v ? 520 : 500;
  return (
    <AbsoluteFill>
      <Titulo n={4} rotulo="Dois modos" texto="Dois jeitos de criar o vídeo" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1500 }} />
      {MODOS.map((m, i) => (
        <Caixa key={m.n} em={t[i] - 8} ativo={atual === i} style={{ position: "absolute", left: v ? M : M + i * (w + 60), top: v ? 460 + i * (h + 36) : 360, width: w, height: h, padding: "44px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, color: COR.destaque, letterSpacing: 4 }}>{m.n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 52 : 56, color: COR.texto, marginTop: 14 }}>{m.nome}</div>
            <div style={{ fontFamily: SANS, fontSize: v ? 30 : 32, color: COR.suave, marginTop: 20, lineHeight: 1.35 }}>{m.desc}</div>
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 26, color: COR.texto, borderTop: `1px solid ${COR.linha}`, paddingTop: 22 }}>{m.fluxo}</div>
        </Caixa>
      ))}
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
