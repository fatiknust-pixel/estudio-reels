import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { useQuadro, useVideo } from "../contexto";

// Fundo da cena: foto com efeito Ken Burns + escurecimento, ou gradiente animado se não houver foto.
export const Fundo: React.FC<{ chave?: string; indice: number; duracao: number }> = ({ chave, indice, duracao }) => {
  const f = useCurrentFrame();
  const { imagem, tema, projeto } = useVideo();
  const { largura, altura } = useQuadro();
  const est = projeto.estiloIA;
  // sem estilo de edição (vídeos antigos e modo bruto): grade, e a bandeira no tema Brasil
  const tipo = est?.dinamica === "minimal" ? "limpo" : est?.fundo ?? (tema.bandeira ? "bandeira" : "grade");
  const src = imagem(chave);
  const t = f / Math.max(1, duracao);
  const dir = indice % 2 === 0 ? 1 : -1;
  return (
    <AbsoluteFill style={{ background: tema.fundo, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(f / 40) * 20}% ${30 + Math.cos(f / 50) * 10}%, ${indice % 2 ? tema.brilhoB : tema.brilhoA} 0%, ${tema.fundo} 65%)`,
        }}
      />
      {tipo === "bandeira" && <Bandeira f={f} />}
      {tipo === "raios" && <Raios f={f} />}
      {src && (
        <Img
          src={src}
          style={{
            position: "absolute", width: "100%", height: "100%", objectFit: "cover",
            transform: `scale(${1.12 + t * 0.14}) translateX(${dir * interpolate(t, [0, 1], [-30, 30])}px)`,
            filter: "saturate(1.1) contrast(1.05)",
          }}
        />
      )}
      {/* escurece para o texto aparecer */}
      <AbsoluteFill style={{ background: src ? `linear-gradient(180deg, ${tema.fundo}8C 0%, ${tema.fundo}59 35%, ${tema.fundo}BF 62%, ${tema.fundo}F2 100%)` : "transparent" }} />
      {tema.bandeira && src && <AbsoluteFill style={{ background: `linear-gradient(160deg, ${tema.verde}33 0%, transparent 45%, ${tema.azul}33 100%)` }} />}
      {/* textura em movimento (motion graphics), conforme o estilo */}
      {tipo === "ondas" && <Ondas f={f} />}
      {tipo === "pontos" && (
        <AbsoluteFill style={{ opacity: 0.18, backgroundImage: `radial-gradient(${tema.texto} 2px, transparent 2.5px)`, backgroundSize: "44px 44px", backgroundPosition: `${(f * 0.6) % 44}px ${(f * 0.9) % 44}px`, maskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 70%)" }} />
      )}
      {(tipo === "grade" || tipo === "bandeira") && <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${(f * 1.5) % 90}px`,
          maskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 75%)",
        }}
      />}
      {/* partículas (no tema Brasil, viram "estrelas" verdes, amarelas e brancas) */}
      {tipo !== "limpo" && Array.from({ length: tipo === "grade" || tipo === "bandeira" ? 14 : 6 }).map((_, i) => {
        const x = (i * 137) % largura;
        const y = altura - ((f * (1 + (i % 4) * 0.6) + i * 210) % (altura + 180));
        const c = tema.bandeira ? [tema.amarelo, tema.verde, "#fff"][i % 3] : i % 3 ? tema.amarelo : "#fff";
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 6 + (i % 3) * 4, height: 6 + (i % 3) * 4, borderRadius: 99, background: c, opacity: 0.3 }} />;
      })}
    </AbsoluteFill>
  );
};

// Losango amarelo + círculo azul girando devagar, como marca d'água da bandeira
const Bandeira: React.FC<{ f: number }> = ({ f }) => {
  const { tema } = useVideo();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 0.22 }}>
      <svg width={1500} height={1500} viewBox="-750 -750 1500 1500" style={{ transform: `rotate(${Math.sin(f / 90) * 4}deg) scale(${1 + Math.sin(f / 60) * 0.03})` }}>
        <polygon points="0,-560 700,0 0,560 -700,0" fill="none" stroke={tema.amarelo} strokeWidth={18} />
        <polygon points="0,-470 590,0 0,470 -590,0" fill={tema.verde} opacity={0.25} />
        <circle r={300} fill="none" stroke={tema.azul} strokeWidth={14} />
        <path d="M -300 -40 Q 0 -110 300 60" fill="none" stroke="#fff" strokeWidth={16} opacity={0.8} />
      </svg>
    </AbsoluteFill>
  );
};

// Linhas onduladas que se movem devagar
const Ondas: React.FC<{ f: number }> = ({ f }) => {
  const { tema } = useVideo();
  const linhas = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill style={{ opacity: 0.35 }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
        {linhas.map((i) => {
          const y0 = 500 + i * 220;
          const pts = Array.from({ length: 28 }, (_, k) => {
            const x = k * 40;
            const y = y0 + Math.sin(k / 3 + f / 25 + i) * (40 + i * 8);
            return `${k ? "L" : "M"}${x},${y.toFixed(1)}`;
          }).join(" ");
          return <path key={i} d={pts} fill="none" stroke={[tema.destaque, tema.azul, tema.vermelho][i % 3]} strokeWidth={4} opacity={0.6} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Raios de luz girando atrás do conteúdo
const Raios: React.FC<{ f: number }> = ({ f }) => {
  const { tema } = useVideo();
  return (
    <AbsoluteFill style={{ opacity: 0.16, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 2600, height: 2600, borderRadius: "50%", transform: `rotate(${f * 0.25}deg)`, background: `repeating-conic-gradient(${tema.destaque} 0deg 6deg, transparent 6deg 22deg)`, maskImage: "radial-gradient(circle, black 0%, transparent 60%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)" }} />
    </AbsoluteFill>
  );
};
