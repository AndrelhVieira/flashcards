#!/usr/bin/env bash
# Roda os testes das regras do Firestore no emulador, que exige Java 21+.
# Usa o Java do PATH se for 21+; senão procura um JDK 21+ instalado (Homebrew/macOS).
set -euo pipefail

java_major() {
  "$1" -version 2>&1 | awk -F'"' '/version/ { split($2, v, "."); print v[1]; exit }'
}

is_java_21() {
  [ -x "$1" ] && [ "$(java_major "$1")" -ge 21 ] 2>/dev/null
}

if ! is_java_21 "$(command -v java || true)"; then
  candidates=()
  if command -v brew >/dev/null 2>&1; then
    for formula in openjdk@21 openjdk; do
      candidates+=("$(brew --prefix "$formula" 2>/dev/null || true)/libexec/openjdk.jdk/Contents/Home")
    done
  fi
  if [ -x /usr/libexec/java_home ]; then
    candidates+=("$(/usr/libexec/java_home -v 21+ 2>/dev/null || true)")
  fi

  found=""
  for home in "${candidates[@]}"; do
    if is_java_21 "$home/bin/java"; then
      found="$home"
      break
    fi
  done

  if [ -z "$found" ]; then
    echo "Erro: o emulador do Firestore requer Java 21 ou superior." >&2
    echo "Instale com: brew install openjdk@21" >&2
    exit 1
  fi

  export JAVA_HOME="$found"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Usando Java $(java_major "$(command -v java)") ($(command -v java))"
exec firebase emulators:exec --only firestore --project demo-flashcards \
  'vitest run --config vitest.rules.config.ts'
