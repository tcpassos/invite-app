#!/usr/bin/env bash
#
# Publica o conteudo de docs/ na Wiki do projeto no Azure DevOps.
#
# O GitHub e a fonte da verdade. Este script clona o repositorio git da Wiki,
# substitui o conteudo pelo que esta em docs/ e envia. Rodar sempre que a
# documentacao mudar, tipicamente no fim de cada sprint.
#
# Uso:
#   bash tools/sync-wiki.sh            # mostra o que mudou e pede confirmacao
#   bash tools/sync-wiki.sh --yes      # envia sem perguntar
#   bash tools/sync-wiki.sh --force    # sobrescreve edicoes feitas direto na Wiki
#
# O sync e de mao unica, do GitHub para a Wiki. Se alguem editar pela interface
# da Wiki, o proximo sync apagaria esse trabalho, entao o script para e avisa.
# Nesse caso, traga as mudancas para docs/ antes de rodar de novo.
#
set -euo pipefail

AUTO_YES=0
FORCE=0
for arg in "$@"; do
  case "$arg" in
    --yes)   AUTO_YES=1 ;;
    --force) FORCE=1 ;;
    *) echo "opcao desconhecida: $arg (use --yes ou --force)" >&2; exit 2 ;;
  esac
done

WIKI_URL="https://dev.azure.com/GUITOEBE/invite-people/_git/invite-people.wiki"

# Paginas criadas direto pela interface da Wiki que o sync nao deve apagar.
# Vazio hoje. O Team Charter que veio do modelo do professor foi apagado da Wiki
# em 30/08/2026, entao a nossa pagina Team Charter e a unica que existe.
KEEP=()

# Arquivos e pastas de docs/ que ficam so no GitHub e nao viram pagina da Wiki.
# "Comecando" esta de fora porque as paginas ainda sao marcadores da fase de
# implementacao. Quando tiverem conteudo, na Sprint 2, remover as duas linhas
# e recolocar "Comecando" no docs/.order.
EXCLUDE=(
  "README.md"
  "Começando"
  "Começando.md"
)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS="$REPO_ROOT/docs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [ ! -d "$DOCS" ]; then
  echo "erro: pasta docs/ nao encontrada em $REPO_ROOT" >&2
  exit 1
fi

echo "Clonando a Wiki..."
# autocrlf desligado para o conteudo ir como LF, igual ao que esta no GitHub.
git -c core.autocrlf=false clone --quiet "$WIKI_URL" "$WORK/wiki"
WIKI="$WORK/wiki"
git -C "$WIKI" config core.autocrlf false

# Limpa o conteudo anterior, preservando o .git, o .gitignore e a lista KEEP.
# Guarda contra sobrescrever quem editou a Wiki pela interface. Todo commit que
# este script cria comeca com "Sincroniza docs/", entao qualquer commit acima do
# ultimo desses veio de fora e ainda nao esta em docs/.
EXTERNOS="$(git -C "$WIKI" log --format='  %h  %an  %s' -n 100 \
  | awk '/Sincroniza docs\// { exit } { print }')"
if [ -n "$EXTERNOS" ] && [ "$FORCE" != "1" ]; then
  echo >&2
  echo "PARADO. A Wiki tem edicoes feitas direto na interface desde o ultimo sync:" >&2
  echo >&2
  echo "$EXTERNOS" >&2
  echo >&2
  echo "Continuar apagaria esse trabalho. Traga as mudancas para docs/ primeiro." >&2
  echo "Para ver o que mudou:" >&2
  echo "  git clone $WIKI_URL wiki-tmp && cd wiki-tmp && git log -p" >&2
  echo >&2
  echo "Se tiver certeza de que da para descartar, rode com --force." >&2
  exit 1
fi

echo "Limpando o conteudo anterior..."
find "$WIKI" -mindepth 1 -maxdepth 1 \
  ! -name ".git" \
  ! -name ".gitignore" \
  -exec rm -rf {} +

for page in "${KEEP[@]}"; do
  git -C "$WIKI" checkout --quiet HEAD -- "$page" 2>/dev/null \
    || echo "aviso: pagina preservada '$page' nao existe mais na Wiki"
done

# Copia docs/ para a raiz da Wiki, aplicando as exclusoes.
echo "Copiando docs/..."
copy_args=(-a)
for name in "${EXCLUDE[@]}"; do
  copy_args+=(--exclude="$name")
done
if command -v rsync >/dev/null 2>&1; then
  rsync "${copy_args[@]}" "$DOCS"/ "$WIKI"/
else
  cp -r "$DOCS"/. "$WIKI"/
  for name in "${EXCLUDE[@]}"; do
    rm -rf "$WIKI/$name"
  done
fi

# Converte as cercas de Mermaid do formato do GitHub para o do Azure Wiki.
# No GitHub a cerca e ```mermaid, no Azure e ::: mermaid, fechando com :::.
echo "Convertendo blocos Mermaid..."
converted=0
while IFS= read -r -d '' file; do
  if grep -q '^```mermaid[[:space:]]*$' "$file"; then
    awk '
      /^```mermaid[[:space:]]*$/ { print "::: mermaid"; dentro = 1; next }
      dentro && /^```[[:space:]]*$/ { print ":::"; dentro = 0; next }
      { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    converted=$((converted + 1))
  fi
done < <(find "$WIKI" -name "*.md" -not -path "*/.git/*" -print0)
echo "  $converted arquivo(s) com Mermaid convertido(s)"

# As paginas preservadas entram no fim do .order da raiz.
for page in "${KEEP[@]}"; do
  entry="${page%.md}"
  if [ -f "$WIKI/$page" ] && ! grep -qxF "$entry" "$WIKI/.order" 2>/dev/null; then
    printf '%s\n' "$entry" >> "$WIKI/.order"
  fi
done

cd "$WIKI"
git add -A

if git diff --cached --quiet; then
  echo "Nada mudou. A Wiki ja esta em dia."
  exit 0
fi

echo
echo "Mudancas a enviar:"
git diff --cached --stat
echo

if [ "$AUTO_YES" != "1" ]; then
  resposta=""
  read -r -p "Enviar para a Wiki? [s/N] " resposta || true
  case "$resposta" in
    s|S|sim|SIM) ;;
    *) echo "Cancelado."; exit 0 ;;
  esac
fi

origem="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
if [ -n "$(git -C "$REPO_ROOT" status --porcelain -- "$DOCS")" ]; then
  origem="$origem, com alteracoes ainda nao commitadas"
fi
git commit --quiet -m "Sincroniza docs/ do GitHub ($origem)"
git push --quiet origin HEAD
echo "Pronto. Wiki atualizada a partir do commit $origem."
