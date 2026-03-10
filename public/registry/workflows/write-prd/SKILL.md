---
name: write-prd
description: "Research-informed PRD generator with epics, user stories, and status tracking. Researches the domain via /meta-code pipeline before brainstorming, then asks research-backed questions grounded in real web findings — not generic LLM knowledge. Produces a complete PRD with epics, stories, acceptance criteria, quality gates, and a JSON status tracking file. Invoke with /write-prd [feature description]."
disable-model-invocation: true
argument-hint: "[feature description]"
---

# write-prd — Research-Informed PRD Generator

Write a PRD for: $ARGUMENTS

## Overview

Research-first PRD generator that breaks from the BMAD pattern of asking questions based on LLM knowledge alone. This workflow researches the domain, competitors, best practices, and technical landscape BEFORE engaging in brainstorming — so every question asked is grounded in real web findings, codebase patterns, and official documentation.

**Key differentiator:** Questions present OPTIONS discovered through research, not generic prompts. The user makes INFORMED decisions, not guesses.

**Outputs:**
1. A complete PRD with epics, user stories, and acceptance criteria (`./tasks/prd-[name].md`)
2. A JSON status tracking file for progress management (`./tasks/prd-[name]-status.json`)

## Execution Flow

```
$ARGUMENTS -> [feature description]
       |
       v
+---------------+
|  Phase 1:     |
|   INTAKE      |  <- Parse request, identify domain and scope
+-------+-------+
        |
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
|  BRAINSTORM   |  <- Research-informed Q&A with user
|  (2-5 rounds) |  <- Every question backed by web findings
+-------+-------+
        | decisions + requirements
        v
+---------------+
|  Phase 4:     |
|  STRUCTURE    |  <- Decompose into epics + stories + dependencies
+-------+-------+
        | epic/story hierarchy
        v
+---------------+
|  Phase 5:     |
|  WRITE        |  <- Generate PRD + status file
+-------+-------+
        | PRD + status.json
        v
+---------------+
|  Phase 6:     |
|  FINALIZE     |  <- User review, adjustments, save
+-------+-------+
```

## Phase-by-Phase Execution

### Phase 1 — INTAKE

Parse the user's feature description and prepare the research scope.

**1a. Parse `$ARGUMENTS`:**

Extract from the user's description:
- **Domain:** What area does this feature belong to? (auth, payments, UI, data pipeline, etc.)
- **Keywords:** Key terms for web research
- **Implied users:** Who will use this?
- **Implied scope:** Rough size estimate (small feature, full product, platform)

**1b. Detect existing codebase context:**

Run parallel Glob calls:
```
Glob: Cargo.toml
Glob: package.json
Glob: pyproject.toml
Glob: go.mod
```

Also check for existing PRDs:
```
Glob: tasks/prd-*.md
Glob: docs/prd*.md
Glob: specs/*.md
```

If existing PRDs found, read them to understand the project's PRD conventions and avoid overlap.

**1c. Prepare research questions:**

From the user's description, generate 3-5 targeted research queries:
- "{domain} best practices {year}"
- "{feature_type} implementation patterns {tech_stack}"
- "{domain} competitors comparison"
- "{feature_type} security considerations"
- "{domain} common pitfalls"

**GATE:** Domain identified, research queries prepared.

---

### Phase 2 — RESEARCH (mandatory /meta-code pipeline)

Deep research BEFORE asking a single question. This is what makes this approach superior to BMAD.

**2a. Spawn agent-websearch:**

```
Agent(
  description: "Research {domain} for PRD",
  prompt: <see references/brainstorm-protocols.md — Research prompt>,
  subagent_type: "agent-websearch"
)
```

Research focus:
1. **Competitive landscape** — What do competitors offer? What's the standard feature set?
2. **Best practices** — How do industry leaders implement this type of feature?
3. **Technical patterns** — What frameworks, libraries, and architectures are recommended?
4. **Security considerations** — What are the OWASP-relevant risks for this domain?
5. **User expectations** — What do users typically expect from this type of feature?
6. **Common pitfalls** — What mistakes do teams commonly make?

Wait for completion. Extract key findings and compress to <500 words.

**2b. Spawn agent-explore + agent-docs in parallel (if applicable):**

```
// If codebase detected:
Agent(
  description: "Explore codebase architecture",
  prompt: <see references/brainstorm-protocols.md — Explore prompt>,
  subagent_type: "agent-explore"
)

// If libraries identified from research:
Agent(
  description: "Fetch docs for {libraries}",
  prompt: <see references/brainstorm-protocols.md — Docs prompt>,
  subagent_type: "agent-docs"
)
```

Spawn both in a SINGLE message for parallel execution.

**2c. Synthesize research into a brainstorm brief:**

Organize findings into categories that will drive questions:
- **Competitive options** — "Competitor A does X, Competitor B does Y"
- **Technical trade-offs** — "Approach A is faster but less secure than Approach B"
- **Feature expectations** — "Users in this domain expect minimum: X, Y, Z"
- **Risk areas** — "Common failure modes: X, Y"
- **Existing codebase constraints** — "Current architecture supports X but not Y"

**GATE:** Research synthesis complete. Must have at least web research results.

---

### Phase 3 — BRAINSTORM (research-informed Q&A)

This is the core innovation. Every question is backed by research findings.

**3a. Present research summary first:**

Before asking any questions, present a concise research brief to the user:

```markdown
## Research Findings for "{feature description}"

### Competitive Landscape
- {Competitor A}: {what they offer, how they do it}
- {Competitor B}: {what they offer, how they do it}
- {Market gap}: {unmet need none address}

### Best Practices
- {Practice 1 from authoritative source}
- {Practice 2}

### Technical Landscape
- Recommended stack/pattern: {what research suggests}
- Alternative: {what else is used}

### Key Risks
- {Risk 1}
- {Risk 2}

### Existing Codebase
- {Relevant patterns found}
- {Constraints}

*Sources: {abbreviated source list}*
```

**3b. Round 1 — Vision & Scope (informed by competitive research):**

```
Based on our research, here's what I found about {domain}:

1. {Competitor A} offers {feature set}. {Competitor B} takes a different approach with {feature set}.
   What is YOUR vision for this feature?
   A. Match {Competitor A}'s approach — {pro}, {con}
   B. Follow {Competitor B}'s model — {pro}, {con}
   C. Hybrid approach — combine {specific elements}
   D. Something different — [describe]

2. Research shows users in this domain expect at minimum: {X, Y, Z}.
   Which of these are must-haves for YOUR users?
   A. All of them (full parity)
   B. Only {X, Y} — {Z} is out of scope for now
   C. {X} only — start minimal
   D. Different priorities — [specify]

3. The market gap our research identified is: {gap}.
   Do you want to address this gap?
   A. Yes, make it a core differentiator
   B. Nice-to-have, not core
   C. No, focus on table stakes first
```

**3c. Round 2 — Technical Decisions (informed by technical research):**

```
Based on our research, here are the technical trade-offs:

1. For {technical decision}, research recommends:
   A. {Approach A} — used by {who}, {pro from research}, {con from research}
   B. {Approach B} — recommended by {source}, {pro}, {con}
   C. {Approach C} — {description}

2. Security research found {risk}. How do you want to handle it?
   A. {Mitigation strategy 1 from research}
   B. {Mitigation strategy 2 from research}
   C. Accept the risk for MVP, address later
   D. Other

3. {If codebase exists}: Your current architecture uses {pattern}.
   A. Extend it for this feature (consistent, lower risk)
   B. Introduce {new pattern from research} (better fit but migration cost)
   C. Hybrid — use existing for {X}, new for {Y}
```

**3d. Round 3 — Prioritization & Scope (informed by best practices):**

```
Based on everything we've discussed and the research findings:

1. Using MoSCoW, how would you classify these capabilities?
   {For each discovered capability}:
   A. Must Have (MVP, blocks launch)
   B. Should Have (important, not blocking)
   C. Could Have (nice-to-have)
   D. Won't Have (explicitly out of scope)

2. Research suggests {epic decomposition}. Does this breakdown make sense?
   A. Yes, proceed with this structure
   B. Adjust — [specify changes]
   C. Different breakdown — [describe]
```

**3e. Quality Gates (MANDATORY — always ask):**

```
What quality commands must pass for every user story?
   A. pnpm typecheck && pnpm lint
   B. npm run typecheck && npm run lint
   C. cargo check && cargo clippy && cargo test
   D. Other: [specify your commands]

For UI stories, include visual verification?
   A. Yes, verify in browser
   B. No, automated tests sufficient
```

**3f. Adaptive rounds (0-2 additional rounds):**

After each round, decide:
- Answers reveal complexity → ask follow-up questions with research context
- New topic emerged → research it quickly (web search) then ask informed question
- Sufficient clarity → proceed to Phase 4

Typically 2-4 total rounds.

**3g. Devil's Advocate (before closing brainstorm):**

Surface risks and counter-arguments from research:

```
Before we finalize, our research flagged these potential issues:

1. {Risk from research}: {why it matters}
   - Are you comfortable with this risk?

2. {Common pitfall from research}: {teams that built similar features often struggled with X}
   - How do you want to mitigate this?

3. {Assumption check}: We're assuming {X}. Research suggests {counter-evidence}.
   - Should we adjust our approach?
```

**GATE:** All critical decisions made. Quality gates defined. Scope clear.

---

### Phase 4 — STRUCTURE

Decompose the brainstorm output into a formal epic/story hierarchy.

**4a. Define epics:**

From the brainstorm decisions, identify 2-6 epics. Each epic represents a major feature area:

```
EP-001: {Title} — {1-sentence description}
EP-002: {Title} — {1-sentence description}
...
```

Rules:
- Each epic should contain 2-8 stories (more than 8 → split the epic)
- Epics are ordered by implementation priority (Must Have first)
- Each epic has a clear, measurable definition of done

**4b. Decompose stories per epic:**

For each epic, apply SPIDR decomposition:
1. **Workflow steps** — break multi-step processes into individual stories
2. **Business rules** — each conditional branch is a story
3. **User types** — admin vs. user vs. guest are separate stories
4. **Happy path first** — core flow first, edge cases as follow-on stories
5. **Data type / platform splitting** — each variant is a story

Each story gets:
- `US-NNN` ID (sequential across all epics)
- Title
- Description ("As a... I want... so that...")
- Acceptance criteria (atomic, testable, `- [ ]` format)
- Priority (P0/P1/P2)
- Dependencies (blocked_by other US-NNN IDs)

**4c. Map dependencies:**

Build a dependency graph:
- Which stories must complete before others can start?
- Which stories can run in parallel?
- Are there cross-epic dependencies?

**4d. Estimate story sizes:**

| Size | Story Points | Description |
|------|-------------|-------------|
| XS | 1 | Config change, single file, straightforward |
| S | 2 | CRUD endpoint, simple component, single pattern |
| M | 3 | Feature with business logic, multiple files |
| L | 5 | Complex feature, multiple integration points |
| XL | 8 | Should probably be split further |

**GATE:** All epics defined. All stories have IDs, descriptions, criteria, priorities, and dependencies.

---

### Phase 5 — WRITE

Generate the PRD document and status tracking file.

**5a. Write the PRD:**

Follow the exact template in [references/prd-template.md](references/prd-template.md). Key sections:

1. `# PRD: {Feature Name}` — document title
2. `## Overview` — problem + solution summary
3. `## Goals` — measurable objectives
4. `## Target Users` — user personas/roles
5. `## Research Findings` — condensed research that informed decisions
6. `## Quality Gates` — commands that must pass for every story
7. `## Epics & User Stories` — hierarchical epic → story structure
8. `## Functional Requirements` — numbered FR-N requirements
9. `## Non-Functional Requirements` — performance, security, a11y
10. `## Non-Goals` — explicit out-of-scope
11. `## Files NOT to Modify` — protect existing code (if codebase exists)
12. `## Technical Considerations` — architecture decisions from brainstorm
13. `## Success Metrics` — how to measure success
14. `## Open Questions` — remaining unknowns

Wrap entire PRD in `[PRD]...[/PRD]` markers for tool parsing.

**5b. Write the status tracking file:**

Generate a JSON file at `./tasks/prd-[feature-name]-status.json`:

```json
{
  "prd": {
    "file": "tasks/prd-[feature-name].md",
    "title": "[Feature Name]",
    "created_at": "[date]",
    "status": "DRAFT"
  },
  "epics": [
    {
      "id": "EP-001",
      "title": "[Epic Title]",
      "status": "TODO",
      "priority": "P0",
      "stories_total": 4,
      "stories_done": 0
    }
  ],
  "stories": [
    {
      "id": "US-001",
      "title": "[Story Title]",
      "epic": "EP-001",
      "status": "TODO",
      "priority": "P0",
      "size": "S",
      "blocked_by": [],
      "started_at": null,
      "completed_at": null,
      "reviewed_at": null
    }
  ]
}
```

Status values: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`, `CANCELLED`

**5c. Save both files:**

```
./tasks/prd-[feature-name].md          — the PRD
./tasks/prd-[feature-name]-status.json — the status tracker
```

Create the `tasks/` directory if it doesn't exist.

**GATE:** Both files written.

---

### Phase 6 — FINALIZE

Present the PRD for user review.

**6a. Display summary:**

```markdown
## PRD Summary: {Feature Name}

**File:** `tasks/prd-{name}.md`
**Status file:** `tasks/prd-{name}-status.json`

### Epics
| ID | Title | Stories | Priority |
|----|-------|---------|----------|
| EP-001 | {title} | {n} stories | P0 |
| EP-002 | {title} | {n} stories | P1 |

### Stories Overview
| ID | Title | Epic | Priority | Size | Blocked By |
|----|-------|------|----------|------|------------|
| US-001 | {title} | EP-001 | P0 | S | — |
| US-002 | {title} | EP-001 | P0 | M | US-001 |

### Quality Gates
- {command_1}
- {command_2}

### Next Steps
- Run `/implement-story tasks/prd-{name}.md US-001` to implement the first story
- Run `/review-story tasks/prd-{name}.md` to review after implementation
```

**6b. Accept modifications:**

Ask: "Would you like to adjust anything? You can:"
- Add/remove/modify stories
- Change priorities or dependencies
- Adjust acceptance criteria
- Add technical considerations

Apply changes to both the PRD and the status JSON.

**6c. Mark as READY:**

Once the user approves, update the status file: `"status": "READY"`.

**GATE:** User approves the PRD.

---

## Hard Rules

1. Phase 2 (RESEARCH) is MANDATORY — never ask questions without research backing.
2. Every question in Phase 3 must reference a specific research finding.
3. Quality gates question is MANDATORY in Phase 3 — never skip it.
4. Story IDs use `US-NNN` format (zero-padded three digits) for compatibility with `/implement-story` and `/review-story`.
5. Epic IDs use `EP-NNN` format (zero-padded three digits).
6. PRD wrapped in `[PRD]...[/PRD]` markers — required for tool parsing.
7. Acceptance criteria use GFM task list format: `- [ ] atomic criterion`.
8. Quality gates appear ONCE in the Quality Gates section — never duplicated inside stories.
9. Status file is JSON (not YAML or Markdown) per Anthropic's recommendation.
10. Each story must be independently completable in one AI agent session.
11. Never present generic questions — every option must trace to research.
12. Files NOT to Modify section is MANDATORY if a codebase exists.

## Error Handling

- **agent-websearch fails:** Ask generic but structured questions. Note reduced quality in the PRD. Mark "Research Findings" section as incomplete.
- **agent-explore fails:** Skip codebase-specific questions. Note that technical constraints are unverified.
- **agent-docs fails:** Rely on web research for library information.
- **User gives vague answers:** Ask for clarification with specific options. Never proceed with ambiguity.
- **Too many stories (>30):** Suggest splitting into multiple PRDs or phased releases.
- **No codebase detected:** Skip codebase exploration. Focus on greenfield architecture decisions.
- **Existing PRDs found:** Read them for format consistency. Note overlap if features intersect.

## DO NOT

- Ask generic brainstorming questions without research backing — this is NOT BMAD.
- Skip research because the feature "seems simple" — even simple features benefit from competitive context.
- Present more than 5 questions per round — cognitive overload reduces answer quality.
- Make architectural decisions for the user — present researched options with trade-offs.
- Generate the PRD before brainstorming is complete — quality in = quality out.
- Duplicate quality gates inside individual stories — they live in one section only.
- Create stories that require the AI agent to make architectural decisions — those are epic-level concerns.
- Use Markdown for the status file — JSON is more reliable for AI reading/writing.
- Skip the devil's advocate phase — surfacing risks before finalizing saves rework.

## References

- [Brainstorm Protocols](references/brainstorm-protocols.md) — agent prompt templates, research-informed question patterns, progressive disclosure structure
- [PRD Template](references/prd-template.md) — the exact PRD format compatible with /implement-story and /review-story, including status file schema
