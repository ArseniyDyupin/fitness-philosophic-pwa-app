#!/usr/bin/env bash

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$ROOT/.claude/agents"
SKILLS_DIR="$ROOT/.agents/skills"
AGENTS_MD="$ROOT/AGENTS.md"
CLAUDE_MD="$ROOT/CLAUDE.md"
fail=0

pass() { printf '  ok   %s\n' "$1"; }
bad() { printf '  FAIL %s\n' "$1"; fail=1; }
section() { printf '\n%s\n' "$1"; }
fm_end() { grep -n '^---$' "$1" | sed -n '2p' | cut -d: -f1; }
frontmatter() { local e; e="$(fm_end "$1")"; [ -n "$e" ] && sed -n "2,$((e - 1))p" "$1"; }
fm_value() { frontmatter "$1" | grep -E "^$2:" | head -1 | sed -E "s/^$2:[[:space:]]*//"; }

[ -f "$AGENTS_MD" ] || { printf 'Missing AGENTS.md\n'; exit 2; }
[ -f "$CLAUDE_MD" ] || { printf 'Missing CLAUDE.md\n'; exit 2; }
[ -d "$CLAUDE_DIR" ] || { printf 'Missing .claude/agents\n'; exit 2; }
[ -d "$SKILLS_DIR" ] || { printf 'Missing .agents/skills\n'; exit 2; }

agents="$(cd "$CLAUDE_DIR" && ls -1 *.md 2>/dev/null | sed 's/\.md$//' | sort)"
skills="$(cd "$SKILLS_DIR" && ls -1d */ 2>/dev/null | tr -d '/' | sort)"

printf 'Fitness PWA agent-layer guard — %s agents\n' "$(printf '%s\n' "$agents" | grep -c .)"

section "1. Frontmatter"
frontmatter_issue=0
while read -r agent; do
  [ -z "$agent" ] && continue
  file="$CLAUDE_DIR/$agent.md"
  [ -n "$(fm_end "$file")" ] || { bad "$agent.md has invalid frontmatter"; frontmatter_issue=1; continue; }
  for key in name description model tools; do
    frontmatter "$file" | grep -qE "^$key:" || { bad "$agent.md missing $key"; frontmatter_issue=1; }
  done
  [ "$(fm_value "$file" name)" = "$agent" ] || { bad "$agent.md name does not match filename"; frontmatter_issue=1; }
done <<EOF
$agents
EOF
[ "$frontmatter_issue" -eq 0 ] && pass "Claude agent frontmatter is complete"

section "2. Claude/Codex parity"
if [ "$agents" != "$skills" ]; then
  bad ".claude/agents and .agents/skills contain different specialists"
  diff -u <(printf '%s\n' "$agents") <(printf '%s\n' "$skills") || true
else
  parity_issue=0
  while read -r skill; do
    [ -z "$skill" ] && continue
    file="$SKILLS_DIR/$skill/SKILL.md"
    [ -f "$file" ] || { bad "missing $file"; parity_issue=1; continue; }
    [ "$(fm_value "$file" name)" = "$skill" ] || { bad "$skill SKILL.md name mismatch"; parity_issue=1; }
  done <<EOF
$skills
EOF
  [ "$parity_issue" -eq 0 ] && pass "Claude agents and Codex skills cover the same specialists"
fi

section "3. Routing"
routing="$(awk '/^## Specialist Routing/{f=1; next} /^## /{f=0} f' "$AGENTS_MD")"
routed="$(printf '%s\n' "$routing" | grep -oE '`[a-z0-9][a-z0-9-]*`' | tr -d '`' | sort -u)"
routing_issue=0
while read -r specialist; do
  [ -z "$specialist" ] && continue
  printf '%s\n' "$agents" | grep -qx "$specialist" || { bad "routing references missing $specialist"; routing_issue=1; }
done <<EOF
$routed
EOF
while read -r agent; do
  [ -z "$agent" ] && continue
  printf '%s\n' "$routed" | grep -qx "$agent" || { bad "$agent is not present in routing"; routing_issue=1; }
done <<EOF
$agents
EOF
[ "$routing_issue" -eq 0 ] && pass "routing has no dangling or orphaned specialists"

section "4. OpenSpec"
openspec_issue=0
for file in \
  "$ROOT/openspec/config.yaml" \
  "$ROOT/.codex/skills/openspec-propose/SKILL.md" \
  "$ROOT/.claude/skills/openspec-propose/SKILL.md" \
  "$ROOT/.claude/commands/opsx/propose.md"; do
  [ -f "$file" ] || { bad "missing ${file#"$ROOT/"}"; openspec_issue=1; }
done
[ "$openspec_issue" -eq 0 ] && pass "OpenSpec project and Claude/Codex workflows are installed"

section "5. Source invariants"
invariant_issue=0
grep -q "super('AITrainerDB')" "$ROOT/src/services/data/db.ts" || { bad "Dexie database identity changed"; invariant_issue=1; }
grep -q "registerType: 'prompt'" "$ROOT/vite.config.ts" || { bad "PWA prompt-update config changed"; invariant_issue=1; }
grep -q "ai-trainer:openai-api-key" "$ROOT/src/services/ai/aiGateway.ts" || { bad "AI gateway key storage contract changed"; invariant_issue=1; }
grep -q "SUPPORTED_LANGUAGES: \\['en', 'ru'\\]" "$ROOT/src/constants/index.ts" || { bad "supported language contract changed"; invariant_issue=1; }
[ "$invariant_issue" -eq 0 ] && pass "Dexie, prompt-update PWA, AI gateway key, and language contracts match guidance"

printf '\n'
if [ "$fail" -eq 0 ]; then
  printf 'All agent-layer checks passed.\n'
  exit 0
fi

printf 'Agent-layer checks failed.\n'
exit 1
