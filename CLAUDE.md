# Framecraft — guia para o Claude

PWA (React + Vite) que cria vídeos 9:16/16:9 com Remotion. Prévia ao vivo no app, render no GitHub Actions.
- **Modo 1 (IA):** tema → Claude escreve `roteiro.json` → voz (edge-tts) + imagens (Wikimedia) → editor.
- **Modo 2 (bruto):** vídeo da galeria → transcrição (faster-whisper) + estilo viral → editor.
- Formato central de tudo: `src/tipos.ts` (tipo `Projeto` = `projetos/<id>/projeto.json`).

## Regras de economia (siga sempre)

1. **Respostas curtas.** Português, direto. Sem repetir o pedido, sem resumo longo do que fez, sem explicar código que não pedi. Ao terminar: 1 a 3 linhas (o que mudou e onde).
2. **Leia pouco.** Use o mapa abaixo para ir direto ao arquivo. Leia só o trecho necessário (offset/limit, grep) em vez do arquivo inteiro. Não explore o repositório "para entender".
3. **Nunca leia sem eu pedir:** `projetos/` (dados gerados, dezenas de pastas), `package-lock.json`, `public/fonts`, `public/sfx`, `public/projetos`, `node_modules/`, `out/`. Se precisar de um exemplo de projeto, use `app/demos/demo-ia.json` ou `demo-bruto.json`, só o trecho útil.
4. **Não rode comandos à toa.** Para conferir mudanças de código: `npm run typecheck`. Não rode build/render a menos que eu peça.
5. **Pedido ambíguo:** faça a interpretação mais provável e diga em uma linha o que assumiu, em vez de fazer várias perguntas.
6. Não crie arquivos novos (docs, testes, README) sem eu pedir.

## Qual modelo usa cada trabalho

| Trabalho | Quem faz |
|---|---|
| Pesquisa na web, conferir fatos, achar onde algo está no código | subagente `pesquisador` (Haiku) |
| Escrever texto: roteiro, títulos, legendas, textos de cena, docs | subagente `redator` (Sonnet) |
| Mudança simples de código (cor, texto, valor, um componente) | sessão principal, direto, sem subagente |
| Bug difícil, mudança em vários arquivos, workflows, `linhaTempo.ts`/`tipos.ts` | sessão principal (Opus) |

- Delegue para o subagente só quando a tarefa for grande o bastante. Para 1 ou 2 buscas, faça direto.
- Peça aos subagentes só a conclusão (caminhos `arquivo:linha` ou fatos com fonte), nunca o conteúdo dos arquivos.
- Modelo da sessão (o usuário escolhe com `/model`): **Sonnet** no dia a dia; **Opus** só para trabalho difícil.

## Mapa: "quero arrumar X" → onde mexer

### Visual do vídeo (o que aparece no MP4 e na prévia) — `src/`
| Assunto | Arquivo |
|---|---|
| Montagem geral (qual modo, legenda, efeitos) | `src/Composicao.tsx` (registro em `src/Root.tsx`, `src/index.ts`) |
| Cenas do Modo 1 (IA) | `src/ModoIA.tsx` |
| Vídeo bruto do Modo 2 (enquadramento, zoom, cortes) | `src/ModoBruto.tsx` |
| Visual "Videoaula" (fundo branco) | `src/aula/ModoAula.tsx`, `src/aula/ElementosAula.tsx` |
| Legenda palavra por palavra | `src/componentes/Legenda.tsx` |
| Elementos animados das cenas (números, listas, mapas…) | `src/componentes/Elementos.tsx` |
| Fundo, galeria de fotos, fusão | `src/componentes/Fundo.tsx` |
| Gameplay no fundo + fotos como cartões por cima | `src/componentes/Gameplay.tsx` (dados: `fundoVideo` em `src/tipos.ts`; tempo das fotos: `iniciosGaleria` em `src/linhaTempo.ts`) |
| Emojis, sons, música, barra de progresso, títulos, enquete final | `src/componentes/Efeitos.tsx` |
| Dinâmica de edição (energética, cinema, glitch…), câmera | `src/componentes/Dinamica.tsx` |
| Ícones | `src/componentes/Icone.tsx` |
| Cores/paletas | `src/temas.ts` |
| Fontes | `src/fontes.ts` (arquivos em `public/fonts/`) |
| Tempo, duração, cortes, frames, 9:16 vs 16:9 | `src/linhaTempo.ts` (cuidado: afeta tudo) |
| Formato dos dados / valores padrão | `src/tipos.ts` (`LEGENDA_PADRAO`, `EFEITOS_PADRAO`) |
| Catálogo de estilos do Modo 1 | `src/estilos-ia.json` |
| Gêneros (documentário, mistérios, top 10…) | `src/generos.json` |
| Onde os arquivos são buscados (render x prévia) | `src/arquivos.ts` |

### App (telas e editor no celular) — `app/`
| Assunto | Arquivo |
|---|---|
| Tela inicial / lista de projetos | `app/telas/Inicio.tsx` |
| Criar vídeo com IA (tema, gênero, lote) | `app/telas/NovoIA.tsx` |
| Enviar vídeo bruto (Modo 2) | `app/telas/NovoBruto.tsx` |
| Configurações (token) | `app/telas/Config.tsx` |
| Editor (abas, prévia) | `app/telas/Editor.tsx`, estado em `app/editor/contexto.tsx` |
| Abas do editor | `app/editor/Painel*.tsx` (Legendas, Estilo, Efeitos, Cortes, Cenas, Imagens, IA, Exportar) |
| Tela "processando" | `app/editor/Processamento.tsx` |
| Estilos prontos do Modo 2 | `app/estilos.ts` |
| Opções de estilo do Modo 1 / sorteio do lote | `app/estilosIA.ts` |
| Componentes de interface e CSS | `app/ui.tsx`, `app/estilo.css` |
| Chamadas ao GitHub (salvar, disparar Actions) | `app/lib/github.ts` |
| Salvar/abrir projetos | `app/lib/projetos.ts`; armazenamento no aparelho: `app/lib/local.ts` |
| PWA (instalar, cache) | `public/manifest.webmanifest`, `public/sw.js` |

### Geração e render (GitHub Actions) — `.github/workflows/` + `scripts/`
| Assunto | Arquivo |
|---|---|
| Gerar vídeo IA (Claude escreve roteiro, voz, imagens) | `.github/workflows/gerar-ia.yml` |
| Regras do roteiro que o Claude segue | `docs/guia-roteiro.md`; validador: `scripts/validar-roteiro.mjs` |
| Roteiro → projeto | `scripts/importar-roteiro.mjs`; formato Astra: `scripts/astra.mjs` |
| Estilo do Modo 1 (não repetir) | `scripts/estilo-ia.mjs` |
| Narração (edge-tts) | `scripts/voz.py` |
| Narração gravada por você (limpa ruído, transcreve, corta por cena) | `scripts/voz_propria.py` (botão na aba Exportar; workflow `atualizar-ia.yml` com `audio`) |
| Imagens (Wikimedia, Pixabay…; candidatas que o Claude escolhe olhando) | `scripts/imagens.mjs` (`--candidatos`/`--escolhas`; passos nos workflows `gerar-ia`/`atualizar-ia`) |
| Refazer voz/imagens após editar | `.github/workflows/atualizar-ia.yml` |
| Processar vídeo bruto (whisper, cortes, rosto, áudio) | `.github/workflows/processar-bruto.yml`, `scripts/processar_bruto.py` |
| Sugestões da IA no Modo 2 | `docs/guia-sugestoes.md`, `scripts/aplicar_sugestoes.py` |
| Exportar MP4 | `.github/workflows/exportar.yml`, `scripts/renderizar.mjs` |
| Preparar a gameplay de fundo (corta, release `brutos`, prévia) | `.github/workflows/preparar-fundo.yml` |
| Salvar resultado das Actions no repo | `scripts/aplicar_resultado.py`, `scripts/salvar_no_repo.sh` |
| Publicar o app (GitHub Pages) | `.github/workflows/pages.yml` |
| Efeitos sonoros | `scripts/gerar-sfx.sh` → `public/sfx/` |

### Erro em um vídeo específico
Leia só `projetos/<id>/projeto.json` (campo de erro tem o link do log) e, se for Modo 1, `roteiro.json` da mesma pasta. Não abra outras pastas de `projetos/`.

## Comandos
```bash
npm run dev        # app em localhost:5173
npm run typecheck  # conferir código (use este para validar)
npm run studio     # Remotion Studio
node scripts/renderizar.mjs <id>   # MP4 local em out/<id>.mp4 (só se eu pedir)
```
