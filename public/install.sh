#!/usr/bin/env bash
set -euo pipefail

# Claude Craft — Workflow & Agent Installer
# Usage:
#   curl -fsSL https://claude-craft-two.vercel.app/install.sh | bash                  # Install all
#   curl -fsSL https://claude-craft-two.vercel.app/install.sh | bash -s -- workflow meta-code
#   curl -fsSL https://claude-craft-two.vercel.app/install.sh | bash -s -- agent agent-docs
#   curl -fsSL https://claude-craft-two.vercel.app/install.sh | bash -s -- all

BASE_URL="https://claude-craft-two.vercel.app/registry"
SKILLS_DIR="$HOME/.claude/skills"
AGENTS_DIR="$HOME/.claude/agents"

info()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
ok()    { printf '\033[0;32m%s\033[0m\n' "$*"; }
err()   { printf '\033[0;31m%s\033[0m\n' "$*" >&2; }

download_file() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if command -v curl &>/dev/null; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget &>/dev/null; then
    wget -qO "$dest" "$url"
  else
    err "Error: curl or wget required"
    exit 1
  fi
}

install_workflow() {
  local name="$1"
  info "Installing workflow: $name"

  # Fetch manifest to get file list
  local manifest
  manifest=$(curl -fsSL "$BASE_URL/manifest.json")

  local files
  files=$(echo "$manifest" | python3 -c "
import json, sys
m = json.load(sys.stdin)
wf = m.get('workflows', {}).get('$name', [])
for f in wf:
    print(f)
" 2>/dev/null || echo "$manifest" | jq -r ".workflows[\"$name\"][]" 2>/dev/null)

  if [ -z "$files" ]; then
    err "Workflow '$name' not found in registry"
    exit 1
  fi

  while IFS= read -r file; do
    download_file "$BASE_URL/workflows/$name/$file" "$SKILLS_DIR/$name/$file"
  done <<< "$files"

  ok "  Installed $name -> $SKILLS_DIR/$name/"
}

install_agent() {
  local name="$1"
  # Ensure .md extension
  [[ "$name" == *.md ]] || name="$name.md"

  info "Installing agent: $name"
  mkdir -p "$AGENTS_DIR"
  download_file "$BASE_URL/agents/$name" "$AGENTS_DIR/$name"
  ok "  Installed $name -> $AGENTS_DIR/$name"
}

install_all() {
  info "Installing all workflows and agents from Claude Craft..."
  echo ""

  local manifest
  manifest=$(curl -fsSL "$BASE_URL/manifest.json")

  # Install all workflows
  local wf_names
  wf_names=$(echo "$manifest" | python3 -c "
import json, sys
m = json.load(sys.stdin)
for k in m.get('workflows', {}):
    print(k)
" 2>/dev/null || echo "$manifest" | jq -r '.workflows | keys[]' 2>/dev/null)

  while IFS= read -r name; do
    [ -n "$name" ] && install_workflow "$name"
  done <<< "$wf_names"

  echo ""

  # Install all agents
  local agent_names
  agent_names=$(echo "$manifest" | python3 -c "
import json, sys
m = json.load(sys.stdin)
for a in m.get('agents', []):
    print(a)
" 2>/dev/null || echo "$manifest" | jq -r '.agents[]' 2>/dev/null)

  while IFS= read -r name; do
    [ -n "$name" ] && install_agent "$name"
  done <<< "$agent_names"

  echo ""
  ok "All done! Restart Claude Code to load the new workflows and agents."
}

# ── Main ────────────────────────────────────────────────
case "${1:-all}" in
  workflow)
    [ -z "${2:-}" ] && { err "Usage: install.sh workflow <name>"; exit 1; }
    install_workflow "$2"
    ;;
  agent)
    [ -z "${2:-}" ] && { err "Usage: install.sh agent <name>"; exit 1; }
    install_agent "$2"
    ;;
  all)
    install_all
    ;;
  *)
    err "Usage: install.sh [all|workflow <name>|agent <name>]"
    exit 1
    ;;
esac
