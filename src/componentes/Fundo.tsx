import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { useVideo } from "../contexto";

// Fundo da cena: foto com efeito Ken Burns + escurecimento, ou gradiente animado se não houver foto.
export const Fundo: React.FC<{ chave?: string; indice: number; duracao: number }> = ({ chave, indice, duracao }) => {
  const f = useCurrentFrame();
  const { imagem, tema } = useVideo();
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
      {tema.bandeira && <Bandeira f={f} />}
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
      {/* grade em movimento (motion graphics) */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${(f * 1.5) % 90}px`,
          maskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 75%)",
        }}
      />
      {/* partículas (no tema Brasil, viram "estrelas" verdes, amarelas e brancas) */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = (i * 137) % 1080;
        const y = 1920 - ((f * (1 + (i % 4) * 0.6) + i * 210) % 2100);
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
