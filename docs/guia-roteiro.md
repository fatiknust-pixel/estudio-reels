# Guia do roteiro (Modo 1 — vídeo gerado por IA)

Este guia é lido pelo Claude na Action `gerar-ia.yml`. O formato é o mesmo do
`conteudo/<id>/roteiro.json` do projeto Astra. O pedido (tema, tom, duração) está em
`projetos/<id>/projeto.json`, no campo `pedido`.

## O que entregar

Dois arquivos na pasta `projetos/<id>/`:

1. `roteiro.json` — o vídeo, cena por cena.
2. `imagens.json` — que fotos baixar do Wikipédia / Wikimedia Commons.

Depois rode `node scripts/validar-roteiro.mjs projetos/<id>` e corrija até não haver erros.

## Pesquisa e fontes

- Pesquise antes de escrever (WebSearch/WebFetch). Use **fontes confiáveis e verificáveis**:
  órgãos oficiais (STF, TSE, IBGE, ministérios, Diário Oficial, Banco Central…), leis, artigos
  científicos, e veículos de imprensa reconhecidos (Agência Brasil, G1, Folha, Estadão, BBC, Reuters,
  Poder360, Nexo…). Confira datas, números e nomes em mais de uma fonte quando possível.
- **Nada inventado.** Se não confirmou um dado, não use. Em tema polêmico, seja neutro e factual,
  diferencie fato de opinião e atribua as afirmações ("segundo o STF…").
- Cada cena com fatos mostra suas fontes em `fontes` (curtas, ex.: `"STF — HC 193.726"`, `"IBGE 2024"`,
  `"G1"`), no máximo 3.
- Liste as fontes completas em `fontesPesquisa`: `[{ "titulo": "...", "url": "https://..." }]`.

## Estrutura do vídeo

- **Gancho (cena 1, até ~5 s):** pergunta forte, contradição ou número surpreendente que prenda
  nos primeiros segundos. Nada de "Olá, pessoal".
- **Desenvolvimento:** 4 a 8 cenas, uma ideia por cena, frases curtas e diretas (linguagem falada,
  pt-BR). Use os elementos animados para reforçar o que está sendo dito.
- **Final:** resumo em uma frase + **pergunta para o público** (elemento `enquete` com 2 opções)
  + **CTA** (elemento `seguir`, ex.: "SIGA PARA MAIS").
- **Duração:** a voz fala ~2,4 palavras por segundo (contando as pausas). Para `pedido.duracao` segundos, o total de
  palavras de todos os `texto` deve ficar perto de `duracao × 2,4` (± 10%).
- Escreva números como a voz deve falar quando ajudar a pronúncia ("12 anos", "R$ 5 mil", "2017").

## Estilo de edição (variar sempre!)

Todo `roteiro.json` tem um objeto `estilo`. Ele muda o **ritmo e o movimento** da edição, não só as cores:

```json
"estilo": { "dinamica": "cinema", "legenda": "discreta", "transicao": "circulo", "fundo": "limpo",
            "musica": "epica", "formato": "linha-do-tempo", "fonte": "playfair", "paleta": "pordosol" }
```

| campo | opções |
|---|---|
| `dinamica` | `energetica`, `cinema`, `jornal`, `glitch`, `colagem`, `minimal`, `padrao` (veja abaixo) |
| `legenda` | `karaoke` (3 palavras, a falada colorida), `palavra` (uma palavra gigante por vez), `caixa` (palavra falada dentro de uma caixa colorida), `discreta` (frase pequena, estilo documentário), `cinema` (frase inteira embaixo, como legenda de filme e série) |
| `transicao` | `faixas`, `zoom` (zoom com desfoque), `deslize` (cena entra pela lateral), `flash` (clarão), `circulo` (abre em círculo) |
| `fundo` | `grade`, `ondas`, `pontos`, `raios`, `limpo`, `bandeira` (só para temas do Brasil) |
| `musica` | `tensao`, `leve`, `epica`, `nenhuma` |
| `formato` | `explicativo`, `lista`, `linha-do-tempo`, `mito-verdade`, `comparacao`, `curiosidade` |
| `fonte` | `montserrat`, `poppins`, `oswald` (condensada, notícia), `raleway`, `playfair` (serifada, documentário), `robotoslab`, `anton`, `bebas`, `inter`, `bangers` (gibi) |
| `paleta` | `padrao`, `brasil`, `neon`, `noticia`, `documentario`, `oceano`, `fogo`, `pordosol`, `grafite`, `claro` |

### Dinâmica de edição
| dinâmica | como fica | combina com | o roteiro |
|---|---|---|---|
| `energetica` | "câmera" dá socos de zoom a cada elemento novo, treme nos carimbos, flash na troca de cena | `palavra`/`caixa`, `zoom`/`flash`, `leve`, `anton`/`poppins` | frases curtas, cenas curtas, **muitos** elementos (3–5 por cena), carimbos |
| `cinema` | faixas pretas, grão de filme, vinheta, zoom lento contínuo | `playfair`, `discreta`, `circulo`/`zoom`, `epica` | ritmo calmo, texto narrativo, poucos elementos (1–2), mais `definicao`/`linha` |
| `jornal` | tarja AO VIVO piscando e letreiro correndo com o título e as fontes | `noticia`, `oswald`, `caixa`, `flash`/`deslize`, `tensao` | tom de reportagem, fontes em todas as cenas, `tag` e `titulo` |
| `glitch` | distorção RGB e linhas de TV nas trocas de cena e nos elementos | `neon`, `poppins`, `palavra`, `deslize`, `tensao` | tecnologia, mistério, viradas ("mas tem um detalhe…") |
| `colagem` | textura de papel, elementos levemente tortos, movimento "stop motion" | `pordosol`/`padrao`, `robotoslab`/`bangers`, `karaoke`, `deslize`, `leve` | curiosidades, história leve, `icones` e `comentario` |
| `minimal` | sem partículas nem texturas, limpo e calmo | `grafite`/`claro`, `raleway`/`inter`, `discreta`, `circulo`, `leve`/`nenhuma` | didático, frases completas, poucos elementos |
| `padrao` | o visual original dos vídeos de presidentes do Astra | qualquer | explicativo |

**Formatos:** `explicativo` (gancho → contexto → fatos → resumo → final), `lista` ("5 coisas que…", uma cena
por item com o número em destaque), `linha-do-tempo` (cenas por data, `linha` e o ano em `titulo`),
`mito-verdade` (cada cena começa com a afirmação e um `carimbo` MITO/VERDADE), `comparacao` (A × B com
`placar` e `check`), `curiosidade` (5–6 cenas curtas, ritmo acelerado).

### Regra de variedade
- O que vier em `pedido.estilo` com valor diferente de `"auto"` é **obrigatório** (o app sorteou para variar
  um lote, ou você escolheu).
- Onde for `"auto"` (ou o campo não existir), escolha o que combina com o tema **sem repetir a `dinamica`, a
  `legenda`, a `transicao` e o `fundo` do vídeo anterior** — veja com `node scripts/estilo-ia.mjs recentes <id>`.
  Evite também repetir o `formato`, a paleta e a fonte. Monte uma identidade coerente (ex.: notícia →
  `jornal` + `oswald` + `caixa` + `flash`; história → `cinema` + `playfair` + `discreta` + `zoom` + `epica`;
  curiosidade leve → `colagem` + `bangers` + `karaoke` + `deslize` + `leve`).
- Se `pedido.lote` existir, este vídeo faz parte de um lote: os temas dos outros estão em `lote.outros` — não
  repita o mesmo ângulo nem o mesmo gancho deles.
- O validador confere tudo isso.

## Videoaulas (quando `pedido.tom` começa com "Videoaula")

Série didática "IA do Zero ao Especialista". O tema começa com o código da aula (`Aula 3.4: …`) e traz um
briefing do que ensinar: siga o briefing, ele é o conteúdo da aula. O objetivo é que **qualquer pessoa
acompanhe sem se entediar**, sem perder a seriedade: ritmo de Reels, conteúdo de aula.

**Voz e linguagem**
- Professor próximo e confiante, falando com "você". Sério, sem exagero: nada de "revolucionário",
  "vai roubar seu emprego", "segredo que ninguém conta", promessas de dinheiro ou de resultado.
- Frases de até ~15 palavras, uma ideia por frase. Todo termo técnico ganha uma explicação simples na
  primeira vez (elemento `definicao`). Termo em inglês: diga a tradução na primeira vez.
- Comandos e nomes técnicos aparecem na tela; na fala, escreva como se lê ("barra clear", "skill").
- Preços, datas e números sempre com fonte na cena (`fontes`) e com a data ("em outubro de 2026").
- Continuidade de série: quando fizer sentido, ligue com a aula anterior ("na aula passada você viu…").

**Estrutura (2 min ≈ 290 palavras; em 1:30 junte conceito e analogia e corte o erro comum)**

| # | `id` | tempo | o que a voz faz | elementos na tela |
|---|---|---|---|---|
| 1 | `gancho` | 0–5 s | pergunta direta ao espectador ou número real surpreendente | `pergunta` ou `contador`, às vezes `carimbo` |
| 2 | `promessa` | 5–12 s | "Nesta aula você vai aprender…" (3 itens) | `titulo` com o código da aula em `sub` + `icones` com os 3 itens |
| 3 | `conceito` | 12–30 s | o conceito em linguagem simples | `titulo` + `definicao` (+ `tag`) |
| 4 | `analogia` | 30–45 s | comparação com algo do dia a dia | `icones` ou `mapa` |
| 5 | `exemplo` | 45–72 s | um caso concreto, passo a passo | `comentario` digitando o prompt/comando; `check` (antes ruim × depois bom), `placar` ou `contador` para números |
| 6 | `erro-comum` | 72–85 s | o erro que quase todo mundo comete, e como evitar | `carimbo` ("ERRO COMUM", "MITO", vermelho) + `check` com `ok: false` |
| 7 | `pratica` | 85–97 s | "Pause o vídeo e tente: …" (o exercício da aula, em 1 frase) | `tag` "PAUSE E TENTE" com ícone `alvo` + `pergunta` |
| 8 | `resumo` | 97–108 s | as 3 ideias da aula em 3 frases curtas | `titulo` "RESUMO" + `icones` com 3 itens |
| 9 | `final` | 108–120 s | quiz com 2 opções, uma pausa curta, a resposta certa com o porquê, convite para a próxima aula | `enquete` (o quiz) + `seguir` ("PRÓXIMA: AULA 3.5") |

**Ritmo e interação**
- Algo novo na tela a cada 3–5 s (a cada 8–12 palavras faladas): 3 a 5 elementos por cena, cada um com
  `em` na palavra exata em que aquilo é dito. Nunca uma cena inteira só com legenda.
- Pelo menos 3 momentos que falam com o espectador: a pergunta do gancho, o "pause e tente" e o quiz.
  Um `comentario` ("comenta aí qual você usa") pode entrar no exemplo ou no resumo.
- Fundos: o tema quase nunca tem foto livre útil, então deixe a maioria das cenas com fundo animado
  (sem `fundo`). Use `imagens.json` só para pessoas, empresas ou lugares reais — nas videoaulas, 2 a 4
  imagens bastam (exceção à regra geral de 4 a 9).
- `formato`: `explicativo` por padrão; `comparacao` quando a aula compara (ex.: modelos, planos);
  `lista` quando o briefing enumera itens; `mito-verdade` quando a aula é sobre erros e limites.

**Visual "Videoaula" (`visual: "aula"` no projeto — fundo branco, sem dinâmica de Reels)**
- Cada cena vira um slide: o `titulo` (em `topo`) é a manchete; os outros elementos ocupam vagas lado a lado,
  uma por posição usada (`alto`, `alto2`, `meio`, `meio2`), da esquerda para a direita na ordem em que entram.
  Use **no máximo 3 posições por cena** além do `titulo` (4 só em comparações), e reuse a mesma posição
  quando um elemento deve substituir o anterior.
- Os ícones são a ilustração da aula e se desenham na tela: escolha o ícone que **explica** a ideia, da lista
  de tecnologia (`cerebro` para IA, `chip`/`robo` para modelos, `chat` para conversa, `terminal`/`codigo`
  para comandos, `camadas` para contexto, `lupa` para pesquisa, `moeda`/`grafico` para custo, `escudo`/
  `cadeado` para segurança, `plug` para conectores, `engrenagem` para automação, `lampada` para dica…).
  Prefira `icones` (2–3 ícones com rótulos de 1–3 palavras) e `tag` com ícone a textos longos.
- `carimbo` vira um destaque com marca-texto (vermelho = alerta/erro): use para a palavra-chave da cena, não
  como carimbo de efeito. `comentario` mostra o prompt sendo digitado numa caixa "Prompt".
- Nada de emojis nem exageros visuais; textos dos elementos curtos (até ~5 palavras), a fala explica o resto.
- A voz dessas aulas lê bem termos em inglês: escreva "machine learning", "prompt", "tokens" normalmente.

## Gêneros (canal dark) — quando existir `pedido.genero`

O app tem modelos de "canal dark" (vídeo narrado, sem rosto: documentário, história, biografia,
mistérios, curiosidades, ranking, ciência, lugares, mitologia, terror, economia, geopolítica,
tecnologia, natureza, reflexões). Quando o pedido trouxer `pedido.genero`:
- **Siga `pedido.genero.instrucoes`** — elas valem mais que as regras gerais de estrutura deste guia
  (ex.: num documentário longo não precisa de enquete; feche com o convite para se inscrever).
- O formato do quadro está em `projeto.formato` (`16:9` = YouTube, horizontal; `9:16` = vertical) e a
  duração em `pedido.duracao`. Vídeos longos (5–12 min) pedem 12 a 30 cenas de 20–40 s cada.
- Se `pedido.genero.galeria` for `true`, é um vídeo **guiado por imagens**, no estilo dos canais dark do
  YouTube: a imagem na tela sempre mostra **o que o narrador está dizendo naquele instante**. Cada cena
  tem `"galeria": ["chave1", "chave2", "chave3", ...]` (2 a 8 fotos que se sucedem com fusão e movimento de
  câmera) e `"galeriaEm": [0, "palavra2", "palavra3", ...]`: a palavra **exata do `texto` da cena** em
  que cada foto entra (a 1ª é `0`, o começo). Quebre a fala em ideias (uma por frase ou oração) e dê a
  cada ideia a foto do assunto exato dela (o lugar, a pessoa, o objeto, o mapa, a época citados),
  trocando de foto a cada 3 a 6 segundos de fala (~8 a 14 palavras). Não repita chaves entre cenas.
  O `imagens.json` terá então 20 a 60 imagens (a regra geral de 4 a 9 não vale). `fundo` pode ficar
  vazio quando houver `galeria`.
- Se o `projeto.json` tiver o campo `fundoVideo`, o vídeo roda sobre uma **gameplay de fundo** (vídeo sem
  som atrás de tudo): as fotos da `galeria` aparecem por cima como cartões grandes (no vertical, na parte
  de cima; no horizontal, à esquerda), os elementos animados ficam por cima de tudo e a legenda embaixo.
  Faça tudo como acima (galeria com `galeriaEm`, em quase todas as cenas), mas use **poucos elementos por
  cena (0 a 2)** e evite `posicao: "alto"`/`"topo"` com elementos grandes, para não cobrir o cartão da
  foto; prefira `meio2` e `titulo` curto. Não mencione a gameplay na fala.
- Prefira acervos livres e confiáveis do Wikimedia Commons (fotos oficiais, NASA/ESA, museus, arquivos
  históricos em domínio público). Nunca use imagens com direitos autorais.

## Formato do `roteiro.json`

```json
{
  "titulo": "Título curto do vídeo",
  "estilo": { "dinamica": "energetica", "legenda": "palavra", "transicao": "zoom", "fundo": "raios",
              "musica": "leve", "formato": "lista", "fonte": "anton", "paleta": "neon" },
  "legenda": { "palavrasPorTela": 3 },
  "fontesPesquisa": [{ "titulo": "STF — notícia do julgamento", "url": "https://portal.stf.jus.br/..." }],
  "cenas": [
    {
      "id": "gancho",
      "texto": "O que a voz fala nesta cena (vira a narração e a legenda).",
      "fundo": "chave-da-imagem",
      "galeria": ["chave-1", "chave-2"],
      "galeriaEm": [0, "palavra"],
      "fontes": ["Fonte curta"],
      "elementos": [
        { "tipo": "pergunta", "texto": "INOCENTADO?", "em": "inocentado", "posicao": "alto" }
      ]
    }
  ]
}
```

- `id`: curto, minúsculas e hífens, único (`gancho`, `contexto`, `numeros`, `final`…).
- `fundo`: chave de uma imagem do `imagens.json` (ou omita para fundo animado).
- `galeria` (opcional): 2 a 8 chaves do `imagens.json` que se sucedem na cena (estilo documentário).
- `galeriaEm` (com `galeria`): lista do mesmo tamanho; para cada foto, a palavra exata do `texto` em que ela
  entra (a 1ª: `0`). Sem ela, o tempo é dividido igualmente.
- `em`: a palavra **exata do `texto` da cena** em que o elemento aparece (ou `0` = início da cena).
- `posicao`: `topo`, `alto`, `alto2`, `meio`, `meio2` (de cima para baixo). Um elemento sai quando
  outro (que não seja `carimbo`) entra na mesma posição. A legenda fica embaixo — não use `meio2`
  para coisas grandes.
- Cores (campo `cor`): `amarelo`, `vermelho`, `verde`, `azul`, `roxo`, `cinza`.
- 2 a 5 elementos por cena; sempre um `titulo` em `topo` no começo das cenas principais.

## Elementos animados

| tipo | campos | uso |
|---|---|---|
| `titulo` | `texto`, `sub?`, `cor?` | faixa de título (CAIXA ALTA, até ~22 letras) |
| `pergunta` | `texto` | pergunta grande balançando |
| `carimbo` | `texto`, `cor?` | carimbo (VERDADE, FALSO, NÃO, ANULADO…) — pode sobrepor |
| `tag` | `texto`, `icone?`, `cor?` | etiqueta com ícone |
| `pessoa` | `imagem`, `nome`, `cargo` | foto redonda de uma pessoa (chave do `imagens.json`) |
| `icones` | `itens: [[icone, rótulo], ...]` | 2–3 ícones lado a lado (use `["seta", ""]` entre eles) |
| `contador` | `de`, `ate`, `unidade`, `rotulo?` | número que conta até o valor |
| `linha` | `itens: [[data, rótulo], ...]` | linha do tempo (2–4 marcos) |
| `definicao` | `palavra`, `significado` | termo + explicação curta |
| `mapa` | `de`, `para`, `legenda?` | algo que vai de um lugar a outro |
| `placar` | `sim`, `nao`, `rotulo`, `rotuloSim?`, `rotuloNao?`, `decimais?`, `cores?` | votação/comparação em barras |
| `relogio` | `rotulo`, `antes?`, `depois?` | prazo que cai pela metade (barras) |
| `check` | `ok` (true/false), `texto`, `nota` | verdadeiro/falso com explicação |
| `comentario` | `texto` | balão "comenta aí" digitando |
| `enquete` | `pergunta`, `opcoes` (2) | pergunta final para o público comentar 1 ou 2 |
| `seguir` | `texto` | botão de seguir pulsando (CTA) |

Ícones: `predio casa seta contrato documento dinheiro lavagem martelo balanca obra relogio check x pin
mais urna alvo alerta celular tornozeleira cruz balao` e, para tecnologia e aulas, `cerebro chip robo chat
lupa engrenagem raio nuvem livro codigo grafico cadeado pessoa lampada pasta globo imagem video microfone
chave escudo camadas terminal plug calendario email estrela ferramenta lista play olho moeda`.

## Formato do `imagens.json`

```json
{
  "lula": { "wiki": "Luiz Inácio Lula da Silva", "rotulo": "Luiz Inácio Lula da Silva" },
  "stf": { "commons": "Supremo Tribunal Federal sede Brasília", "rotulo": "Sede do STF" },
  "planalto": { "arquivo": "Palácio do Planalto.jpg", "rotulo": "Palácio do Planalto" }
}
```

- `wiki`: título exato do artigo na Wikipédia em português (usa a foto principal do artigo) — o melhor
  para pessoas, lugares e instituições.
- `commons`: busca no Wikimedia Commons (para locais, objetos, eventos).
- `arquivo`: nome exato de um arquivo do Commons (tem prioridade, use se você confirmou que existe).
- `rotulo`: legenda curta mostrada no crédito.
- 4 a 9 imagens; só imagens livres do Commons (o autor e a licença aparecem no vídeo).
  Pode combinar `wiki` + `commons` como plano B.

## Exemplo completo

Veja `app/demos/demo-ia.json` (campo `cenas`) — é o vídeo do Astra sobre o Lula convertido para este app.
