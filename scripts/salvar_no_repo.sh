#!/usr/bin/env bash
# Salva o resultado de uma Action no repositório sem atropelar o que o app salvou no meio do caminho:
# pega a versão mais nova do ramo, reaplica o resultado e tenta de novo se alguém empurrou antes.
# Uso: scripts/salvar_no_repo.sh "<mensagem>" <comando que altera os arquivos...>
set -euo pipefail
MSG="$1"; shift
RAMO="${GITHUB_REF_NAME:-main}"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
# Guarda os arquivos novos (áudio, imagens…): depois do 1º commit eles passam a ser "rastreados" e o
# reset --hard de uma nova tentativa os apagaria — o projeto ficava pronto, mas sem voz e sem imagens.
COPIA="$(mktemp -d)"
git ls-files --others --exclude-standard -z projetos | xargs -0 -r cp --parents -t "$COPIA"
for tentativa in 1 2 3 4 5; do
  git fetch -q origin "$RAMO"
  git reset -q --hard "origin/$RAMO"
  cp -a "$COPIA"/. .   # devolve os arquivos novos
  "$@"
  git add -A projetos
  if git diff --cached --quiet; then echo "Nada para salvar"; exit 0; fi
  git commit -q -m "$MSG"
  if git push -q origin "HEAD:$RAMO"; then echo "✓ salvo ($tentativa)"; exit 0; fi
  echo "push recusado; tentando de novo…"; sleep $((tentativa * 3))
done
echo "::error::Não consegui salvar no repositório"; exit 1
