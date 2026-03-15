#!/usr/bin/env node

/**
 * Reads skills and agents from the skills repository and generates:
 * - lib/skills-data.ts    (knowledge skills)
 * - lib/workflows-data.ts (workflow skills + subagents)
 *
 * Classification heuristic:
 *   SKILL.md with model: or argument-hint: in frontmatter → workflow
 *   Everything else → knowledge skill
 *
 * Usage: node scripts/sync-all.mjs [path-to-skills-repo]
 *   Default: ../skills (relative to this project)
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const SKILLS_REPO = resolve(process.argv[2] || join(PROJECT_ROOT, "../skills"));

const GITHUB_REPO = "https://github.com/ArthurDEV44/skills";
const GITHUB_RAW = "https://raw.githubusercontent.com/ArthurDEV44/skills/main";

// ── Frontmatter parser ────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const raw = match[1];
  const fm = {};
  const lines = raw.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^(\w[\w-]*):\s*(.*)/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();

    // Multi-line folded scalar (key: >)
    if (val === ">" || val === "|") {
      const collected = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
        i++;
        collected.push(lines[i].trim());
      }
      fm[key] = collected.join(" ");
      continue;
    }

    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }
  return fm;
}

// ── Helpers ────────────────────────────────────────────────────────

function titleCase(name) {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function truncateDesc(desc, maxLen = 200) {
  if (!desc || desc.length <= maxLen) return desc || "";
  return desc.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

function listFilesRecursive(dir, base = "") {
  const entries = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) {
      entries.push(...listFilesRecursive(full, rel));
    } else {
      entries.push(rel);
    }
  }
  return entries;
}

function detectAgents(content) {
  const agents = [];
  if (content.includes("agent-websearch")) agents.push("agent-websearch");
  if (content.includes("agent-explore")) agents.push("agent-explore");
  if (content.includes("agent-docs")) agents.push("agent-docs");
  return agents;
}

// ── Skill categories (for knowledge skills) ────────────────────────

const CATEGORY_RULES = [
  { match: /^rust-|^async-stripe|^clerk-rs/, cat: "rust" },
  { match: /^c-best/, cat: "c" },
  { match: /^go-/, cat: "go" },
  { match: /^angular|^clerk-best|^coss-ui|^drizzle|^fumadocs|^neon-|^next-best|^primeng|^tailwind|^tanstack|^react-email/, cat: "frontend" },
  { match: /^caustics|^moebius|^painterly|^post-processing|^react-three|^retro-dithering|^tsl-|^volumetric|^web-3d/, cat: "shaders" },
  { match: /^cuda/, cat: "cuda" },
  { match: /^rag-|^python-best/, cat: "ai" },
  { match: /.*/, cat: "tools" },
];

function classifySkillCategory(name) {
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(name)) return rule.cat;
  }
  return "tools";
}

// ── Scan skills directory ──────────────────────────────────────────

const skillsDir = join(SKILLS_REPO, "skills");
const agentsDir = join(SKILLS_REPO, "agents");

const workflows = [];
const skills = [];

for (const name of readdirSync(skillsDir).sort()) {
  const skillDir = join(skillsDir, name);
  if (!statSync(skillDir).isDirectory()) continue;

  const skillFile = join(skillDir, "SKILL.md");
  let content;
  try {
    content = readFileSync(skillFile, "utf-8");
  } catch {
    continue;
  }

  const fm = parseFrontmatter(content);
  const isWorkflow = !!fm.model || !!fm["argument-hint"] || !!fm["allowed-tools"] || !!fm.context || !!fm["disable-model-invocation"];

  if (isWorkflow) {
    const files = listFilesRecursive(skillDir);
    workflows.push({
      name: fm.name || name,
      title: titleCase(fm.name || name),
      description: truncateDesc(fm.description),
      agents: detectAgents(content),
      files,
    });
  } else {
    // Count reference files
    const refsDir = join(skillDir, "references");
    let references = 0;
    try {
      references = readdirSync(refsDir).filter((f) => f.endsWith(".md")).length;
    } catch {
      // no references dir
    }

    skills.push({
      name: fm.name || name,
      title: titleCase(fm.name || name),
      description: truncateDesc(fm.description),
      category: classifySkillCategory(name),
      references,
    });
  }
}

// ── Scan agents directory ──────────────────────────────────────────

const subagents = [];

try {
  for (const file of readdirSync(agentsDir).sort()) {
    if (!file.endsWith(".md")) continue;
    const content = readFileSync(join(agentsDir, file), "utf-8");
    const fm = parseFrontmatter(content);

    // Parse tools from frontmatter
    const toolsRaw = fm.tools || fm["allowed-tools"] || "";
    const tools = toolsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    subagents.push({
      name: fm.name || file.replace(".md", ""),
      description: truncateDesc(fm.description),
      model: fm.model || "sonnet",
      tools,
    });
  }
} catch {
  console.warn("No agents directory found at", agentsDir);
}

// ── Generate workflows-data.ts ─────────────────────────────────────

const workflowsTs = `// Auto-generated by scripts/sync-all.mjs — do not edit manually.
// Source: ${SKILLS_REPO}

export const GITHUB_REPO = ${JSON.stringify(GITHUB_REPO)};
export const GITHUB_RAW = ${JSON.stringify(GITHUB_RAW)};

export interface Workflow {
  name: string;
  title: string;
  description: string;
  agents: string[];
  files: string[];
}

export interface Subagent {
  name: string;
  description: string;
  model: string;
  tools: string[];
}

export const workflows: Workflow[] = ${JSON.stringify(workflows, null, 2)};

export const subagents: Subagent[] = ${JSON.stringify(subagents, null, 2)};
`;

writeFileSync(join(PROJECT_ROOT, "lib/workflows-data.ts"), workflowsTs);
console.log(`✓ workflows-data.ts — ${workflows.length} workflows, ${subagents.length} subagents`);

// ── Generate skills-data.ts ────────────────────────────────────────

const skillCategories = [...new Set(skills.map((s) => s.category))].sort();

const skillsTs = `// Auto-generated by scripts/sync-all.mjs — do not edit manually.
// Source: ${SKILLS_REPO}

export type SkillCategory = ${skillCategories.map((c) => `"${c}"`).join(" | ")};

export interface Skill {
  name: string;
  title: string;
  description: string;
  category: SkillCategory;
  references: number;
}

export const categoryMeta: Record<
  SkillCategory,
  { label: string; color: string; borderColor: string }
> = {
  rust: { label: "Rust", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10", borderColor: "border-t-orange-500" },
  c: { label: "C", color: "text-red-600 dark:text-red-400 bg-red-500/10", borderColor: "border-t-red-500" },
  go: { label: "Go", color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10", borderColor: "border-t-cyan-500" },
  frontend: { label: "Frontend & Web", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10", borderColor: "border-t-blue-500" },
  shaders: { label: "3D Graphics & Shaders", color: "text-violet-600 dark:text-violet-400 bg-violet-500/10", borderColor: "border-t-violet-500" },
  cuda: { label: "GPU / CUDA", color: "text-lime-600 dark:text-lime-400 bg-lime-500/10", borderColor: "border-t-lime-500" },
  ai: { label: "AI & Data", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", borderColor: "border-t-emerald-500" },
  tools: { label: "Tools & Workflows", color: "text-neutral-600 dark:text-neutral-400 bg-neutral-500/10", borderColor: "border-t-neutral-500" },
};

export const skills: Skill[] = ${JSON.stringify(skills, null, 2)};

export const GITHUB_REPO = ${JSON.stringify(GITHUB_REPO)};
`;

writeFileSync(join(PROJECT_ROOT, "lib/skills-data.ts"), skillsTs);
console.log(`✓ skills-data.ts — ${skills.length} skills across ${skillCategories.length} categories`);
