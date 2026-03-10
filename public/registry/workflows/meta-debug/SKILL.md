---
name: meta-debug
description: "Multi-agent debugging workflow that diagnoses and fixes errors with surgical precision. Orchestrates agent-explore (root cause), agent-docs (API verification), and agent-websearch (community solutions) in a 5-step pipeline: triage, investigate, verify docs, research (conditional), fix. Use when the user pastes an error message, stack trace, compiler output, or failing test, or says 'debug', 'fix this error', 'why is this failing', 'help me fix', 'what went wrong', 'diagnose this', or describes unexpected behavior with error context."
---

# meta-debug — Multi-Agent Debugging Pipeline

## Overview

meta-debug is a 5-step debugging pipeline that diagnoses errors and applies fixes by combining:
1. **Error triage** (orchestrator) — classify, extract signals, route to correct diagnosis path
2. **Codebase investigation** (agent-explore) — trace root cause, map dependency chain
3. **Documentation check** (agent-docs) — verify API usage, check for breaking changes
4. **Web research** (agent-websearch) — community solutions, known issues (conditional)
5. **Fix implementation** (orchestrator) — apply minimal fix, verify, explain

Steps 2 and 3 run in parallel. Step 4 runs only if Steps 2-3 don't resolve the issue.

## Execution Flow

```
Error Input (message, stack trace, test output)
     │
     ▼
┌─────────────┐
│  Step 1:    │
│   TRIAGE    │  ← Orchestrator: classify, extract signals
│  (instant)  │
└──────┬──────┘
       │ error classification + extracted signals
       ▼
┌──────┴──────────────────┐
│         PARALLEL         │
│  ┌──────────┐  ┌──────────┐
│  │ Step 2:  │  │ Step 3:  │
│  │INVESTIGATE│  │VERIFY    │
│  │(codebase)│  │(docs)    │
│  └────┬─────┘  └────┬─────┘
│       │              │     │
└───────┼──────────────┼─────┘
        ▼              ▼
   ┌─────────────────────────┐
   │  Root cause identified? │
   │  YES → Step 5           │
   │  NO  → Step 4           │
   └─────────────────────────┘
        │              │
        ▼              ▼
┌──────────────┐  ┌──────────────┐
│  Step 4:     │  │  Step 5:     │
│  RESEARCH    │  │  FIX         │
│  (web, cond.)│  │  (implement) │
└──────┬───────┘  └──────────────┘
       │                  ▲
       └──────────────────┘
```

## Step-by-Step Execution

### Step 1 — Error Triage (Orchestrator, Instant)

Parse the error and classify it. This step uses NO agents — the orchestrator handles it directly.

**1a. Extract signals from the error:**

| Signal | What to look for |
|--------|-----------------|
| File paths | Absolute or relative paths in the error output |
| Line numbers | `:42`, `line 42`, `at line 42` |
| Error codes | `E0308`, `TS2322`, `ENOENT`, HTTP status codes |
| Library names | Package names in import paths or stack frames |
| Versions | Version strings near library names in lock files or error text |
| Function names | Top of stack trace, `at function_name` |

**1b. Classify the error type:**

| Classification | Indicators |
|---------------|------------|
| **Compile error** | Compiler output, syntax errors, type mismatches, missing imports |
| **Type error** | Type checker output, generic constraint failures, inference failures |
| **Runtime error** | Panic, exception, segfault, stack trace with runtime frames |
| **Dependency issue** | Resolution failures, version conflicts, missing packages |
| **Config issue** | Environment variables, config file parsing, path errors |
| **Logic bug** | Wrong output, assertion failure, test mismatch (expected vs got) |
| **Performance issue** | Timeout, OOM, slow query, high CPU |
| **Test failure** | Test framework output, assertion messages, diff output |

**1c. Prepare the triage report** (used internally for Steps 2-3):

```
## Triage Report
- Classification: {error_type}
- Error message: {core_message}
- Files involved: {file_paths_with_lines}
- Error code: {code_if_any}
- Libraries: {library_names_with_versions}
- Stack trace depth: {number_of_frames}
```

**1d. Detect codebase and libraries:**

Run parallel Glob calls for manifest files:
```
Glob: Cargo.toml
Glob: package.json
Glob: pyproject.toml
Glob: go.mod
```

If any manifest found → Step 2 is active.
If libraries identified in triage → Step 3 is active.

### Step 2 — Codebase Investigation (agent-explore)

Spawn agent-explore to trace the error to its root cause:

```
Task(
  description: "Investigate {error_type} in codebase",
  prompt: <see references/agent-orchestration.md for template>,
  subagent_type: "agent-explore"
)
```

The agent investigates:
- Read the files and lines referenced in the error
- Trace the call chain that leads to the failure point
- Map dependencies of the failing code (imports, types, modules)
- Check for recent changes near the error (git blame/log if useful)
- Identify the architectural context — is this a handler, middleware, model, test?

### Step 3 — Documentation Check (agent-docs)

Spawn agent-docs to verify API usage against official documentation:

```
Task(
  description: "Check docs for {library}",
  prompt: <see references/agent-orchestration.md for template>,
  subagent_type: "agent-docs"
)
```

The agent checks:
- Correct API signatures for functions involved in the error
- Known breaking changes or migration notes for the library version
- Required configuration or setup steps that may have been missed
- Deprecation warnings for any APIs used in the failing code

**Spawn Steps 2 and 3 in a SINGLE message** for true parallel execution.

### Decision Gate — Is the Root Cause Clear?

After Steps 2-3 complete, evaluate:

- **Root cause identified** → proceed to Step 5.
  - agent-explore found the exact code causing the issue AND
  - agent-docs confirmed the correct API usage (or the error is not API-related)

- **Root cause unclear** → proceed to Step 4.
  - The error doesn't match any obvious code issue
  - The API usage appears correct but the error persists
  - The error message is cryptic or underdocumented
  - A known bug or platform-specific issue is suspected

### Step 4 — Web Research (agent-websearch, Conditional)

ONLY run this step if Steps 2-3 did not resolve the issue.

```
Task(
  description: "Search for {error_message}",
  prompt: <see references/agent-orchestration.md for template>,
  subagent_type: "agent-websearch"
)
```

The agent searches for:
- The exact error message + library name + version
- GitHub issues mentioning this error
- Stack Overflow solutions with high vote counts
- Blog posts or changelogs that document this specific issue
- Whether a patch or workaround exists

### Step 5 — Fix Implementation (Orchestrator)

Apply the fix based on all gathered evidence. Follow this protocol:

**5a. Present the diagnosis:**

```markdown
## Root Cause
[1-3 sentences explaining WHY the error occurred — the actual cause, not the symptom]

## Evidence
- [file:line — what was found there]
- [Documentation reference — what the correct behavior should be]
- [Web source — if Step 4 was needed]
```

**5b. Choose the fix strategy:**

If multiple fixes exist, rank by:
1. **Correctness** — does it fix the actual root cause, not just the symptom?
2. **Safety** — minimal side effects, no regressions, preserves existing behavior
3. **Simplicity** — least invasive change, fewest files modified

Present the top strategy. If there are meaningful alternatives, list them briefly with trade-offs.

For fix strategy ranking criteria and anti-patterns, see `references/fix-strategies.md`.

**5c. Apply the fix:**

- Use Edit tool for surgical changes — do not rewrite files unnecessarily
- Change only what is necessary to fix the root cause
- Preserve existing code style and conventions

**5d. Verify the fix:**

- If the error came from a compiler: re-run the build
- If the error came from a test: re-run the failing test
- If the error came from runtime: explain how to verify manually
- If linting or type checking is available: run it

**5e. Suggest prevention:**

One sentence on how to avoid this error in the future (only if there's a meaningful preventive measure — don't add noise).

## Hard Rules

1. Step 1 is ALWAYS done by the orchestrator — no agent spawning for triage.
2. Steps 2 and 3 run in PARALLEL — spawn both in a single message.
3. Step 4 is CONDITIONAL — only run when Steps 2-3 don't resolve the issue.
4. Step 5 runs AFTER all investigation is complete — never fix before understanding.
5. Agent boundaries are strict — explore reads code, docs queries Context7, websearch fetches URLs.
6. Max 3 Context7 calls — agent-docs must stay within the hard limit.
7. Compress triage report before passing to agents (<300 words).
8. Every diagnosis claim must trace to evidence (file:line, doc reference, or URL).
9. Graceful degradation — if any agent fails, continue with available data and note the gap.
10. Do NOT use TeamCreate — use simple Task tool spawning for all agents.

## Error Handling

- agent-explore returns empty: the error may be in generated/external code — note this, proceed with Steps 3-4.
- agent-docs returns empty: the library may lack Context7 coverage — note this, rely on web research.
- agent-websearch returns empty: the error may be novel — apply best-effort diagnosis from Steps 2-3.
- All agents fail: use the triage report and error message to provide the best guidance possible with an honest disclaimer.
- No codebase detected: skip Step 2, rely on Steps 3-4 and the error message itself.
- No library identified: skip Step 3, rely on Steps 2 and 4.

## DO NOT

- Skip triage and jump straight to web searching — triage prevents wasted effort.
- Apply a fix before completing investigation — understand first, fix second.
- Suggest "just Google it" — every step must add diagnostic value.
- Spawn all agents simultaneously — Step 1 must complete first to inform Steps 2-3.
- Run Step 4 unconditionally — web research is the fallback, not the default.
- Include unsourced fix suggestions — every fix traces to evidence.
- Over-fix — change only what is necessary, do not refactor surrounding code.
- Hardcode language-specific patterns in the pipeline — use adaptive detection from triage signals.

## References

- [Error Patterns](references/error-patterns.md) — common error pattern taxonomy, diagnosis heuristics per classification, and language-adaptive signal extraction
- [Fix Strategies](references/fix-strategies.md) — fix strategy ranking criteria, common fix anti-patterns, and verification protocols
- [Agent Orchestration](references/agent-orchestration.md) — exact Task tool parameters, prompt templates, and coordination rules for all three agents
