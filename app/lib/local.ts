// Armazenamento no aparelho (IndexedDB): rascunhos dos projetos e arquivos (vídeo da galeria,
// áudios e imagens já baixados, imagens próprias que ainda vão subir para o GitHub).
import { Projeto } from "../../src/tipos";

const BANCO = "estudio-reels";
let banco: Promise<IDBDatabase> | null = null;

const abrir = () =>
  (banco ??= new Promise((ok, erro) => {
    const r = indexedDB.open(BANCO, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      db.createObjectStore("projetos");
      db.createObjectStore("arquivos");
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error);
  }));

const op = async <T>(loja: string, modo: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest): Promise<T> => {
  const db = await abrir();
  return new Promise((ok, erro) => {
    const t = db.transaction(loja, modo);
    const req = f(t.objectStore(loja));
    req.onsuccess = () => ok(req.result as T);
    req.onerror = () => erro(req.error);
  });
};

export const local = {
  projeto: (id: string) => op<Projeto | undefined>("projetos", "readonly", (s) => s.get(id)),
  projetos: () => op<Projeto[]>("projetos", "readonly", (s) => s.getAll()),
  salvarProjeto: (p: Projeto) => op("projetos", "readwrite", (s) => s.put(p, p.id)),
  apagarProjeto: async (id: string) => {
    await op("projetos", "readwrite", (s) => s.delete(id));
    await op("arquivos", "readwrite", (s) => s.delete(IDBKeyRange.bound(`${id}/`, `${id}/￿`)));
  },
  arquivo: (id: string, caminho: string) => op<Blob | undefined>("arquivos", "readonly", (s) => s.get(`${id}/${caminho}`)),
  salvarArquivo: (id: string, caminho: string, b: Blob) => op("arquivos", "readwrite", (s) => s.put(b, `${id}/${caminho}`)),
  apagarArquivo: (id: string, caminho: string) => op("arquivos", "readwrite", (s) => s.delete(`${id}/${caminho}`)),
  // apaga cópias baixadas do GitHub (que podem ter mudado), mantendo as da lista
  limparCache: async (id: string, manter: string[]) => {
    const chaves = await op<IDBValidKey[]>("arquivos", "readonly", (s) => s.getAllKeys(IDBKeyRange.bound(`${id}/`, `${id}/\uffff`)));
    for (const k of chaves) {
      const caminho = String(k).slice(id.length + 1);
      if (!manter.includes(caminho)) await op("arquivos", "readwrite", (s) => s.delete(k));
    }
  },
};

// Pede ao navegador para não apagar os dados do app quando faltar espaço
export const pedirPersistencia = () => navigator.storage?.persist?.().catch(() => false);
