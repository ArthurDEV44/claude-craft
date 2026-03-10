# Agent Protocols — How Each Agent Is Invoked

## Agent Spawning via Task Tool

All agents are spawned using the `Task` tool — NOT using TeamCreate or agent teams. meta-code is a defined pipeline, not a long-lived team collaboration.

Each Task tool call uses these parameters:

```
Task(
  description: "3-5 word summary",
  prompt: "Detailed instructions with user question + prior context",
  subagent_type: "agent-type",
  model: "sonnet"  // all subagents use sonnet for speed
)
```

**No `team_name` or `name` parameters** — these are one-shot subagent calls, not team members.

---

## Phase 1: agent-websearch

### Task Tool Parameters

```
Task(
  description: "Web research on {topic}",
  prompt: <see template below>,
  subagent_type: "agent-websearch"
)
```

### Prompt Template

```
Research the following development question thoroughly using web search.

## Question
{user_question}

## Search Strategy
- Search for current best practices, recent articles, and official guidance related to this question.
- If the question involves specific libraries or frameworks, search for their latest documentation and changelog.
- If the question involves a technique or pattern, search for real-world examples and community consensus.
- Use 2-3 complementary searches to cover different angles.
- Include the current year (2026) in searches for time-sensitive topics.

## Output Requirements
Return your findings in this exact structure:

### Key Findings
[Numbered list of 3-8 key findings, most important first]

### Libraries & Frameworks Mentioned
[List any specific libraries, frameworks, or tools that are relevant to answering the question. Include version numbers if found. Format: "- library-name (vX.Y.Z if known)"]

### Best Practices
[Specific, actionable recommendations from authoritative sources]

### Sources
[All URLs consulted, formatted as markdown links]
```

### Expected Output Structure

The orchestrator extracts from Phase 1 output:
- `key_findings`: All content under "Key Findings" header
- `libraries`: Parse library names from "Libraries & Frameworks Mentioned" section
- `best_practices`: Content under "Best Practices" header
- `sources`: URLs from "Sources" section

### Compressed Summary for Downstream Phases

Before passing to Phase 2/3, compress to:

```
## Research Context (for downstream agents)

Key findings on "{user_question}":
1. {finding_1}
2. {finding_2}
...

Relevant libraries: {lib1} {version}, {lib2} {version}
```

Target: <500 words. Strip URLs and detailed explanations. Keep only facts and library identifiers.

---

## Phase 2: agent-explore

### Codebase Detection (run by orchestrator BEFORE spawning)

Use Glob to check for project manifest files:

```
Glob: Cargo.toml
Glob: package.json
Glob: pyproject.toml
Glob: go.mod
```

Run these 4 Glob calls in parallel. If ANY returns a result, `codebase_exists = true`.

For additional detection (if all 4 return empty), check:
```
Glob: pom.xml
Glob: build.gradle
Glob: *.sln
Glob: Makefile
Glob: .git
```

### Task Tool Parameters

```
Task(
  description: "Explore codebase for {topic}",
  prompt: <see template below>,
  subagent_type: "Explore"
)
```

### Prompt Template

```
Explore the codebase in the current working directory to find code, patterns, and architecture relevant to the following question.

## Question
{user_question}

## Research Context
The following was found via web research (use this to guide what you look for):

{phase_1_compressed_summary}

## Exploration Focus
1. Find existing code that relates to the question — functions, types, modules, handlers.
2. Identify patterns and conventions the project uses that would affect how to implement or approach this.
3. Check if there's already an implementation of what's being asked about (partial or complete).
4. Note the project's architecture, relevant dependencies, and module structure.
5. Focus your exploration on areas most relevant to the question — don't do a full project scan.

## Output Requirements
Return findings with file:line references for every claim. Use the most appropriate exploration mode (Quick Scan, Deep Dive, Architecture Map, Dependency Trace, or Pattern Analysis) based on what the question requires.
```

### Expected Output

agent-explore returns structured findings with file:line references following its internal output format (varies by exploration mode). The orchestrator uses this output directly in Phase 4 synthesis.

---

## Phase 3: agent-docs

### Library Extraction (run by orchestrator AFTER Phase 1)

Parse the Phase 1 output to extract library names:

1. Read the "Libraries & Frameworks Mentioned" section from Phase 1 output.
2. If Phase 2 is also running (codebase exists), read the manifest file (Cargo.toml, package.json, etc.) to get exact version numbers.
3. Select the top 1-2 libraries most relevant to the user's question.
4. If no libraries identified from either source, skip Phase 3.

### Task Tool Parameters

```
Task(
  description: "Fetch docs for {library}",
  prompt: <see template below>,
  subagent_type: "agent-docs"
)
```

### Prompt Template

```
Look up official documentation for the following libraries to answer a specific development question.

## Question
{user_question}

## Libraries to Look Up
{library_list_with_versions}

## Context
This documentation lookup is part of a comprehensive research workflow. Web research has already found general information. Your job is to provide authoritative, version-accurate API details and code examples that web research cannot reliably provide.

Focus on:
1. Exact API signatures and types relevant to the question
2. Official code examples for the specific use case
3. Version-specific behavior, deprecations, or migration notes
4. Configuration or setup requirements

## Important
- Use the Context7 two-step protocol: resolve-library-id first, then query-docs.
- Maximum 3 Context7 calls total. Plan queries carefully.
- If a version is specified, use the versioned library ID if available.
- Do NOT repeat general information that web search would cover. Focus on precise API details and examples.
```

### Expected Output

agent-docs returns structured documentation following its output format:
- Answer (direct answer)
- Code Examples (runnable snippets)
- Key API Details (signatures, types)
- Version Notes (if applicable)
- Sources (Context7 library ID, URLs)

---

## Parallel Spawning

When both Phase 2 and Phase 3 are active, spawn them in a SINGLE message with TWO Task tool calls:

```
[Message with two tool calls]:

Task(
  description: "Explore codebase for {topic}",
  prompt: <phase 2 prompt>,
  subagent_type: "Explore"
)

Task(
  description: "Fetch docs for {library}",
  prompt: <phase 3 prompt>,
  subagent_type: "agent-docs"
)
```

This ensures true parallel execution. Both agents work simultaneously and the orchestrator waits for both to complete before proceeding to Phase 4.

If only one phase is applicable (e.g., codebase exists but no libraries identified), spawn only that one.

---

## Orchestrator Responsibilities

The orchestrator (main Claude session) handles:

1. **Receive user question** — parse intent, identify topic
2. **Spawn Phase 1** — wait for completion
3. **Process Phase 1 output** — extract findings, libraries, create compressed summary
4. **Detect codebase** — parallel Glob for manifest files
5. **Extract library list** — merge Phase 1 libraries + manifest dependencies
6. **Decide which phases to run** — based on codebase detection and library extraction
7. **Spawn Phase 2 and/or Phase 3** — in parallel when both applicable
8. **Wait for all active phases** — collect outputs
9. **Synthesize** — combine all outputs following the conflict resolution, deduplication, and grounding rules from workflow-engine.md
10. **Format and deliver** — follow the output template

The orchestrator NEVER duplicates agent work. It does not search the web, explore the codebase, or query Context7 itself. It only orchestrates and synthesizes.
