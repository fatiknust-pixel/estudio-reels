# Guia do canal dark (vídeos de 8 a 10 minutos)

Para vídeos do Modo 1 com `pedido.genero` (documentário narrado, sem rosto, estilo canal dark do YouTube). Vale junto com
`docs/guia-roteiro.md` e as `instrucoes` do gênero; em caso de conflito, as `instrucoes` do gênero ganham.
Base: pesquisa sobre canais dark/faceless (fontes secundárias: guias de criadores, notícias sobre a política do YouTube);
os números são **heurísticas de mercado**, não dados oficiais — use como ponto de partida.

## 1. Estrutura de um vídeo de ~10 min (≈ 1.450 palavras)
| Tempo | Bloco | O que fazer |
|---|---|---|
| 0:00–0:30 | **Gancho** | Comece no ponto mais forte: fato chocante, pergunta que dói, cena no meio da ação, contradição. Nada de "olá, pessoal", nada de apresentar o canal. |
| 0:30–1:00 | **Promessa** | Diga o que a pessoa vai descobrir e por que importa ("no fim você vai entender por que…"). Contexto mínimo. |
| 1:00–8:30 | **5 capítulos de ~90 s** | Cada capítulo = uma ideia nova + um dado/curiosidade surpreendente. Abra com `titulo` curto na tela. **Termine cada capítulo com um loop aberto** ("mas o que ninguém esperava era…") que puxa o próximo. |
| ≈ 6:30–7:00 | **Virada/clímax** | O fato mais forte do vídeo, perto de 2/3 do tempo (a retenção costuma cair no meio: é aqui que ela se recupera). |
| 8:30–9:30 | **Desfecho** | Responde ao gancho, amarra as pontas, deixa uma reflexão ou pergunta. |
| 9:30–10:00 | **Fecho curto** | Convite breve para se inscrever e sugestão do próximo vídeo da série. Sem enquete longa. |

Para 8 min: 4 capítulos (≈ 1.150 palavras). Para 5 min: 3 capítulos (≈ 720 palavras).

## 2. Ritmo da narração
- 140 a 150 palavras por minuto no português (calcule a duração por aí). Frases curtas (até ~18 palavras), uma ideia por frase,
  alternando frases curtas e médias. Vírgula e ponto marcam as pausas da voz: pontue de propósito (reticências só em suspense).
- Números, siglas e datas escritos para serem **falados** ("mil novecentos e quarenta e cinco", "cinco vírgula dois milhões").
- Re-hook a cada 30–60 s: uma pergunta, uma promessa ("já vamos ver"), uma virada.
- Fato verificável a cada 2–3 frases. Nada de enrolação, de repetição do que já foi dito, nem de "como já falei".

## 3. Imagens: a foto é o que está sendo dito agora
- Foto nova a cada **3 a 6 s** (≈ 8–14 palavras); documento, mapa ou prova importante fica 6–10 s.
- Quebre a fala em ideias e dê a cada ideia a foto do assunto exato (o rio, a rua, o prédio, a pessoa, o objeto, o documento, o mapa).
  Use `galeria` + `galeriaEm` com a palavra exata em que cada foto entra. Mude a foto **sempre** que o assunto da frase mudar.
- Varie os planos: geral → detalhe → mapa de localização → foto histórica → foto atual. Nunca use a mesma foto duas vezes.
- Prefira fotos reais e datadas; mapas (locator maps do Commons) quando falar de lugar, fronteira ou rota; documentos/capas/jornais da época em história.
- Para cada imagem do `imagens.json` dê `wiki` (artigo da Wikipédia **no idioma do vídeo**) e `commons` (busca descritiva, com nome do lugar/pessoa e,
  se ajudar, o ano), além de `rotulo` curto. Evite termos genéricos ("floresta", "cidade"): diga qual.
- **A foto tem de ser do que a frase diz, não do tema geral.** Frase sobre um país/cidade → foto desse país/cidade (paisagem, skyline, marco conhecido, mapa de localização), nunca uma foto genérica nem de outro lugar.
  Frase sobre uma obra, máquina ou fato → foto daquela obra/máquina/fato. Se não houver foto específica, escolha outro assunto da frase que tenha foto, em vez de uma foto "parecida".
- **`commons` é a busca que decide a foto**: escreva com os nomes próprios exatos, em inglês, como no título do arquivo no Commons (ex.: "Hong Kong-Zhuhai-Macau Bridge Qingzhou cable-stayed", "Brasília Congresso Nacional Oscar Niemeyer").
  Termos genéricos ("bridge construction", "city") trazem fotos aleatórias. `wiki` só serve se o artigo for exatamente o assunto da foto (artigo de conceito genérico mostra foto qualquer).
  O sistema descarta foto cujo título/descrição não cite o assunto pedido; sem foto boa, o vídeo mostra o fundo neutro em vez de uma foto errada.
- Ritmo: nunca deixe a mesma foto mais de 8 s; o validador exige pelo menos 1 foto para cada 8 s de fala.
- A câmera já se move devagar sozinha (aproxima, afasta, arrasta para os lados); você não precisa descrever.

## 4. Na tela
- Poucos elementos (0 a 2 por cena): `titulo` ao abrir cada capítulo; `contador`/`placar` para números e rankings; `linha` para sequência de datas;
  `mapa` para localização; `pessoa` ao apresentar alguém; `definicao` para termo difícil; `check`/`carimbo` só para um desmentido ou veredito.
- Sem enquete e sem "siga" no meio: só o fecho curto no final. A legenda é no estilo cinema (frase embaixo, simples): não escreva para legenda chamativa.
- Fontes na tela (`fontes`) quando citar número, data ou caso real.

## 5. Honestidade, fontes e o que o YouTube pede
- Pesquise de verdade (web), cruze pelo menos 2 fontes confiáveis, preencha `fontesPesquisa` com título + URL, e use só o que a fonte sustenta.
- Casos reais: tom respeitoso, sem acusar pessoas vivas sem fonte, sem violência gráfica, sem expor menores. Lendas e teorias: marque como lenda/teoria.
- **Política de conteúdo "inautêntico/em massa" (YouTube, jul/2025):** o risco de desmonetização é de canal com roteiro, voz e imagens genéricos, repetidos em série.
  Para o canal ter valor próprio: ângulo único em cada vídeo, pesquisa com fontes, comentário/análise (não só resumo), **estrutura e abertura diferentes de um vídeo
  para o outro** (não repita o mesmo molde nem a mesma frase de gancho), imagens com licença e crédito. Imagem sintética realista exige rótulo de IA no YouTube.
  Confira sempre a página oficial da política antes de monetizar.

## 6. Publicação (campo `publicacao` do roteiro)
Escreva também, no `roteiro.json`:
`"publicacao": { "titulos": ["…", "…", "…"], "descricao": "…", "tags": ["…"] }`
- 3 títulos alternativos (até ~65 caracteres) com padrões que funcionam: pergunta curiosa, "A verdadeira história de…", "Por que… ", número ("7 fatos…"), tese
  contraintuitiva; sem clickbait falso (o vídeo precisa entregar). Um deles pode ser o `titulo`.
- `descricao`: 2–3 linhas do que o vídeo mostra + marcadores de capítulo (`0:00 Gancho`…) + as fontes. A Action acrescenta os créditos das fotos.
- 8 a 12 `tags`. Miniatura: um único ponto focal; sugira o texto de 2–4 palavras no último título da lista.

## 7. Por nicho
- **Terror, mistérios, casos reais:** abra no momento mais intrigante; cronologia clara; "o que se sabe / o que não se sabe"; teorias com ressalva; final aberto.
  Marque lenda como lenda; sem gore; cuidado com nomes de vítimas e menores.
- **Lugares do mundo / abandonados:** abra com a imagem ou o dado mais impressionante do lugar; por que foi construído e por que mudou/foi abandonado; curiosidades;
  como é hoje; mapa de localização; fotos do lugar **exato**.
- **Geopolítica e economia:** pergunta de tensão ("por que X não pode…?"); contexto histórico; mapa; atores e interesses; números **com fonte e data**; cenários e "o que muda";
  neutralidade (mostre mais de um lado).
- **História e biografia:** arco origem → conflito → virada → legado; datas; trechos de cartas/documentos; mapas de época; o "porquê" importa mais que a lista de datas.
- **Ciência, espaço, natureza:** pergunta "e se…?"; escalas e comparações; números; analogias do dia a dia; imagens da NASA/ESA/museus.
- **Curiosidades e rankings:** contagem regressiva com critério claro; cada item com mini-gancho; o mais surpreendente por último.

## 8. Outros idiomas (`pedido.idioma`)
- Escreva o roteiro **direto no idioma** (não traduza frase por frase): nomes e termos na forma local, unidades locais (ou as duas), referências culturais do público.
- Títulos de artigos da Wikipédia (`wiki`) no idioma do vídeo.
- Palavras por minuto de narração, aproximado: inglês 150, espanhol 160, francês 150, italiano 150, alemão 130.
- Legenda: no máximo 2 linhas de ~40 caracteres, e leitura confortável (≈ 17 caracteres por segundo): frases que cabem nisso.
