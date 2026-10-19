import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { quando } from "../dados";
import roteiro from "../../conteudo/roteiro.json";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Icone } from "../componentes/Icone";
import { Sfx } from "../componentes/Som";

const ID = "autor";
// Trecho real do código do app (app/lib/projetos.ts)
const CODIGO = `export const carregarProjeto = async (id: string) => {
  if (ehDemo(id)) {
    const salvo = await local.projeto(id);
    return { projeto: salvo ?? structuredClone(DEMOS[id]) };
  }
  const doAparelho = await local.projeto(id);
  if (doAparelho && (estaSujo(id) || !gh.temToken()))
    return { projeto: doAparelho, origem: "aparelho" };
  try {
    const remoto = await gh.lerJSON(\`\${pasta(id)}/projeto.json\`);
    await local.salvarProjeto(remoto);
    return { projeto: remoto, origem: "github" };
  } catch (e) {
    if (doAparelho) return { projeto: doAparelho };
    throw e;
  }
};

export const salvarNoGitHub = async (p: Projeto) => {
  const pendentes = lerSujos()[p.id] ?? [];
  for (const caminho of pendentes) {
    const b = await local.arquivo(p.id, caminho);
    await gh.salvarArquivo(\`\${pasta(p.id)}/\${caminho}\`, b);
  }
};`.split("\n");
const PALAVRAS = /\b(export|const|async|await|return|if|try|catch|throw|for|of)\b/g;

const Linha: React.FC<{ t: string }> = ({ t }) => {
  const partes = t.split(PALAVRAS);
  return (
    <div style={{ whiteSpace: "pre", height: 34 }}>
      {partes.map((p, i) => (
        <span key={i} style={{ color: PALAVRAS.test(p) ? "#C792EA" : /["`]/.test(p) ? "#C3E88D" : "#E6E8F0" }}>
          {(PALAVRAS.lastIndex = 0, p)}
        </span>
      ))}
    </div>
  );
};

const FATOS: [string, string][] = [
  ["2", "modos de criação"],
  ["6", "estilos de edição"],
  ["5", "automações no GitHub Actions"],
];

export const Autor = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v } = useFormato();
  const nome = quando(ID, "Fabio", 0, 20) - 4;
  const ia = quando(ID, "inteligência", 0, 60) - 4;
  const linhas = Math.floor(interpolate(f, [0, 90], [3, CODIGO.length], { extrapolateRight: "clamp" }));
  const sNome = spring({ frame: f - nome, fps, config: { damping: 14, stiffness: 140 } });
  const sIA = spring({ frame: f - ia, fps, config: { damping: 11 } });
  const painel = v ? { x: 60, y: 940, w: 960, h: 520 } : { x: 90, y: 200, w: 820, h: 680 };
  return (
    <AbsoluteFill>
      {/* editor de código com o código real do app sendo "digitado" */}
      <div style={{ position: "absolute", left: painel.x, top: painel.y, width: painel.w, height: painel.h, borderRadius: 20, background: "rgba(13,15,24,0.95)", border: `1.5px solid ${COR.linha}`, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: spring({ frame: f, fps }) }}>
        <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `1px solid ${COR.linha}` }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
          ))}
          <span style={{ marginLeft: 12, fontFamily: MONO, fontSize: 18, color: COR.suave }}>app/lib/projetos.ts</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 52, bottom: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", fontFamily: MONO, fontWeight: 500, fontSize: v ? 19 : 20, transform: `translateY(${-Math.max(0, linhas - (v ? 12 : 16)) * 34}px)` }}>
          {CODIGO.slice(0, linhas).map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 18 }}>
              <span style={{ width: 30, textAlign: "right", color: "rgba(201,184,255,0.35)" }}>{i + 1}</span>
              <Linha t={t} />
            </div>
          ))}
        </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: v ? 60 : 1000, top: v ? 210 : 230, width: v ? 960 : 840 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: COR.suave, opacity: sNome }}>Um projeto de</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: v ? 104 : 104, color: COR.branco, letterSpacing: -3, lineHeight: 1.05, opacity: sNome, transform: `translateY(${(1 - sNome) * 40}px)` }}>
          {roteiro.autor}
        </div>
        <div style={{ height: 8, width: 360 * sNome, background: COR.ciano, borderRadius: 4, marginTop: 10 }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 30, padding: "14px 24px", borderRadius: 999, background: "rgba(139,92,246,0.18)", border: `2px solid ${COR.azul}`, fontFamily: SANS, fontWeight: 700, fontSize: v ? 30 : 30, color: COR.branco, opacity: sIA, transform: `scale(${0.85 + 0.15 * sIA})` }}>
          <Icone nome="efeitos" tamanho={34} cor={COR.ciano} />
          Desenvolvido com auxílio de IA
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
          {FATOS.map(([n, t], k) => {
            const s = spring({ frame: f - ia - 10 - k * 6, fps, config: { damping: 14 } });
            return (
              <div key={k} style={{ flex: 1, padding: "18px 18px", borderRadius: 18, background: "rgba(26,31,46,0.9)", border: `1.5px solid ${COR.linha}`, opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: COR.ciano, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: COR.suave, marginTop: 8, lineHeight: 1.2 }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>
      {Array.from({ length: 10 }, (_, i) => (
        <Sfx key={i} nome="tecla" em={2 + i * 8} volume={0.18} />
      ))}
      <Sfx nome="swoosh" em={nome} volume={0.35} />
      <Sfx nome="sucesso" em={ia + 4} volume={0.3} />
    </AbsoluteFill>
  );
};
