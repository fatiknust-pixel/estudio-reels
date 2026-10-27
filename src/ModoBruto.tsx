// Modo 2 — vídeo bruto: junta os trechos que sobraram depois dos cortes, enquadra em 9:16 e aplica zooms.
import React from "react";
import { AbsoluteFill, Audio, Easing, getRemotionEnvironment, interpolate, OffthreadVideo, Sequence, spring, useCurrentFrame } from "remotion";
import { arquivoGlobal } from "./arquivos";
import { useVideo } from "./contexto";
import { Fundo } from "./componentes/Fundo";
import { AjusteMargem, MARGEM_TELA } from "./componentes/AjusteMargem";
import { FPS } from "./linhaTempo";

// Escala do zoom no frame atual (zooms em tempo do conteúdo)
const useEscala = () => {
  const f = useCurrentFrame();
  const { projeto, linha } = useVideo();
  const t = linha.paraConteudo(f);
  // no gancho (abertura) não há zoom: ele pertence ao corpo do vídeo
  const tr = linha.trechos.find((x) => f / FPS >= x.saida && f / FPS < x.saida + x.fim - x.ini);
  if (tr?.gancho) return 1.06;
  const z = projeto.efeitos.zooms.find((z) => t >= z.i && t < z.f);
  if (!z) return 1;
  if (z.seco) return z.escala; // estilo "cortes rápidos": muda o enquadramento de uma vez
  const entrou = (t - z.i) * FPS;
  const falta = (z.f - t) * FPS;
  if (z.suave) {
    // aproximação lenta durante todo o trecho (estilo documentário)
    return interpolate(t, [z.i, z.f], [1, z.escala], { easing: Easing.inOut(Easing.quad) });
  }
  // "punch-in": entra rápido e sai rápido
  const k = Math.min(1, entrou / 5, falta / 4);
  return 1 + (z.escala - 1) * Easing.out(Easing.cubic)(Math.max(0, k));
};

// Auto-enquadramento: posição do rosto no tempo t (s do original), com transição suave de 0,6 s
const focoEm = (foco: { t: number; x: number; y: number }[], t: number) => {
  let k = -1;
  for (let i = 0; i < foco.length; i++) if (foco[i].t <= t) k = i;
  if (k < 0) return foco[0];
  const atual = foco[k];
  const ant = foco[k - 1];
  if (!ant) return atual;
  const p = Easing.inOut(Easing.cubic)(Math.min(1, (t - atual.t) / 0.6));
  return { t, x: ant.x + (atual.x - ant.x) * p, y: ant.y + (atual.y - ant.y) * p };
};

// Converte a posição do rosto (% do original) em object-position (para o rosto ficar ~centralizado)
// e na origem do zoom (para o punch-in aproximar do rosto, não do centro da tela).
// L × A = tamanho do quadro (1080×1920 no vertical, 1920×1080 no horizontal)
const enquadrar = (v: { largura: number; altura: number }, fx: number, fy: number, L: number, A: number) => {
  const esc = Math.max(L / v.largura, A / v.altura);
  const ws = v.largura * esc, hs = v.altura * esc;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const px = ws > L + 1 ? clamp(((fx / 100) * ws - L / 2) / (ws - L) * 100) : 50;
  const py = hs > A + 1 ? clamp(((fy / 100) * hs - 0.4 * A) / (hs - A) * 100) : 50;
  const esq = ((ws - L) * px) / 100, topo = ((hs - A) * py) / 100;
  return { pos: `${px}% ${py}%`, origem: `${clamp((((fx / 100) * ws - esq) / L) * 100)}% ${clamp((((fy / 100) * hs - topo) / A) * 100)}%` };
};

// Na prévia, um vídeo que o navegador não consegue tocar não derruba o editor
const semErro = (e: Error) => console.warn("vídeo:", e.message);
const naPrevia = getRemotionEnvironment().isPlayer;

// Na aba Cortes: faixa vermelha quando o trecho atual vai ser cortado
const MarcaCorte: React.FC = () => {
  const f = useCurrentFrame();
  const { projeto, linha } = useVideo();
  const t = linha.paraConteudo(f);
  const c = projeto.previaCortes?.find((c) => t >= Math.min(c.i, c.f) && t < Math.max(c.i, c.f));
  if (!c) return null;
  return (
    <AbsoluteFill style={{ border: "18px solid #FF3B30", background: "rgba(255,59,48,.28)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#FF3B30", color: "#fff", fontFamily: "Montserrat, Arial", fontWeight: 900, fontSize: 64, padding: "16px 36px", borderRadius: 20 }}>
        ✂ CORTADO{c.motivo ? ` · ${c.motivo}` : ""}
      </div>
    </AbsoluteFill>
  );
};

// Texto do gancho, grande e no alto, durante a abertura
const TextoGancho: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const f = useCurrentFrame();
  const { tema } = useVideo();
  const m = spring({ frame: f, fps: FPS, config: { damping: 10, stiffness: 170, mass: 0.7 } });
  const saida = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: 250, bottom: "auto", left: MARGEM_TELA, right: MARGEM_TELA, width: "auto", alignItems: "center", opacity: saida }}>
     <AjusteMargem>
      <div style={{ maxWidth: 940, transform: `scale(${m}) rotate(-2deg)`, background: tema.destaque, color: "#111", fontFamily: "Montserrat, Arial", fontWeight: 900, fontSize: 78, lineHeight: 1.05, textAlign: "center", textTransform: "uppercase", padding: "18px 34px", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
        {texto}
      </div>
     </AjusteMargem>
    </AbsoluteFill>
  );
};

// Som de "whoosh" baixinho nos punch-ins (design de som automático)
const SonsZoom: React.FC = () => {
  const { projeto, linha } = useVideo();
  if (projeto.efeitos.sfxAuto === false) return null;
  let ultimo = -99;
  return (
    <>
      {projeto.efeitos.zooms.filter((z) => !z.seco && !z.suave).map((z) => {
        const de = linha.paraSaida(z.i);
        if (de === null || de - ultimo < 45) return null;
        ultimo = de;
        return <Sequence key={z.id} from={Math.max(0, de - 3)} durationInFrames={20} layout="none"><Audio src={arquivoGlobal("sfx/whoosh.mp3")} volume={0.18} /></Sequence>;
      })}
    </>
  );
};

export const ModoBruto: React.FC = () => {
  const { projeto, linha, arquivo, quadro: q } = useVideo();
  const f = useCurrentFrame();
  const v = projeto.video;
  const escala = useEscala();
  const src = v ? arquivo(v.arquivo) : null;
  if (!v || !src) {
    return <Fundo indice={0} duracao={linha.duracao} />;
  }
  // "ajustar" (vídeo inteiro + fundo desfocado) só faz sentido quando o vídeo e o quadro têm orientações diferentes
  const deitado = v.largura > v.altura * 0.75;
  const ajustar = v.enquadramento === "ajustar" && deitado !== q.horizontal;
  const seguir = v.seguirRosto !== false && (v.foco?.length ?? 0) > 0 && !ajustar;
  const rosto = seguir ? focoEm(v.foco!, linha.paraConteudo(f)) : null;
  const quadro = rosto ? enquadrar(v, rosto.x, rosto.y, q.largura, q.altura) : null;
  const pos = quadro ? quadro.pos : `${v.focoX ?? 50}% 50%`;
  const origem = quadro ? quadro.origem : "50% 42%";
  return (
    <AbsoluteFill>
      {/* aparece só onde não há vídeo (ex.: enquete no fim) */}
      <Fundo indice={0} duracao={linha.duracao} />
      {linha.trechos.map((tr, i) => {
        const de = Math.round(tr.saida * FPS);
        const dur = Math.round((tr.saida + tr.fim - tr.ini) * FPS) - de;
        if (dur < 1) return null;
        return (
          <Sequence key={i} from={de} durationInFrames={dur} premountFor={15} name={`trecho ${i + 1}`}>
            {ajustar && (
              <AbsoluteFill style={{ filter: "blur(40px) brightness(.6)", transform: "scale(1.2)" }}>
                <OffthreadVideo src={src} startFrom={Math.round(tr.ini * FPS)} muted onError={naPrevia ? semErro : undefined} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </AbsoluteFill>
            )}
            <AbsoluteFill style={{ transform: `scale(${escala})`, transformOrigin: origem }}>
              <OffthreadVideo
                src={src}
                startFrom={Math.round(tr.ini * FPS)}
                // micro fade de 2 frames em cada corte: evita o "clique" no áudio dos jump cuts
                volume={(q) => (v.volume ?? 1) * Math.max(0, Math.min(1, (q + 1) / 3, (dur - q) / 3))}
                onError={naPrevia ? semErro : undefined}
                style={{ width: "100%", height: "100%", objectFit: ajustar ? "contain" : "cover", objectPosition: pos }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {linha.trechos[0]?.gancho && (
        <>
          {projeto.gancho?.texto && (
            <Sequence durationInFrames={Math.round((linha.trechos[0].fim - linha.trechos[0].ini) * FPS)} layout="none">
              <TextoGancho texto={projeto.gancho.texto} dur={Math.round((linha.trechos[0].fim - linha.trechos[0].ini) * FPS)} />
            </Sequence>
          )}
          <Sequence from={Math.round((linha.trechos[0].fim - linha.trechos[0].ini) * FPS)} durationInFrames={20} layout="none">
            <Audio src={arquivoGlobal("sfx/whoosh.mp3")} volume={0.5} />
          </Sequence>
        </>
      )}
      <SonsZoom />
      {projeto.previaCortes && <MarcaCorte />}
    </AbsoluteFill>
  );
};
