# Prompts — Claude Code

Ready-to-use prompt templates for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), leveraging skills, MCP servers, and agent swarms. Each template is bilingual (FR/EN) and designed to be copy-pasted directly into Claude Code — just replace the `@paths` with your own.

## Templates

| Template | Description |
|----------|-------------|
| [ux-redesign-prd.md](prompts/ux-redesign-prd.md) | Generate a UX/UI redesign PRD with design inspiration |
| [implement-prd.md](prompts/implement-prd.md) | Implement a PRD — single US, full PRD, or agent swarm |
| [optimize-code.md](prompts/optimize-code.md) | Explore and optimize code (file, folder, or via PRD) |
| [design-exploration-prd.md](prompts/design-exploration-prd.md) | Explore a UI section with design research, then write a PRD |

## Skills & MCP Used

These prompts reference the following Claude Code skills and MCP servers:

**Skills:** `/ralph-tui-prd`, `/web-design-guidelines`, `/frontend-design`, `/coss-ui`, `/agent-swarm`

**MCP servers:** `fontofweb` (design inspiration), `context7` (library documentation)

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with the skills and MCP servers listed above installed
- [tmux](https://github.com/tmux/tmux) for agent swarm prompts
- Agent teams enabled:

```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Usage

Copy-paste a template into Claude Code, replace `@paths` (e.g., `@src/components/`, `@tasks/prd-name.md`) with your actual project paths.

## License

[MIT](LICENSE)
