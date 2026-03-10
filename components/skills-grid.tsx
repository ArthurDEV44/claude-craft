"use client";

import { useState, useMemo, useCallback } from "react";
import {
  skills,
  categoryMeta,
  GITHUB_REPO,
  type SkillCategory,
} from "@/lib/skills-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";

const categories: Array<{ value: string; label: string; count: number }> = [
  { value: "all", label: "All", count: skills.length },
  ...Object.entries(categoryMeta).map(([key, meta]) => ({
    value: key,
    label: meta.label,
    count: skills.filter((s) => s.category === key).length,
  })),
];

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.414A2 2 0 0 0 13.414 5L11 2.586A2 2 0 0 0 9.586 2H4Zm5 2.414L11.586 7H10a1 1 0 0 1-1-1V4.414ZM4 5.5A1.5 1.5 0 0 1 5.5 4h2v2a2.5 2.5 0 0 0 2.5 2.5h2v3.5a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-7Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h5.5A1.5 1.5 0 0 1 14 3.5v7a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 10.5v-7Z" />
      <path d="M3 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 3 14h6a1.5 1.5 0 0 0 1.5-1.5V12H7a3 3 0 0 1-3-3V5H3Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CopyButton({ skillName }: { skillName: string }) {
  const [copied, setCopied] = useState(false);
  const command = `npx skills add ${GITHUB_REPO} --skill ${skillName}`;

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(command).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    },
    [command],
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1 border border-home-border px-2 py-0.5 font-mono text-xs text-home-text-muted transition-colors duration-150 hover:border-home-accent/40 hover:text-home-text"
      title={command}
    >
      {copied ? (
        <>
          <CheckIcon className="size-3 text-emerald-500" />
          <span className="text-emerald-500">Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="size-3" />
          Copy install
        </>
      )}
    </button>
  );
}

export function SkillsGrid() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory =
        activeTab === "all" || skill.category === activeTab;
      const matchesSearch =
        search === "" ||
        skill.title.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase()) ||
        skill.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeTab]);

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as string)}
      >
        {/* Filter bar */}
        <div className="pb-6">
          {/* Search — prominent, full-width */}
          <div className="relative mb-6">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              size="lg"
              placeholder="Search skills..."
              className="[&_[data-slot=input]]:pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile: Select dropdown */}
          <div className="sm:hidden">
            <Select
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectPopup>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({cat.count})
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

          {/* Desktop: Underline tabs */}
          <TabsList variant="underline" className="hidden sm:flex">
            {categories.map((cat) => (
              <TabsTab key={cat.value} value={cat.value}>
                {cat.label}
                <span className="ml-1 text-muted-foreground">
                  ({cat.count})
                </span>
              </TabsTab>
            ))}
          </TabsList>
        </div>

        {/* Grid content */}
        <TabsPanel value={activeTab} className="pt-4">
          {/* Result count — shown when filtering */}
          {(search !== "" || activeTab !== "all") && filtered.length > 0 && (
            <p className="mb-6 font-mono text-xs text-home-text-muted">
              {filtered.length} of {skills.length} skills
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="py-16 text-home-text-muted">
              <p className="text-base font-medium text-home-text">
                No skills found
              </p>
              <p className="mt-1 text-sm font-light">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((skill) => {
                const meta = categoryMeta[skill.category];
                const borderClass = meta.borderColor.replace(
                  "border-t-",
                  "border-l-",
                );
                return (
                  <a
                    key={skill.name}
                    href={`${GITHUB_REPO}/tree/main/skills/${skill.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group block border-l-4 ${borderClass} py-4 pl-5 pr-4 outline-none transition-colors duration-150 hover:bg-home-surface focus-visible:ring-2 focus-visible:ring-ring`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-home-text">
                        {skill.title}
                      </p>
                      <Badge variant="outline" size="sm" className="shrink-0">
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-home-text-muted">
                      {skill.name}
                    </p>
                    <p className="mt-2 max-w-[55ch] text-sm font-light leading-relaxed text-home-text-muted line-clamp-2">
                      {skill.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-home-text-muted">
                        <FileIcon className="size-3" />
                        {skill.references}{" "}
                        {skill.references === 1 ? "ref" : "refs"}
                      </span>
                      <CopyButton skillName={skill.name} />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </TabsPanel>
      </Tabs>
    </div>
  );
}
