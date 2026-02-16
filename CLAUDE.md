# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A collection of bilingual (FR/EN) copy-paste prompt templates for Claude Code, leveraging skills, MCP servers (fontofweb, context7), and agent swarms. This is **not** a software project — no build system, no tests, no dependencies.

## Structure

- `prompts/` — All prompt templates as Markdown files
  - `ux-redesign-prd.md` — Generate a UX/UI redesign PRD using skills (/ralph-tui-prd, /coss-ui, /frontend-design, /web-design-guidelines) and MCP (fontofweb, context7), plus follow-up to enrich user-stories with MCP references
  - `implement-prd.md` — Implement from a PRD: single user-story, full PRD with agent swarm, or full PRD with /agent-swarm skill
  - `optimize-code.md` — Explore and optimize code at file, folder, or PRD level using context7
  - `design-exploration-prd.md` — Explore UI code with fontofweb design research + context7 stack learning, then write a PRD
  - `github-issue-prd.md` — Read a GitHub issue, explore the stack via context7, then write a PRD with /ralph-tui-prd

## Template Conventions

- Each file contains variants by scope (single file, folder, full PRD, etc.)
- Every prompt has a **FR** and **EN** version — both are equivalent, keep them in sync
- Prompts use `@path` references (e.g., `@src/components/`, `@tasks/prd-name.md`) as placeholders for the user to substitute
- Prompts explicitly reference which skills (`/skill-name`) and MCP servers to use
- PRD-related prompts always output to a `@tasks/` folder and use `/ralph-tui-prd`
- Agent swarm prompts remind to close tmux panes and update the PRD checklist after completion

## When Editing Templates

- Keep FR and EN versions in sync within each file
- Each fenced code block is a standalone prompt the user copy-pastes
- Follow existing structure: H1 for template name, H2 for variant, H3 for language (FR/EN)
- Always specify which skills and MCP servers the prompt relies on
