# PRD Template — Exact Format for /implement-story and /review-story Compatibility

## Complete PRD Template

```markdown
[PRD]
# PRD: {Feature Name}

## Overview

{2-3 paragraphs: What is this feature? What problem does it solve? Who is it for?
Include the key decisions made during brainstorming.}

## Goals

- {Measurable objective 1 — e.g., "Reduce user churn by 5% within 90 days"}
- {Measurable objective 2}
- {Measurable objective 3}

## Target Users

- **{User Role A}:** {Who they are, what they need, how they'll use this feature}
- **{User Role B}:** {Who they are, what they need}

## Research Findings

Key findings that informed this PRD:

### Competitive Context
- {Competitor A}: {what they offer, how we differ}
- {Competitor B}: {what they offer, how we differ}

### Best Practices Applied
- {Practice 1 from research that shaped our approach}
- {Practice 2}

### Risks Identified
- {Risk 1}: {how we're mitigating it}
- {Risk 2}: {how we're mitigating it}

*Full research sources available in project documentation.*

## Quality Gates

These commands must pass for every user story:
- `{command_1}` - {description}
- `{command_2}` - {description}

{For UI stories, additional gates:}
- {visual verification instruction}

## Epics & User Stories

### EP-001: {Epic Title}

{1-2 sentence epic description. What business outcome does this epic deliver?}

**Definition of Done:** {When is this epic complete?}

#### US-001: {Story Title}
**Description:** As a {user role}, I want {concrete action} so that {measurable outcome}.

**Priority:** P0
**Size:** S (2 pts)
**Dependencies:** None

**Acceptance Criteria:**
- [ ] Given {context}, when {action}, then {verifiable result}
- [ ] Given {edge case}, when {action}, then {explicit behavior}
- [ ] {Additional atomic criterion}

#### US-002: {Story Title}
**Description:** As a {user role}, I want {concrete action} so that {measurable outcome}.

**Priority:** P0
**Size:** M (3 pts)
**Dependencies:** Blocked by US-001

**Acceptance Criteria:**
- [ ] {Criterion}
- [ ] {Criterion}

---

### EP-002: {Epic Title}

{Epic description.}

**Definition of Done:** {Completion criteria}

#### US-003: {Story Title}
**Description:** As a {user role}, I want {action} so that {outcome}.

**Priority:** P1
**Size:** S (2 pts)
**Dependencies:** Blocked by US-001

**Acceptance Criteria:**
- [ ] {Criterion}
- [ ] {Criterion}

#### US-004: {Story Title}
...

---

{Continue for all epics and stories...}

## Functional Requirements

- FR-01: {The system must...}
- FR-02: {When a user..., the system must...}
- FR-03: {The system must NOT...}

## Non-Functional Requirements

- **Performance:** {Response time, throughput, latency thresholds}
- **Security:** {Auth requirements, encryption, data handling}
- **Accessibility:** {WCAG level, keyboard navigation, screen reader support}
- **Scalability:** {Expected load, growth projections}

## Non-Goals

- {What this feature explicitly will NOT do}
- {Feature that is out of scope}
- {Adjacent functionality deferred to future work}

## Files NOT to Modify

{Only include if a codebase exists. Critical for AI agents.}
- `path/to/core/infrastructure.ext` — {reason}
- `path/to/shared/config.ext` — {reason}

## Technical Considerations

- **Architecture:** {Key architectural decisions from brainstorm}
- **Data Model:** {Schema changes, new tables/collections}
- **API Design:** {New endpoints, contract changes}
- **Dependencies:** {New libraries or services needed}
- **Migration:** {Data migration needs, backward compatibility}

## Success Metrics

- {Metric 1: how measured, target value, timeframe}
- {Metric 2: how measured, target value, timeframe}

## Open Questions

- {Question 1 — who should answer, by when}
- {Question 2 — what depends on this answer}
[/PRD]
```

---

## Format Rules for Downstream Compatibility

### Story ID Format
- Stories: `US-NNN` — zero-padded three digits, sequential across all epics
- Epics: `EP-NNN` — zero-padded three digits

### Heading Hierarchy
- `#` — PRD title
- `##` — Top-level sections (Overview, Goals, User Stories, etc.)
- `###` — Epic headings within Epics & User Stories section
- `####` — Individual story headings within an epic

### Acceptance Criteria Format
- GitHub Flavored Markdown task list: `- [ ] criterion`
- One atomic, independently verifiable fact per checkbox
- Use Given/When/Then format where applicable
- Never include quality gate commands in criteria

### Quality Gates Section
- Listed once, applies to all stories
- Commands wrapped in backticks: `` `command` ``
- Followed by dash and description: `` `command` - description ``

### PRD Wrapper
- `[PRD]` on its own line before the document
- `[/PRD]` on its own line after the document
- These markers are used by ralph-tui and other parsing tools

### Story Metadata
Each story carries inline metadata:
- `**Priority:**` — P0 (must have), P1 (should have), P2 (could have)
- `**Size:**` — XS (1pt), S (2pt), M (3pt), L (5pt), XL (8pt)
- `**Dependencies:**` — "None" or "Blocked by US-NNN, US-NNN"

### File Naming
- PRD: `./tasks/prd-{feature-name-kebab-case}.md`
- Status: `./tasks/prd-{feature-name-kebab-case}-status.json`

---

## Status File Schema

```json
{
  "prd": {
    "file": "tasks/prd-{name}.md",
    "title": "{Feature Name}",
    "created_at": "{YYYY-MM-DD}",
    "status": "DRAFT | READY | IN_PROGRESS | DONE"
  },
  "epics": [
    {
      "id": "EP-001",
      "title": "{Epic Title}",
      "status": "TODO | IN_PROGRESS | DONE",
      "priority": "P0 | P1 | P2",
      "stories_total": 4,
      "stories_done": 0
    }
  ],
  "stories": [
    {
      "id": "US-001",
      "title": "{Story Title}",
      "epic": "EP-001",
      "status": "TODO | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED | CANCELLED",
      "priority": "P0 | P1 | P2",
      "size": "XS | S | M | L | XL",
      "blocked_by": [],
      "started_at": null,
      "completed_at": null,
      "reviewed_at": null
    }
  ]
}
```

### Status Transitions

```
TODO → IN_PROGRESS → IN_REVIEW → DONE
  |                      |
  └→ BLOCKED ←───────────┘
  |
  └→ CANCELLED
```

- `TODO` → `IN_PROGRESS`: when `/implement-story` starts Phase 4
- `IN_PROGRESS` → `IN_REVIEW`: when implementation passes quality gates
- `IN_REVIEW` → `DONE`: when `/review-story` Phase 5 passes (zero CRITICAL/HIGH)
- Any → `BLOCKED`: when a dependency is not met
- `BLOCKED` → `TODO`: when blocker is resolved
- Any → `CANCELLED`: manual decision

### Epic Status Roll-up

- `TODO`: no stories started
- `IN_PROGRESS`: at least one story started, not all done
- `DONE`: all stories DONE or CANCELLED

### PRD Status

- `DRAFT`: during brainstorming and writing
- `READY`: user approved, ready for implementation
- `IN_PROGRESS`: at least one story started
- `DONE`: all epics DONE

---

## Relationship to Other Skills

```
/write-prd                    → produces PRD + status.json
     |
     v
/implement-story [prd] [US-NNN]  → implements one story, updates status
     |
     v
/review-story [prd] [US-NNN?]    → reviews implementation, updates status
     |
     v
/security-review                  → standalone security audit (used within review-story)
```

The status.json file is the shared state between all skills. Each skill reads it to understand progress and updates it after completing its work.
