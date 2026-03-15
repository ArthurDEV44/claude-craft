import type { Metadata } from "next";
import { SkillsGrid } from "@/components/skills-grid";
import { skills, categoryMeta, GITHUB_REPO } from "@/lib/skills-data";
import { Button } from "@/components/ui/button";
import { InstallBlock } from "./install-block";

export const metadata: Metadata = {
  title: "Community Skills",
  description:
    "Browse 35+ community-built skills that extend Claude Code with specialized knowledge for Rust, frontend frameworks, 3D shaders, and more.",
};

const totalRefs = skills.reduce((acc, s) => acc + s.references, 0);

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function SkillsPage() {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Hero — left-aligned, grain texture, matching homepage editorial style */}
      <section className="grain w-full px-4 pt-20 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Open Source
          </p>
          <h1 className="mb-6 max-w-[20ch] font-extrabold leading-[0.95] tracking-[-0.04em] text-home-text text-[clamp(2.5rem,2rem+3vw,4.5rem)]">
            Community Skills
          </h1>
          <p className="mb-10 max-w-[50ch] text-lg font-light leading-relaxed text-home-text-muted">
            Extend Claude Code with specialized knowledge — curated skills for
            Rust, frontend frameworks, 3D shaders, and more.
          </p>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-home-text-muted">
            <span>
              <span className="font-semibold text-home-text">
                {skills.length}
              </span>{" "}
              skills
            </span>
            <span>
              <span className="font-semibold text-home-text">{totalRefs}</span>{" "}
              references
            </span>
            <span>
              <span className="font-semibold text-home-text">
                {Object.keys(categoryMeta).length}
              </span>{" "}
              categories
            </span>
          </div>

          {/* Install hint */}
          <InstallBlock command={`npx skills add ${GITHUB_REPO}`} />

          {/* CTA */}
          <Button
            size="lg"
            render={
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GitHubIcon className="size-4" />
            View on GitHub
          </Button>
        </div>
      </section>

      {/* Skills Grid */}
      <section className="w-full px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Browse
          </p>
          <h2 className="mb-12 font-extrabold tracking-[-0.02em] text-home-text text-[clamp(1.5rem,1.2rem+1.5vw,2rem)]">
            All Skills
          </h2>
          <SkillsGrid />
        </div>
      </section>

      {/* Footer CTA — left-aligned, editorial */}
      <footer className="w-full border-t border-home-border-subtle px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Contribute
          </p>
          <h2 className="mb-4 font-extrabold tracking-[-0.02em] text-home-text text-[clamp(1.25rem,1rem+1vw,1.75rem)]">
            Build your own skill
          </h2>
          <p className="mb-8 max-w-[50ch] text-sm font-light leading-relaxed text-home-text-muted sm:text-base">
            Skills are open source and community-driven. Create a skill to share
            specialized knowledge with Claude Code users everywhere.
          </p>
          <Button
            render={
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GitHubIcon className="size-4" />
            View on GitHub
          </Button>
        </div>
      </footer>
    </main>
  );
}
