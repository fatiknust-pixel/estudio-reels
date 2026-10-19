# Guia do roteiro (Modo 1 — vídeo gerado por IA)

Este guia é lido pelo Claude na Action `gerar-ia.yml`, em três etapas: a **pesquisa** (Sonnet) escreve
`out/pesquisa.md` e o `imagens.json`, o **roteiro** (Opus) escreve o `roteiro.json` só com os fatos da pesquisa,
e a **revisão** (Haiku) corrige o formato até o validador aprovar. O formato é o mesmo do
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
| `legenda` | `karaoke` (3 palavras, a falada colorida), `palavra` (uma palavra gigante por vez), `caixa` (palavra falada dentro de uma caixa colorida), `discreta` (frase pequena, estilo documentário) |
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
mais urna alvo alerta celular tornozeleira cruz balao`.

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
