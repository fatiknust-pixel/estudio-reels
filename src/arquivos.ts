import { staticFile } from "remotion";

// Onde estão os arquivos?
// - Render (GitHub Actions): tudo em public/ → staticFile().
// - Prévia no app: a página define window.__BASE_ARQUIVOS__ (pasta pública do site) e os arquivos
//   do projeto (áudio, imagens, vídeo) chegam como URLs locais em props.arquivos.
const base = () => (typeof window !== "undefined" ? (window as any).__BASE_ARQUIVOS__ : undefined);

// Arquivos do próprio app (fontes, efeitos sonoros, trilha)
export const arquivoGlobal = (p: string) => {
  const b = base();
  return b !== undefined ? b + p : staticFile(p);
};

// Arquivo de um projeto: primeiro o mapa da prévia, senão public/projetos/<id>/<p>
// (o mapa com "__publico" também cai na pasta pública — usado pelos exemplos)
export const arquivoProjeto = (id: string, p: string | undefined, mapa?: Record<string, string>) => {
  if (!p) return null;
  if (/^(https?:|blob:|data:)/.test(p)) return p;
  if (mapa?.[p]) return mapa[p];
  if (mapa && !mapa.__publico) return null;
  return arquivoGlobal(`projetos/${id}/${p}`);
};
