#!/usr/bin/env bash
set -euo pipefail

# Find package.json files outside node_modules
mapfile -t PKGS < <(find . -type f -name package.json -not -path "*/node_modules/*")

candidates=()

for pkg in "${PKGS[@]}"; do
  dir="$(dirname "$pkg")"
  # Heuristics: must look like a Next app directory
  if grep -q '"next"\s*:' "$pkg" 2>/dev/null; then
    if [ -f "$dir/next.config.js" ] || [ -f "$dir/next.config.mjs" ] || [ -d "$dir/app" ] || [ -d "$dir/pages" ]; then
      candidates+=("$dir")
    fi
  fi
done

if [ ${#candidates[@]} -eq 0 ]; then
  echo "No Next.js app candidates found. If your app is in a nonstandard path, provide it manually:"
  read -rp "Enter app path (relative to repo root): " manual
  if [ -z "$manual" ] || [ ! -d "$manual" ]; then
    echo "Invalid path. Exiting." >&2
    exit 1
  fi
  APP_DIR="$manual"
elif [ ${#candidates[@]} -eq 1 ]; then
  APP_DIR="${candidates[0]}"
else
  echo "Multiple Next.js app candidates found. Choose one:"
  i=1
  for c in "${candidates[@]}"; do
    echo "  [$i] $c"
    i=$((i+1))
  done
  read -rp "Select number: " sel
  if ! [[ "$sel" =~ ^[0-9]+$ ]] || [ "$sel" -lt 1 ] || [ "$sel" -gt ${#candidates[@]} ]; then
    echo "Invalid selection." >&2
    exit 1
  fi
  APP_DIR="${candidates[$((sel-1))]}"
fi

# Persist selection for future terminals
echo "export APP_DIR=\"$APP_DIR\"" > .nextapp
echo "APP_DIR set to: $APP_DIR"
echo "Run:  source .nextapp"
