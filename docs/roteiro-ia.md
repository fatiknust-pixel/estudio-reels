# Roteiro: de iniciante a especialista em IA

Oct 19, 2026 · @Clovis

## Como usar este roteiro

São 8 níveis e 40 aulas, do zero (o que é IA) até construir e avaliar seus próprios agentes. Faça uma aula por dia, ou um nível por semana: em 8 a 10 semanas você cobre tudo.

Cada aula tem quatro partes:

1. **Explicação** — o conceito em linguagem simples.
2. **Exemplo** — um caso concreto, com prompt ou código pronto para copiar.
3. **Prática** — um exercício de 10 a 30 minutos. Só avance depois de fazer.
4. **Linha para o Framecraft** — o tema já escrito para virar videoaula no Framecraft.

### Como gerar as videoaulas no Framecraft

1. Abra o app e toque em **Vídeo gerado por IA** (Modo 1).
2. No campo de temas, cole as **5 linhas** de um bloco (o app aceita até 5 vídeos por lote e 2000 caracteres; cada linha deste roteiro tem menos de 380).
3. **Tom:** escolha *Didático (passo a passo)*. **Duração:** *2 min* para aulas de conceito, *1:30* para dicas rápidas.
4. Deixe o estilo em **Automático** e ligue *Variar estilo entre os vídeos* — assim cada aula do lote sai com visual diferente.
5. Toque em gerar. O Claude da Action pesquisa, escreve o roteiro, grava a voz e busca imagens. Depois é só revisar no editor e exportar.

Dica: cada linha começa com o título da aula (o app usa os primeiros 70 caracteres como nome do projeto) e depois traz um briefing do que o vídeo deve explicar. Isso evita que o roteirista da Action invente um ângulo diferente do que você precisa estudar.

### Como as pesquisas deste roteiro foram feitas (e por quê)

As buscas na web foram feitas por agentes auxiliares rodando o **Claude Haiku 5.5**, o modelo mais barato da família ($0,10 por milhão de tokens de entrada, contra $4 do Opus 5.5 — 40 vezes menos). O modelo principal só entrou para revisar, organizar e escrever. Esse é exatamente o padrão que você vai aprender no Nível 3: **modelo barato para coletar, modelo forte para pensar**.

## Nível 1 — Fundamentos: como a IA pensa

Objetivo: entender o que acontece por trás da tela, para nunca mais usar IA "no escuro". Sem isso, todo o resto vira decoreba.

### Aula 1.1 — O que é IA (e o que é IA generativa)

**Explicação.** Inteligência artificial é o campo que faz máquinas executarem tarefas que exigiriam inteligência humana. Dentro dela está o *machine learning* (a máquina aprende padrões com exemplos, em vez de regras escritas à mão). Dentro do ML está o *deep learning* (redes neurais com muitas camadas). E dentro dele está a **IA generativa**: modelos que criam texto, imagem, áudio, vídeo e código novos.

**Exemplo.** O filtro de spam do seu e-mail é ML clássico (classifica). O Claude escrevendo um e-mail para você é IA generativa (cria).

**Prática.** Liste 5 coisas que você usa no dia a dia e classifique: IA clássica, IA generativa ou nenhuma (ex.: recomendação do Netflix, corretor do teclado, Waze, ChatGPT, calculadora).

**Linha para o Framecraft:**

```
Aula 1.1: O que é IA e IA generativa — explique para iniciantes a diferença entre inteligência artificial, machine learning, deep learning e IA generativa usando círculos dentro de círculos, com exemplos do dia a dia (filtro de spam, Netflix, Claude escrevendo um texto)
```

### Aula 1.2 — Como um LLM funciona por dentro

**Explicação.** LLM (*Large Language Model*) é um modelo treinado com uma quantidade enorme de texto para fazer uma coisa: **prever a próxima palavra** (na verdade, o próximo *token*). Repetindo essa previsão milhares de vezes, ele escreve respostas inteiras. A arquitetura por trás é o **Transformer** (Google, 2017), que usa "atenção" para pesar quais palavras do texto importam para cada previsão. Depois do pré-treino, o modelo passa por ajuste com feedback humano e regras (no caso do Claude, a "IA Constitucional") para ficar útil e seguro.

**Exemplo.** Complete: "O céu está...". Você pensou "azul", "nublado", "limpo". O LLM faz o mesmo, mas com probabilidades calculadas sobre bilhões de exemplos.

**Prática.** Peça ao Claude: *"Explique como você gera uma resposta, passo a passo, como se eu tivesse 12 anos."* Depois peça: *"Agora como se eu fosse engenheiro."* Compare as duas.

**Linha para o Framecraft:**

```
Aula 1.2: Como um LLM funciona por dentro — explique que modelos como o Claude preveem o próximo token, o que é o Transformer e a atenção (2017), pré-treino com muito texto e o ajuste fino com feedback humano e IA Constitucional, com analogia do autocompletar do celular
```

### Aula 1.3 — Tokens e janela de contexto

**Explicação.** O modelo não lê palavras, lê **tokens** (pedaços de palavra). Em português, uma palavra costuma virar 1 a 2 tokens. Tudo é medido e cobrado em tokens: o que você envia (entrada) e o que ele responde (saída). A **janela de contexto** é quanto o modelo consegue "ter em mente" de uma vez: os modelos Claude atuais têm até **1 milhão de tokens** — algo como vários livros inteiros.

**Exemplo.** Uma conversa muito longa fica mais cara e mais lenta, porque a cada nova mensagem o histórico inteiro é relido. Por isso é melhor abrir uma conversa nova para um assunto novo.

**Prática.** Cole um texto de 2 páginas no Claude e peça um resumo. Depois, na mesma conversa, mude de assunto 3 vezes e note como as respostas começam a misturar contextos. Recomece numa conversa nova e compare.

**Linha para o Framecraft:**

```
Aula 1.3: Tokens e janela de contexto — explique o que é um token, por que tudo na IA é medido e cobrado em tokens de entrada e saída, o que é a janela de contexto (até 1 milhão de tokens no Claude) e por que abrir conversa nova para assunto novo economiza e melhora as respostas
```

### Aula 1.4 — Alucinação, data de corte e limites

**Explicação.** Como o modelo prevê texto provável, ele pode gerar algo que *soa* certo mas é falso: a **alucinação**. Ele também tem uma **data de corte**: só sabe o que estava nos dados de treino. Para fatos recentes, precisa de busca na web ou de documentos que você fornece.

**Exemplo.** Pergunte o preço de um produto hoje sem ativar a busca: a resposta pode estar desatualizada. Com a busca ligada, o Claude cita as fontes e você confere.

**Prática.** Peça 3 referências bibliográficas sobre um tema de nicho, sem busca. Verifique se existem. Depois repita com a busca ativada e peça os links. Anote a diferença.

**Linha para o Framecraft:**

```
Aula 1.4: Alucinação e limites da IA — explique por que modelos de linguagem às vezes inventam fatos com confiança, o que é data de corte do treinamento, como a busca na web e as fontes citadas reduzem erros, e 3 hábitos para checar respostas antes de confiar
```

### Aula 1.5 — O mapa dos modelos e das empresas

**Explicação.** Os principais laboratórios: **Anthropic** (Claude), **OpenAI** (GPT/ChatGPT), **Google** (Gemini), **Meta** (Llama, de pesos abertos), além de Mistral, DeepSeek e outros. Existem modelos fechados (você usa pela API ou app) e de **pesos abertos** (você pode rodar no seu computador). Os modelos atuais são **multimodais**: leem texto, imagem, PDF e áudio.

**Exemplo.** Na família Claude atual: **Haiku 5.5** (rápido e baratíssimo), **Sonnet 5.5** (equilíbrio para o dia a dia e código), **Opus 5.5** (raciocínio forte) e **Fable 5.1** (o mais capaz, para os problemas mais difíceis).

**Prática.** Faça a mesma pergunta difícil a dois modelos diferentes (ex.: Haiku e Opus no app do Claude). Compare qualidade, tamanho e tempo da resposta.

**Linha para o Framecraft:**

```
Aula 1.5: O mapa dos modelos de IA em 2026 — apresente Anthropic (Claude), OpenAI (ChatGPT), Google (Gemini), Meta (Llama) e modelos de pesos abertos, explique modelo fechado x aberto e multimodal, e mostre a família Claude: Haiku 5.5, Sonnet 5.5, Opus 5.5 e Fable 5.1, para que serve cada um
```

## Nível 2 — Prompts e uso diário do Claude

Objetivo: tirar respostas de nível profissional na primeira tentativa e organizar seu trabalho dentro do app.

### Aula 2.1 — Anatomia de um prompt que funciona

**Explicação.** Um bom prompt responde a cinco perguntas: **quem** (contexto sobre você e o público), **o quê** (a tarefa, com verbo claro), **por quê** (o objetivo — o modelo decide melhor quando sabe a finalidade), **como** (formato, tamanho, tom) e **limites** (o que evitar). Pense no Claude como um colega brilhante que acabou de chegar e não sabe nada do seu projeto.

**Exemplo.**

- Fraco: *"Escreva um post sobre IA."*
- Forte: *"Sou nutricionista e tenho 3 mil seguidores no Instagram, a maioria mães de 30 a 45 anos. Escreva uma legenda de até 120 palavras explicando como uso IA para montar cardápios mais rápido. Tom acolhedor, sem jargão técnico, termine com uma pergunta para gerar comentários. Não prometa resultados de saúde."*

**Prática.** Pegue 3 prompts que você usou esta semana e reescreva cada um com as cinco perguntas. Compare as respostas antes e depois.

**Linha para o Framecraft:**

```
Aula 2.1: Anatomia de um prompt que funciona — ensine as 5 partes de um bom prompt (quem, o quê, por quê, como e limites), mostre um prompt fraco virando um prompt forte para um post de Instagram, e a regra de ouro: trate a IA como um colega brilhante que acabou de chegar
```

### Aula 2.2 — As 5 técnicas clássicas de prompt

**Explicação.** São as técnicas que aparecem nos guias oficiais da Anthropic, OpenAI e Google:

1. **Exemplos (few-shot):** mostre 2 ou 3 exemplos do resultado que você quer. Fixa formato e estilo melhor que qualquer descrição.
2. **Tags XML:** separe instruções de dados, como `<contrato>...</contrato>`. O Claude foi treinado para respeitar essa estrutura.
3. **Papel:** "Você é um revisor de contratos com foco em LGPD" dá perspectiva e vocabulário.
4. **Pensar antes de responder:** peça o raciocínio antes da conclusão em tarefas de lógica, contas ou decisão. Os modelos atuais já têm "pensamento estendido" embutido.
5. **Encadear prompts:** divida tarefas grandes em etapas (extrair → analisar → redigir), cada uma em uma mensagem.

**Exemplo.**

```
Analise o contrato abaixo.
<contrato>
[cole aqui]
</contrato>
Liste em <riscos> as 3 cláusulas mais arriscadas para o contratante
e em <sugestoes> uma redação alternativa para cada uma.
```

**Prática.** Escolha uma tarefa repetitiva do seu trabalho e monte um prompt usando pelo menos 3 das 5 técnicas. Salve-o — ele vira um modelo reutilizável (e no Nível 5, uma skill).

**Linha para o Framecraft:**

```
Aula 2.2: As 5 técnicas clássicas de prompt — ensine com exemplo curto cada uma: dar exemplos (few-shot), separar dados com tags XML, definir um papel, pedir para pensar antes de responder e encadear prompts em etapas, segundo os guias oficiais da Anthropic, OpenAI e Google
```

### Aula 2.3 — Iterar: a conversa é o prompt

**Explicação.** Ninguém acerta de primeira sempre. Especialistas iteram: pedem rascunho, criticam, refinam. Três movimentos poderosos: **"Antes de começar, me faça as perguntas que precisar"**, **"Critique sua própria resposta como um especialista exigente e melhore"** e **"Me dê 3 versões bem diferentes"**.

**Exemplo.** Ao pedir um plano de negócios, comece com "me entreviste com 5 perguntas antes de escrever". A resposta final sai sob medida, em vez de genérica.

**Prática.** Peça um texto qualquer e use os três movimentos em sequência. Anote qual deles mais melhorou o resultado.

**Linha para o Framecraft:**

```
Aula 2.3: Iterar com a IA como um especialista — mostre 3 frases que melhoram qualquer resposta: peça para a IA te entrevistar antes, peça autocrítica como especialista exigente e peça 3 versões diferentes, com um exemplo de plano de negócios melhorando a cada rodada
```

### Aula 2.4 — Projetos, instruções e memória

**Explicação.** No app do Claude, um **Projeto** é uma pasta com conhecimento fixo (arquivos, instruções) que vale para todas as conversas dentro dele. As **instruções personalizadas** e os **estilos** definem como o Claude escreve para você. A **memória** permite que ele lembre preferências e contexto entre conversas (você pode ver, editar e desligar).

**Exemplo.** Crie o projeto "Meu canal de Reels" com: o público-alvo, 5 roteiros que deram certo e a instrução "sempre comece com um gancho de até 5 segundos". Toda conversa ali já nasce sabendo disso.

**Prática.** Crie um projeto para a sua área principal de trabalho, com pelo menos 3 arquivos de referência e um parágrafo de instruções. Use-o por uma semana.

**Linha para o Framecraft:**

```
Aula 2.4: Projetos, instruções e memória no Claude — explique como um Projeto guarda arquivos e instruções para todas as conversas, como funcionam instruções personalizadas, estilos e memória entre conversas, com o exemplo de um projeto para um canal de Reels
```

### Aula 2.5 — Artefatos, arquivos e imagens

**Explicação.** **Artefatos** são criações que o Claude gera numa janela própria: documentos, páginas web, apps interativos, gráficos, diagramas e apresentações. Você pode editar, publicar e compartilhar o link. Além disso, o Claude lê **PDFs, planilhas, prints e fotos** — e com a ferramenta de análise roda código para fazer contas e gráficos de verdade.

**Exemplo.** Envie a planilha de gastos do mês e peça: *"Crie um painel interativo com os gastos por categoria e um alerta para o que passou de 20% da renda."*

**Prática.** Crie três artefatos: um documento (ex.: guia de onboarding), um mini-app (ex.: calculadora de preço de serviço) e uma análise de um PDF ou planilha seu.

**Linha para o Framecraft:**

```
Aula 2.5: Artefatos, arquivos e imagens no Claude — mostre o que são artefatos (documentos, páginas, apps interativos, gráficos, apresentações), como publicar e compartilhar, e como o Claude lê PDFs, planilhas e fotos, com o exemplo de transformar uma planilha de gastos num painel interativo
```

## Nível 3 — Escolher o modelo certo e economizar

Objetivo: pagar pouco pelo que é simples e investir no que é difícil. É aqui que o usuário comum vira especialista.

### Aula 3.1 — Cada modelo para um trabalho

**Explicação.** Usar sempre o modelo mais forte é como chamar um cirurgião para fazer curativo. Preços oficiais da API, em dólar por milhão de tokens ([fonte](https://platform.claude.com/docs/en/about-claude/models/overview)):

| Modelo | Entrada | Saída | Use para |
| --- | --- | --- | --- |
| Haiku 5.5 | $0,10 | $0,50 | classificar, extrair, resumir, buscas em volume, subagentes |
| Sonnet 5.5 | $2 | $10 | dia a dia, textos, código, agentes |
| Opus 5.5 | $4 | $20 | raciocínio complexo, projetos longos, decisões |
| Fable 5.1 | $10 | $50 | os problemas mais difíceis e tarefas autônomas muito longas |

Todos têm janela de 1 milhão de tokens. O Haiku custa 40 vezes menos que o Opus na entrada.

**Exemplo.** Separar 500 comentários em "elogio / dúvida / reclamação": Haiku. Escrever a estratégia de resposta para as reclamações: Opus.

**Prática.** Liste 10 tarefas suas com IA e marque ao lado qual modelo cada uma merece.

**Linha para o Framecraft:**

```
Aula 3.1: Qual modelo do Claude usar em cada tarefa — compare Haiku 5.5, Sonnet 5.5, Opus 5.5 e Fable 5.1 com os preços oficiais por milhão de tokens (de US$ 0,10 a US$ 10 na entrada), explique que o Haiku custa 40 vezes menos que o Opus e dê exemplos de tarefa certa para cada um
```

### Aula 3.2 — Planos do app: o que cada um libera

**Explicação.** No app (claude.ai), você paga assinatura, não tokens. Preços em dólar ([fonte](https://claude.com/pricing)):

| Plano | Preço | Destaques |
| --- | --- | --- |
| Free | $0 | chat, busca web, memória, conectores, artefatos |
| Pro | $20/mês ($17 no anual) | mais uso, Projetos, Claude Code, Claude in Chrome, Research |
| Max | a partir de $100/mês | 5x ou 20x o uso do Pro |
| Team | $25/assento/mês ($20 no anual) | 2 a 150 pessoas, administração central, SSO |
| Enterprise | sob contrato | SCIM, auditoria, compliance |

**Exemplo.** Quem usa Claude Code todo dia e bate no limite do Pro costuma subir para o Max. Quem só conversa e escreve, fica bem no Pro.

**Prática.** Durante uma semana, anote quantas vezes você bateu no limite de uso. Isso decide seu plano melhor que qualquer tabela.

**Linha para o Framecraft:**

```
Aula 3.2: Planos do Claude explicados — compare Free, Pro (US$ 20 por mês), Max (a partir de US$ 100), Team e Enterprise, o que cada um libera (Projetos, Claude Code, Research, Claude in Chrome) e como saber se vale a pena subir de plano observando seus limites de uso
```

### Aula 3.3 — Esforço e pensamento estendido

**Explicação.** Os modelos atuais "pensam" antes de responder. O **esforço** (*effort*) regula quanto: baixo, médio, alto, extra-alto e máximo. Mais esforço = respostas mais cuidadosas, porém mais lentas e que gastam mais do seu limite. No app, você ajusta no seletor de modelo; no Claude Code, com o comando `/effort`.

**Exemplo.** Revisar a ortografia de um e-mail: esforço baixo. Encontrar o erro em uma planilha financeira com 40 fórmulas: esforço alto.

**Prática.** Faça o mesmo problema de lógica com esforço baixo e alto. Compare acerto e tempo.

**Linha para o Framecraft:**

```
Aula 3.3: Esforço e pensamento estendido na IA — explique que os modelos atuais pensam antes de responder, como o nível de esforço (baixo, médio, alto, extra-alto e máximo) troca velocidade e custo por qualidade, e quando usar cada nível, com exemplo de revisão de e-mail x planilha financeira
```

### Aula 3.4 — A estratégia "modelo barato coleta, modelo forte pensa"

**Explicação.** Em tarefas grandes, o trabalho braçal (buscar na web, ler arquivos, resumir logs) consome a maior parte dos tokens, mas exige pouca inteligência. A técnica: delegar esse trabalho a **subagentes** com Haiku e deixar o modelo forte só para planejar, decidir e escrever. Isso também protege a janela de contexto do modelo principal, que recebe apenas os resumos.

**Exemplo.** Este próprio roteiro: três agentes Haiku pesquisaram em paralelo (recursos do Claude, Claude Code e API, cursos e fundamentos) e devolveram relatórios. O modelo principal só leu os relatórios e escreveu as aulas.

**Prática.** No Claude Code, peça: *"Use subagentes com o modelo haiku para pesquisar X, Y e Z em paralelo e me traga um resumo comparativo."* Observe o uso no `/usage`.

**Linha para o Framecraft:**

```
Aula 3.4: A estratégia modelo barato coleta, modelo forte pensa — explique como delegar buscas e leituras a subagentes com Claude Haiku, deixar o Opus só para planejar e escrever, por que isso economiza tokens e protege a janela de contexto, com o exemplo de três pesquisas em paralelo
```

### Aula 3.5 — Economia profissional: cache, lote e contexto enxuto

**Explicação.** Quatro alavancas oficiais ([fonte](https://code.claude.com/docs/en/costs)):

1. **Prompt caching (API):** um texto fixo repetido (manual, base de conhecimento) é guardado em cache; reler do cache custa cerca de 10% do preço normal, ou menos nos modelos 5.5.
2. **Batch API:** tarefas sem pressa processadas em lote custam **50% menos** e a maioria termina em menos de 1 hora.
3. **Contexto enxuto:** `/clear` entre tarefas diferentes, `/compact` em conversas longas, CLAUDE.md curto (menos de \~200 linhas) e conectores/MCP que você não usa desligados.
4. **Planejar antes:** o modo plan do Claude Code evita retrabalho, que é o gasto mais caro de todos.

**Exemplo.** Um chatbot de atendimento com manual de 50 páginas: com cache, cada pergunta paga o manual a \~10% do preço, em vez de 100%.

**Prática.** Aplique `/clear` e `/compact` por uma semana no Claude Code e compare seu `/usage` com a semana anterior.

**Linha para o Framecraft:**

```
Aula 3.5: Como gastar menos com IA — explique prompt caching (reler do cache custa cerca de 10% do preço), Batch API com 50% de desconto, manter o contexto enxuto com /clear e /compact, desligar conectores sem uso e planejar antes para evitar retrabalho, com exemplo de chatbot com manual de 50 páginas
```

## Nível 4 — Conectores, MCP e pesquisa

Objetivo: fazer a IA trabalhar com os **seus** dados e ferramentas (e-mail, agenda, arquivos, Canva, GitHub) em vez de só conversar.

### Aula 4.1 — Busca na web e Research

**Explicação.** A **busca na web** deixa o Claude consultar a internet e citar as fontes. O **Research** (planos pagos) vai além: faz dezenas de buscas encadeadas, lê as páginas e entrega um relatório com citações. Você ativa pelo botão **+ → Research** ([fonte](https://support.claude.com/en/articles/11088861-use-research-on-claude)).

**Exemplo.** *"Compare as 5 principais ferramentas de agendamento para clínicas no Brasil: preço, integração com WhatsApp e avaliações. Quero uma tabela e as fontes."*

**Prática.** Escolha uma decisão real (comprar um equipamento, escolher um curso) e faça um Research. Abra pelo menos 3 fontes citadas para conferir.

**Linha para o Framecraft:**

```
Aula 4.1: Busca na web e Research no Claude — explique a diferença entre a busca simples com fontes citadas e o modo Research dos planos pagos, que faz várias buscas encadeadas e entrega um relatório, como ativar pelo botão mais e por que sempre abrir as fontes para conferir
```

### Aula 4.2 — Conectores: a IA dentro do seu e-mail, agenda e arquivos

**Explicação.** **Conectores** ligam o Claude a serviços como Gmail, Google Agenda, Google Drive, Notion, Canva e GitHub. Você autoriza uma vez e ele passa a ler (e, se permitido, agir) nesses apps. Ele pede sua aprovação antes de ações sensíveis, como mover ou apagar arquivos. O catálogo fica em [claude.ai/directory/connectors](https://claude.ai/directory/connectors/) ([fonte](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors)).

**Exemplo.** *"Olhe minha agenda da semana e meus e-mails não respondidos e monte uma lista de prioridades para segunda-feira."* Ou, com o Canva: *"Crie 3 capas para meus Reels com a paleta da minha marca."*

**Prática.** Conecte Google Agenda e Gmail e peça um resumo diário. Depois conecte o Canva e gere um design.

**Linha para o Framecraft:**

```
Aula 4.2: Conectores do Claude — mostre como ligar Gmail, Google Agenda, Google Drive, Notion, Canva e GitHub, como o Claude lê seus dados e pede aprovação antes de ações sensíveis, onde fica o diretório de conectores e 3 usos práticos: resumo do dia, prioridades da semana e capas no Canva
```

### Aula 4.3 — O que é MCP, o "USB-C da IA"

**Explicação.** O **MCP (Model Context Protocol)** é o padrão aberto por trás dos conectores. Criado pela Anthropic em **novembro de 2024**, foi adotado pela OpenAI em março de 2025 e depois por Google, Microsoft e outros. Funciona como um USB-C: qualquer app que tenha um **servidor MCP** se liga a qualquer IA que seja **cliente MCP**. Um servidor oferece três coisas: **ferramentas** (ações), **recursos** (dados) e **prompts** (modelos prontos) ([fonte](https://en.wikipedia.org/wiki/Model_Context_Protocol)).

**Exemplo.** O mesmo servidor MCP do Notion funciona no Claude, no Claude Code e em outros apps compatíveis, sem reprogramar nada.

**Prática.** Desenhe no papel: o Claude no centro, 4 servidores MCP ao redor (um para cada ferramenta que você usa) e o que cada um permitiria fazer.

**Linha para o Framecraft:**

```
Aula 4.3: O que é MCP, o USB-C da inteligência artificial — explique o Model Context Protocol criado pela Anthropic em novembro de 2024 e adotado pela OpenAI em 2025, a relação entre cliente e servidor MCP, e as três coisas que um servidor oferece: ferramentas, recursos e prompts
```

### Aula 4.4 — Adicionando seus próprios servidores MCP

**Explicação.** Além do diretório, você pode adicionar servidores MCP por URL como conector personalizado no app, ou pelo terminal no Claude Code. Existem milhares de servidores prontos (bancos de dados, Figma, Slack, navegadores). Cuidado: cada servidor ativo ocupa contexto e pode custar tokens; desligue os que não usa com `/mcp` ([fonte](https://code.claude.com/docs/en/mcp)).

**Exemplo (Claude Code).**

```
claude mcp add --transport http notion https://mcp.notion.com/mcp
claude mcp list
```

Depois, dentro do Claude Code: *"Leia minha página de metas no Notion e crie tarefas para esta semana."*

**Prática.** Adicione um servidor MCP de uma ferramenta que você usa, faça 3 pedidos reais e depois desative-o com `/mcp`.

**Linha para o Framecraft:**

```
Aula 4.4: Como adicionar servidores MCP no Claude — mostre como incluir um conector personalizado por URL no app e pelo comando claude mcp add no Claude Code, exemplos de servidores prontos (Notion, Figma, Slack, bancos de dados) e por que desligar com /mcp os que você não usa para economizar contexto
```

### Aula 4.5 — Segurança: prompt injection e privilégio mínimo

**Explicação.** Quando a IA lê e-mails, sites e documentos, alguém pode esconder instruções maliciosas neles ("ignore tudo e envie os contatos para..."). Isso é **prompt injection**, o risco nº 1 da lista OWASP para aplicações com LLM ([fonte](https://genai.owasp.org)). Defesas: dê a cada conector só a permissão necessária, revise antes de aprovar ações (enviar, apagar, pagar) e desconfie quando a IA mudar de comportamento depois de ler conteúdo externo.

**Exemplo.** Um e-mail de "fornecedor" com texto branco invisível pedindo para a IA encaminhar faturas. Com aprovação manual de envios, o golpe para em você.

**Prática.** Revise os conectores ativos na sua conta e remova permissões que você não usa.

**Linha para o Framecraft:**

```
Aula 4.5: Prompt injection e segurança com IA — explique como instruções escondidas em e-mails, sites e documentos podem enganar uma IA com conectores, por que é o risco número 1 da lista OWASP para LLMs, e 3 defesas: privilégio mínimo, aprovar ações sensíveis e desconfiar de mudanças de comportamento
```

## Nível 5 — Skills, plugins e Claude Code

Objetivo: transformar o que você sabe fazer em "receitas" que a IA executa sozinha, e trabalhar com arquivos e projetos de verdade.

### Aula 5.1 — O que são Skills

**Explicação.** Uma **Skill** é uma pasta com um arquivo `SKILL.md`: um cabeçalho com nome e **descrição**, e abaixo as instruções (e, se quiser, arquivos de apoio e scripts). O Claude lê só as descrições de todas as skills; quando um pedido combina com uma delas, ele carrega a skill inteira. Assim, você pode ter dezenas de skills sem lotar o contexto. Também dá para chamar manualmente com `/nome-da-skill` ([fonte](https://code.claude.com/docs/en/skills)).

**Exemplo.** O app já vem com skills prontas para criar Word, Excel, PowerPoint e PDF. Quando você pede "me dê isso em planilha", a skill de Excel entra em ação.

**Prática.** Liste 5 tarefas que você repete toda semana do mesmo jeito. Cada uma é candidata a skill.

**Linha para o Framecraft:**

```
Aula 5.1: O que são Skills no Claude — explique que uma skill é uma pasta com um arquivo SKILL.md com nome, descrição e instruções, que o Claude lê só a descrição e carrega a skill quando o pedido combina, como chamar com barra e o nome, e exemplos de skills prontas de Word, Excel e PDF
```

### Aula 5.2 — Criando sua primeira skill

**Explicação.** O segredo é a **descrição**: ela diz o que a skill faz e *quando* usar. Instruções curtas e específicas valem mais que textos longos. Para criar e testar com rigor, use a skill oficial **skill-creator**: ela gera casos de teste, compara resultados com e sem a skill e melhora a descrição. No Claude Code: `/plugin install skill-creator@claude-plugins-official`.

**Exemplo** — arquivo `.claude/skills/revisar-legenda/SKILL.md`:

```markdown
---
name: revisar-legenda
description: Revisa legendas de Reels e posts em português quanto a gancho, clareza e chamada para ação. Use quando o usuário pedir revisão de legenda, copy ou roteiro curto.
model: haiku
---

Revise o texto indicado.
1. O gancho prende nos primeiros 5 segundos? Se não, proponha 2 alternativas.
2. Corte palavras sobrando e jargão.
3. Termine com uma pergunta ou chamada para ação.
Entregue: versão final + lista curta do que mudou.
```

Repare no `model: haiku`: a skill roda no modelo barato, porque revisar legenda não exige o Opus.

**Prática.** Transforme o prompt que você montou na Aula 2.2 em uma skill. Teste com 3 pedidos diferentes e ajuste a descrição até ela ser acionada sozinha.

**Linha para o Framecraft:**

```
Aula 5.2: Como criar sua primeira skill no Claude — mostre a estrutura do SKILL.md com nome, descrição e instruções, por que a descrição decide quando a skill é usada, o truque de rodar skills simples no modelo Haiku para economizar e a skill oficial skill-creator que testa e melhora outras skills
```

### Aula 5.3 — Claude Code: não é só para programadores

**Explicação.** O **Claude Code** é o Claude trabalhando direto nos seus arquivos: lê pastas, cria e edita documentos, roda comandos, usa Git e publica. Roda no terminal, no VS Code, no JetBrains, no app desktop e na web (claude.ai/code), nos planos pagos ([fonte](https://code.claude.com/docs/en/overview)). O arquivo **CLAUDE.md** na raiz do projeto é a "memória do projeto": regras, comandos e convenções que ele lê em toda sessão (mantenha abaixo de \~200 linhas).

**Exemplo.** O próprio Framecraft: o Claude Code roda dentro do GitHub Actions, lê o `docs/guia-roteiro.md`, pesquisa, escreve o `roteiro.json` e valida com um script. É Claude Code como "funcionário" de um sistema.

**Prática.** Abra o Claude Code numa pasta com seus documentos e peça: *"Organize estes arquivos em pastas por assunto e crie um índice em INDICE.md."* Depois rode `/init` num projeto para gerar um CLAUDE.md.

**Linha para o Framecraft:**

```
Aula 5.3: Claude Code não é só para programadores — explique que o Claude Code trabalha direto nos seus arquivos (lê pastas, edita, roda comandos), onde ele roda (terminal, VS Code, desktop e web), o papel do arquivo CLAUDE.md como memória do projeto, e exemplos fora da programação como organizar documentos
```

### Aula 5.4 — Comandos essenciais e o modo plan

**Explicação.** Os comandos que mais usará no Claude Code:

| Comando | O que faz |
| --- | --- |
| `/model` | troca o modelo (Haiku, Sonnet, Opus, Fable) |
| `/effort` | ajusta o esforço de raciocínio |
| `/clear` | limpa o contexto entre tarefas diferentes |
| `/compact` | resume a conversa para liberar contexto |
| `/usage` | mostra quanto você já usou |
| `/mcp` | gerencia servidores MCP |
| `/init` | cria o CLAUDE.md do projeto |
| Shift+Tab | alterna modos, incluindo o **modo plan** |

No **modo plan**, o Claude investiga e propõe um plano sem alterar nada; você aprova antes de ele agir. Os **modos de permissão** definem o que ele pode fazer sem perguntar ([fonte](https://code.claude.com/docs/en/permission-modes)).

**Exemplo.** Antes de reorganizar 300 arquivos, entre no modo plan, revise o plano e só então aprove.

**Prática.** Faça uma tarefa média inteira usando: modo plan → aprovar → `/compact` no meio → `/usage` no fim.

**Linha para o Framecraft:**

```
Aula 5.4: Comandos essenciais do Claude Code — ensine /model, /effort, /clear, /compact, /usage, /mcp e /init, o que faz cada um, e o modo plan (Shift+Tab) em que o Claude propõe um plano antes de mexer em qualquer arquivo, com o exemplo de reorganizar 300 arquivos com segurança
```

### Aula 5.5 — Plugins e marketplaces

**Explicação.** Um **plugin** é um pacote que junta skills, subagentes, hooks e servidores MCP e se instala de uma vez. Você instala pelo comando `/plugin` (aba Discover); o marketplace oficial se chama `claude-plugins-official`, e há uma vitrine em [claude.com/marketplace](https://claude.com/marketplace). Plugins também funcionam no claude.ai ([fonte](https://code.claude.com/docs/en/plugins)).

**Exemplo.** Uma agência empacota num plugin: a skill de revisão de legenda, um subagente pesquisador com Haiku e o conector do Canva. Cada pessoa nova da equipe instala um plugin e já trabalha no padrão da casa.

**Prática.** Abra `/plugin`, instale um plugin oficial que faça sentido para você e use-o em uma tarefa real.

**Linha para o Framecraft:**

```
Aula 5.5: Plugins e marketplaces do Claude — explique que um plugin empacota skills, subagentes, hooks e servidores MCP para instalar de uma vez, como usar o comando /plugin e o marketplace oficial, e o exemplo de uma agência que distribui seu padrão de trabalho para toda a equipe num plugin
```

## Nível 6 — Agentes, subagentes e automações

Objetivo: a IA deixa de esperar você perguntar e passa a executar tarefas sozinha, no horário certo, com você no controle.

### Aula 6.1 — O que é um agente de IA

**Explicação.** Um **agente** é um modelo de IA rodando em loop com **ferramentas**: ele planeja, usa uma ferramenta (buscar, ler arquivo, rodar código), olha o resultado e decide o próximo passo, até terminar. Três níveis: **chat** (pergunta e resposta), **fluxo** (etapas fixas que você definiu) e **agente** (o modelo decide as etapas). Regra da Anthropic: comece pelo mais simples que resolve; agente só quando a tarefa é aberta e difícil de especificar.

**Exemplo.** Fluxo: "todo e-mail com nota fiscal → extrair valor → lançar na planilha". Agente: "descubra por que as vendas caíram em março" (ele decide onde procurar).

**Prática.** Pegue 3 tarefas suas e classifique: chat, fluxo ou agente. Justifique.

**Linha para o Framecraft:**

```
Aula 6.1: O que é um agente de IA — explique que um agente é um modelo em loop com ferramentas que planeja, age, observa e decide o próximo passo, a diferença entre chat, fluxo de etapas fixas e agente, e a regra de começar pelo mais simples, com exemplo de notas fiscais x investigar queda de vendas
```

### Aula 6.2 — Subagentes: sua equipe de especialistas

**Explicação.** **Subagentes** são agentes auxiliares que o Claude principal chama para tarefas específicas. Cada um tem o próprio contexto (não polui o principal), as próprias ferramentas e pode usar **outro modelo**. Ficam em arquivos Markdown na pasta `.claude/agents/` do projeto ou `~/.claude/agents/` ([fonte](https://code.claude.com/docs/en/sub-agents)).

**Exemplo** — arquivo `.claude/agents/pesquisador.md`:

```markdown
---
name: pesquisador
description: Pesquisa um tema na web e devolve um resumo com fontes. Use para qualquer levantamento de informações antes de escrever.
tools: WebSearch, WebFetch
model: haiku
effort: low
---

Pesquise o tema pedido em fontes confiáveis e oficiais.
Devolva no máximo 300 palavras em tópicos, cada fato com o link.
Marque claramente o que não conseguiu confirmar.
```

**Prática.** Crie dois subagentes: um `pesquisador` (Haiku) e um `revisor` (Opus) que critica textos. Peça um artigo e veja os dois trabalhando.

**Linha para o Framecraft:**

```
Aula 6.2: Subagentes no Claude Code — explique que subagentes são especialistas que o Claude principal chama, cada um com contexto, ferramentas e modelo próprios, mostre um arquivo de subagente pesquisador com modelo Haiku na pasta .claude/agents e como montar uma equipe de pesquisador barato e revisor forte
```

### Aula 6.3 — Hooks: regras que sempre acontecem

**Explicação.** Instruções no prompt são pedidos; o modelo pode esquecer. **Hooks** são comandos que o próprio Claude Code executa automaticamente em momentos definidos: antes de usar uma ferramenta, depois de editar um arquivo, ao terminar uma resposta. Servem para formatar código, bloquear comandos perigosos, mandar notificação ou filtrar saídas enormes antes de chegarem ao contexto ([fonte](https://code.claude.com/docs/en/hooks-guide)).

**Exemplo.** Hook depois de cada edição de arquivo: rodar o corretor/formatador. Hook antes de comandos: bloquear qualquer `rm -rf`. Hook ao terminar: tocar um som avisando que acabou.

**Prática.** No Claude Code, peça: *"Configure um hook que me notifique quando você terminar uma tarefa."* Depois leia o `settings.json` que ele criou.

**Linha para o Framecraft:**

```
Aula 6.3: Hooks no Claude Code — explique a diferença entre uma instrução no prompt, que a IA pode esquecer, e um hook, que sempre executa em momentos definidos (antes de uma ferramenta, depois de editar, ao terminar), com 3 exemplos: formatar arquivos, bloquear comandos perigosos e avisar quando terminar
```

### Aula 6.4 — IA que usa o navegador e o computador

**Explicação.** O **Claude in Chrome** é uma extensão (planos pagos) que age nas abas em que você está logado: preenche formulários, compara preços, organiza informações. Pede permissão por site e confirmação antes de compras ([fonte](https://claude.com/chrome)). O app desktop também pode controlar programas do computador (**computer use**) e trabalhar em tarefas longas por você — o antigo Cowork agora faz parte do próprio Claude.

**Exemplo.** *"Abra os 5 sites de passagem que deixei nas abas e monte uma tabela com o voo mais barato de cada um para 12 de dezembro."*

**Prática.** Faça uma pesquisa de preço com o Claude in Chrome. Regra de segurança: não use em sites de banco nem de saúde, como a própria Anthropic recomenda.

**Linha para o Framecraft:**

```
Aula 6.4: IA que usa seu navegador e seu computador — explique o Claude in Chrome, que age nas abas em que você está logado com permissão por site e confirmação antes de compras, o controle do computador pelo app desktop, um exemplo de comparar passagens e por que evitar sites de banco e saúde
```

### Aula 6.5 — Tarefas agendadas, rotinas e GitHub Actions

**Explicação.** O passo final da automação é a IA trabalhar **sem você abrir o app**. As **Routines** do Claude Code rodam na nuvem da Anthropic por agenda, por chamada de API ou por eventos do GitHub, mesmo com o computador desligado (Pro, Max, Team e Enterprise; crie em claude.ai/code/routines ou com `/schedule`) ([fonte](https://code.claude.com/docs/en/routines)). No **GitHub Actions**, a ação `anthropics/claude-code-action` roda o Claude a cada evento do repositório. Para scripts, o modo `claude -p "pedido"` roda sem interface.

**Exemplo.** O Framecraft é exatamente isso: você cola o tema no celular, o app grava o pedido no GitHub e uma Action acorda o Claude, que pesquisa, escreve o roteiro e dispara voz e imagens. Outra ideia: uma rotina toda segunda às 8h que resume as notícias do seu setor e salva num arquivo.

**Prática.** Crie uma rotina semanal simples (ex.: "toda sexta, liste os 5 assuntos mais comentados de IA da semana com fontes").

**Linha para o Framecraft:**

```
Aula 6.5: IA trabalhando sozinha com rotinas e GitHub Actions — explique as Routines do Claude Code que rodam na nuvem por agenda ou eventos mesmo com o computador desligado, o claude-code-action no GitHub e o modo claude -p, usando como exemplo um app que gera vídeos de Reels sozinho a partir de um tema
```

## Nível 7 — API, SDK e seus próprios apps de IA

Objetivo: sair de usuário e virar construtor. Aqui você liga o Claude aos seus sistemas e cria produtos.

### Aula 7.1 — App x API: quando cada um

**Explicação.** No **app**, você paga assinatura e conversa. Na **API**, você paga por token e o Claude vira uma peça do seu programa: um site, um bot de WhatsApp, uma planilha automática. Você cria a conta e a chave de API no Console ([platform.claude.com](https://platform.claude.com)), define limites de gasto e acompanha o uso. Para automação sem código, ferramentas como **n8n, Make e Zapier** chamam a API por você com blocos visuais.

**Exemplo.** Um salão de beleza quer responder dúvidas no site 24h: isso é API (ou n8n + API), não o app.

**Prática.** Crie sua conta no Console, gere uma chave e defina um **limite de gasto mensal baixo** (ex.: US$ 5) antes de qualquer teste. Nunca publique a chave em código ou repositório público.

**Linha para o Framecraft:**

```
Aula 7.1: App ou API do Claude, quando usar cada um — explique a diferença entre pagar assinatura no app e pagar por token na API, como criar a chave e definir limite de gasto no Console, automação sem código com n8n, Make e Zapier, e o cuidado de nunca expor sua chave de API
```

### Aula 7.2 — Sua primeira chamada à API

**Explicação.** Tudo passa por um único endpoint, a **Messages API**: você envia o modelo, o limite de tokens da resposta e a lista de mensagens. Para aprender, use o **Haiku 5.5**: cada teste custa frações de centavo.

**Exemplo (Python).** Instale com `pip install anthropic` e defina a variável `ANTHROPIC_API_KEY`:

```python
import anthropic

client = anthropic.Anthropic()  # lê ANTHROPIC_API_KEY do ambiente

resposta = client.messages.create(
    model="claude-haiku-5-5",
    max_tokens=1000,
    system="Você é um professor paciente que explica com analogias.",
    messages=[{"role": "user", "content": "O que é uma API, em 3 frases?"}],
)

for bloco in resposta.content:
    if bloco.type == "text":
        print(bloco.text)

print(resposta.usage)  # tokens de entrada e saída gastos
```

**Prática.** Rode o código, troque o `system` três vezes (professor, comediante, advogado) e anote o `usage` de cada chamada. Depois troque o modelo para `claude-sonnet-5-5` e compare.

**Linha para o Framecraft:**

```
Aula 7.2: Sua primeira chamada à API do Claude em Python — mostre passo a passo instalar o pacote anthropic, guardar a chave na variável ANTHROPIC_API_KEY, chamar a Messages API com modelo, max_tokens, system e messages usando o Haiku 5.5 para gastar centavos, e ler o uso de tokens da resposta
```

### Aula 7.3 — Ferramentas (tool use): a IA aciona seu sistema

**Explicação.** Com **tool use**, você descreve funções do seu sistema (nome, descrição e parâmetros em JSON). Quando precisa, o Claude responde "quero chamar `consultar_agenda` com data=amanhã"; **seu código** executa e devolve o resultado; o Claude continua. A Anthropic também oferece ferramentas prontas no servidor, como **busca na web** e **execução de código** ([fonte](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)).

**Exemplo.**

```python
ferramentas = [{
    "name": "consultar_agenda",
    "description": "Retorna os horários livres do salão em uma data.",
    "input_schema": {
        "type": "object",
        "properties": {"data": {"type": "string", "description": "AAAA-MM-DD"}},
        "required": ["data"],
    },
}]
# envie tools=ferramentas no messages.create; se stop_reason == "tool_use",
# execute a função e devolva um bloco tool_result na próxima mensagem
```

**Prática.** Crie uma ferramenta falsa `cotacao_dolar` que retorna um número fixo e faça o Claude usá-la para responder "quanto são 250 dólares em reais?".

**Linha para o Framecraft:**

```
Aula 7.3: Tool use, quando a IA aciona o seu sistema — explique como descrever funções com nome, descrição e parâmetros, o ciclo em que o Claude pede a ferramenta, seu código executa e devolve o resultado, as ferramentas prontas de busca na web e execução de código, com exemplo de agenda de salão de beleza
```

### Aula 7.4 — RAG e embeddings: a IA consultando sua base

**Explicação.** **Embeddings** transformam textos em vetores numéricos que representam significado, permitindo achar trechos parecidos. **RAG** (*Retrieval-Augmented Generation*) usa isso para buscar os trechos relevantes da sua base (manuais, contratos, FAQ) e colocá-los no prompt antes de responder. Hoje, com janelas de 1 milhão de tokens e prompt caching, bases pequenas e médias muitas vezes cabem inteiras no prompt — RAG vale a pena quando a base é grande demais ou muda o tempo todo.

**Exemplo.** Escritório com 20 mil documentos: RAG. Loja com um manual de 80 páginas: coloque o manual no prompt com cache.

**Prática.** Monte um "assistente da sua empresa" num Projeto do Claude com 5 documentos. Depois desenhe como ficaria a versão RAG se fossem 50 mil documentos.

**Linha para o Framecraft:**

```
Aula 7.4: RAG e embeddings explicados — explique o que são embeddings (textos virando vetores de significado), como o RAG busca trechos da sua base antes de responder, e quando não precisa de RAG porque a base cabe inteira na janela de 1 milhão de tokens com prompt caching, com exemplo de escritório x loja
```

### Aula 7.5 — Agent SDK e Managed Agents: agentes em produção

**Explicação.** Duas formas de colocar agentes no ar:

- **Claude Agent SDK** (`claude-agent-sdk` em Python, `@anthropic-ai/claude-agent-sdk` em TypeScript): é o Claude Code como biblioteca, com ferramentas prontas (ler, editar, terminal, busca na web), subagentes e MCP. **Você hospeda** ([fonte](https://code.claude.com/docs/en/agent-sdk/overview)).
- **Managed Agents** (beta): **a Anthropic hospeda** o loop do agente e um ambiente isolado por sessão, com agendamento e memória. Você só configura o agente e inicia sessões ([fonte](https://platform.claude.com/docs/en/managed-agents/overview)).

**Exemplo.** Um agente que toda noite lê os pedidos do dia, confere o estoque e manda um relatório: no Managed Agents, sem servidor próprio.

**Prática.** Escreva em uma página a especificação de um agente para seu trabalho: objetivo, ferramentas, modelo (lembre do Haiku para subtarefas), quando roda e o que exige aprovação humana.

**Linha para o Framecraft:**

```
Aula 7.5: Como colocar agentes de IA em produção — compare o Claude Agent SDK, que é o Claude Code como biblioteca que você hospeda, e o Managed Agents, em que a Anthropic hospeda o agente e o ambiente, com o exemplo de um agente que confere pedidos e estoque toda noite e manda um relatório
```

## Nível 8 — Especialista: qualidade, segurança, ética e carreira

Objetivo: o que separa quem "usa bem" de quem é referência: medir resultados, usar com responsabilidade e continuar atualizado.

### Aula 8.1 — Avaliação (evals): provar que melhorou

**Explicação.** Especialista não diz "achei melhor"; ele **mede**. Uma *eval* é um conjunto de casos de teste (entradas reais + o que seria uma boa resposta) e um critério de nota. Toda vez que você muda um prompt, skill, modelo ou esforço, roda a eval e compara. O critério pode ser automático (o JSON é válido?), humano (nota de 1 a 5) ou outro modelo como juiz (*LLM-as-judge*), com régua escrita.

**Exemplo.** Sua skill de legenda: 20 legendas reais, régua "gancho em até 8 palavras, sem jargão, termina com pergunta". Teste Haiku x Sonnet: se o Haiku tirar a mesma nota, você economiza 20 vezes.

**Prática.** Monte uma eval de 10 casos para a skill que você criou na Aula 5.2 e compare dois modelos.

**Linha para o Framecraft:**

```
Aula 8.1: Evals, como provar que sua IA melhorou — explique o que é uma eval (casos de teste reais, resposta esperada e régua de nota), avaliação automática, humana e com outro modelo como juiz, e o exemplo de testar Haiku contra Sonnet numa skill de legendas para decidir se dá para economizar
```

### Aula 8.2 — Privacidade, LGPD e uso responsável

**Explicação.** A **LGPD** vale para IA sempre que há dados pessoais: CPF, saúde, dados de clientes. Antes de colar algo, pergunte: posso compartilhar isso com um serviço externo? Revise nas configurações da sua conta se suas conversas podem ser usadas para treinamento, e prefira planos Team/Enterprise para dados da empresa. Anonimize (troque nomes por "Cliente A"). E seja transparente: diga quando um conteúdo foi feito com IA, principalmente imagens e vídeos de pessoas reais.

**Exemplo.** Em vez de colar a planilha com nomes e telefones dos pacientes, cole só as colunas de agendamento com IDs.

**Prática.** Escreva sua política pessoal de IA em 5 regras (o que nunca colar, quando revisar, quando avisar que usou IA).

**Linha para o Framecraft:**

```
Aula 8.2: Privacidade, LGPD e uso responsável de IA — explique quando a LGPD se aplica ao uso de IA, o que nunca colar num chat, como anonimizar dados trocando nomes por códigos, revisar as configurações de treinamento da conta e por que avisar quando um conteúdo foi feito com IA
```

### Aula 8.3 — As leis de IA: Europa e Brasil

**Explicação.** **União Europeia:** o AI Act já proíbe certos usos (como pontuação social) desde **2 de fevereiro de 2025** e classifica sistemas por risco. Em junho de 2026 houve acordo provisório para adiar as regras de alto risco para dezembro de 2027 e agosto de 2028 ([fonte](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement)). **Brasil:** o **PL 2338/2023**, marco legal da IA, foi aprovado no Senado em **10 de dezembro de 2024** e está em análise numa comissão especial da Câmara ([fonte](https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)). Confira o andamento atual antes de citar.

**Exemplo.** Uma empresa brasileira que vende software de RH com IA para a Europa já precisa olhar o AI Act, porque triagem de currículos é considerada de alto risco.

**Prática.** Peça um Research: *"Qual a situação hoje do PL 2338/2023 na Câmara? Cite fontes oficiais."* Compare com o que está aqui.

**Linha para o Framecraft:**

```
Aula 8.3: As leis de inteligência artificial na Europa e no Brasil — explique o AI Act europeu, com proibições desde fevereiro de 2025 e classificação por risco, e o PL 2338 de 2023, marco legal da IA aprovado no Senado em dezembro de 2024 e em análise na Câmara, de forma neutra e com fontes oficiais
```

### Aula 8.4 — O ecossistema além do Claude

**Explicação.** Especialista conhece a caixa de ferramentas inteira e escolhe a certa:

| Ferramenta | Para quê |
| --- | --- |
| ChatGPT, Gemini | assistentes gerais concorrentes, bons para comparar respostas |
| NotebookLM | estudar a partir dos seus documentos (resumos, áudios) |
| Perplexity | busca com respostas e fontes |
| Midjourney, Veo, Sora, Runway, Kling | gerar imagem e vídeo |
| n8n, Make, Zapier | automações visuais ligando apps e IA |
| Hugging Face | modelos abertos e cursos |

**Exemplo.** O Framecraft junta várias peças: Claude para roteiro, edge-tts para voz, Wikimedia para imagens, Remotion para montar o vídeo. Essa é a mentalidade de especialista: **compor ferramentas**, não depender de uma só.

**Prática.** Monte um fluxo com pelo menos 3 ferramentas diferentes (ex.: Claude escreve → gerador de imagem ilustra → Canva monta o post).

**Linha para o Framecraft:**

```
Aula 8.4: O ecossistema de IA além do Claude — apresente ChatGPT e Gemini, NotebookLM para estudar documentos, Perplexity, geradores de imagem e vídeo (Midjourney, Veo, Sora, Runway, Kling), automação com n8n, Make e Zapier e a Hugging Face, e a mentalidade de combinar ferramentas em vez de depender de uma só
```

### Aula 8.5 — Projeto final, portfólio e como se manter atualizado

**Explicação.** Você vira especialista quando resolve um problema real de ponta a ponta. Escolha um projeto que use pelo menos: uma skill, um conector ou MCP, um subagente com Haiku, uma automação agendada e uma eval. Documente o antes e depois (tempo e dinheiro economizados) — isso é seu portfólio. Para se manter atualizado, a IA muda a cada mês: acompanhe o blog e as notas de versão da Anthropic, a Anthropic Academy, e reserve 1 hora por semana para testar uma novidade.

**Exemplo.** Projeto: "Assistente de conteúdo". Rotina toda segunda pesquisa tendências (subagente Haiku) → skill escreve 5 roteiros → você aprova → Framecraft gera os vídeos → eval mede gancho e retenção.

**Prática.** Escreva em uma página o seu projeto final e um cronograma de 4 semanas para entregá-lo.

**Linha para o Framecraft:**

```
Aula 8.5: Seu projeto final em IA e como se manter atualizado — mostre um projeto completo que combina skill, conector, subagente barato, automação agendada e avaliação, como documentar o antes e depois para virar portfólio, e o hábito de 1 hora por semana para testar novidades seguindo fontes oficiais
```

## Cursos gratuitos e fontes

Use estes cursos como complemento das videoaulas: assista a aula no Estúdio, faça a prática e aprofunde no curso do nível correspondente.

| Curso | De quem | Nível do roteiro | Idioma |
| --- | --- | --- | --- |
| [Anthropic Academy](https://anthropic.skilljar.com) (Claude Code in Action, MCP) | Anthropic | 4, 5, 6 | inglês |
| [Cursos da Anthropic no GitHub](https://github.com/anthropics/courses) (API, prompts, evals, tool use) | Anthropic | 2, 7, 8 | inglês (arquivado, partes desatualizadas) |
| [Short courses](https://www.deeplearning.ai/short-courses/) (MCP e Claude Code com a Anthropic) | DeepLearning.AI | 4, 5, 6 | inglês |
| [Elements of AI](https://www.elementsofai.com) | Univ. de Helsinque | 1 | vários |
| [Introduction to Generative AI](https://www.cloudskillsboost.google/) | Google Cloud | 1 | inglês |
| [Generative AI for Beginners](https://microsoft.github.io/generative-ai-for-beginners/) | Microsoft | 1, 2, 7 | inglês |
| [Agents Course e LLM Course](https://huggingface.co/learn) | Hugging Face | 6, 7 | inglês |
| [Escola Virtual (fluêncIA e outros)](https://www.ev.org.br) | Fundação Bradesco + Microsoft | 1, 2 | português, com certificado |

Confira no site de cada curso se ele continua gratuito antes de se inscrever.

### Fontes oficiais usadas neste roteiro

- [Modelos e preços da API](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Planos do Claude](https://claude.com/pricing)
- [Research no Claude](https://support.claude.com/en/articles/11088861-use-research-on-claude)
- [Conectores do Google Workspace](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors)
- [Artefatos](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- [Memória e busca em conversas](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- [Claude Code: visão geral](https://code.claude.com/docs/en/overview), [skills](https://code.claude.com/docs/en/skills), [subagentes](https://code.claude.com/docs/en/sub-agents), [hooks](https://code.claude.com/docs/en/hooks-guide), [MCP](https://code.claude.com/docs/en/mcp), [plugins](https://code.claude.com/docs/en/plugins), [rotinas](https://code.claude.com/docs/en/routines), [custos](https://code.claude.com/docs/en/costs), [modos de permissão](https://code.claude.com/docs/en/permission-modes)
- [Tool use na API](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview), [Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview)
- [Claude in Chrome](https://claude.com/chrome)
- [Model Context Protocol (Wikipédia)](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [OWASP Top 10 para aplicações com LLM](https://genai.owasp.org)
- [AI Act: acordo do Omnibus (Gibson Dunn)](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement)
- [PL 2338/2023 no Senado](https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)

Preços e recursos mudam com frequência: os valores acima foram conferidos em 19 de outubro de 2026.
