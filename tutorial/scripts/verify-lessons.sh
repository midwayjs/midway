#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TUTORIAL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$TUTORIAL_DIR/.." && pwd)"
BASE_TEMPLATE_DIR="$TUTORIAL_DIR/src/templates/default"
LESSON_ROOT="$TUTORIAL_DIR/src/content/tutorial"
NODE_MODULES_DIR="$PROJECT_ROOT/node_modules"

if [ ! -d "$NODE_MODULES_DIR/@midwayjs" ]; then
  NODE_MODULES_DIR="$TUTORIAL_DIR/node_modules"
fi

TSC_BIN="$NODE_MODULES_DIR/.bin/tsc"

if [ ! -x "$TSC_BIN" ]; then
  echo "TypeScript compiler not found: $TSC_BIN"
  echo "Run: cd tutorial && npm install"
  exit 1
fi

failed=0
checked=0

for lesson_dir in "$LESSON_ROOT"/*/*; do
  if [ ! -f "$lesson_dir/content.md" ]; then
    continue
  fi
  if [ ! -d "$lesson_dir/_files" ]; then
    continue
  fi

  checked=$((checked + 1))
  tmp_dir="$(mktemp -d)"

  # Base project from default template.
  cp -R "$BASE_TEMPLATE_DIR"/. "$tmp_dir"/
  # Overlay lesson files for this case.
  cp -R "$lesson_dir/_files"/. "$tmp_dir"/
  ln -s "$NODE_MODULES_DIR" "$tmp_dir/node_modules"

  if "$TSC_BIN" --noEmit -p "$tmp_dir/tsconfig.json" >/tmp/tutorial-lesson-verify.log 2>&1; then
    echo "PASS $(basename "$(dirname "$lesson_dir")")/$(basename "$lesson_dir")"
  else
    echo "FAIL $(basename "$(dirname "$lesson_dir")")/$(basename "$lesson_dir")"
    sed -n '1,120p' /tmp/tutorial-lesson-verify.log
    failed=1
  fi

  rm -rf "$tmp_dir"
done

echo "Checked lessons: $checked"
if [ "$failed" -ne 0 ]; then
  exit 1
fi
