# Workflow Engine — meta-code Execution Specification

## Pattern Classification

meta-code implements a **Pipeline + Fan-out/Fan-in hybrid**:
- **Pipeline**: Phase 1 (RESEARCH) must complete before Phases 2-3 start.
- **Fan-out**: Phases 2 (EXPLORE) and 3 (DOCUMENT) run in parallel.
- **Fan-in**: Phase 4 (SYNTHESIZE) aggregates all results into one response.

This matches Anthropic's "Prompt Chaining" pattern (Phase 1 → 2/3) combined with "Parallelization — Sectioning" (Phases 2 and 3 are independent subtasks).

## Execution Phases

### Phase 1: RESEARCH (agent-websearch)

**Always executes. No conditions.**

**Purpose:** Establish external context — current best practices, recent changes, ecosystem landscape, relevant articles.

**Input:** The user's question, reformulated as 1-3 web search queries.

**Query reformulation rules:**
1. Extract the core technical topic from the user's question.
2. Add specificity: include language, framework, version if mentioned.
3. Add currency: include current year for time-sensitive topics.
4. For broad questions, craft 2-3 complementary queries covering different angles.

**Output extraction — pass downstream as compressed summary (<500 words):**
- Key findings (numbered list, max 8 items)
- Library/framework names mentioned (used to trigger Phase 3)
- Version numbers found
- Best practice recommendations
- Notable URLs for citation

**Timeout:** 60 seconds. If timeout, proceed with empty research context.

---

### Phase 2: EXPLORE (agent-explore) — Conditional

**Condition:** A codebase must exist in the current working directory.

**Detection logic** (run by the orchestrator BEFORE spawning):
```
Check for any of these files in the current working directory:
- Cargo.toml
- package.json
- pyproject.toml
- go.mod
- pom.xml
- build.gradle / build.gradle.kts
- *.sln / *.csproj
- Makefile / CMakeLists.txt
- composer.json
- mix.exs
- deno.json / deno.jsonc
- .git/ (fallback — if a git repo exists, there's likely a project)
```

If NONE found: Skip Phase 2. Set `codebase_context = "No codebase detected in current directory."`.

**Input:** User's question + Phase 1 research summary (to guide what to look for in the codebase).

**Exploration focus:**
- How the user's question relates to existing code
- Relevant files, functions, types, patterns
- Current architecture and conventions that affect the answer
- Existing implementations of similar functionality

**Output:** Structured findings with file:line references, following agent-explore's output format.

**Timeout:** 90 seconds. If timeout, proceed with whatever partial results were returned.

---

### Phase 3: DOCUMENT (agent-docs) — Conditional

**Condition:** Specific libraries or frameworks must be identified from Phase 1 output or from codebase detection.

**Library extraction logic:**
1. From Phase 1 research summary: extract any library/framework names explicitly mentioned as relevant to the answer.
2. From codebase manifest (if Phase 2 also runs): extract dependency names that relate to the user's question.
3. If neither source yields library names: Skip Phase 3. Set `docs_context = "No specific library documentation needed."`.

**Max libraries per invocation:** 2 (due to the 3-call Context7 limit: 1 resolve + 1 query per library, or 1 resolve + 2 queries for one library with complex needs).

**Input:** User's question + library names + version information (from codebase if available).

**Output:** Structured documentation following agent-docs output format (Answer, Code Examples, Key API Details, Version Notes, Sources).

**Timeout:** 45 seconds. If timeout, proceed with whatever partial results were returned.

---

### Phase 4: SYNTHESIZE (orchestrator)

**Always executes last. Waits for all active phases to complete.**

**Input:** All agent outputs (Phase 1 always, Phase 2 if codebase existed, Phase 3 if libraries identified).

**Synthesis rules:**

1. **Conflict resolution priority:**
   - Official documentation (Phase 3) > Web research (Phase 1) > Codebase patterns (Phase 2)
   - Exception: if the codebase has an intentional deviation from docs (e.g., custom wrapper), note both the standard approach and the project's approach.

2. **Deduplication:**
   - If Phase 1 and Phase 3 both found the same documentation, use Phase 3's version (more structured).
   - If Phase 1 and Phase 2 both describe the same pattern, cite the codebase file:line reference (more specific).

3. **Grounding:**
   - Every claim must trace to a source (URL, file:line, or Context7 library ID).
   - If a recommendation cannot be sourced, mark it as "Based on general best practices" and do not present it as authoritative.

4. **Code examples:**
   - If Phase 2 found relevant existing code AND Phase 3 found documentation examples, present the documentation example adapted to the project's conventions (naming, error handling, module structure).
   - If only Phase 3 has examples, present them as-is with a note about adapting to project conventions.
   - If only Phase 1 has code snippets, present them with appropriate caveats about verifying correctness.

5. **Gap reporting:**
   - If a phase was skipped (no codebase, no libraries), state this explicitly in the relevant output section.
   - If a phase failed or timed out, note what was attempted and what's missing.

## Execution Flow — Decision Tree

```
START
  │
  ├─ Reformulate user question as web search queries
  │
  ├─ SPAWN Phase 1: agent-websearch
  │     └─ Wait for completion (max 60s)
  │
  ├─ EXTRACT from Phase 1 output:
  │     ├─ key_findings: string (summary, <500 words)
  │     ├─ libraries: string[] (names extracted)
  │     └─ versions: map<string, string> (library → version)
  │
  ├─ DETECT codebase: Glob for manifest files
  │     ├─ codebase_exists: bool
  │     └─ manifest_deps: string[] (dependency names from manifest)
  │
  ├─ MERGE library list: libraries ∪ (manifest_deps ∩ relevant_to_question)
  │
  ├─ DECIDE parallel phases:
  │     ├─ IF codebase_exists → spawn Phase 2
  │     ├─ IF libraries.length > 0 → spawn Phase 3
  │     └─ IF neither → skip to Phase 4 with Phase 1 results only
  │
  ├─ WAIT for all spawned phases to complete
  │
  └─ SYNTHESIZE (Phase 4) → Final response
```

## Error Handling Matrix

| Scenario | Action |
|----------|--------|
| Phase 1 returns empty | Proceed but note "Web research yielded no results." Phases 2-3 still run if conditions met. |
| Phase 1 times out | Proceed with empty research context. Note the timeout. |
| Phase 2 returns empty | Report "No relevant codebase findings." in codebase section. |
| Phase 2 times out | Use partial results if any. Note timeout. |
| Phase 3 Context7 unavailable | Report "Documentation lookup unavailable." Rely on Phase 1 web results for docs. |
| Phase 3 returns empty | Report "No documentation found for [library]." |
| Phase 3 times out | Use partial results. Note timeout. |
| All phases fail | Return Phase 1 summary (even if empty) with honest "Unable to gather comprehensive information" disclaimer. |
| Exa MCP unavailable | agent-websearch falls back to native WebSearch/WebFetch automatically. |
| Context7 resolve fails | agent-docs tries fallback plugin tools automatically. |

## Output Format

```markdown
## Answer

[Direct, actionable answer to the user's question — 3-10 sentences.
 Synthesized from all available phases. Leads with the most important finding.]

## Details

### From Web Research
[Key findings from Phase 1, organized by relevance.
 Each finding cited with source URL.
 If Phase 1 was empty/failed: "Web research did not yield relevant results."]

### From Codebase Analysis
[Relevant patterns, existing code, architecture context from Phase 2.
 Each finding cited with file:line reference.
 If skipped: "No codebase detected in current directory."
 If empty: "No codebase findings relevant to this question."]

### From Documentation
[Official API details, code examples, version notes from Phase 3.
 Each finding cited with Context7 library ID and source URL.
 If skipped: "No specific library documentation needed."
 If empty: "No documentation found for [library]."]

## Recommended Approach

[Concrete next steps, 3-7 items.
 Code examples tailored to user's context (if codebase was analyzed).
 Prioritize actionability over comprehensiveness.]

## Sources
- [Source Title](URL) — brief annotation
- file:line — what was found there
- Library: name vX.Y.Z via Context7
```

## Performance Characteristics

| Phase | Expected Duration | Parallelism |
|-------|-------------------|-------------|
| Phase 1 (RESEARCH) | 10-30s | Runs alone |
| Phase 2 (EXPLORE) | 15-60s | Parallel with Phase 3 |
| Phase 3 (DOCUMENT) | 5-20s | Parallel with Phase 2 |
| Phase 4 (SYNTHESIZE) | 5-10s | Runs alone (orchestrator) |
| **Total (best case)** | **30-70s** | |
| **Total (worst case, all phases)** | **60-120s** | |
