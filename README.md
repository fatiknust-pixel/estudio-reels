# Estúdio Reels

App pessoal (PWA, instalável no celular) para criar vídeos **9:16** profissionais, com prévia ao vivo
(sem renderizar) e render final no **GitHub Actions**. Reaproveita a base do
[Astra](https://github.com/fatiknust-pixel/Astra): Remotion, legenda palavra por palavra, temas de cores,
elementos animados, voz edge-tts e imagens do Wikimedia com créditos.

- **Modo 1 — Vídeo gerado por IA:** tema, tom, cores e duração → o Claude pesquisa e escreve o roteiro
  (formato `roteiro.json` do Astra) → voz + imagens → editor.
- **Modo 2 — Vídeo bruto:** vídeo da galeria + estilo viral (Legenda impacto, Cortes rápidos, Podcast,
  Documentário, Notícia, Tutorial) → transcrição com tempo por palavra → editor.
- **Editor (os dois modos):** legendas (texto, tempo, destaque), estilo (cor, fonte, posição, palavras por
  tela), efeitos (zoom, emojis, sons, barra de progresso, títulos, enquete final), cortes e, no Modo 1,
  texto das cenas, fontes e imagens. **Exportar** → MP4 1080×1920 para baixar no app.

## Como funciona

```
app/  (PWA no GitHub Pages)  ──token pessoal (só no aparelho)──▶  API do GitHub
  │  prévia ao vivo: @remotion/player + src/ (a mesma composição do render)
  │  salva projetos/<id>/projeto.json                     dispara workflows
  ▼                                                                │
.github/workflows/exportar.yml  ── Remotion render ──▶  release "exportes" (MP4)
```

| Pasta | O quê |
|---|---|
| `app/` | Interface (React + Vite): início, configurações, editor e painéis. |
| `src/` | Composição Remotion única (`Reels`): modo IA, modo bruto, legenda, efeitos, temas, fontes. |
| `src/tipos.ts` | Formato do `projeto.json` (o que o editor altera, a prévia mostra e o render usa). |
| `projetos/<id>/` | Projetos salvos pelo app + arquivos gerados pelas Actions (áudio, imagens, prévia). |
| `public/` | Fontes, efeitos sonoros, ícones do app e os exemplos. |
| `scripts/` | Render (`renderizar.mjs`), Modo 2 (`processar_bruto.py`), junção segura do resultado das Actions (`aplicar_resultado.py`, `salvar_no_repo.sh`), conversão do Astra (`astra.mjs`). |

Arquivos grandes ficam em **releases** do repositório, não no histórico do git: o vídeo normalizado
para o render (`brutos`) e os MP4 exportados (`exportes`). O vídeo da galeria sobe do celular em partes
de 12 MB para um ramo temporário `envio/<id>` (só pela api.github.com, que aceita chamadas do
navegador); a Action junta as partes e apaga o ramo.

### Modo 2 — o que a Action `processar-bruto.yml` faz

1. Remonta o vídeo enviado e normaliza (H.264, 30 fps, lado maior ≤ 1920) → release `brutos`.
2. Gera `projetos/<id>/previa.mp4` (leve, keyframes frequentes) para a prévia no celular.
3. Transcreve com **faster-whisper** (`medium` ou `small`, pt, tempo por palavra, VAD).
4. Aplica o estilo: no **Legenda impacto**, destaca números e palavras fortes, faz *punch-in*
   de zoom nelas e corta as pausas maiores que o limite escolhido.
5. Junta o resultado ao `projeto.json` mais recente (sem apagar o que você editou) e faz o commit.

## Configurar (uma vez)

1. **GitHub Pages:** *Settings → Pages → Source: GitHub Actions*. O app fica em
   `https://<usuário>.github.io/estudio-reels/`. No celular, abra e use *Adicionar à tela inicial*.
2. **Token pessoal** (no app, ⚙️ Configurações): fine-grained, só este repositório, com
   *Contents: Read and write* e *Actions: Read and write*. Fica salvo apenas no aparelho.
3. **Claude nas Actions** (Modo 1 e sugestões): rode `claude setup-token` no computador e salve como
   segredo `CLAUDE_CODE_OAUTH_TOKEN` em *Settings → Secrets and variables → Actions*.

> GitHub Pages em conta gratuita exige repositório **público** — e aí os vídeos enviados às releases
> também ficam públicos. Com GitHub Pro dá para manter o repositório privado.

## Desenvolvimento

```bash
npm install
npm run dev          # app em http://localhost:5173 (exemplos funcionam sem token)
npm run studio       # Remotion Studio com o exemplo do modo bruto
npm run typecheck
node scripts/renderizar.mjs <id>   # MP4 de projetos/<id>/ em out/<id>.mp4
```

## Etapas

1. ✅ Estrutura do app + editor com prévia ao vivo + exportar
2. ✅ Modo 2 com o estilo “Legenda impacto” (envio do vídeo, transcrição faster-whisper)
3. ⏳ Modo 1 (roteiro com o Claude, voz, imagens)
4. ⏳ Demais estilos e sugestões da IA

Remotion é gratuito para uso individual; veja a [licença](https://www.remotion.dev/license).
