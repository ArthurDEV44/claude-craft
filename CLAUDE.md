# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Claude Craft — A showcase site for Claude Code multi-agent workflows and community skills. Built with Next.js 16 (App Router), Tailwind CSS v4, and deployed on Vercel.

## Structure

- `app/(home)/page.tsx` — Homepage with overview of workflows and skills
- `app/(home)/workflows/` — Workflows catalog: 13 multi-agent pipelines and 3 subagents with install buttons
- `app/(home)/skills/` — Community skills catalog: 40+ skills across Rust, frontend, 3D shaders, CUDA, AI, and more
- `lib/workflows-data.ts` — Auto-generated workflow and subagent data (from skills repo)
- `lib/skills-data.ts` — Auto-generated skills data (from skills repo)
- `scripts/sync-all.mjs` — Reads `../skills/` repo, parses SKILL.md frontmatter, generates both data files
- `components/skills-grid.tsx` — Client-side filterable/searchable skills grid
- `components/ui/` — UI components built on Base UI and Tailwind CSS
- `public/install.sh` — Shell installer for workflows and agents

## Key Conventions

- Package manager: **bun** (never npm)
- Design tokens: OKLCH-based custom properties in `app/global.css` (light + dark mode)
- Theme: `next-themes` with class-based dark mode
- UI components: `@base-ui/react` + `class-variance-authority`
- No fumadocs, no MDX, no documentation pages — just the two catalog pages
- Data is auto-generated: run `bun run sync` to regenerate from `../skills/` repo
- Workflows are skills with `model:` or `argument-hint:` in SKILL.md frontmatter
- Install: workflows use `npx skills add`, agents use `curl` from GitHub raw
