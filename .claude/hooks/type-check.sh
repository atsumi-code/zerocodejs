#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): run the project's vue-tsc type check after edits
# to .ts/.vue files, and surface failures back into Claude's context.
set -o pipefail

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}" || exit 0

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')

case "$file" in
  *.ts|*.tsx|*.vue) ;;
  *) exit 0 ;;
esac

out=$(npx vue-tsc --noEmit 2>&1)
code=$?

if [ "$code" -ne 0 ]; then
  ctx=$(printf 'vue-tsc type check failed after editing %s:\n%s' "$file" "$out" | jq -Rs .)
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":%s}}' "$ctx"
fi

exit 0
