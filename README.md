# Prompts — Claude Code Agent Teams

Ready-to-use prompt templates for orchestrating [Claude Code Agent Teams](https://docs.anthropic.com/en/docs/claude-code/agent-teams) (swarm mode) with tmux split panes.

## Quick Start

1. Launch Claude Code inside tmux:

```bash
tmux new -s claude-team "claude"
```

2. Copy-paste any template below into Claude Code, replace the `[PLACEHOLDERS]`, and let the agent team do the work.

## Templates

| Template | Description | Agents |
|----------|-------------|--------|
| [implement-prd.md](prompts/implement-prd.md) | Implement a full PRD with parallel agents | 3-6 |
| [debug-hypotheses.md](prompts/debug-hypotheses.md) | Debug with competing hypotheses | 2-5 |
| [review-pr.md](prompts/review-pr.md) | Multi-angle PR code review | 2-5 |
| [refactor-codebase.md](prompts/refactor-codebase.md) | Refactor, migrate, or clean up a codebase | 2-6 |

Each template comes in multiple variants (simple, advanced, quick) depending on how much control you want.

## Orchestration Patterns

These templates leverage 4 orchestration patterns:

- **Leader** — One coordinator distributes independent subtasks
- **Swarm** — N similar tasks processed in parallel, no cross-dependencies
- **Pipeline** — Sequential stages where each depends on the previous
- **Watchdog** — Parallel work with continuous quality oversight

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with agent teams enabled:

```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

- [tmux](https://github.com/tmux/tmux) installed for split-pane mode

## Usage Tips

- **File ownership**: always assign distinct files/directories to each teammate to avoid conflicts
- **Plan approval**: use `(plan approval required)` for risky or architectural tasks
- **Delegate mode**: press `Shift+Tab` to keep the lead as pure orchestrator
- **Right-size**: 2-5 teammates is the sweet spot — more agents ≠ faster
- **Context**: teammates don't inherit conversation history — be explicit in spawn prompts

## License

[MIT](LICENSE)
