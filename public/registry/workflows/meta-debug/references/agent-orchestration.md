# Agent Orchestration — Task Parameters, Prompt Templates, and Coordination

## Table of Contents

- [Agent Spawning Protocol](#agent-spawning-protocol)
- [Step 2: agent-explore Prompt Template](#step-2-agent-explore-prompt-template)
- [Step 3: agent-docs Prompt Template](#step-3-agent-docs-prompt-template)
- [Step 4: agent-websearch Prompt Template](#step-4-agent-websearch-prompt-template)
- [Parallel Spawning](#parallel-spawning)
- [Output Processing](#output-processing)
- [Orchestrator Responsibilities](#orchestrator-responsibilities)

---

## Agent Spawning Protocol

All agents are spawned using the `Task` tool — NOT TeamCreate. meta-debug is a pipeline, not a long-lived team.

Each Task tool call uses these parameters:

```
Task(
  description: "3-5 word summary",
  prompt: "Detailed instructions with triage report + context",
  subagent_type: "agent-type"
)
```

**No `team_name` or `name` parameters** — these are one-shot subagent calls.

---

## Step 2: agent-explore Prompt Template

### Task Tool Parameters

```
Task(
  description: "Investigate {error_type} in codebase",
  prompt: <template below>,
  subagent_type: "agent-explore"
)
```

### Prompt Template

```
Investigate the following error in the codebase to find the root cause.

## Error Context
{triage_report}

## Investigation Tasks

1. **Read the error location**: Read the file(s) and line(s) referenced in the error. Understand what the code is doing at the failure point.

2. **Trace the call chain**: Follow the function calls that lead to the error. If there's a stack trace, read each frame's source location. If there's no stack trace, trace backward from the error location through callers.

3. **Map dependencies**: Identify what types, functions, and modules the failing code depends on. Check if any of these dependencies have incorrect signatures, missing implementations, or version mismatches.

4. **Check for recent changes**: If the error suggests a regression (code that used to work), use git log or git blame on the relevant files to find recent modifications.

5. **Understand architectural context**: Determine what role the failing code plays — is it a handler, middleware, model, utility, test? This context affects the fix strategy.

## Output Requirements

Return your findings with file:line references for every claim. Structure your output as:

### Error Location Analysis
[What the code does at the failure point, with file:line references]

### Call Chain
[The sequence of calls leading to the error, with file:line for each step]

### Dependencies
[Types, modules, and external crates/packages involved, with versions if visible in manifests]

### Recent Changes
[Any relevant recent modifications, or "No recent changes detected" if stable]

### Root Cause Assessment
[Your assessment of WHY the error occurs — the actual cause, not the symptom. Include confidence level: HIGH (clear evidence), MEDIUM (strong indicators), LOW (hypothesis based on partial evidence)]

### Suggested Fix Direction
[Brief description of what needs to change to fix the root cause, with specific file:line targets]
```

---

## Step 3: agent-docs Prompt Template

### Task Tool Parameters

```
Task(
  description: "Check docs for {library}",
  prompt: <template below>,
  subagent_type: "agent-docs"
)
```

### Prompt Template

```
Look up official documentation to verify correct API usage for the code involved in the following error.

## Error Context
{triage_report}

## Libraries to Check
{library_names_with_versions}

## Documentation Focus

1. **API signatures**: Look up the exact function/method signatures involved in the error. Verify parameter types, return types, and generic constraints.

2. **Breaking changes**: Check if the library version in use has any breaking changes, deprecations, or migration notes relevant to the error.

3. **Correct usage patterns**: Find official examples showing the correct way to use the APIs involved in the error. Compare against the error context to spot usage mistakes.

4. **Required setup or configuration**: Check if there are initialization steps, feature flags, or configuration requirements that must be met for the API to work correctly.

## Important
- Use the Context7 two-step protocol: resolve-library-id first, then query-docs.
- Maximum 3 Context7 calls total. Plan queries carefully.
- Focus on the specific APIs mentioned in the error — do not provide general library overviews.
- If a version is specified, prioritize version-specific documentation.

## Output Requirements

Structure your output as:

### API Verification
[Correct signatures for the APIs involved, compared against the error. Note any mismatches.]

### Breaking Changes / Migration Notes
[Any relevant version-specific changes, or "No breaking changes found for this version"]

### Correct Usage Example
[Official code example showing the correct pattern for the user's use case]

### Required Setup
[Any setup, config, or feature flags needed, or "No special setup required"]

### Documentation Assessment
[Does the error match a known documentation pattern? Is the user's code consistent with documented usage?]
```

---

## Step 4: agent-websearch Prompt Template

### Task Tool Parameters

```
Task(
  description: "Search for {error_message}",
  prompt: <template below>,
  subagent_type: "agent-websearch"
)
```

### Prompt Template

```
Search for solutions to a specific error that could not be resolved through codebase investigation and documentation alone.

## Error Details
{triage_report}

## What Has Already Been Tried
Codebase investigation and documentation lookup did not resolve this error. The following was found:
{summary_of_steps_2_3_findings}

## Search Strategy

1. **Exact error search**: Search for the exact error message in quotes, combined with the library name and version.
2. **GitHub issues**: Search for this error in the library's GitHub repository issues.
3. **Community solutions**: Search Stack Overflow and developer forums for this error with validated solutions.
4. **Known bugs**: Check if this is a documented bug with a patch, workaround, or version fix.

## Search Queries to Run
- "{exact_error_message}" {library_name}
- {library_name} {error_code_if_any} site:github.com/issues
- {error_message_keywords} {library_name} {version} fix

## Output Requirements

Structure your output as:

### Solutions Found
[Numbered list of solutions, most authoritative first. For each:
- Source (URL)
- Solution description
- Applicability: does it match the user's version and context?
- Confidence: HIGH (official fix/patch), MEDIUM (community-validated), LOW (speculative)]

### Known Bug Status
[Is this a known bug? If so: reported when, fixed in which version, workaround available?
Or: "No known bug reports found for this error."]

### Recommended Fix
[The single best solution from the findings, with justification for why it's the best match.]

### Sources
[All URLs consulted, formatted as markdown links]
```

---

## Parallel Spawning

When both Step 2 and Step 3 are active, spawn them in a SINGLE message with TWO Task tool calls:

```
[Message with two tool calls]:

Task(
  description: "Investigate {error_type} in codebase",
  prompt: <Step 2 prompt with triage report>,
  subagent_type: "agent-explore"
)

Task(
  description: "Check docs for {library}",
  prompt: <Step 3 prompt with triage report>,
  subagent_type: "agent-docs"
)
```

This ensures true parallel execution. Both agents work simultaneously and the orchestrator waits for both to complete before evaluating the decision gate.

If only one step is applicable (e.g., codebase exists but no library identified), spawn only that one.

---

## Output Processing

### Combining Agent Outputs

After all agents complete, merge their findings for Step 5:

**Evidence hierarchy** (when agents provide conflicting information):
1. Official docs (Step 3) — highest authority for API correctness
2. Codebase evidence (Step 2) — ground truth for current state
3. Web research (Step 4) — community validation and workarounds

**Deduplication:** If Steps 2 and 3 identify the same root cause, cite the more authoritative source and note confirmation from the other.

**Gap reporting:** If any step was skipped or returned empty, note this in the diagnosis. Example: "Documentation check was skipped (no library identified in the error)."

### Extracting the Root Cause

From the combined output, extract:
1. **Root cause statement** — one sentence explaining WHY the error occurs
2. **Evidence chain** — file:line references, doc references, or URLs that support the statement
3. **Fix target** — the specific file(s) and line(s) where the fix should be applied
4. **Confidence level** — HIGH, MEDIUM, or LOW based on the strength of evidence

If confidence is LOW, present the diagnosis as a hypothesis and suggest additional investigation steps the user can take.

---

## Orchestrator Responsibilities

The orchestrator (main Claude session) handles:

1. **Parse error input** — extract the error message, stack trace, or description from user input
2. **Execute Step 1 (triage)** — classify, extract signals, prepare triage report
3. **Detect codebase** — parallel Glob for manifest files
4. **Identify libraries** — from error text, import paths, and manifest files
5. **Spawn Steps 2 and/or 3** — in parallel when both applicable
6. **Wait for all active agents** — collect outputs
7. **Evaluate decision gate** — is the root cause clear? If not, spawn Step 4
8. **Execute Step 5 (fix)** — apply fix, verify, explain
9. **Report results** — present diagnosis, fix, and prevention to user

The orchestrator NEVER duplicates agent work. It does not explore the codebase, query Context7, or search the web itself. It only orchestrates, synthesizes, and applies fixes.
