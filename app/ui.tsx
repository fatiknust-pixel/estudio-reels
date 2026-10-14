import React, { useEffect, useState } from "react";

// ---------- avisos rápidos ----------
type Aviso = { msg: string; erro?: boolean; id: number };
let ouvinte: ((a: Aviso | null) => void) | null = null;
let timer: any;
export const avisar = (msg: string, erro = false) => {
  clearTimeout(timer);
  ouvinte?.({ msg, erro, id: Date.now() });
  timer = setTimeout(() => ouvinte?.(null), erro ? 6000 : 2600);
};
export const avisarErro = (e: unknown) => avisar(e instanceof Error ? e.message : String(e), true);

export const Avisos: React.FC = () => {
  const [a, setA] = useState<Aviso | null>(null);
  useEffect(() => {
    ouvinte = setA;
    return () => {
      ouvinte = null;
    };
  }, []);
  if (!a) return null;
  return (
    <div className={"toast" + (a.erro ? " erro" : "")} role="status" onClick={() => setA(null)}>
      {a.msg}
    </div>
  );
};

// ---------- navegação por hash ----------
export const useRota = () => {
  const [h, setH] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const f = () => setH(location.hash.slice(1) || "/");
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return h;
};
export const ir = (rota: string) => {
  location.hash = rota;
};

// ---------- campos ----------
export const fmtTempo = (s: number, decimal = true) => {
  if (!isFinite(s)) s = 0;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${(decimal ? r.toFixed(1) : Math.floor(r).toString()).padStart(decimal ? 4 : 2, "0")}`;
};

export const CampoTempo: React.FC<{ valor: number; mudar: (v: number) => void; agora?: () => number; rotulo?: string; passo?: number }> = ({ valor, mudar, agora, rotulo, passo = 0.1 }) => {
  const [txt, setTxt] = useState(valor.toFixed(2));
  useEffect(() => setTxt(valor.toFixed(2)), [valor]);
  const aplicar = (v: number) => mudar(Math.max(0, Math.round(v * 100) / 100));
  return (
    <div className="campo-tempo" aria-label={rotulo}>
      {rotulo && <span className="pequeno suave" style={{ minWidth: 38 }}>{rotulo}</span>}
      <button className="btn mini" onClick={() => aplicar(valor - passo)} aria-label="menos">−</button>
      <input
        type="number" inputMode="decimal" step={passo} value={txt}
        onChange={(e) => setTxt(e.target.value)}
        onBlur={() => { const v = parseFloat(txt.replace(",", ".")); if (isFinite(v)) aplicar(v); else setTxt(valor.toFixed(2)); }}
      />
      <button className="btn mini" onClick={() => aplicar(valor + passo)} aria-label="mais">+</button>
      {agora && <button className="btn mini" title="Usar o tempo atual da prévia" onClick={() => aplicar(agora())}>⏱</button>}
    </div>
  );
};

export const Alternar: React.FC<{ rotulo: React.ReactNode; valor: boolean; mudar: (v: boolean) => void }> = ({ rotulo, valor, mudar }) => (
  <label className="alternar">
    <span>{rotulo}</span>
    <input type="checkbox" role="switch" checked={valor} onChange={(e) => mudar(e.target.checked)} />
  </label>
);

export const Deslizar: React.FC<{ rotulo: string; valor: number; min: number; max: number; passo?: number; mudar: (v: number) => void; fmt?: (v: number) => string }> = ({ rotulo, valor, min, max, passo = 1, mudar, fmt }) => (
  <label className="campo">
    <span>{rotulo}: <b style={{ color: "var(--txt)" }}>{fmt ? fmt(valor) : valor}</b></span>
    <input type="range" min={min} max={max} step={passo} value={valor} onChange={(e) => mudar(parseFloat(e.target.value))} />
  </label>
);

export const Escolha = <T extends string | number>({ opcoes, valor, mudar }: { opcoes: [T, React.ReactNode][]; valor: T; mudar: (v: T) => void }) => (
  <div className="chips" role="radiogroup">
    {opcoes.map(([v, r]) => (
      <button key={String(v)} role="radio" aria-checked={v === valor} className={"chip" + (v === valor ? " on" : "")} onClick={() => mudar(v)}>
        {r}
      </button>
    ))}
  </div>
);
