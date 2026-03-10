---
name: meta-code
description: "Intelligent multi-agent workflow that answers development questions by orchestrating web research, codebase exploration, and documentation lookup in a 3-phase pipeline. Use when the user says 'meta-code', '/meta-code', 'research and answer', 'deep research', 'full analysis', or 'comprehensive answer'. Spawns agent-websearch, agent-explore, and agent-docs as subagents, synthesizes their outputs into a single grounded response with sources."
---

# meta-code — Multi-Agent Research Pipeline

## Overview

meta-code is a 3-phase intelligent pipeline that answers development questions by combining:
1. **Web research** (agent-websearch) — current best practices, articles, ecosystem context
2. **Codebase analysis** (agent-explore) — relevant patterns, existing code, architecture
3. **Documentation lookup** (agent-docs) — official API details, code examples, version-accurate docs

Phases 2 and 3 are conditional and run in parallel. The orchestrator synthesizes all findings into one actionable response.

## Execution Flow

```
User Question
     │
     ▼
┌─────────────┐
│  Phase 1:   │
│  RESEARCH   │  ← Always runs first (agent-websearch)
│  (web)      │
└──────┬──────┘
       │ compressed summary + library names
       ▼
┌──────┴──────────────────┐
│         PARALLEL         │
│  ┌──────────┐  ┌──────────┐
│  │ Phase 2: │  │ Phase 3: │
│  │ EXPLORE  │  │ DOCUMENT │
│  │(codebase)│  │ (docs)   │
│  └────┬─────┘  └────┬─────┘
│       │              │     │
└───────┼──────────────┼─────┘
        ▼              ▼
   ┌──────────────────────┐
   │      Phase 4:        │
   │     SYNTHESIZE       │  ← Orchestrator combines all findings
   │  (final response)    │
   └──────────────────────┘
```

## Step-by-Step Execution

### Step 1 — Spawn Phase 1 (RESEARCH)

Always run first. Spawn agent-websearch via Task tool:

```
Task(
  description: "Web research on {topic}",
  prompt: [Phase 1 prompt template from references/agent-protocols.md],
  subagent_type: "agent-websearch"
)
```

Wait for completion. Extract from the output:
- **Key findings** — numbered list of important discoveries
- **Library names** — any libraries/frameworks mentioned as relevant
- **Compressed summary** — <500 words for passing to Phase 2/3

### Step 2 — Detect Conditions for Phases 2 and 3

**Codebase detection** — Run parallel Glob calls for manifest files:
- `Cargo.toml`, `package.json`, `pyproject.toml`, `go.mod`
- If any found → Phase 2 is active
- If none found → skip Phase 2

**Library extraction** — From Phase 1 output, extract library names:
- If libraries identified → Phase 3 is active
- If codebase manifest exists, also check for relevant dependencies
- If no libraries found → skip Phase 3

### Step 3 — Spawn Phases 2 and 3 in Parallel

Spawn both in a SINGLE message with multiple Task tool calls for true parallelism:

```
// Only if codebase detected:
Task(
  description: "Explore codebase for {topic}",
  prompt: [Phase 2 prompt with compressed Phase 1 summary],
  subagent_type: "Explore"
)

// Only if libraries identified:
Task(
  description: "Fetch docs for {library}",
  prompt: [Phase 3 prompt with library names and versions],
  subagent_type: "agent-docs"
)
```

If only one phase is applicable, spawn only that one. If neither is applicable, proceed directly to Step 4.

### Step 4 — Synthesize (Phase 4)

Combine all agent outputs into the final response. Follow these rules:

**Conflict resolution:** Official docs (Phase 3) > Web research (Phase 1) > Codebase patterns (Phase 2)

**Deduplication:** If multiple phases found the same information, use the most authoritative version and cite it once.

**Grounding:** Every claim must trace to a source (URL, file:line, or Context7 library ID). Unsourced claims must be marked as general guidance.

**Gap reporting:** If any phase was skipped or failed, note this in the relevant section.

## Output Format

```markdown
## Answer

[Direct, actionable answer — 3-10 sentences. Most important finding first.]

## Details

### From Web Research
[Key findings from Phase 1 with source URLs.
 Or: "Web research did not yield relevant results."]

### From Codebase Analysis
[Findings from Phase 2 with file:line references.
 Or: "No codebase detected." / "No relevant codebase findings."]

### From Documentation
[API details and code examples from Phase 3 with Context7 sources.
 Or: "No specific library documentation needed." / "No docs found."]

## Recommended Approach

[3-7 concrete next steps. Code examples tailored to user's context.]

## Sources
- [Source Title](URL) — annotation
- file:line — what was found
- Library: name vX.Y.Z via Context7
```

## Hard Rules

1. Phase 1 ALWAYS runs first — web research provides foundation for other phases.
2. Phases 2 and 3 run in PARALLEL when both applicable — never sequentially.
3. Phase 4 ALWAYS runs last — synthesis only after all agents complete.
4. Never skip Phase 1, even for simple questions.
5. Respect agent boundaries — websearch does NOT read code, explore does NOT fetch URLs, docs ONLY uses Context7.
6. Max 3 Context7 calls — agent-docs must stay within the hard limit.
7. Summarize before passing — compress Phase 1 output before feeding to Phase 2/3 (<500 words).
8. Cite everything — every claim traces to a source.
9. Graceful degradation — if any agent fails, continue with available data and note the gap.
10. No duplicate work — agents don't overlap domains.

## Error Handling

- If any agent returns empty results: note the gap in the relevant output section, proceed with other phases.
- If any agent times out: use partial results if available, note the timeout.
- If Exa MCP is unavailable: agent-websearch falls back to native WebSearch/WebFetch automatically.
- If Context7 is unavailable: report the failure, rely on Phase 1 web results for documentation.
- If all phases fail: return whatever is available with an honest disclaimer.

## DO NOT

- Spawn all 3 agents simultaneously — Phase 1 must complete first.
- Run Phases 2 and 3 sequentially when they could be parallel.
- Pass raw Phase 1 output to downstream agents — always compress first.
- Use TeamCreate for this workflow — use simple Task tool spawning.
- Include unsourced claims in the synthesis without marking them.
- Repeat the same information across output sections.

## References

- [Workflow Engine Specification](references/workflow-engine.md) — detailed execution logic, conditions, context passing, error handling, timeouts
- [Agent Protocols](references/agent-protocols.md) — exact Task tool parameters, prompt templates, expected output formats for each agent
- [Research Notes](references/research-notes.md) — synthesized best practices from web research on multi-agent orchestration patterns
