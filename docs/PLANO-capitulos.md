# Plano: "IA do Zero ao Especialista" em 8 capítulos de ~10 min

Decisão do dono do projeto (substitui o plano de 40 aulas de ~2 min):

- **8 vídeos, um por nível do roteiro (`docs/roteiro-ia.md`)**: Capítulo 1 … Capítulo 8, cada um com ~10 min
  (~1.450 palavras de narração, ~145 palavras/min), cobrindo TODO o conteúdo das 5 aulas do nível
  (as antigas 1.1…8.5 viram seções/momentos dentro do capítulo, com vinheta de seção na tela).
- **Visual "Videoaula"** (`visual: "aula"`, 16:9, fundo branco, ícones simples que se desenham, sem informação demais). Já no `main`.
- **Tudo em pt-BR**: narração, textos na tela, legendas. Termos em inglês só quando são o nome real da coisa (Claude, prompt, MCP…).
- **Voz: a voz clonada do dono, feita no Voice Studio do computador dele** (não a Thalita/edge-tts).
- **Pronúncia**: termos em inglês e siglas têm de sair certos (ex.: "Claude" lido como "Clód", nunca "cloud") e a
  última sílaba não pode ser cortada. `scripts/pronuncias.json` guarda o dicionário (vale para a voz neural; para a
  voz clonada, passe o texto já "respelado" por `falado()` de `scripts/voz.py`, ou ajuste o dicionário ao motor).
  `voz.py` agora também acrescenta 0,4 s de respiro no fim de cada cena.
- **Fluxo de aprovação**: gerar e renderizar o Capítulo 1, enviar ao dono, e só gerar o 2 em diante depois que ele autorizar.
  Capítulo a capítulo, autorizando cada um (ou todos os próximos, se ele disser).

## Como fazer (sessão rodando no computador do dono, onde está o Voice Studio)

1. `git pull`. Ler `docs/guia-roteiro.md` (seção Videoaulas / visual Videoaula) e o nível correspondente em `docs/roteiro-ia.md`.
2. Projeto novo por capítulo (`app/lib/projetos.ts → projetoIA` ou copiando um `projetos/ia-*/projeto.json`):
   `formato "16:9"`, `visual "aula"`, `tema "aula"`, `duracao 600`, título "Capítulo N: <nível>", `pedido.tema` começando por "Capítulo N".
   O cabeçalho do visual lê `^Aula X.Y`; ajustar `src/aula/ModoAula.tsx` (Cabecalho) para também aceitar `^Capítulo N`.
3. Roteiro (cenas com `texto`, elementos, imagens): ~28–32 cenas, ritmo dos 9 momentos do guia repetido por seção,
   com exemplos práticos e recapitulação ao fim de cada seção. Validar com `node scripts/validar-roteiro.mjs projetos/<id>`.
4. **Narração com a voz clonada**: para cada cena, gerar o áudio no Voice Studio a partir do texto (passado por `falado()`),
   salvar em `projetos/<id>/audio/<cena>-<hash>.mp3`, aplicar `tratar()` (EQ + -16 LUFS + respiro) e obter o tempo de cada palavra
   (alinhamento forçado, ex. whisper/whisperx em pt, já que o clone não devolve WordBoundary). Gravar em `narracao.<cena>` =
   `{hash, texto, audio, duracao, palavras:[{p,i,f}]}` — o mesmo formato que `scripts/voz.py` produz. Conferir de ouvido
   "Claude", "prompt", "MCP", "API" e o fim de cada frase.
5. Renderizar: `CHROMIUM_PATH=<headless_shell> node scripts/renderizar.mjs <id> "<saida>.mp4"` (≈ 1 min por 20 s de vídeo; 10 min leva bem mais, então rodar em segundo plano).
6. Enviar o MP4 do Capítulo 1 ao dono e esperar autorização antes do 2.
7. Ao fim, reunir `Capítulo 1 … Capítulo 8` em ordem numa pasta única para entregar.

## Já existente no repo

- Os 40 projetos antigos (`projetos/ia-20261019-*`) ficam como histórico; não renderizar de novo.
- A Aula 1.1 (nova) serviu de amostra do visual Videoaula; o dono pediu refazer tudo em capítulos.
