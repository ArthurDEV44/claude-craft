# Review Protocols — Agent Prompts and Coordination

## Agent Spawning Rules

All agents are spawned using the `Agent` tool:

```
Agent(
  description: "3-5 word summary",
  prompt: "Detailed instructions",
  subagent_type: "agent-type"
)
```

**Subagent type assignments:**

| Phase | Agent | subagent_type |
|-------|-------|---------------|
| 2a | Web research | `agent-websearch` |
| 2c | Codebase exploration | `agent-explore` |
| 2c | Documentation lookup | `agent-docs` |
| 3 | Code review | `agent-explore` |
| 4 | Security audit | `agent-explore` |

Review and security agents use `agent-explore` for read-only access (no Edit/Write).

---

## Phase 2a — Research Prompt Template

```
Research best practices for reviewing an implementation of the following feature.

## Feature Context
PRD: {prd_title}
Stories in scope:
{for each story: "- {story_id}: {title} — {description}"}

Acceptance Criteria:
{all_acceptance_criteria}

## Technical Context
- Language/Framework: {detected_from_manifest}
- Project type: {detected_from_structure}

## Research Focus
1. Best practices for implementing this type of feature — what should a good implementation look like?
2. Common mistakes and anti-patterns specific to this feature type
3. Security considerations (OWASP-relevant patterns for this domain)
4. Testing best practices — what test coverage is expected?
5. Performance considerations specific to this feature type

## Search Strategy
- Search for "{feature_type} best practices {language/framework} 2025 2026"
- Search for "{feature_type} common mistakes {language/framework}"
- Search for "{feature_type} security checklist" if auth/payment/data involved
- Search for "{feature_type} testing strategy"

## Output Requirements
### Best Practices
[What a correct implementation of this feature should look like]

### Common Anti-Patterns
[Mistakes to watch for during review]

### Security Considerations
[Domain-specific security risks]

### Testing Expectations
[What tests should exist for this feature]

### Sources
[All URLs as markdown links]
```

---

## Phase 2c — Codebase Exploration Prompt Template

```
Explore the codebase to understand the implementation patterns and conventions used in this project.

## Context
We are reviewing an implementation of: {feature_description}
Changed files: {file_list}

## Research Context (from web research)
{compressed_phase_2a_output — max 500 words}

## Exploration Tasks
1. Read the changed files to understand what was implemented
2. Identify the project's established patterns:
   - Error handling conventions
   - Testing patterns (framework, structure, naming)
   - Code organization (module layout, file grouping)
   - Naming conventions
3. Find similar features already in the codebase — how were they implemented?
4. Check if the implementation follows existing conventions or deviates
5. Look for shared utilities or helpers that should have been used but weren't
6. Identify any configuration or setup the feature depends on

## Output Requirements
### Project Conventions
[Established patterns with file:line examples]

### Similar Existing Features
[How comparable features are implemented, with file:line]

### Convention Deviations
[Where the new code deviates from established patterns]

### Shared Code Opportunities
[Existing utilities that could/should be reused]
```

---

## Phase 2c — Documentation Lookup Prompt Template

```
Look up documentation for libraries used in this feature implementation.

## Feature
{feature_description}

## Libraries to Look Up
{library_list_with_versions}

## Review Focus
We're reviewing existing code, so look up:
1. Correct API signatures — is the code using APIs correctly?
2. Deprecated APIs — is anything being used that's been deprecated?
3. Best practices — does the official documentation recommend a different approach?
4. Known issues or gotchas with these specific versions

## Important
- Context7 two-step: resolve-library-id first, then query-docs
- Maximum 3 Context7 calls
- Focus on correctness verification, not general overview
```

---

## Phase 3 — Code Review Prompt Template

```
Perform a thorough code review of an existing feature implementation.

## Feature Context
PRD: {prd_title}
Stories:
{for each story: "### {story_id}: {title}\nDescription: {description}\nAcceptance Criteria:\n{criteria}"}

## Best Practices Context (from research)
{compressed_phase_2_synthesis — max 500 words}

## Files to Review
{file_list with line counts}

Read each file listed above. Then evaluate:

## Review Checklist

### 1. Acceptance Criteria Compliance
For EACH acceptance criterion listed above:
- Is it fully implemented? Cite the file:line that satisfies it.
- Is it partially implemented? What's missing?
- Is it not implemented at all?

Format:
- [PASS] {criterion} — satisfied by `file:line`
- [PARTIAL] {criterion} — {what's missing}
- [FAIL] {criterion} — not found in implementation

### 2. Correctness
- Logic errors (wrong conditions, incorrect calculations, bad comparisons)
- Off-by-one errors in loops or slicing
- Null/undefined/None handling — are all nullable values checked?
- Error paths — do all error cases return/throw correctly?
- Edge cases — empty arrays, zero values, max values, concurrent access
- Type safety — are types correct and complete?

### 3. Quality
- Naming: are variable/function names clear and descriptive?
- Readability: can a new developer understand this without extra context?
- Complexity: are functions reasonably sized? (<50 lines, single responsibility)
- DRY: are there copy-pasted code blocks that should be abstracted?
- Dead code: unused imports, unreachable branches, commented-out code?
- Debug artifacts: leftover console.log, println!, dbg!, TODO/FIXME?
- Convention adherence: does it match project patterns? (from research context)

### 4. Performance
- Unnecessary allocations in loops or hot paths
- N+1 query patterns (database access in loops)
- Blocking I/O in async contexts
- Missing memoization/caching for expensive operations
- Unbounded collections that could grow without limit
- Redundant computations

### 5. Tests
- Is there test coverage for the new functionality?
- Are edge cases tested? (empty, zero, max, error conditions)
- Are tests deterministic? (no timing deps, no random, no network)
- Do test names describe what they verify?
- Are assertions testing behavior (not implementation details)?
- Is error handling tested? (not just happy path)

### 6. Best Practices Adherence
For each best practice from the research context:
- Does the implementation follow it?
- If not, is there a good reason to deviate?

## Output Format
For each finding:

### [{Category}] {Title}
- **Severity:** MUST_FIX | SHOULD_FIX | CONSIDER | OK
- **File:** `path/to/file.ext:line`
- **Issue:** {what is wrong and why}
- **Fix:** {specific code change to resolve it}

### Acceptance Criteria Summary
{table of all criteria with PASS/PARTIAL/FAIL status}

### Review Summary
- MUST_FIX: {count}
- SHOULD_FIX: {count}
- CONSIDER: {count}
- Criteria: {passed}/{total} PASS, {partial} PARTIAL, {failed} FAIL
- **Verdict:** PASS | PASS_WITH_FIXES | FAIL
```

---

## Phase 4 — Security Audit Prompt Template

```
Perform a security audit of an existing feature implementation.

## Feature Context
{feature_description}
This feature handles: {data_types — user input, authentication, payments, file uploads, etc.}

## Files to Audit
{file_list}

Read each file thoroughly, then check for:

## Security Checklist

### 1. Injection (CWE-89, CWE-79, CWE-78, CWE-22)
- SQL injection: string concatenation/interpolation in queries
- XSS: innerHTML, dangerouslySetInnerHTML, v-html, unescaped output
- Command injection: exec(), system(), shell=True with user input
- Path traversal: user input in file paths without canonicalization
- Template injection: user input in template strings

### 2. Authentication & Authorization (CWE-284, CWE-287)
- Missing auth checks on endpoints
- Direct object reference without ownership validation
- Privilege escalation vectors
- Session handling issues
- Missing rate limiting on sensitive operations

### 3. Cryptography (CWE-327, CWE-338)
- Weak algorithms (MD5/SHA1 for passwords, DES/RC4, ECB mode)
- Math.random() or equivalent for security-sensitive values
- Hardcoded encryption keys

### 4. Secrets (CWE-798)
- Hardcoded passwords, API keys, tokens in source code
- Connection strings with embedded credentials
- Secrets in config files that shouldn't be committed

### 5. Data Handling (CWE-502, CWE-200, CWE-20)
- Insecure deserialization (pickle, yaml.load without SafeLoader)
- Sensitive data in logs, URLs, client storage
- Missing input validation at system boundaries
- PII exposure

### 6. Configuration (CWE-16, CWE-352, CWE-918)
- CORS misconfiguration (wildcard with credentials)
- Missing CSRF protection on state-changing operations
- SSRF: user-controlled URLs fetched server-side
- Debug mode in production config

### 7. AI-Generated Code Anti-Patterns
- eval() with dynamic input
- innerHTML from untrusted sources
- .unwrap() on user input (Rust)
- subprocess with shell=True (Python)
- Missing error handling on external calls

## Output Format
For each finding:

### [{SEVERITY}] {Vulnerability Title}
- **File:** `path/to/file.ext:line`
- **Type:** CWE-XXX: {name}
- **Description:** {what is wrong and why it's dangerous}
- **Remediation:**
  ```{lang}
  // Before (vulnerable)
  {code}

  // After (fixed)
  {code}
  ```

### Security Summary
- CRITICAL: {count}
- HIGH: {count}
- MEDIUM: {count}
- LOW: {count}
- INFO: {count}
- **Verdict:** PASS | PASS_WITH_FIXES | FAIL
```

---

## Parallel Spawning

### Phase 2c — Explore + Docs

When both codebase and libraries are detected, spawn in a SINGLE message:

```
Agent(
  description: "Explore codebase patterns",
  prompt: <explore template>,
  subagent_type: "agent-explore"
)

Agent(
  description: "Fetch docs for {library}",
  prompt: <docs template>,
  subagent_type: "agent-docs"
)
```

### Phases 3 + 4 — Review + Security

Always spawn both in a SINGLE message:

```
Agent(
  description: "Code review for {story/PRD}",
  prompt: <Phase 3 template>,
  subagent_type: "agent-explore"
)

Agent(
  description: "Security audit for {story/PRD}",
  prompt: <Phase 4 template>,
  subagent_type: "agent-explore"
)
```

---

## Compressed Summary Format

When passing Phase 2 output to review agents, compress to:

```markdown
## Review Context (from research)

Best practices for {feature_type}:
1. {practice_1}
2. {practice_2}
3. {practice_3}

Common anti-patterns to watch for:
- {anti_pattern_1}
- {anti_pattern_2}

Security notes: {key_security_consideration}
Correct API usage: {api_detail_from_docs}
Project conventions: {key_convention_from_explore}
```

Target: <500 words.

---

## Orchestrator Responsibilities

| Phase | Role |
|-------|------|
| 1. INTAKE | Parse PRD, map files, display scope — orchestrator handles directly |
| 2. RESEARCH | Spawn agents, compress, synthesize — orchestrator orchestrates |
| 3. REVIEW | Spawn read-only agent — orchestrator does NOT review |
| 4. SECURITY | Spawn read-only agent — orchestrator does NOT audit |
| 5. REMEDIATE | Fix issues using Edit tool — orchestrator writes code here |
| 6. SUMMARY | Compile final report — orchestrator produces deliverable |

The orchestrator writes code ONLY in Phase 5 (remediation). All other phases are either orchestration or delegation.

---

## Full PRD Mode Adaptations

When reviewing a complete PRD (no story ID specified):

**Phase 1:** Extract ALL stories. Map all changed files. Group files by likely story ownership if possible.

**Phase 2:** Research focuses on the PRD's overall feature area. One research pass covers all stories.

**Phase 3:** Review prompt includes ALL stories and ALL acceptance criteria. The agent evaluates each story independently and cross-story consistency.

**Phase 4:** Security prompt receives all changed files. One comprehensive audit.

**Phase 5:** Group fixes by story. After fixing each story's issues, run its specific quality gates.

**Phase 6:** Summary includes per-story breakdown AND overall PRD completion status.
