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
5. **Sugestões do Claude** (se o segredo existir e a opção estiver ligada): lê a transcrição numerada e
   sugere gancho de abertura (trecho forte que toca antes do começo + texto), cortes de enrolação,
   palavras em destaque, zooms, emojis, títulos (passos do tutorial, assunto do podcast, chamada da
   notícia), enquete e título — seguindo [`docs/guia-sugestoes.md`](docs/guia-sugestoes.md). Tudo entra
   aplicado e marcado como IA; na aba 🤖 IA do editor dá para tirar por partes ou pedir de novo.
6. Junta o resultado ao `projeto.json` mais recente e faz o commit.

**Acabamento profissional automático (Modo 2):**
- **Voz tratada:** filtro de graves, redução de ruído, compressor e volume padrão de redes (-14 LUFS, pico -1,5 dBTP).
- **Imagem:** leve ajuste de contraste, cor e nitidez.
- **Auto-enquadramento:** detecta o rosto (OpenCV) e a "câmera" acompanha com calma (zona morta + transição suave);
  os punch-ins aproximam do rosto. Dá para desligar em Estilo → "Seguir o rosto automaticamente".
- **Ritmo:** cortes de enquadramento alternados a cada jump cut e uma quebra de padrão sempre que passa tempo
  demais sem mudança visual (≈3 s no impacto, 2,5 s nos cortes rápidos, 4,5 s em notícia/tutorial, 6 s no podcast).
- **Áudio dos cortes:** micro fade de 2 frames em cada corte (sem "clique").
- **Design de som:** whoosh nos punch-ins e títulos, pop nos emojis (Efeitos → "Sons automáticos").
- **Trilha com ducking:** abaixa enquanto alguém fala e volta nas pausas.

| Estilo | O que faz |
|---|---|
| 💥 Legenda impacto | 2 palavras por vez, pop, destaque amarelo e zoom nas palavras-chave |
| ⚡ Cortes rápidos | pausas > 0,3 s cortadas, enquadramento alterna a cada corte, 1 palavra por vez (Anton) |
| 🎙️ Corte de podcast | vídeo deitado inteiro com fundo desfocado, legenda em caixa, assunto no topo |
| 🎞️ Documentário | zoom lento contínuo, trilha suave, legenda discreta em minúsculas |
| 📰 Notícia | tema vermelho, palavra ativa em faixa, chamada “ÚLTIMAS NOTÍCIAS” |
| 🧑‍🏫 Tutorial | legenda em caixa, títulos “PASSO 1, 2, 3…” (pela IA), tema oceano |

### Modo 1 — o que as Actions fazem

- `gerar-ia.yml`: o **Claude** (`anthropics/claude-code-action`, com a sua assinatura) lê o pedido em
  `projeto.json`, pesquisa na web e escreve `roteiro.json` + `imagens.json` no formato do Astra seguindo
  [`docs/guia-roteiro.md`](docs/guia-roteiro.md) (gancho, cenas com elementos animados e fontes na tela,
  enquete e CTA no final), conferindo com `scripts/validar-roteiro.mjs`. Depois vêm a narração
  (`scripts/voz.py`, edge-tts `pt-BR-AntonioNeural` +5%, tempo por palavra) e as imagens
  (`scripts/imagens.mjs`, Wikipédia/Commons com autor e licença).
- `atualizar-ia.yml`: depois de editar o texto de cenas ou pedir outra imagem no app, refaz só a voz
  das cenas que mudaram e baixa só as imagens pedidas. Ao exportar isso também acontece sozinho.
- Áudios e imagens ganham nomes com hash (`audio/<cena>-<hash>.mp3`), então o app nunca mostra arquivo
  velho do cache; os que deixam de ser usados são apagados.

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
3. ✅ Modo 1 (roteiro com o Claude, voz, imagens)
4. ✅ Demais estilos e sugestões da IA

Remotion é gratuito para uso individual; veja a [licença](https://www.remotion.dev/license).
