"use client";

import { useState, useCallback } from "react";

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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M8.75 1.75a.75.75 0 0 0-1.5 0v6.69L5.53 6.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06L8.75 8.44V1.75Z" />
      <path d="M1.5 10.75a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 0 .75.75h8.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A2.25 2.25 0 0 1 12.25 14.5h-8.5a2.25 2.25 0 0 1-2.25-2.25v-1.5Z" />
    </svg>
  );
}

const BASE_URL = "https://claude-craft-two.vercel.app";

export function InstallAllBlock() {
  const command = `curl -fsSL ${BASE_URL}/install.sh | bash`;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy();
        }
      }}
      className="mb-8 flex max-w-xl cursor-pointer items-center justify-between gap-2 border border-home-border bg-home-surface px-3 py-2.5 font-mono text-xs transition-colors duration-150 hover:border-home-accent/40 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm"
    >
      <span className="min-w-0 truncate">
        <span className="text-home-text-muted select-none">$ </span>
        <span className="text-home-text">{command}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-home-text-muted">
        {copied ? (
          <>
            <CheckIcon className="size-3.5 text-emerald-500" />
            <span className="text-emerald-500">Copied</span>
          </>
        ) : (
          <>
            <CopyIcon className="size-3.5" />
            <span>Copy</span>
          </>
        )}
      </span>
    </div>
  );
}

export function InstallButton({
  type,
  name,
}: {
  type: "workflow" | "agent";
  name: string;
}) {
  const command = `curl -fsSL ${BASE_URL}/install.sh | bash -s -- ${type} ${name}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-home-accent px-2 py-1 font-mono text-[10px] text-white transition-colors duration-150 hover:bg-home-accent-hover"
    >
      {copied ? (
        <>
          <CheckIcon className="size-3 text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <DownloadIcon className="size-3" />
          <span>Install</span>
        </>
      )}
    </button>
  );
}
