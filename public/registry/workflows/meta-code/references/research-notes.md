# Research Notes — Multi-Agent Workflow Orchestration

Synthesized from web research (Exa), Anthropic documentation, and industry frameworks (Feb 2026).

## 1. Recommended Orchestration Patterns

### Anthropic's Official Patterns (from "Building Effective Agents")

Anthropic identifies 5 core workflow patterns, in order of increasing complexity:

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| **Prompt Chaining** | Sequential steps, each LLM call processes the previous output, with optional gates between steps | Fixed, well-defined subtasks |
| **Routing** | Classify input and direct to specialized handlers | Distinct categories requiring separate handling |
| **Parallelization** | Run multiple LLM tasks simultaneously (sectioning or voting), aggregate results programmatically | Speed gains or when multiple perspectives increase confidence |
| **Orchestrator-Workers** | Central LLM dynamically breaks down tasks and delegates to workers, synthesizes results | Complex tasks where subtasks can't be predicted upfront |
| **Evaluator-Optimizer** | One LLM generates, another evaluates in iterative loops | Clear evaluation criteria, iterative refinement adds value |

**Key principle:** "Add complexity only when it demonstrably improves outcomes."

### 11 Industry Patterns (from AskAiBrain 2026 Guide)

The most relevant to meta-code:

1. **Pipeline (Sequential)** — ⭐ complexity. Agents process outputs linearly. Best for well-defined sequential steps with cascading transformations.
2. **Fan-out/Fan-in (Parallel)** — ⭐⭐ complexity. Task distributed to multiple parallel agents; aggregator synthesizes results. Dramatically reduces processing time.
3. **Supervisor (Centralized)** — ⭐⭐ complexity. Central supervisor analyzes requests and routes to specialized agents.

**meta-code maps to: Pipeline + Fan-out/Fan-in hybrid.** Phase 1 is sequential (pipeline), Phases 2+3 are parallel (fan-out), Phase 4 is aggregation (fan-in).

### Google ADK Multi-Agent Patterns

Google's ADK uses `AgentTool` to wrap agents as tools. Unlike OpenAI's handoffs (which transfer control entirely), AgentTool keeps the coordinator in charge. This matches Claude Code's Task tool model where the main session spawns and coordinates subagents.

### OpenAI Agents SDK

Orchestrator + specialists architecture with parallel execution for low latency and strict JSON schemas for predictable outputs. Guardrails and session memory prevent repeated advice.

## 2. Error Handling and Retry Strategies

### Graceful Degradation
- If any agent fails, the workflow continues with available data and notes the gap.
- Never let a single agent failure cascade to kill the entire pipeline.
- Report what was attempted, what failed, and what the partial result covers.

### Environmental Feedback (Anthropic)
- Agents must gain "ground truth" from the environment at each step.
- Control mechanisms: maximum iterations, checkpoints for human feedback.

### Timeout Policies
- Set reasonable timeouts per agent based on expected work (research: 60s, exploration: 90s, docs: 30s).
- If an agent times out, proceed with what's available. Note the timeout in the final synthesis.

### Retry Rules
- Do NOT retry the same failing call in a loop.
- If an agent returns empty, try reformulating the query once. If still empty, proceed without.
- For tool-level failures (MCP unavailable), fall back to alternative tools before giving up.

## 3. Context Passing Between Agents

### Key Principles
- **Summarize, don't forward raw output.** Passing full agent output to downstream agents wastes context and introduces noise.
- **Extract structured keys.** From Phase 1 (research), extract: key findings, library names, version numbers, URLs, best practices.
- **Information flow should be directional.** Phase 1 → Phase 2 (codebase context) and Phase 1 → Phase 3 (library targets). Phase 2 and Phase 3 do not need each other's output.
- **The orchestrator (team lead) is the only entity that sees all outputs.** It synthesizes during Phase 4.

### Context Budget
- Claude's context window fills fast. Performance degrades as it fills.
- Subagents get their own isolated context windows (Anthropic sub-agents architecture).
- When passing context downstream, compress to essential findings only (aim for <500 words summary from Phase 1).

### Anthropic Sub-Agents Architecture (Feb 2026)
- Sub-agents run in isolated context windows — they don't share the parent's full conversation.
- Orchestrator-Worker pattern with context isolation achieves 90% performance gains on complex tasks.
- The spawn prompt must contain ALL context the subagent needs — it has no access to prior conversation.

## 4. Agent Coordination and Task Decomposition

### Task Decomposition Principles
1. **Classify first, then route.** Analyze the user's question to determine which phases are needed.
2. **Maximize parallelism.** Independent tasks (codebase exploration and docs lookup) should always run simultaneously.
3. **Minimize sequential dependencies.** Only Phase 1 must complete before Phases 2+3 start, because its output informs their queries.
4. **Each agent owns a single domain.** agent-websearch handles web research, agent-explore handles codebase, agent-docs handles documentation. No overlap.

### Coordination Without Teams
- For short-lived, defined pipelines, use simple Task tool spawning (not TeamCreate).
- TeamCreate is for longer-lived collaborations where teammates claim tasks over time.
- meta-code is a defined pipeline with known phases — Task tool spawning is appropriate.

### Output Aggregation
- The orchestrator collects all agent outputs and synthesizes.
- Resolve conflicts: official docs > web research > codebase patterns.
- Deduplicate: if web research found the same documentation that agent-docs retrieved, prefer the Context7 version (more structured).

## 5. Anti-Patterns to Avoid

### From Research
1. **God Agent** — Single agent doing everything. Solution: specialize.
2. **Agent Loops** — Agents calling each other in cycles. Solution: strict directional flow.
3. **Redundant Work** — Multiple agents searching for the same information. Solution: clear domain boundaries.
4. **Context Explosion** — Passing too much data between agents. Solution: summarize before passing.
5. **Premature Parallelism** — Running all agents simultaneously when some need prior results. Solution: sequence Phase 1, then parallelize.
6. **Over-Orchestration** — Using teams/complex coordination for simple tasks. Solution: use Task tool directly.
7. **Ignoring Failures** — Proceeding without noting what data is missing. Solution: always report gaps.
8. **Duplicate Synthesis** — Repeating same info across output sections. Solution: deduplicate in final synthesis.

### From Anthropic Best Practices
- Don't build complex frameworks when simple patterns suffice.
- Tool documentation is as important as human-computer interface design.
- Transparency: always show planning steps and decision rationale.

## Sources

- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents) (Dec 2024)
- [The 11 Multi-Agent Orchestration Patterns — AskAiBrain](https://www.askaibrain.com/en/posts/11-multi-agent-orchestration-patterns-complete-guide) (Jan 2026)
- [Multi-Agent System Patterns — Medium/Mjgmario](https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41) (Jan 2026)
- [Multi-Agent Orchestration Patterns — Zylos Research](https://zylos.ai/research/2026-01-06-multi-agent-orchestration-patterns) (Jan 2026)
- [AI Agent Orchestration Patterns — Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Developer's Guide to Multi-Agent Patterns in ADK — Google](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/) (Dec 2025)
- [Anthropic Sub-Agents Architecture — Medium/Jiten Oswal](https://medium.com/@jiten.p.oswal/the-architecture-of-scale-a-deep-dive-into-anthropics-sub-agents-6c4faae1abda) (Feb 2026)
- [Best Practices for Claude Code — Anthropic Docs](https://docs.anthropic.com/en/docs/claude-code/best-practices)
