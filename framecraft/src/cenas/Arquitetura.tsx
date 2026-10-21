import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Caixa, Conector, Defs, Glossario, Titulo } from "../componentes/Base";
import { quando } from "../dados";
import { Sfx } from "../componentes/Som";

export const Arquitetura = () => {
  const f = useCurrentFrame();
  const { v, W, H } = useFormato();
  const M = v ? 70 : 110;
  const nos = [
    { nome: "Aplicativo", sub: "navegador · GitHub Pages", em: quando("arquitetura", "navegador", 0, 40) },
    { nome: "API do GitHub", sub: "salva o projeto no repositório", em: quando("arquitetura", "GitHub", 0, 90) },
    { nome: "GitHub Actions", sub: "o Remotion renderiza o vídeo", em: quando("arquitetura", "Actions", 0, 150) },
    { nome: "MP4 final", sub: "volta para o celular", em: quando("arquitetura", "celular", 0, 200) },
  ];
  const w = v ? 720 : 360;
  const h = v ? 200 : 260;
  const gx = (1700 - 4 * w) / 3;
  const pos = nos.map((_, i) => (v ? { x: (W - w) / 2, y: 460 + i * (h + 80) } : { x: M + i * (w + gx), y: 400 }));
  return (
    <AbsoluteFill>
      <Titulo n={8} rotulo="Por dentro" texto="Sem servidor próprio: tudo roda no GitHub" style={{ position: "absolute", left: M, top: v ? 190 : 130, width: 1600 }} />
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs />
        {pos.slice(0, -1).map((p, i) => {
          const q = pos[i + 1];
          const d = v ? `M ${p.x + w / 2} ${p.y + h + 6} L ${q.x + w / 2} ${q.y - 8}` : `M ${p.x + w + 8} ${p.y + h / 2} L ${q.x - 10} ${q.y + h / 2}`;
          return <Conector key={i} d={d} em={nos[i + 1].em - 14} dur={14} sinal />;
        })}
      </svg>
      {nos.map((n, i) => (
        <Caixa key={n.nome} em={n.em - 6} ativo={f >= n.em && (i === nos.length - 1 || f < nos[i + 1].em)} style={{ position: "absolute", left: pos[i].x, top: pos[i].y, width: w, height: h, padding: "0 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 20, color: COR.destaque, letterSpacing: 3 }}>{String(i + 1).padStart(2, "0")}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v ? 42 : 36, color: COR.texto, marginTop: 8 }}>{n.nome}</div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: COR.suave, marginTop: 8 }}>{n.sub}</div>
        </Caixa>
      ))}
      <Glossario termo="Segurança" explica="a chave de acesso fica guardada só no aparelho" em={quando("arquitetura", "aparelho", 0, 260) - 30} style={{ position: "absolute", left: M, top: v ? 1580 : 760, width: v ? 940 : 1500 }} />
      <Sfx nome="tique" em={14} volume={0.2} />
    </AbsoluteFill>
  );
};
