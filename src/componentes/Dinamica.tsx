import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { useQuadro, useVideo } from "../contexto";
import { FONTE } from "../fontes";

// "Dinâmica de edição" do Modo 1: como o vídeo se movimenta, além de cores e fontes.
// (Adaptado de fatiknust-pixel/Astra, src/componentes/Dinamica.tsx)
// - padrao     : sem efeitos extras
// - energetica : "câmera" dá socos de zoom a cada elemento novo e treme nos carimbos; flash na troca de cena
// - cinema     : faixas pretas, grão de filme, vinheta e um zoom lento contínuo
// - jornal     : tarja "AO VIVO" e letreiro correndo embaixo com o título e as fontes
// - glitch     : distorção RGB e linhas de TV nas trocas de cena e nos elementos
// - colagem    : textura de papel, elementos tortos e movimento em "stop motion"
// - minimal    : remove partículas e texturas, tudo mais calmo

export const useDinamica = () => useVideo().projeto.estiloIA?.dinamica ?? "padrao";

// Frames (absolutos) em que uma cena começa ou um elemento entra
const useBatidas = () => {
  const { linha } = useVideo();
  return useMemo(() => {
    const b: { f: number; forte: boolean; cena: boolean }[] = [];
    for (const c of linha.cenas) {
      b.push({ f: c.inicio, forte: false, cena: true });
      for (const e of c.elementos) b.push({ f: c.inicio + e.entra, forte: e.tipo === "carimbo", cena: false });
    }
    return b.sort((x, y) => x.f - y.f);
  }, [linha]);
};
const ultimaAntes = (b: { f: number; forte: boolean; cena: boolean }[], f: number, so?: (x: { forte: boolean; cena: boolean }) => boolean) => {
  for (let i = b.length - 1; i >= 0; i--) if (b[i].f <= f && (!so || so(b[i]))) return b[i];
  return undefined;
};

// Envolve as cenas e aplica o movimento de "câmera" da dinâmica escolhida
export const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { linha } = useVideo();
  const d = useDinamica();
  const batidas = useBatidas();
  let transform = "";
  let filter = "";
  if (d === "energetica") {
    const ultima = ultimaAntes(batidas, f);
    const dt = ultima ? f - ultima.f : 99;
    const soco = Math.exp(-dt / 5);
    const tremor = ultima?.forte && dt < 10 ? (random(`t${f}`) - 0.5) * 18 * (1 - dt / 10) : 0;
    transform = `scale(${1 + 0.07 * soco}) translate(${tremor}px, ${tremor * 0.6}px) rotate(${soco * (ultima && ultima.f % 2 ? 1 : -1) * 0.8}deg)`;
  } else if (d === "cinema") {
    transform = `scale(${1 + 0.06 * (f / Math.max(1, linha.duracao))})`;
    filter = "saturate(0.85) contrast(1.08)";
  } else if (d === "colagem") {
    // stop motion: a "câmera" só muda de posição a cada 3 frames
    const q = Math.floor(f / 3);
    transform = `translate(${(random(`x${q}`) - 0.5) * 6}px, ${(random(`y${q}`) - 0.5) * 6}px) rotate(${(random(`r${q}`) - 0.5) * 0.6}deg)`;
  } else if (d === "glitch") {
    const ultima = ultimaAntes(batidas, f);
    const dt = ultima ? f - ultima.f : 99;
    if (dt < 5) transform = `translateX(${(random(`g${f}`) - 0.5) * 30}px) skewX(${(random(`s${f}`) - 0.5) * 6}deg)`;
  }
  return <AbsoluteFill style={{ transform, filter }}>{children}</AbsoluteFill>;
};

const Grao: React.FC<{ f: number }> = ({ f }) => {
  const { largura, altura } = useQuadro();
  if (useVideo().leve) return null;
  return (
    <AbsoluteFill style={{ opacity: 0.18, mixBlendMode: "overlay" }}>
      <svg width={largura} height={altura}>
        <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={largura} height={altura} filter="url(#grao)" />
      </svg>
    </AbsoluteFill>
  );
};

// Camadas por cima das cenas (abaixo da legenda)
export const Sobreposicao: React.FC = () => {
  const f = useCurrentFrame();
  const { projeto, tema, linha, leve } = useVideo();
  const d = useDinamica();
  const batidas = useBatidas();
  const q = useQuadro();

  if (d === "cinema") {
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.65) 100%)" }} />
        <Grao f={f} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 110, background: "#000" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 110, background: "#000" }} />
      </AbsoluteFill>
    );
  }

  if (d === "jornal") {
    const fontes = linha.cenas.flatMap((c) => c.fontes).filter((v, i, a) => a.indexOf(v) === i);
    const texto = `${projeto.titulo.toUpperCase()}  •  ${fontes.length ? fontes.join("  •  ") + "  •  " : ""}`;
    const largura = texto.length * 17;
    const x = -((f * 6) % largura);
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: q.horizontal ? q.altura - 114 : 1580, height: 74, display: "flex", background: "#fff", overflow: "hidden" }}>
          <div style={{ flexShrink: 0, background: tema.vermelho, color: "#fff", fontFamily: FONTE, fontWeight: 900, fontSize: 32, padding: "0 22px", display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
            <span style={{ width: 14, height: 14, borderRadius: 99, background: "#fff", opacity: f % 30 < 15 ? 1 : 0.3 }} /> AO VIVO
          </div>
          <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: x, display: "flex", alignItems: "center", whiteSpace: "nowrap", fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: "#111" }}>
              {texto}{texto}{texto}{texto}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (d === "glitch") {
    const ultima = ultimaAntes(batidas, f);
    const dt = ultima ? f - ultima.f : 99;
    const forca = dt < 6 ? 1 - dt / 6 : 0;
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <AbsoluteFill style={{ opacity: 0.12, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 2px, transparent 2px 6px)" }} />
        {forca > 0 && (
          <>
            {!leve && <AbsoluteFill style={{ background: tema.vermelho, mixBlendMode: "screen", opacity: 0.25 * forca, transform: `translateX(${12 * forca}px)` }} />}
            {!leve && <AbsoluteFill style={{ background: tema.azul, mixBlendMode: "screen", opacity: 0.25 * forca, transform: `translateX(${-12 * forca}px)` }} />}
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: random(`b${f}-${i}`) * q.altura, height: 20 + random(`h${f}-${i}`) * 60, background: "rgba(255,255,255,.12)", transform: `translateX(${(random(`x${f}-${i}`) - 0.5) * 120}px)` }} />
            ))}
          </>
        )}
      </AbsoluteFill>
    );
  }

  if (d === "colagem" && !leve) {
    return (
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.35 }}>
        <svg width={q.largura} height={q.altura}>
          <filter id="papel"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 3)} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width={q.largura} height={q.altura} filter="url(#papel)" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (d === "energetica") {
    // flash curto a cada troca de cena
    const ultima = ultimaAntes(batidas, f, (b) => b.cena);
    const dt = ultima && ultima.f > 0 ? f - ultima.f : 99;
    return <AbsoluteFill style={{ pointerEvents: "none", background: tema.destaque, opacity: interpolate(dt, [0, 3], [0.18, 0], { extrapolateRight: "clamp" }) }} />;
  }

  return null;
};

// Ajuste por elemento: na colagem, cada elemento fica levemente torto
export const ajusteElemento = (dinamica: string, indice: number): React.CSSProperties =>
  dinamica === "colagem" ? { rotate: `${(random(`el${indice}`) - 0.5) * 7}deg` } : {};
