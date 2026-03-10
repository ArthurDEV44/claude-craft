---
name: implement-story
description: "End-to-end workflow to implement a user story from a PRD. Orchestrates 8 phases: intake, research (/meta-code pipeline), planning, implementation, code review, security audit, remediation loop, and conventional commit with push. Invoke with /implement-story [prd-path] [story-id]."
disable-model-invocation: true
argument-hint: "[prd-path] [story-id]"
---

# implement-story — PRD User Story Implementation Pipeline

Implement the following: $ARGUMENTS

## Overview

End-to-end pipeline that takes a user story from a PRD through research, implementation, review, security audit, remediation, and commit. Every phase has a gate — the pipeline only advances when the gate passes.

**Key principles:**
- Research before code — understand fully before writing a single line
- Fresh-context reviews — reviewers never see their own code
- Proof-of-fix — every issue is fixed AND verified, not just acknowledged
- Gate-based progression — no skipping phases

## Execution Flow

```
$ARGUMENTS -> [prd-path] [story-id]
       |
       v
+---------------+
|  Phase 1:     |
|   INTAKE      |  <- Parse PRD, extract user story, confirm with user
+-------+-------+
        | story + acceptance criteria
        v
+---------------+
|  Phase 2:     |
|  RESEARCH     |  <- /meta-code pipeline (websearch -> explore + docs)
|  (mandatory)  |
+-------+-------+
        | research synthesis
        v
+---------------+
|  Phase 3:     |
|    PLAN       |  <- Implementation plan from research + criteria
+-------+-------+
        | approved plan
        v
+---------------+
|  Phase 4:     |
|  IMPLEMENT    |  <- Execute plan, run tests, verify criteria
+-------+-------+
        | all criteria met
        v
+-------+-------------------+
|         PARALLEL           |
|  +----------+  +----------+|
|  | Phase 5: |  | Phase 6: ||
|  |  REVIEW  |  | SECURITY ||
|  |(quality) |  | (audit)  ||
|  +----+-----+  +----+-----+|
|       |              |      |
+-------+--------------+------+
        v              v
+-------------------------+
|      Phase 7:           |
|     REMEDIATE           |  <- Fix all issues, re-verify
|  (max 3 iterations)    |
+-----------+-------------+
            | zero CRITICAL/HIGH
            v
+-------------------------+
|      Phase 8:           |
|   COMMIT & PUSH         |  <- Conventional commit, push
+-------------------------+
```

## Phase-by-Phase Execution

### Phase 1 — INTAKE

Parse the PRD and extract the target user story.

**1a. Parse arguments:**

- If `$ARGUMENTS` contains a file path → read that file as the PRD
- If `$ARGUMENTS` contains a story ID (e.g., `US-001`, `US-1`, `#1`) → target that story
- If arguments are ambiguous → ask the user with AskUserQuestion

**1b. Read and parse the PRD:**

Read the PRD file. Extract:
- **Story title and description** ("As a..., I want..., so that...")
- **Acceptance criteria** (the checklist items under the story)
- **Quality gates** (from the PRD's Quality Gates section, if present)
- **Dependencies** (other stories this depends on, functional requirements)
- **Technical considerations** (from the PRD, if present)

**1c. Confirm with the user:**

Display the extracted story and acceptance criteria. Ask: "Is this the correct story? Proceed with implementation?"

**GATE:** User confirms the story is correct.

---

### Phase 2 — RESEARCH (mandatory /meta-code pipeline)

This phase replicates the `/meta-code` research pipeline. It is MANDATORY — never skip research.

**2a. Spawn Phase 1 of meta-code (agent-websearch):**

```
Agent(
  description: "Research for {story_title}",
  prompt: <see references/phase-protocols.md — Research prompt template>,
  subagent_type: "agent-websearch"
)
```

Wait for completion. Extract key findings, libraries mentioned, best practices.

**2b. Detect codebase and libraries:**

Run parallel Glob calls for manifest files:
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
  description: "Explore codebase for {story_title}",
  prompt: <see references/phase-protocols.md — Explore prompt template>,
  subagent_type: "agent-explore"
)

// If libraries identified:
Agent(
  description: "Fetch docs for {libraries}",
  prompt: <see references/phase-protocols.md — Docs prompt template>,
  subagent_type: "agent-docs"
)
```

Spawn both in a SINGLE message for true parallel execution.

**2d. Synthesize research:**

Combine all agent outputs following meta-code conflict resolution:
- Official docs > Web research > Codebase patterns
- Deduplicate findings
- Every claim traces to a source

**GATE:** Research synthesis is complete. At least agent-websearch returned results.

---

### Phase 3 — PLAN

Generate a detailed implementation plan from the research and acceptance criteria.

**3a. Create the plan:**

Based on Phase 2 research + Phase 1 acceptance criteria, produce:

```markdown
## Implementation Plan: {story_title}

### Files to Create/Modify
- `path/to/file.ext` — what changes and why

### Step-by-step
1. {step} — {rationale from research}
2. ...

### Test Strategy
- Unit tests: {what to test}
- Integration tests: {if applicable}

### Quality Gates
- {commands from PRD quality gates section}
- {language-specific checks: cargo clippy, eslint, etc.}

### Risk Areas
- {potential issues identified from research}
```

**3b. Present plan to user:**

Show the plan. The user can approve, modify, or reject.

**GATE:** User approves the plan (or plan is reasonable and no user interaction configured).

---

### Phase 4 — IMPLEMENT

Execute the plan step by step.

**4a. Implement each step:**

Follow the plan sequentially. For each step:
1. Read existing files before modifying
2. Make the change using Edit (prefer) or Write (new files)
3. Run quality gates after each logical group of changes

**4b. Run quality gates:**

After implementation is complete:
- Run PRD-specified quality gates (e.g., `pnpm typecheck && pnpm lint`)
- Run language-specific checks (e.g., `cargo check && cargo clippy`)
- Run tests (e.g., `cargo test`, `pnpm test`)

**4c. Verify acceptance criteria:**

Go through each acceptance criterion from Phase 1. For each one:
- Verify it is met by the implementation
- If it requires a test → confirm the test exists and passes
- If it requires visual verification → note it for the user

**GATE:** All quality gates pass. All acceptance criteria are met (or marked for manual verification).

---

### Phase 5 — CODE REVIEW (parallel with Phase 6)

Spawn a fresh-context read-only subagent for code review.

```
Agent(
  description: "Code review for {story_title}",
  prompt: <see references/phase-protocols.md — Review prompt template>,
  subagent_type: "agent-explore"
)
```

The review agent checks:
1. **Correctness** — logic errors, edge cases, off-by-one, null handling
2. **Quality** — naming, readability, complexity, DRY violations
3. **Performance** — unnecessary allocations, N+1 queries, blocking in async
4. **Tests** — coverage gaps, missing edge cases, brittle assertions
5. **Patterns** — consistency with existing codebase conventions
6. **Acceptance criteria** — does the implementation actually satisfy each criterion?

Output: Structured review report with categorized findings (MUST_FIX, SHOULD_FIX, CONSIDER, OK).

---

### Phase 6 — SECURITY REVIEW (parallel with Phase 5)

Spawn a fresh-context read-only subagent for security audit.

```
Agent(
  description: "Security audit for {story_title}",
  prompt: <see references/phase-protocols.md — Security prompt template>,
  subagent_type: "agent-explore"
)
```

The security agent follows the `/security-review` protocol:
1. Read all changed files (via `git diff --name-only`)
2. Audit against OWASP Top 10 + AI-generated code anti-patterns
3. Check for secrets, injection, auth issues, insecure crypto

Output: Structured security report with CRITICAL/HIGH/MEDIUM/LOW/INFO findings.

**Spawn Phase 5 and Phase 6 in a SINGLE message** for true parallel execution.

**GATE:** Both reviews complete.

---

### Phase 7 — REMEDIATE

Fix all issues found in Phase 5 and Phase 6.

**7a. Triage findings:**

Collect all findings from both reviews. Categorize:

| Priority | Source | Action |
|----------|--------|--------|
| CRITICAL (security) | Phase 6 | Fix immediately |
| HIGH (security) | Phase 6 | Fix immediately |
| MUST_FIX (review) | Phase 5 | Fix immediately |
| MEDIUM (security) | Phase 6 | Fix recommended |
| SHOULD_FIX (review) | Phase 5 | Fix recommended |
| LOW/INFO/CONSIDER | Phase 5+6 | Note but skip unless trivial |

**7b. Fix loop (max 3 iterations):**

For each CRITICAL/HIGH/MUST_FIX issue:
1. Apply the fix
2. Run the specific test or check that validates the fix
3. Mark as resolved

After all fixes:
1. Re-run ALL quality gates
2. Re-run a lightweight verification of the fixed areas

**7c. If issues persist after 3 iterations:**

Stop and present remaining issues to the user with:
- What was tried
- Why it didn't resolve
- Recommended manual action

**GATE:** Zero CRITICAL/HIGH/MUST_FIX issues remaining. All quality gates pass.

---

### Phase 8 — COMMIT & PUSH

Create a conventional commit and push.

**8a. Determine commit type:**

| Change Type | Prefix |
|-------------|--------|
| New feature / user story implementation | `feat` |
| Bug fix discovered during implementation | `fix` |
| Refactoring without behavior change | `refactor` |
| Tests only | `test` |
| Documentation only | `docs` |

**8b. Determine scope:**

Extract from the story title or primary area of change:
- Module name (e.g., `auth`, `api`, `ui`)
- Feature area (e.g., `cart`, `payment`, `onboarding`)

**8c. Write the commit message:**

Format:
```
type(scope): short description (imperative mood, <72 chars)

Implement {story_id}: {story_title}

Changes:
- {change_1}
- {change_2}
- {change_3}

Acceptance criteria verified:
- [x] {criterion_1}
- [x] {criterion_2}

PRD: {prd_file_path}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**8d. Stage, commit, push:**

```bash
# Stage specific files (never git add -A)
git add path/to/changed/files...

# Commit with conventional message
git commit -m "$(cat <<'EOF'
feat(scope): implement story description

...body...

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

# Push to current branch
git push
```

**GATE:** Ask user to confirm before pushing. Show the commit message and list of staged files.

---

## Hard Rules

1. Phase 2 (RESEARCH) is MANDATORY — never skip research, even for "simple" stories.
2. Phases 5 and 6 run in PARALLEL — spawn both in a single message.
3. Phase 7 has a MAX 3 ITERATIONS — escalate to user after 3 failed attempts.
4. Phase 8 requires USER CONFIRMATION before push.
5. Review agents are READ-ONLY — use `agent-explore` subagent type (no Edit/Write tools).
6. Quality gates run after Phase 4 AND after Phase 7 — both must pass.
7. Every Phase 5+6 finding that is CRITICAL/HIGH/MUST_FIX must be addressed in Phase 7.
8. Conventional commit format is non-negotiable — `type(scope): description`.
9. Never stage `.env`, credentials, or secret files.
10. Each phase documents its output before the next phase begins.
11. Agent boundaries are strict: websearch does NOT read code, explore does NOT fetch URLs, docs ONLY uses Context7.
12. Compress research output before passing to downstream phases (<500 words).

## Error Handling

- **PRD file not found:** Ask user for the correct path.
- **Story ID not found in PRD:** List available stories, ask user to pick.
- **agent-websearch fails:** Continue with codebase + docs research. Note the gap.
- **agent-explore or agent-docs fails:** Continue with available data. Note the gap.
- **Quality gates fail in Phase 4:** Fix the issues before proceeding to review.
- **All review agents fail:** Perform manual inline review as the orchestrator. Note reduced coverage.
- **Push fails:** Show error, suggest `git pull --rebase` or ask user for guidance.
- **No git repository:** Skip Phase 8 commit/push. Present changes summary instead.

## DO NOT

- Skip Phase 2 (research) for any reason — "I already know how to do this" is not acceptable.
- Start implementing before the plan is generated (Phase 3 before Phase 2).
- Run review phases sequentially when they can be parallel.
- Fix issues without re-running the specific validation that caught them.
- Push without user confirmation.
- Use `git add -A` or `git add .` — always stage specific files.
- Modify files during review phases (5 and 6) — reviews are read-only.
- Continue past 3 remediation iterations — escalate to the user.
- Invent acceptance criteria that aren't in the PRD.
- Downplay security findings to pass the gate faster.

## References

- [Phase Protocols](references/phase-protocols.md) — exact Agent tool parameters, prompt templates, and expected output formats for each phase
