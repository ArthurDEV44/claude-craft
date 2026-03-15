import type { Metadata } from "next";
import { workflows, subagents, GITHUB_REPO } from "@/lib/workflows-data";
import { InstallAllBlock, InstallButton } from "./install-button";

export const metadata: Metadata = {
  title: "Workflows & Agents",
  description:
    "Multi-agent workflows and subagents that orchestrate Claude Code for end-to-end development — from PRD generation to implementation, review, and debugging.",
};

const agentWorkflows = workflows.filter((w) => w.agents.length > 0);

export default function WorkflowsPage() {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="grain w-full px-4 pt-20 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Multi-agent orchestration
          </p>
          <h1 className="mb-6 max-w-[20ch] font-extrabold leading-[0.95] tracking-[-0.04em] text-home-text text-[clamp(2.5rem,2rem+3vw,4.5rem)]">
            Workflows & Agents
          </h1>
          <p className="mb-10 max-w-[50ch] text-lg font-light leading-relaxed text-home-text-muted">
            Multi-step pipelines that orchestrate subagents to handle complex
            development tasks end-to-end — planning, implementation, review,
            debugging, and more.
          </p>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-home-text-muted">
            <span>
              <span className="font-semibold text-home-text">
                {workflows.length}
              </span>{" "}
              workflows
            </span>
            <span>
              <span className="font-semibold text-home-text">
                {subagents.length}
              </span>{" "}
              subagents
            </span>
            <span>
              <span className="font-semibold text-home-text">
                {agentWorkflows.length}
              </span>{" "}
              use agents
            </span>
          </div>

          {/* Install all */}
          <InstallAllBlock />
        </div>
      </section>

      {/* Subagents */}
      <section className="w-full px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Foundation
          </p>
          <h2 className="mb-4 font-extrabold tracking-[-0.02em] text-home-text text-[clamp(1.5rem,1.2rem+1.5vw,2rem)]">
            Subagents
          </h2>
          <p className="mb-8 max-w-[60ch] text-sm font-light leading-relaxed text-home-text-muted">
            Specialized agents that workflows delegate to. Each runs on Sonnet
            and is strictly read-only.
          </p>

          <div className="grid gap-8 sm:grid-cols-3">
            {subagents.map((agent) => (
              <div key={agent.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-home-agent" />
                    <h3 className="font-mono text-sm font-semibold text-home-text">
                      {agent.name}
                    </h3>
                  </div>
                  <InstallButton type="agent" name={agent.name} />
                </div>
                <p className="mb-3 text-sm font-light leading-relaxed text-home-text-muted">
                  {agent.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="border border-home-border-subtle bg-white px-2 py-0.5 font-mono text-[10px] text-home-text-muted dark:bg-home-surface"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Workflows */}
      <section className="w-full px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Browse
          </p>
          <h2 className="mb-12 font-extrabold tracking-[-0.02em] text-home-text text-[clamp(1.5rem,1.2rem+1.5vw,2rem)]">
            All Workflows
          </h2>

          <div>
            {workflows.map((workflow) => (
              <a
                key={workflow.name}
                href={`${GITHUB_REPO}/tree/main/skills/${workflow.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 border-b border-b-home-border-subtle py-6 transition-colors duration-150 hover:bg-home-surface/50 last:border-b-0 sm:gap-6"
              >
                {/* File count */}
                <div className="flex w-10 shrink-0 flex-col items-center sm:w-12">
                  <span className="font-mono text-xl font-semibold leading-none text-home-text sm:text-2xl">
                    {String(workflow.files.length).padStart(2, "0")}
                  </span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-home-text-muted">
                    files
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-home-text">
                      {workflow.title}
                    </h4>
                    <InstallButton type="workflow" name={workflow.name} />
                  </div>
                  <p className="mt-1 max-w-[55ch] text-sm font-light leading-relaxed text-home-text-muted">
                    {workflow.description}
                  </p>

                  {/* Agent badges */}
                  {workflow.agents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                      {workflow.agents.map((agent) => (
                        <span
                          key={agent}
                          className="inline-flex items-center gap-1 border border-home-border-subtle bg-white px-2 py-0.5 font-mono text-[10px] text-home-text-muted dark:bg-home-surface"
                        >
                          <span className="size-1.5 rounded-full bg-home-agent" />
                          {agent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-home-border-subtle px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            How it works
          </p>
          <h2 className="mb-4 font-extrabold tracking-[-0.02em] text-home-text text-[clamp(1.25rem,1rem+1vw,1.75rem)]">
            Orchestration model
          </h2>
          <p className="max-w-[60ch] text-sm font-light leading-relaxed text-home-text-muted sm:text-base">
            Each workflow is a Claude Code skill that acts as an orchestrator.
            It delegates specialized tasks to subagents running in parallel,
            then synthesizes their outputs into a single, actionable result.
            Subagents are read-only — only the orchestrator modifies code.
          </p>
        </div>
      </footer>
    </main>
  );
}
