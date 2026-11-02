#!/usr/bin/env bash
# Vercel "Ignored Build Step". Exit 0 = skip the build, exit 1 = build.
# Builds cost build minutes on the team's plan: only build what changes the deployed app.
set -u

# Branches and pull requests are tested by CI (.github/workflows), not by previews.
# For one on demand: vercel deploy --build-env FORCE_PREVIEW=1
if [ "${VERCEL_ENV:-}" = "preview" ] && [ "${FORCE_PREVIEW:-}" != "1" ]; then
  echo "Preview builds are off (set FORCE_PREVIEW=1 to build one), skipping."
  exit 0
fi

base=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
if ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  echo "Base commit ${base} not available, building."
  exit 1
fi

# A redeploy reuses the same commit, usually to apply new environment variables,
# which never show up in a git diff. Always build in that case.
if [ "$(git rev-parse "${base}^{commit}")" = "$(git rev-parse HEAD)" ]; then
  echo "Same commit as the previous deployment (redeploy), building."
  exit 1
fi

# Docs, tests, Firebase rules (deployed separately) and editor/CI config never reach the deployed app.
if git diff --quiet "$base" HEAD -- . ':(exclude)docs' ':(exclude)*.md' ':(exclude)tests' \
  ':(exclude)vitest*.config.ts' ':(exclude)scripts/test-rules.sh' ':(exclude)firestore.rules' \
  ':(exclude)firebase.json' ':(exclude).github' ':(exclude).claude'; then
  echo "Only docs/tests/tooling changed since ${base}, skipping build."
  exit 0
fi
echo "App changes since ${base}, building."
exit 1
