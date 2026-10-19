import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MARCAS, quando } from "../dados";
import { COR, MONO, SANS, useFormato } from "../tema";
import { Celular, Tela, posCelular } from "../componentes/Celular";
import { Icone } from "../componentes/Icone";
import { Rotulo, Surge } from "../componentes/Texto";
import { Sfx } from "../componentes/Som";
import { VideoReal } from "./IA";

const ID = "editor";
const ABAS = [
  ["editor-cenas", "Cenas"],
  ["editor-legendas", "Legendas"],
  ["editor-estilo", "Estilo"],
  ["editor-efeitos", "Efeitos"],
  ["editor-imagens", "Imagens"],
  ["editor-exportar", "Exportar"],
] as const;

// Editor: as abas passam uma a uma com a prévia (o vídeo real) tocando, e termina exportando em HD.
export const Editor = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v } = useFormato();
  const CEL = posCelular(v);
  const exporta = quando(ID, "exporta", 0, 110) - 4;
  const passo = Math.max(10, Math.floor((exporta - 6) / 5));
  const aba = Math.min(5, Math.max(0, Math.floor((f - 6) / passo)));
  const atual = f >= exporta ? 5 : Math.min(4, aba);
  const pl = MARCAS["editor-cenas"].el[".player > div"][0];
  const prog = interpolate(f, [exporta + 6, exporta + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const ok = f >= exporta + 42;
  const sOk = spring({ frame: f - exporta - 42, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: CEL.x, top: CEL.y }}>
        <Celular largura={CEL.largura} rotY={v ? 0 : -8} rotX={3}>
          {ABAS.map(([nome], k) => (
            <Tela key={nome} nome={nome} style={{ opacity: k === atual ? 1 : 0 }}>
              <div style={{ position: "absolute", left: pl[0], top: pl[1], width: pl[2], height: pl[3], overflow: "hidden", background: "#000" }}>
                {k === atual && <VideoReal de={180} />}
              </div>
            </Tela>
          ))}
        </Celular>
      </div>
      <div style={{ position: "absolute", left: v ? 70 : 860, top: v ? 190 : 150, width: v ? 960 : 1000 }}>
        <Rotulo texto="Editor com prévia ao vivo" em={2} cor={COR.ciano} />
        <Surge texto="Ajuste tudo." em={4} tamanho={v ? 60 : 72} peso={800} intervalo={2} style={{ marginTop: 20 }} />
        <Surge texto="Exporte em HD." em={exporta - 4} tamanho={v ? 60 : 72} peso={800} cor={COR.ciano} intervalo={2} style={{ marginTop: 4 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: v ? 22 : 36, maxWidth: v ? 960 : 820 }}>
          {ABAS.map(([, rot], k) => {
            const on = k === atual;
            return (
              <div key={rot} style={{ fontFamily: SANS, fontWeight: 700, fontSize: v ? 24 : 28, padding: v ? "8px 18px" : "10px 22px", borderRadius: 999, background: on ? COR.ciano : "rgba(26,31,46,0.85)", color: on ? "#111" : COR.suave, border: `1.5px solid ${on ? COR.ciano : COR.linha}`, transform: `scale(${on ? 1.06 : 1})` }}>
                {rot}
              </div>
            );
          })}
        </div>
        {!v || f >= exporta ? (
          <div style={{ marginTop: v ? 22 : 44, width: v ? 940 : 760, padding: v ? "16px 22px" : "22px 28px", borderRadius: 20, background: "rgba(26,31,46,0.9)", border: `1.5px solid ${ok ? COR.verde : COR.linha}`, opacity: interpolate(f, [exporta - 6, exporta + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: v ? 26 : 30, color: COR.branco }}>
              <Icone nome={ok ? "check" : "video"} tamanho={v ? 34 : 38} cor={ok ? COR.verde : COR.ciano} espessura={2.4} style={{ transform: `scale(${ok ? 0.8 + 0.2 * sOk : 1})` }} />
              {ok ? "Pronto: MP4 1080×1920" : "Renderizando no GitHub Actions…"}
              <span style={{ marginLeft: "auto", fontFamily: MONO, color: ok ? COR.verde : COR.claro }}>{Math.round(prog * 100)}%</span>
            </div>
            <div style={{ marginTop: 14, height: 12, borderRadius: 6, background: "rgba(201,184,255,0.12)", overflow: "hidden" }}>
              <div style={{ width: `${prog * 100}%`, height: "100%", background: ok ? COR.verde : `linear-gradient(90deg, ${COR.azul}, ${COR.ciano})` }} />
            </div>
          </div>
        ) : null}
      </div>
      {ABAS.slice(1, 5).map((_, k) => (
        <Sfx key={k} nome="clique" em={6 + (k + 1) * passo} volume={0.35} />
      ))}
      <Sfx nome="clique" em={exporta} volume={0.45} />
      <Sfx nome="subida" em={exporta + 6} volume={0.25} />
      <Sfx nome="sucesso" em={exporta + 42} volume={0.4} />
    </AbsoluteFill>
  );
};
