# Guia das sugestões da IA (Modo 2 — vídeo bruto)

Lido pelo Claude na Action `processar-bruto.yml`. Você recebe a transcrição de um vídeo falado
(`out/transcricao.txt`) e o estilo escolhido, e devolve `out/sugestoes.json` para deixar o vídeo com
cara de Reels/TikTok viral. Tudo o que você sugerir é aplicado e o usuário pode desligar no app.

## A transcrição

Cada palavra vem com seu número entre colchetes e o tempo da linha: `0:12.4  [57]agora [58]presta [59]atenção`.
Você sempre se refere às palavras **pelo número** (índice). Linhas novas marcam pausas na fala.

## Princípios de edição profissional (siga sempre)

Reunidos de guias de retenção para vídeos curtos e de pesquisas sobre edição (Edit3K, AutoTransition, VEU-Bench).
Os números são referências; o critério final é manter a pessoa assistindo sem cansar.

1. **Gancho nos primeiros 1–3 s.** O vídeo precisa começar com a frase mais forte (ou uma pergunta/contraste).
   Nada de "oi gente, tudo bem", apresentação ou contexto antes do gancho; isso vira corte.
2. **Quebra de padrão a cada ~3–5 s** (impacto/cortes rápidos: ~2–3 s; podcast: ~6 s; documentário: livre).
   Quebra = zoom, corte de enquadramento, título, emoji, som ou mudança de assunto. O sistema já preenche
   buracos com cortes de enquadramento; você escolhe as quebras que **mudam a atenção** (uma pergunta, um
   número, uma virada), não só "mais um corte".
3. **Corte por intenção, não só por silêncio.** Pausas entre frases ficam abaixo de ~0,5 s, exceto quando a
   pausa é o efeito (antes de uma revelação/piada). Silêncio maior que ~1,5 s parece que o vídeo travou.
4. **Ênfase com moderação.** Zoom e cor nas palavras que carregam a ideia; se tudo é destaque, nada é.
   Emojis só quando reforçam o sentido (3–6 por minuto).
5. **Som acompanha a imagem.** Zooms, títulos e emojis já ganham som baixinho automaticamente; não peça
   sons extras em cima deles. A voz já sai tratada (ruído, compressão e volume padrão de redes, -14 LUFS).
6. **Final que fecha o assunto** e puxa interação (pergunta/enquete). Corte despedidas longas.
7. **Respeite o estilo**: `podcast` e `documentario` preservam o raciocínio (corte pouco, ritmo calmo);
   `impacto` e `cortes-rapidos` cortam tudo que não for essencial.

## O que sugerir

- **`gancho`** — o trecho mais forte do vídeo (frase completa, 2 a 6 s, de preferência do meio ou do
  fim) para tocar **antes** do começo, prendendo a atenção nos primeiros segundos; mais um `texto`
  curto e chamativo para a tela (até 6 palavras, sem clickbait mentiroso). Use `null` se o começo do
  vídeo já é um bom gancho.
- **`cortes`** — o que tirar além das pausas: vícios ("é…", "tipo", "né", "então assim"), frases
  repetidas, começos em falso, erros corrigidos na hora e enrolação que não acrescenta nada. Cada corte
  é um intervalo de palavras `de`–`ate` (inclusive). **Nunca** corte no meio de uma ideia que faça a
  frase perder o sentido. Na dúvida, não corte.
- **`destaques`** — índices das palavras-chave que merecem cor (números, nomes, a palavra que carrega
  a ideia). No máximo ~1 a cada 4 palavras.
- **`zooms`** — momentos de ênfase para aproximar o rosto (`de`–`ate`, 0,5 a 2 s). ~1 a cada 4–8 s.
- **`emojis`** — poucos e certeiros (3 a 6 por minuto), na palavra `em`.
- **`titulos`** — títulos na tela quando ajudam a acompanhar:
  - *Tutorial:* "PASSO 1", "PASSO 2"… no início de cada passo (`de` = 1ª palavra do passo, `ate` = ~2 s depois).
  - *Corte de podcast:* o assunto do trecho no topo durante o vídeo todo (ex.: "POR QUE O CAFÉ VICIA").
  - *Notícia:* uma chamada no começo ("URGENTE: …", "ENTENDA").
  - Outros estilos: só se ajudar muito.
- **`enquete`** — uma pergunta para o público comentar no fim, com 2 opções curtas.
- **`titulo`** — título curto do projeto (até 60 letras).

Estilos: `impacto` (energia alta, muitos destaques e zooms), `cortes-rapidos` (corte agressivo de
tudo que não for essencial), `podcast` (preserve o raciocínio; corte pouco), `documentario` (ritmo
calmo; quase nenhum zoom/emoji), `noticia` (sóbrio e direto), `tutorial` (clareza; passos numerados).

## Formato de `out/sugestoes.json`

```json
{
  "titulo": "3 erros que fazem você perder dinheiro",
  "gancho": { "de": 120, "ate": 131, "texto": "ISSO ME CUSTOU 10 MIL" },
  "cortes": [{ "de": 14, "ate": 19, "motivo": "repetição" }],
  "destaques": [3, 9, 27, 40],
  "zooms": [{ "de": 26, "ate": 28 }],
  "emojis": [{ "em": 40, "emoji": "💸" }],
  "titulos": [{ "texto": "PASSO 1", "de": 30, "ate": 34 }],
  "enquete": { "pergunta": "Você já caiu nesse erro?", "opcoes": ["Já", "Nunca"] }
}
```

Confira com `python3 scripts/aplicar_sugestoes.py --validar out/sugestoes.json out/projeto.json` e corrija
até aparecer "✅".
