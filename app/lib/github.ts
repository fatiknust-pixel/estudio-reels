// Acesso ao GitHub direto do navegador, com o token pessoal salvo SÓ neste aparelho (localStorage).
// Permissões do token (fine-grained, só este repositório): Contents = Read and write, Actions = Read and write.

export type ConfigGitHub = { token: string; dono: string; repo: string; ramo: string };

const CHAVE = "estudio-reels:github";

const adivinharRepo = () => {
  // fatiknust-pixel.github.io/estudio-reels → dono e repo
  const m = location.hostname.match(/^([^.]+)\.github\.io$/);
  const repo = location.pathname.split("/").filter(Boolean)[0];
  return { dono: m?.[1] ?? "fatiknust-pixel", repo: m && repo ? repo : "estudio-reels" };
};

export const lerConfig = (): ConfigGitHub => {
  let salvo: Partial<ConfigGitHub> = {};
  try {
    salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
  } catch {}
  const pad = adivinharRepo();
  return { token: salvo.token ?? "", dono: salvo.dono || pad.dono, repo: salvo.repo || pad.repo, ramo: salvo.ramo || "main" };
};

export const salvarConfig = (c: ConfigGitHub) => {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(c));
  } catch {}
};

export const temToken = () => !!lerConfig().token;

export class ErroGitHub extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

const explicar = (status: number, msg: string) => {
  if (status === 401) return "Token inválido ou expirado. Confira em Configurações.";
  if (status === 403) return "O token não tem permissão para isso (precisa de Contents e Actions: Read and write). " + msg;
  if (status === 404) return "Não encontrado (confira dono/repositório e se o token tem acesso a ele). " + msg;
  if (status === 409 || status === 422) return "Conflito ao salvar: " + msg;
  return msg;
};

export const api = async (caminho: string, opcoes: RequestInit & { cru?: boolean } = {}) => {
  const c = lerConfig();
  if (!c.token) throw new ErroGitHub(0, "Configure seu token do GitHub em Configurações.");
  const url = caminho.startsWith("http") ? caminho : `https://api.github.com/repos/${c.dono}/${c.repo}${caminho}`;
  const r = await fetch(url, {
    ...opcoes,
    cache: "no-store",
    headers: {
      Accept: opcoes.cru ? "application/vnd.github.raw+json" : "application/vnd.github+json",
      Authorization: `Bearer ${c.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opcoes.headers ?? {}),
    },
  });
  if (!r.ok) {
    let msg = r.statusText;
    try {
      msg = (await r.json()).message ?? msg;
    } catch {}
    throw new ErroGitHub(r.status, explicar(r.status, msg));
  }
  return r;
};

const json = async (caminho: string, opcoes: RequestInit = {}) => {
  const r = await api(caminho, opcoes);
  return r.status === 204 ? null : r.json();
};

const caminhoUrl = (p: string) => p.split("/").map(encodeURIComponent).join("/");

// ---------- conteúdo do repositório ----------

const b64deTexto = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

const b64deBlob = (b: Blob) =>
  new Promise<string>((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] ?? "");
    r.onerror = () => erro(r.error);
    r.readAsDataURL(b);
  });

export const shaDe = async (caminho: string): Promise<string | undefined> => {
  const c = lerConfig();
  try {
    const j = await json(`/contents/${caminhoUrl(caminho)}?ref=${encodeURIComponent(c.ramo)}`);
    return Array.isArray(j) ? undefined : j.sha;
  } catch (e) {
    if (e instanceof ErroGitHub && e.status === 404) return undefined;
    throw e;
  }
};

export const lerTexto = async (caminho: string) => {
  const c = lerConfig();
  const r = await api(`/contents/${caminhoUrl(caminho)}?ref=${encodeURIComponent(c.ramo)}`, { cru: true });
  return r.text();
};

export const lerJSON = async <T = any>(caminho: string): Promise<T> => JSON.parse(await lerTexto(caminho));

export const lerBlob = async (caminho: string) => {
  const c = lerConfig();
  const r = await api(`/contents/${caminhoUrl(caminho)}?ref=${encodeURIComponent(c.ramo)}`, { cru: true });
  return r.blob();
};

export const salvarArquivo = async (caminho: string, conteudo: string | Blob, mensagem: string) => {
  const c = lerConfig();
  const content = typeof conteudo === "string" ? b64deTexto(conteudo) : await b64deBlob(conteudo);
  // tenta duas vezes: se uma Action salvou no meio do caminho, pega o sha novo
  for (let tentativa = 0; ; tentativa++) {
    const sha = await shaDe(caminho);
    try {
      return await json(`/contents/${caminhoUrl(caminho)}`, {
        method: "PUT",
        body: JSON.stringify({ message: mensagem, content, branch: c.ramo, ...(sha ? { sha } : {}) }),
      });
    } catch (e) {
      if (tentativa < 1 && e instanceof ErroGitHub && (e.status === 409 || e.status === 422)) continue;
      throw e;
    }
  }
};

export const listarPasta = async (caminho: string): Promise<{ name: string; path: string; type: string; size: number }[]> => {
  const c = lerConfig();
  try {
    const j = await json(`/contents/${caminhoUrl(caminho)}?ref=${encodeURIComponent(c.ramo)}`);
    return Array.isArray(j) ? j : [];
  } catch (e) {
    if (e instanceof ErroGitHub && e.status === 404) return [];
    throw e;
  }
};

// ---------- Actions ----------

export type Execucao = {
  id: number;
  status: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  display_title: string;
  name: string;
};

export const dispararWorkflow = async (arquivo: string, inputs: Record<string, string>) => {
  const c = lerConfig();
  await json(`/actions/workflows/${arquivo}/dispatches`, { method: "POST", body: JSON.stringify({ ref: c.ramo, inputs }) });
};

export const listarExecucoes = async (arquivo: string, n = 15): Promise<Execucao[]> => {
  const j = await json(`/actions/workflows/${arquivo}/runs?per_page=${n}`);
  return j.workflow_runs ?? [];
};

// Dispara e espera a execução aparecer (o GitHub não devolve o id na hora)
export const dispararEAchar = async (arquivo: string, inputs: Record<string, string>, titulo: string): Promise<Execucao | null> => {
  const antes = new Date(Date.now() - 5000).toISOString();
  await dispararWorkflow(arquivo, inputs);
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const runs = await listarExecucoes(arquivo, 10);
    const r = runs.find((x) => x.created_at >= antes.slice(0, 19) && x.display_title.includes(titulo));
    if (r) return r;
  }
  return null;
};

export const execucao = async (id: number): Promise<Execucao> => json(`/actions/runs/${id}`);

// ---------- Releases (arquivos grandes: vídeos brutos e MP4 exportados) ----------

export type Asset = { id: number; name: string; size: number; browser_download_url: string; created_at: string; url: string };
export type Release = { id: number; tag_name: string; upload_url: string; assets: Asset[] };

export const release = async (tag: string): Promise<Release | null> => {
  try {
    return await json(`/releases/tags/${encodeURIComponent(tag)}`);
  } catch (e) {
    if (e instanceof ErroGitHub && e.status === 404) return null;
    throw e;
  }
};

export const garantirRelease = async (tag: string, nome: string): Promise<Release> => {
  const r = await release(tag);
  if (r) return r;
  const c = lerConfig();
  return json(`/releases`, {
    method: "POST",
    body: JSON.stringify({ tag_name: tag, target_commitish: c.ramo, name: nome, body: "Arquivos do Estúdio Reels (gerenciado pelo app).", prerelease: true }),
  });
};

export const enviarAsset = (rel: Release, nome: string, arquivo: Blob, progresso?: (f: number) => void) =>
  new Promise<Asset>((ok, erro) => {
    const c = lerConfig();
    const url = rel.upload_url.replace(/\{.*\}$/, "") + `?name=${encodeURIComponent(nome)}`;
    const x = new XMLHttpRequest();
    x.open("POST", url);
    x.setRequestHeader("Authorization", `Bearer ${c.token}`);
    x.setRequestHeader("Accept", "application/vnd.github+json");
    x.setRequestHeader("Content-Type", arquivo.type || "application/octet-stream");
    x.upload.onprogress = (e) => e.lengthComputable && progresso?.(e.loaded / e.total);
    x.onload = () => {
      if (x.status >= 200 && x.status < 300) ok(JSON.parse(x.responseText));
      else erro(new ErroGitHub(x.status, explicar(x.status, x.responseText.slice(0, 200))));
    };
    x.onerror = () => erro(new ErroGitHub(0, "Falha de rede ao enviar o arquivo."));
    x.send(arquivo);
  });

export const apagarAsset = async (id: number) => json(`/releases/assets/${id}`, { method: "DELETE" });

// Baixa um asset (funciona também em repositório privado)
export const baixarAsset = async (a: Asset): Promise<Blob> => {
  const r = await api(`/releases/assets/${a.id}`, { headers: { Accept: "application/octet-stream" } });
  return r.blob();
};

export const testarAcesso = async () => {
  const repo = await json("");
  return { nome: repo.full_name as string, privado: repo.private as boolean, permissoes: repo.permissions as Record<string, boolean> | undefined };
};

// ---------- envio de arquivo grande em partes (ramo temporário envio/<id>) ----------
// Usa só api.github.com (que aceita chamadas do navegador). A Action junta as partes e apaga o ramo.
const PARTE = 12 * 1024 * 1024;

const postarComProgresso = (caminho: string, corpo: string, progresso?: (f: number) => void) =>
  new Promise<any>((ok, erro) => {
    const c = lerConfig();
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.github.com/repos/${c.dono}/${c.repo}${caminho}`);
    x.setRequestHeader("Authorization", `Bearer ${c.token}`);
    x.setRequestHeader("Accept", "application/vnd.github+json");
    x.setRequestHeader("X-GitHub-Api-Version", "2022-11-28");
    x.setRequestHeader("Content-Type", "application/json");
    x.upload.onprogress = (e) => e.lengthComputable && progresso?.(e.loaded / e.total);
    x.onload = () => {
      if (x.status >= 200 && x.status < 300) ok(JSON.parse(x.responseText));
      else {
        let msg = x.statusText;
        try {
          msg = JSON.parse(x.responseText).message ?? msg;
        } catch {}
        erro(new ErroGitHub(x.status, explicar(x.status, msg)));
      }
    };
    x.onerror = () => erro(new ErroGitHub(0, "Falha de rede no envio. Confira a conexão e tente de novo."));
    x.send(corpo);
  });

export const enviarEmPartes = async (ramo: string, arquivo: Blob, info: Record<string, any>, progresso: (f: number) => void) => {
  const total = Math.max(1, Math.ceil(arquivo.size / PARTE));
  const arvore: { path: string; mode: string; type: string; sha: string }[] = [];
  for (let k = 0; k < total; k++) {
    const pedaco = arquivo.slice(k * PARTE, (k + 1) * PARTE);
    const conteudo = await b64deBlob(pedaco);
    let blob: any;
    for (let tentativa = 0; ; tentativa++) {
      try {
        blob = await postarComProgresso("/git/blobs", JSON.stringify({ content: conteudo, encoding: "base64" }), (f) => progresso((k + f) / total));
        break;
      } catch (e) {
        if (tentativa >= 2 || (e instanceof ErroGitHub && e.status >= 400 && e.status < 500)) throw e;
        await new Promise((r) => setTimeout(r, 2000 * (tentativa + 1)));
      }
    }
    arvore.push({ path: `parte-${String(k).padStart(3, "0")}`, mode: "100644", type: "blob", sha: blob.sha });
  }
  const infoBlob = await json("/git/blobs", { method: "POST", body: JSON.stringify({ content: JSON.stringify({ ...info, partes: total, tamanho: arquivo.size }), encoding: "utf-8" }) });
  arvore.push({ path: "info.json", mode: "100644", type: "blob", sha: infoBlob.sha });
  const tree = await json("/git/trees", { method: "POST", body: JSON.stringify({ tree: arvore }) });
  const commit = await json("/git/commits", { method: "POST", body: JSON.stringify({ message: `Envio ${ramo}`, tree: tree.sha }) });
  try {
    await json("/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${ramo}`, sha: commit.sha }) });
  } catch (e) {
    if (!(e instanceof ErroGitHub && e.status === 422)) throw e;
    await json(`/git/refs/heads/${ramo}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: true }) });
  }
  progresso(1);
};
