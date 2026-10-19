import { useCurrentFrame } from "remotion";
import { cena, FPS } from "../dados";
import { COR, SANS, useFormato } from "../tema";

// Legenda da narração, com a palavra falada em destaque. Mostra um trecho curto por vez.
export const Legenda: React.FC<{ id: string }> = ({ id }) => {
  const f = useCurrentFrame();
  const { v } = useFormato();
  const base = v ? 1565 : 985;
  const c = cena(id);
  const t = (f - c.falaEm) / FPS;
  const grupos: { i: number; f: number; ws: typeof c.palavras }[] = [];
  let atual: typeof c.palavras = [];
  c.palavras.forEach((w, k) => {
    const prox = c.palavras[k + 1];
    atual.push(w);
    // quebra o trecho em pausas da fala ou a cada 6 palavras
    if (!prox || atual.length >= 6 || prox.i - w.f > 0.18) {
      grupos.push({ i: atual[0].i, f: atual[atual.length - 1].f, ws: atual });
      atual = [];
    }
  });
  const g = grupos.find((x, k) => t >= x.i - 0.15 && (t < (grupos[k + 1]?.i ?? x.f + 0.6) - 0.15));
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: base, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: v ? 38 : 34,
          color: COR.suave,
          background: "rgba(3,9,22,0.62)",
          padding: "10px 26px",
          borderRadius: 14,
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(141,178,245,0.18)",
          maxWidth: v ? 960 : 1300,
          textAlign: "center",
        }}
      >
        {g.ws.map((w, k) => {
          const falando = t >= w.i - 0.05;
          return (
            <span key={k} style={{ color: falando ? COR.branco : COR.suave, marginRight: k < g.ws.length - 1 ? 10 : 0 }}>
              {w.p}
            </span>
          );
        })}
      </div>
    </div>
  );
};
