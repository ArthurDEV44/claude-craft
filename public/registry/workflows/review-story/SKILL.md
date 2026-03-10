---
name: review-story
description: "End-to-end review and correction workflow for an implemented user story or a complete PRD. Orchestrates 6 phases: intake, research (/meta-code pipeline), code review, security audit, remediation loop, and summary report. Does NOT commit or push — only reviews and fixes. Invoke with /review-story [prd-path] [story-id?]."
disable-model-invocation: true
argument-hint: "[prd-path] [story-id?]"
---

# review-story — PRD Review & Correction Pipeline

Review the following: $ARGUMENTS

## Overview

Review and correction pipeline for already-implemented user stories. Takes a PRD (single story or full PRD), researches best practices, runs parallel code review + security audit, then fixes all issues found. Stops after correction — no commit or push.

**Key principles:**
- Research-informed review — understand best practices before judging code
- Fresh-context reviewers — subagents with no bias toward the code
- Fix everything — every flagged issue is corrected and re-verified
- No commit — the user controls when and how to commit

## Execution Flow

```
$ARGUMENTS -> [prd-path] [story-id?]
       |
       v
+---------------+
|  Phase 1:     |
|   INTAKE      |  <- Parse PRD, map changed files, identify review scope
+-------+-------+
        | stories + criteria + file map
        v
+---------------+
|  Phase 2:     |
|  RESEARCH     |  <- /meta-code pipeline (best practices context)
+-------+-------+
        | research synthesis
        v
+-------+-------------------+
|         PARALLEL           |
|  +----------+  +----------+|
|  | Phase 3: |  | Phase 4: ||
|  |  REVIEW  |  | SECURITY ||
|  |(quality) |  | (audit)  ||
|  +----+-----+  +----+-----+|
|       |              |      |
+-------+--------------+------+
        v              v
+-------------------------+
|      Phase 5:           |
|     REMEDIATE           |  <- Fix all issues, re-verify
|  (max 3 iterations)    |
+-----------+-------------+
            | zero CRITICAL/HIGH
            v
+-------------------------+
|      Phase 6:           |
|     SUMMARY             |  <- Final report with all findings + fixes
+-------------------------+
```

## Phase-by-Phase Execution

### Phase 1 — INTAKE

Parse the PRD and identify the review scope.

**1a. Parse arguments:**

- `$ARGUMENTS` contains a file path → read that file as the PRD
- `$ARGUMENTS` contains a story ID (e.g., `US-001`) → review only that story
- No story ID → review ALL stories in the PRD (full PRD review mode)
- If arguments are ambiguous → ask the user with AskUserQuestion

**1b. Read and parse the PRD:**

Read the PRD file. For each story in scope, extract:
- **Story title and description**
- **Acceptance criteria** (checklist items)
- **Quality gates** (from the PRD's Quality Gates section, if present)
- **Functional requirements** (from the PRD, if present)

**1c. Map changed files:**

Identify which files implement the stories. Run in order, stop at first success:

```bash
# 1. Branch diff against main (preferred)
git diff --name-only main...HEAD

# 2. Fallback: branch diff against master
git diff --name-only master...HEAD

# 3. Fallback: unstaged + staged changes
git diff --name-only HEAD && git diff --name-only --cached

# 4. Fallback: ask the user
```

If reviewing a single story, ask: "Which of these files implement {story_title}?" — or if the file list is small (<10 files), review all.

If reviewing a full PRD, review all changed files.

**1d. Read all files in scope:**

Read every file identified in 1c using the Read tool. Build a mental map of the implementation.

**1e. Display review scope:**

```
## Review Scope

**Mode:** {Single Story: US-XXX | Full PRD}
**Stories in scope:** {count}
**Files to review:** {count}

### Stories
- US-001: {title} — {status: found/not-found in changed files}
- US-002: {title} — ...

### Files
- path/to/file.ext ({lines changed})
- ...

Proceed with review?
```

**GATE:** User confirms scope (or scope is reasonable and auto-proceeds).

---

### Phase 2 — RESEARCH (mandatory /meta-code pipeline)

Research best practices to inform the review. The review is only as good as the reviewer's knowledge.

**2a. Spawn agent-websearch:**

```
Agent(
  description: "Research best practices for {feature_area}",
  prompt: <see references/review-protocols.md — Research prompt>,
  subagent_type: "agent-websearch"
)
```

Focus the research on:
- Best practices for implementing this type of feature
- Common mistakes and anti-patterns
- Security considerations specific to this feature type
- Testing best practices for this domain

Wait for completion. Extract key findings, compress to <500 words.

**2b. Detect codebase and libraries:**

```
Glob: Cargo.toml
Glob: package.json
Glob: pyproject.toml
Glob: go.mod
```

**2c. Spawn agent-explore + agent-docs in parallel:**

```
// If codebase detected:
Agent(
  description: "Explore codebase patterns for {feature_area}",
  prompt: <see references/review-protocols.md — Explore prompt>,
  subagent_type: "agent-explore"
)

// If libraries identified:
Agent(
  description: "Fetch docs for {libraries}",
  prompt: <see references/review-protocols.md — Docs prompt>,
  subagent_type: "agent-docs"
)
```

Spawn both in a SINGLE message for true parallel execution.

**2d. Synthesize research into a review brief:**

Combine all findings into a concise brief that informs Phases 3 and 4. Include:
- Best practices the implementation should follow
- Common pitfalls to check for
- Correct API usage for libraries in use
- Security considerations specific to this feature

**GATE:** Research synthesis complete.

---

### Phase 3 — CODE REVIEW (parallel with Phase 4)

Spawn a fresh-context read-only subagent for thorough code review.

```
Agent(
  description: "Code review for {story_title}",
  prompt: <see references/review-protocols.md — Code Review prompt>,
  subagent_type: "agent-explore"
)
```

The review agent checks:

**1. Acceptance Criteria Compliance**
- For each criterion: is it fully implemented?
- Are there gaps between criteria and implementation?
- Are there criteria that are only partially met?

**2. Correctness**
- Logic errors, off-by-one, incorrect conditions
- Null/undefined/None handling
- Error path coverage
- Edge cases (empty input, boundary values, concurrent access)

**3. Quality**
- Naming clarity, readability, complexity
- DRY violations (copy-pasted blocks)
- Consistency with project conventions
- Dead code, unused imports, leftover debug statements

**4. Performance**
- Unnecessary allocations, N+1 queries
- Blocking I/O in async contexts
- Memory leaks, unbounded growth
- Missing caching for expensive operations

**5. Tests**
- Coverage for new functionality
- Edge case tests
- Test determinism
- Assertion quality (testing behavior, not implementation)

**6. Best Practices (from Phase 2 research)**
- Does the implementation follow researched best practices?
- Are known anti-patterns present?
- Is API usage correct per documentation?

Output: Structured report with MUST_FIX / SHOULD_FIX / CONSIDER / OK findings.

---

### Phase 4 — SECURITY REVIEW (parallel with Phase 3)

Spawn a fresh-context read-only subagent for security audit.

```
Agent(
  description: "Security audit for {story_title}",
  prompt: <see references/review-protocols.md — Security prompt>,
  subagent_type: "agent-explore"
)
```

The security agent follows the `/security-review` protocol:
1. Read all changed files
2. Audit against OWASP Top 10 + AI-generated code anti-patterns
3. Check for secrets, injection, auth issues, insecure crypto, data handling
4. Produce severity-rated findings with code-level remediations

Output: Structured security report with CRITICAL/HIGH/MEDIUM/LOW/INFO findings.

**Spawn Phase 3 and Phase 4 in a SINGLE message** for true parallel execution.

**GATE:** Both reviews complete.

---

### Phase 5 — REMEDIATE

Fix all issues found in Phases 3 and 4.

**5a. Consolidate and triage findings:**

Merge findings from both reviews into a single prioritized list:

| Priority | Source | Action |
|----------|--------|--------|
| CRITICAL (security) | Phase 4 | Fix immediately |
| HIGH (security) | Phase 4 | Fix immediately |
| MUST_FIX (review) | Phase 3 | Fix immediately |
| MEDIUM (security) | Phase 4 | Fix recommended |
| SHOULD_FIX (review) | Phase 3 | Fix recommended |
| LOW/INFO/CONSIDER | Phase 3+4 | Fix if trivial, skip otherwise |

Display the consolidated list to the user before fixing.

**5b. Fix loop (max 3 iterations):**

**Iteration 1:** Fix all CRITICAL + HIGH + MUST_FIX issues:
1. For each issue: apply the fix using Edit tool
2. After each fix: run the specific test/check that validates it
3. After all fixes: re-run quality gates

**Iteration 2 (if needed):** Fix MEDIUM + SHOULD_FIX issues:
1. Same protocol: fix, test, verify
2. Re-run quality gates

**Iteration 3 (if needed):** Address remaining issues or re-fix regressions:
1. If new issues were introduced by fixes → fix them
2. If original issues persist → escalate to user

**After each iteration:**
- Run quality gates (PRD-specified + language-specific)
- Run tests to verify no regressions
- Check that previous fixes still hold

**5c. If issues persist after 3 iterations:**

Stop and present remaining issues to the user:
- What was tried
- Why it didn't resolve
- Recommended manual action

**GATE:** Zero CRITICAL/HIGH/MUST_FIX issues remaining. Quality gates pass.

---

### Phase 6 — SUMMARY

Produce the final review report. This is the deliverable — no commit or push.

## Output Format

```markdown
## Review Report: {PRD title or Story ID}

**Mode:** {Single Story | Full PRD}
**Files reviewed:** {count}
**Stories reviewed:** {count}

### Acceptance Criteria Status

| Story | Criterion | Status |
|-------|-----------|--------|
| US-001 | {criterion_1} | PASS / FAIL / PARTIAL |
| US-001 | {criterion_2} | PASS / FAIL / PARTIAL |
| ... | ... | ... |

### Findings Summary

| Category | CRITICAL | HIGH | MEDIUM | LOW | INFO |
|----------|----------|------|--------|-----|------|
| Code Review | {n} | {n} | {n} | {n} | {n} |
| Security | {n} | {n} | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** |

### Issues Fixed

| ID | Severity | Description | File | Fix Applied |
|----|----------|-------------|------|-------------|
| C-1 | CRITICAL | {desc} | `file:line` | {what was changed} |
| H-1 | HIGH | {desc} | `file:line` | {what was changed} |
| ... | ... | ... | ... | ... |

### Remaining Issues (if any)

| ID | Severity | Description | Reason Not Fixed |
|----|----------|-------------|------------------|
| ... | ... | ... | {why} |

### Quality Gate Results

- {gate_1}: PASS / FAIL
- {gate_2}: PASS / FAIL

### Research Insights Applied

- {insight_1 from Phase 2 that influenced a fix}
- {insight_2}

### Recommendations

- {recommendation_1 — future improvement, not a blocking issue}
- {recommendation_2}

---
**Verdict:** {ALL_CLEAR | ISSUES_REMAINING}
**Changes ready to commit:** {Yes — review `git diff` | No — see remaining issues}
```

---

## Full PRD Mode

When no story ID is provided, review the entire PRD:

**Phase 1 adapts:** Extract ALL stories, map ALL changed files.

**Phase 2 adapts:** Research focuses on the feature area of the entire PRD, not a single story.

**Phases 3-4 adapt:** Review agents receive ALL stories and ALL acceptance criteria. They evaluate completeness across the full PRD scope.

**Phase 5 adapts:** Fixes may span multiple stories. Group fixes by story for clarity.

**Phase 6 adapts:** Summary includes per-story status and an overall PRD completion assessment.

---

## Hard Rules

1. Phase 2 (RESEARCH) is MANDATORY — never review without best-practices context.
2. Phases 3 and 4 run in PARALLEL — spawn both in a single message.
3. Phase 5 has a MAX 3 ITERATIONS — escalate to user after 3 failed fix attempts.
4. Review agents are READ-ONLY — use `agent-explore` (no Edit/Write tools).
5. NEVER commit or push — this workflow stops after correction.
6. Quality gates run after EVERY fix iteration in Phase 5.
7. Every finding must have file:line, severity, and specific remediation.
8. Acceptance criteria are checked explicitly — not assumed to pass.
9. Agent boundaries are strict: websearch does NOT read code, explore does NOT fetch URLs.
10. Compress research output before passing to review agents (<500 words).
11. In full PRD mode, review ALL stories — do not skip stories that "look fine."

## Error Handling

- **PRD file not found:** Ask user for the correct path.
- **Story ID not found in PRD:** List available stories, ask user to pick.
- **No changed files detected:** Ask user which files to review, or offer to review the whole project.
- **agent-websearch fails:** Continue with codebase + docs research. Note the gap.
- **agent-explore or agent-docs fails:** Continue with available data. Note the gap.
- **Quality gates fail after all fix iterations:** Report remaining failures in Phase 6 summary.
- **No git repository:** Ask user for file list to review. Skip git-based file detection.

## DO NOT

- Skip Phase 2 (research) — uninformed reviews miss domain-specific issues.
- Run review phases sequentially when they can be parallel.
- Commit or push changes — the user explicitly controls this.
- Fix issues without re-running the specific validation that caught them.
- Modify files during review phases (3 and 4) — reviews are read-only.
- Continue past 3 fix iterations — escalate to the user.
- Report style issues as security findings (or vice versa).
- Assume acceptance criteria pass without explicit verification.
- Skip stories in full PRD mode because they "look fine."
- Invent findings to justify the review — if code is clean, say so.

## References

- [Review Protocols](references/review-protocols.md) — exact Agent tool parameters, prompt templates, and expected output formats for each phase
