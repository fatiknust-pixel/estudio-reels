import React, { useCallback, useEffect, useState } from "react";
import GENEROS from "../../src/generos.json";
import { IDIOMAS, idiomaDe } from "../../src/idiomas";
import * as gh from "../lib/github";
import { Alternar, avisar, avisarErro, Escolha, ir } from "../ui";

type Ideia = { titulo: string; angulo?: string; estado: "pendente" | "gerado"; projeto?: string; em?: string };
export type Canal = { id: string; nome: string; nicho: string; genero: string; idioma: string; voz: string; ativo: boolean; duracao?: number; ideias: Ideia[]; ultimaGeracao?: string };

const arq = (id: string) => `canais/${id}.json`;
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

// Lê a versão mais nova do GitHub (uma Action pode ter mexido na fila), muda e salva
const alterar = async (id: string, f: (c: Canal) => void, msg: string) => {
  const c = await gh.lerJSON<Canal>(arq(id));
  f(c);
  await gh.salvarArquivo(arq(id), JSON.stringify(c, null, 1) + "\n", msg);
  return c;
};

const CanalCartao: React.FC<{ c: Canal; mudou: (c: Canal) => void }> = ({ c, mudou }) => {
  const [aberto, setAberto] = useState(false);
  const [novas, setNovas] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const pendentes = c.ideias.filter((i) => i.estado === "pendente");
  const feitas = c.ideias.filter((i) => i.estado === "gerado");
  const rodar = async (txt: string, f: () => Promise<unknown>, ok: string) => {
    setOcupado(txt);
    try {
      await f();
      avisar(ok);
    } catch (e) {
      avisarErro(e);
    } finally {
      setOcupado(null);
    }
  };
  return (
    <div className="cartao">
      <div className="linha">
        <b className="cresce">{c.nome}</b>
        <span className={"selo" + (c.ativo ? " ok" : "")}>{c.ativo ? "1 vídeo/dia" : "pausado"}</span>
      </div>
      <p className="pequeno suave" style={{ margin: "4px 0 8px" }}>
        {c.nicho} · {idiomaDe(c.idioma).nome} · {pendentes.length} ideia(s) na fila · {feitas.length} vídeo(s) feito(s)
      </p>
      <Alternar rotulo="Gerar um vídeo por dia (7h, horário de Brasília)" valor={c.ativo} mudar={(v) => rodar("Salvando…", async () => mudou(await alterar(c.id, (x) => { x.ativo = v; }, `Canal ${c.id}: ${v ? "ativado" : "pausado"}`)), v ? "Canal ativo ✓" : "Canal pausado")} />
      <div className="linha" style={{ flexWrap: "wrap", marginTop: 8 }}>
        <button className="btn cresce" disabled={!!ocupado || !pendentes.length} onClick={() => rodar("Pedindo…", () => gh.dispararWorkflow("canal-diario.yml", { canal: c.id, forcar: "true" }), "Vídeo pedido — fica pronto em ~15 min e aparece em Meus projetos")}>▶ Gerar o próximo agora</button>
        <button className="btn cresce" disabled={!!ocupado} onClick={() => rodar("Pedindo…", () => gh.dispararWorkflow("canal-ideias.yml", { canal: c.id, quantidade: "12" }), "O Claude está pesquisando ideias — volte em ~5 min e puxe a lista")}>💡 Pedir ideias à IA</button>
      </div>
      <button className="btn mini" style={{ marginTop: 8 }} onClick={() => setAberto(!aberto)}>{aberto ? "Fechar fila" : "Ver fila e vídeos"}</button>
      {ocupado && <p className="pequeno">{ocupado}</p>}
      {aberto && (
        <div>
          <div className="linha"><h3 className="cresce">Próximas ideias</h3><button className="btn mini" onClick={() => rodar("Atualizando…", async () => mudou(await gh.lerJSON<Canal>(arq(c.id))), "Atualizado ✓")}>⟳</button></div>
          {!pendentes.length && <div className="vazio-lista">Fila vazia. Peça ideias à IA ou escreva abaixo.</div>}
          <div className="lista">
            {pendentes.map((i, k) => (
              <div key={k} className="item" style={{ cursor: "default" }}>
                <span className="tit">{i.titulo}{i.angulo && <small>{i.angulo}</small>}</span>
                <button className="btn mini" aria-label="Remover" onClick={() => rodar("Salvando…", async () => mudou(await alterar(c.id, (x) => { x.ideias = x.ideias.filter((y) => !(y.estado === "pendente" && y.titulo === i.titulo)); }, `Canal ${c.id}: ideia removida`)), "Removida")}>✕</button>
              </div>
            ))}
          </div>
          <label className="campo">
            <span>Adicionar ideias (uma por linha)</span>
            <textarea rows={3} value={novas} onChange={(e) => setNovas(e.target.value)} placeholder={"Ex.: O mistério do voo MH370\nPor que Pripyat foi abandonada"} />
          </label>
          <button className="btn largo" disabled={!!ocupado || !novas.trim()} onClick={() => rodar("Salvando…", async () => {
            const linhas = novas.split("\n").map((t) => t.trim()).filter((t) => t.length >= 8);
            mudou(await alterar(c.id, (x) => { for (const titulo of linhas) x.ideias.push({ titulo, estado: "pendente" }); }, `Canal ${c.id}: ideias`));
            setNovas("");
          }, "Ideias adicionadas ✓")}>Adicionar à fila</button>
          {feitas.length > 0 && <h3>Vídeos gerados</h3>}
          <div className="lista">
            {[...feitas].reverse().map((i, k) => (
              <button key={k} className="item" onClick={() => i.projeto && ir(`/editor/${encodeURIComponent(i.projeto)}`)}>
                <span>🎬</span><span className="tit">{i.titulo}<small>{i.em}</small></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Canais: React.FC = () => {
  const [canais, setCanais] = useState<Canal[] | null>(null);
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState("");
  const [nicho, setNicho] = useState("");
  const [genero, setGenero] = useState(GENEROS.generos[0].id);
  const [idioma, setIdioma] = useState(IDIOMAS[0].id);
  const [voz, setVoz] = useState(IDIOMAS[0].vozes[0][0]);
  const [ideias, setIdeias] = useState("");
  const [salvando, setSalvando] = useState(false);
  const token = gh.temToken();

  const carregar = useCallback(async () => {
    try {
      const arqs = (await gh.listarPasta("canais")).filter((a) => a.name.endsWith(".json"));
      setCanais(await Promise.all(arqs.map((a) => gh.lerJSON<Canal>(a.path))));
    } catch (e) {
      setCanais((c) => c ?? []);
      avisarErro(e);
    }
  }, []);
  useEffect(() => {
    if (token) carregar();
    else setCanais([]);
  }, [token, carregar]);

  const criar = async () => {
    const id = slug(nome);
    if (id.length < 3 || nicho.trim().length < 3) return avisar("Dê um nome e descreva o assunto do canal.", true);
    if (canais?.some((c) => c.id === id)) return avisar("Já existe um canal com esse nome.", true);
    setSalvando(true);
    try {
      const c: Canal = {
        id, nome: nome.trim(), nicho: nicho.trim(), genero, idioma, voz, ativo: false,
        ideias: ideias.split("\n").map((t) => t.trim()).filter((t) => t.length >= 8).map((titulo) => ({ titulo, estado: "pendente" as const })),
      };
      await gh.salvarArquivo(arq(id), JSON.stringify(c, null, 1) + "\n", `Canal ${id}: criado`);
      setCanais([...(canais ?? []), c]);
      setNovo(false);
      setNome(""); setNicho(""); setIdeias("");
      avisar("Canal criado ✓ — peça ideias à IA e ative o vídeo diário");
    } catch (e) {
      avisarErro(e);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="tela">
      <div className="topo">
        <button className="btn icone chato" aria-label="Voltar" onClick={() => ir("/")}>←</button>
        <h1>Canais</h1>
      </div>
      {!token && <div className="aviso">Conecte o GitHub em <a href="#/config">Configurações</a> para criar canais.</div>}
      <p className="pequeno suave" style={{ marginTop: 0 }}>Um canal dark sobre um assunto: o app guarda uma fila de ideias e, todo dia, o GitHub gera o próximo vídeo sozinho (roteiro, voz e fotos). Você abre, confere, exporta e posta.</p>
      {canais === null && <div className="vazio-lista">Carregando…</div>}
      {canais?.map((c) => <CanalCartao key={c.id} c={c} mudou={(n) => setCanais((l) => (l ?? []).map((x) => (x.id === n.id ? n : x)))} />)}
      {canais?.length === 0 && token && !novo && <div className="vazio-lista">Nenhum canal ainda.</div>}
      {!novo && token && <button className="btn prim largo" onClick={() => setNovo(true)}>+ Novo canal</button>}
      {novo && (
        <div className="cartao">
          <b>Novo canal</b>
          <label className="campo"><span>Nome</span><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Mistérios do Mundo" maxLength={40} /></label>
          <label className="campo"><span>Assunto do canal</span><textarea rows={2} value={nicho} onChange={(e) => setNicho(e.target.value)} placeholder="Ex.: desaparecimentos e casos não resolvidos, só casos reais com fontes" maxLength={300} /></label>
          <h3>Gênero (formato do vídeo)</h3>
          <Escolha opcoes={GENEROS.generos.map((g) => [g.id, `${g.emoji} ${g.nome}`] as [string, string])} valor={genero} mudar={setGenero} />
          <h3>Idioma e voz</h3>
          <Escolha opcoes={IDIOMAS.map((i) => [i.id, i.nome] as [string, string])} valor={idioma} mudar={(v) => { setIdioma(v); setVoz(idiomaDe(v).vozes[0][0]); }} />
          <div style={{ marginTop: 8 }}><Escolha opcoes={idiomaDe(idioma).vozes} valor={voz} mudar={setVoz} /></div>
          <label className="campo"><span>Primeiras ideias (uma por linha, opcional — depois a IA sugere mais)</span><textarea rows={3} value={ideias} onChange={(e) => setIdeias(e.target.value)} /></label>
          <div className="linha">
            <button className="btn cresce" onClick={() => setNovo(false)} disabled={salvando}>Cancelar</button>
            <button className="btn prim cresce" onClick={criar} disabled={salvando}>{salvando ? "Criando…" : "Criar canal"}</button>
          </div>
        </div>
      )}
    </div>
  );
};
