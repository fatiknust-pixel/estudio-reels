# Estúdio Reels: vídeo de divulgação (16:9 e 9:16)

Vídeo de apresentação do Estúdio Reels para portfólio (LinkedIn), feito com [Remotion](https://github.com/remotion-dev/remotion),
no mesmo estilo dos vídeos que o próprio app produz. Tem cerca de 50 segundos, em 16:9 (1920×1080) e 9:16 (1080×1920),
com narração, legenda, trilha e efeitos sonoros. Cada cena reorganiza o layout conforme o formato.

## Roteiro

| Cena | O que mostra |
|---|---|
| `abertura` | Linha do tempo de editor lotando de clipes e um relógio disparado: "leva horas". |
| `tarefas` | Roteiro, narração, legendas, cortes e efeitos caindo na tela. |
| `revelacao` | O ícone do app se monta e o nome Estúdio Reels entra. |
| `ia` | Modo 1: o tema é digitado, a IA passa pelas etapas e o vídeo real gerado pelo app toca no celular. |
| `bruto` | Modo 2: legenda de impacto palavra por palavra, cortes nas pausas (onda sonora) e zoom. |
| `editor` | As abas do editor com a prévia tocando e a exportação em MP4 1080×1920. |
| `tecnologia` | Arquitetura: app → GitHub Actions → Claude, Whisper, voz neural e Remotion → MP4. |
| `autor` | Créditos do autor, com um trecho real do código do app. |
| `final` | "Estúdio Reels. Da ideia ao vídeo, em minutos." e o endereço do app. |

O texto falado e o nome do autor ficam em `conteudo/roteiro.json`.

## De onde vêm as imagens

- **Telas:** capturadas do app real (`scripts/capturar_telas.mjs`, com `npm run dev` rodando na raiz). O GitHub é
  simulado com os arquivos deste repositório, então não precisa de token. Só entram projetos do Modo 1.
- **Vídeo dentro do celular:** trecho de 24 s do projeto `ia-20261016-9ah6` renderizado pelo próprio app
  (`public/real/plano-real.mp4`).
- **Trilha e efeitos:** sintetizados em `scripts/gerar_sons.py`, sem direitos autorais.

## Como gerar

Pelo GitHub: **Actions → Vídeo de divulgação → Run workflow**. Os dois MP4 ficam em *Artifacts*.

No computador:

```bash
cd divulgacao
npm install
pip install edge-tts numpy scipy
npm run audio     # narração e linha do tempo
npm run sons      # trilha no ritmo da narração
npm run studio    # prévia
npm run render    # out/estudio-reels-16x9.mp4 e out/estudio-reels-9x16.mp4
```
