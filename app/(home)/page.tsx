import Link from 'next/link';
import { Button } from '@/components/ui/button';

const GITHUB_URL = 'https://github.com/ArthurDEV44/claude-craft';

const categories = [
  {
    title: 'PRD & Planning',
    description: 'Generate and review Product Requirements Documents',
    href: '/docs/prd-planning/ux-redesign-prd',
    items: [
      'UX Redesign PRD',
      'Design Exploration PRD',
      'GitHub Issue PRD',
      'Review PRD',
      'Implement PRD',
    ],
  },
  {
    title: 'Code Quality',
    description: 'Optimize, refactor, audit, and debug your code',
    href: '/docs/code-quality/optimize-code',
    items: ['Optimize Code', 'Refactor Code', 'Security Audit', 'Debug Error'],
  },
  {
    title: 'Design',
    description: 'Review and improve component design with professional inspiration',
    href: '/docs/design/design-review-component',
    items: ['Design Review Component'],
  },
  {
    title: 'DevOps & Migration',
    description: 'Build, deploy, rename, and migrate your stack',
    href: '/docs/devops/pull-build-deploy',
    items: ['Pull Build Deploy', 'Rename Codebase', 'Migrate Stack'],
  },
  {
    title: 'Skills',
    description: 'Create and update Claude Code skills',
    href: '/docs/skills/create-skill',
    items: ['Create Skill', 'Update Skill'],
  },
  {
    title: 'Community Skills',
    description: 'Browse 35+ ready-to-install skills for Rust, frontend, 3D, and more',
    href: '/skills',
    items: ['Rust Ecosystem', 'Frontend Frameworks', '3D & Shaders', 'Dev Tools'],
  },
];

/* Bento grid column spans — size encodes importance */
const gridSpans = [
  'col-span-12 md:col-span-7',
  'col-span-12 md:col-span-5',
  'col-span-12 sm:col-span-6 md:col-span-3',
  'col-span-12 sm:col-span-6 md:col-span-5',
  'col-span-12 sm:col-span-12 md:col-span-4',
  'col-span-12',
];

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.97 4.78a.75.75 0 0 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06l2.47-2.47H2.75A.75.75 0 0 1 2 8Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14ZM4.67 5.715a1.037 1.037 0 0 1-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032Zm.889 6.51h-1.78V6.498h1.78v5.727ZM13.11 2H2.885A.88.88 0 0 0 2 2.866v10.268a.88.88 0 0 0 .885.866h10.226a.882.882 0 0 0 .889-.866V2.865A.88.88 0 0 0 13.111 2Z" />
    </svg>
  );
}

export default function HomePage() {
  const primaryCats = categories.slice(0, 2);
  const secondaryCats = categories.slice(2, 5);
  const communityCat = categories[5];

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Hero — left-aligned, typography-driven, grain texture */}
      <section className="grain w-full px-4 pt-20 pb-24 sm:px-6 sm:pt-32 md:pb-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Prompt templates for Claude Code
          </p>
          <h1 className="mb-6 max-w-[15ch] font-extrabold leading-[0.95] tracking-[-0.04em] text-home-text text-[clamp(3rem,2rem+4vw,5.5rem)]">
            Claude Craft
          </h1>
          <p className="mb-10 max-w-[50ch] text-lg font-light leading-relaxed text-home-text-muted">
            Ship faster with ready-made prompts — PRD generation, code review,
            design audits, security scans, and more.
          </p>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-home-text-muted">
            <span>
              <span className="font-semibold text-home-text">15</span> prompts
            </span>
            <span>
              <span className="font-semibold text-home-text">6</span>{' '}
              categories
            </span>
            <span>
              <span className="font-semibold text-home-text">FR/EN</span>{' '}
              bilingual
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/docs" />}>
              Browse Prompts
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitHubIcon className="size-4" />
              GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Categories — bento grid */}
      <section className="w-full px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs font-normal tracking-[0.1em] uppercase text-home-text-muted">
            Categories
          </p>
          <h2 className="mb-12 font-extrabold tracking-[-0.02em] text-home-text text-[clamp(1.5rem,1.2rem+1.5vw,2rem)]">
            Explore by workflow
          </h2>

          <div className="grid grid-cols-12 gap-4 sm:gap-5">
            {/* Primary categories — large cards, accent left border */}
            {primaryCats.map((cat, i) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group ${gridSpans[i]} rounded-none border-l border-l-home-border p-6 outline-none transition-colors duration-150 hover:bg-home-surface focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <p className="mb-1 font-mono text-xs tracking-[0.08em] uppercase text-home-text-muted">
                  {cat.title}
                </p>
                <p className="mb-4 max-w-[45ch] text-sm font-light leading-relaxed text-home-text-muted">
                  {cat.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm border border-home-border px-2.5 py-1 font-mono text-xs text-home-text"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            ))}

            {/* Secondary categories — smaller, surface background */}
            {secondaryCats.map((cat, i) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group ${gridSpans[i + 2]} rounded-sm border border-home-border-subtle bg-home-surface p-5 outline-none transition-colors duration-150 hover:border-home-border focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <p className="mb-1 text-sm font-semibold text-home-text">
                  {cat.title}
                </p>
                <p className="mb-3 text-sm font-light text-home-text-muted">
                  {cat.description}
                </p>
                <p className="font-mono text-xs text-home-text-muted">
                  {cat.items.join(' \u00b7 ')}
                </p>
              </Link>
            ))}

            {/* Community Skills — full-width banner */}
            <Link
              href={communityCat.href}
              className="group col-span-12 flex items-center justify-between gap-4 rounded-sm border border-home-border bg-home-surface p-6 outline-none transition-colors duration-150 hover:border-home-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div>
                <p className="mb-1 text-sm font-semibold text-home-text">
                  {communityCat.title}
                </p>
                <p className="text-sm font-light text-home-text-muted">
                  {communityCat.description}
                </p>
              </div>
              <ArrowRightIcon className="size-4 shrink-0 text-home-text-muted transition-colors duration-150 group-hover:text-home-accent" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-home-border-subtle px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-home-text-muted">
            Built by Arthur Strivex
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://strivex.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-home-text-muted transition-colors duration-150 hover:text-home-text"
            >
              strivex.fr
            </a>
            <a
              href="https://github.com/ArthurDEV44"
              target="_blank"
              rel="noopener noreferrer"
              className="text-home-text-muted transition-colors duration-150 hover:text-home-text"
              aria-label="GitHub"
            >
              <GitHubIcon className="size-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/arthur-jean-strivex/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-home-text-muted transition-colors duration-150 hover:text-home-text"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="size-4" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
