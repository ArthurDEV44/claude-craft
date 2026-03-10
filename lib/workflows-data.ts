export type WorkflowCategory =
  | "planning"
  | "implementation"
  | "quality"
  | "research"
  | "creation";

export interface Workflow {
  name: string;
  title: string;
  description: string;
  category: WorkflowCategory;
  phases: number;
  steps: string[];
  agents: string[];
}

export interface Subagent {
  name: string;
  title: string;
  description: string;
  model: string;
  tools: string[];
}

export const categoryMeta: Record<
  WorkflowCategory,
  { label: string; textColor: string; borderColor: string }
> = {
  planning: {
    label: "Planning & PRD",
    textColor: "text-cat-planning",
    borderColor: "border-l-cat-planning",
  },
  implementation: {
    label: "Implementation",
    textColor: "text-cat-implementation",
    borderColor: "border-l-cat-implementation",
  },
  quality: {
    label: "Quality & Review",
    textColor: "text-cat-quality",
    borderColor: "border-l-cat-quality",
  },
  research: {
    label: "Research & Debug",
    textColor: "text-cat-research",
    borderColor: "border-l-cat-research",
  },
  creation: {
    label: "Creation & Tools",
    textColor: "text-cat-creation",
    borderColor: "border-l-cat-creation",
  },
};

export const workflows: Workflow[] = [
  // ── Planning & PRD ────────────────────────────────────
  {
    name: "build-saas",
    title: "Build SaaS",
    description:
      "End-to-end SaaS creation from idea to PRD. Researches via /meta-code, brainstorms with research-backed questions, validates the concept, defines architecture, and generates a complete PRD.",
    category: "planning",
    phases: 7,
    steps: [
      "Intake",
      "Research (/meta-code)",
      "Brainstorm (3-5 rounds)",
      "Validate",
      "Architecture",
      "Write PRD",
      "Finalize",
    ],
    agents: ["agent-websearch", "agent-explore", "agent-docs"],
  },
  {
    name: "write-prd",
    title: "Write PRD",
    description:
      "Research-informed PRD generator. Researches the domain via /meta-code before brainstorming, then asks research-backed questions. Produces epics, stories, acceptance criteria, and quality gates.",
    category: "planning",
    phases: 6,
    steps: [
      "Intake",
      "Research (/meta-code)",
      "Brainstorm",
      "Structure (epics & stories)",
      "Write PRD + status.json",
      "Finalize",
    ],
    agents: ["agent-websearch", "agent-explore", "agent-docs"],
  },
  {
    name: "ralph-tui-prd",
    title: "Ralph TUI PRD",
    description:
      "Generates PRDs optimized for ralph-tui task orchestration. Interactive Q&A with lettered options, creates user stories that can be converted to beads issues or prd.json.",
    category: "planning",
    phases: 2,
    steps: ["Clarifying questions (2-4 rounds)", "Generate PRD"],
    agents: [],
  },

  // ── Implementation ────────────────────────────────────
  {
    name: "implement-story",
    title: "Implement Story",
    description:
      "End-to-end workflow to implement a user story from a PRD. Orchestrates research, planning, implementation, code review, security audit, remediation loop, and conventional commit.",
    category: "implementation",
    phases: 8,
    steps: [
      "Intake",
      "Research (/meta-code)",
      "Plan",
      "Implement",
      "Code review (agent-explore)",
      "Security review (agent-explore)",
      "Remediate (max 3 iterations)",
      "Commit & push",
    ],
    agents: ["agent-websearch", "agent-explore", "agent-docs"],
  },
  {
    name: "frontend-design",
    title: "Frontend Design",
    description:
      "Creates distinctive, production-grade frontend interfaces with the intentionality of a senior human web designer. Rejects generic AI aesthetics. Uses /meta-code for design trend research.",
    category: "implementation",
    phases: 5,
    steps: [
      "Research (agent-websearch)",
      "Understand codebase & product",
      "Propose direction (user gate)",
      "Implement",
      "Self-review & user review",
    ],
    agents: ["agent-websearch"],
  },
  {
    name: "refactor",
    title: "Refactor",
    description:
      "Multi-agent refactoring that analyzes, plans, executes, simplifies, and validates code improvements. Covers SOLID principles, performance, Lighthouse scores, dead code, and legacy cleanup.",
    category: "implementation",
    phases: 7,
    steps: [
      "Scope & baseline metrics",
      "Self-analysis (9 categories)",
      "Explore + research (parallel)",
      "Plan (P0-P3 priority)",
      "Execute (one change set at a time)",
      "Simplify (/simplify)",
      "Validate & compare metrics",
    ],
    agents: ["agent-explore", "agent-websearch", "agent-docs"],
  },

  // ── Quality & Review ──────────────────────────────────
  {
    name: "review-story",
    title: "Review Story",
    description:
      "End-to-end review and correction for an implemented user story or complete PRD. Code review, security audit, remediation loop, and structured summary report. Does NOT commit.",
    category: "quality",
    phases: 6,
    steps: [
      "Intake & scope mapping",
      "Research (/meta-code)",
      "Code review (agent-explore)",
      "Security review (agent-explore)",
      "Remediate (max 3 iterations)",
      "Summary report",
    ],
    agents: ["agent-websearch", "agent-explore", "agent-docs"],
  },
  {
    name: "security-review",
    title: "Security Review",
    description:
      "Comprehensive security audit for OWASP Top 10 vulnerabilities, injection flaws, authentication issues, secrets exposure, and insecure patterns. Structured report with severity ratings.",
    category: "quality",
    phases: 3,
    steps: [
      "Scope & classify files",
      "Audit (8 categories)",
      "Report with before/after code",
    ],
    agents: [],
  },

  // ── Research & Debug ──────────────────────────────────
  {
    name: "meta-code",
    title: "Meta Code",
    description:
      "Intelligent multi-agent pipeline that answers development questions by orchestrating web research, codebase exploration, and documentation lookup. Synthesizes outputs with source citations.",
    category: "research",
    phases: 4,
    steps: [
      "Research (agent-websearch)",
      "Explore (agent-explore)",
      "Document (agent-docs)",
      "Synthesize (conflict resolution)",
    ],
    agents: ["agent-websearch", "agent-explore", "agent-docs"],
  },
  {
    name: "meta-debug",
    title: "Meta Debug",
    description:
      "Multi-agent debugging that diagnoses and fixes errors with surgical precision. Triage, investigate root cause, verify against official docs, research community solutions, and fix.",
    category: "research",
    phases: 5,
    steps: [
      "Triage & classify error",
      "Investigate (agent-explore)",
      "Verify docs (agent-docs)",
      "Research (agent-websearch, conditional)",
      "Fix & verify",
    ],
    agents: ["agent-explore", "agent-docs", "agent-websearch"],
  },
  {
    name: "meta-prompt",
    title: "Meta Prompt",
    description:
      "Generates ultra-optimized prompts for Claude Code using the SPARC framework. Two modes: TRANSFORM (rewrites an existing prompt) and GENERATE (creates from scratch).",
    category: "research",
    phases: 4,
    steps: [
      "Analyze request",
      "Apply SPARC framework",
      "Write optimized prompt",
      "Deliver + explain techniques",
    ],
    agents: [],
  },

  // ── Creation & Tools ──────────────────────────────────
  {
    name: "skill-creator",
    title: "Skill Creator",
    description:
      "Interactive guide for creating or updating Claude Code skills. Walks through use case definition, frontmatter, instruction writing, progressive disclosure, and validation.",
    category: "creation",
    phases: 6,
    steps: [
      "Define use cases",
      "Plan skill contents",
      "Initialize template",
      "Write skill (frontmatter + body)",
      "Validate & package",
      "Test & iterate",
    ],
    agents: [],
  },
  {
    name: "extract-catalog",
    title: "Extract Catalog",
    description:
      "Extracts product metadata from supplier catalog PDFs and outputs structured JSON aligned with a hybrid DB schema. Schema-driven, supports tiles, sanitary ware, furniture, and more.",
    category: "creation",
    phases: 4,
    steps: [
      "Schema discovery",
      "Product-by-product extraction",
      "Global validation",
      "Write output & seed DB",
    ],
    agents: [],
  },
];

export const subagents: Subagent[] = [
  {
    name: "agent-docs",
    title: "Agent Docs",
    description:
      "Ultra-specialized documentation lookup powered by Context7 MCP. Resolves library IDs and queries up-to-date, version-accurate documentation and code examples for any library or framework.",
    model: "sonnet",
    tools: [
      "Context7 (resolve-library-id, query-docs)",
      "Read",
      "Grep",
      "Glob",
    ],
  },
  {
    name: "agent-explore",
    title: "Agent Explore",
    description:
      "Elite codebase exploration and analysis. Systematically maps architecture, traces execution flows, analyzes patterns, and builds deep understanding of any codebase. 5 modes: Quick Scan, Deep Dive, Architecture Map, Dependency Trace, Pattern Analysis.",
    model: "sonnet",
    tools: ["Read", "Grep", "Glob", "Bash (read-only)"],
  },
  {
    name: "agent-websearch",
    title: "Agent Websearch",
    description:
      "Expert web research that finds, validates, and synthesizes information. Uses Exa MCP tools for high-quality results with automatic fallback to native WebSearch/WebFetch.",
    model: "sonnet",
    tools: [
      "Exa (web_search, code_context, company_research)",
      "WebFetch",
      "WebSearch (fallback)",
      "Read",
      "Grep",
      "Glob",
    ],
  },
];
