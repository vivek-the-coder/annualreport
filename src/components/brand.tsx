"use client";

import type { SVGProps } from "react";
import { cn } from "@/components/ui";

/**
 * KPGU-style crest logo. Uses three brand colours:
 *  - navy-900 for the shield
 *  - kp-red-600 for the accent (crest)
 *  - gold-500 for the seal
 * The mark is clean enough for SaaS use while still referencing the university
 * crest. Wordmark sits to the right.
 */
export function KpguLogo({
  dark = false,
  compact = false,
  withTagline = false,
}: {
  dark?: boolean;
  compact?: boolean;
  withTagline?: boolean;
}) {
  const shield = dark ? "#ffffff" : "#0B2B76";
  const crest = dark ? "#F5A623" : "#C8102E";
  const gold = "#F5A623";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative flex h-10 w-10 items-center justify-center"
        aria-hidden
      >
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          {/* shield */}
          <path
            d="M24 3 L42 9 V23 C42 34 33 42 24 45 C15 42 6 34 6 23 V9 Z"
            fill={shield}
          />
          {/* inner crest */}
          <path
            d="M24 10 L13 14 V24 C13 31 19 37 24 39 C29 37 35 31 35 24 V14 Z"
            fill={crest}
          />
          {/* globe + book accent */}
          <circle cx="24" cy="23" r="4" fill={gold} />
          <path
            d="M16 32 L24 28 L32 32 L24 36 Z"
            fill={shield}
            opacity="0.9"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-lg font-extrabold tracking-tight", dark ? "text-white" : "text-navy-900")}>
            Annual<span className={dark ? "text-gold-300" : "text-kp-red-600"}>Report</span>
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-[0.22em]", dark ? "text-white/60" : "text-slate-500")}>
            KPGU · Vadodara
          </span>
          {withTagline && (
            <span className={cn("mt-1 font-serif text-[11px] italic", dark ? "text-kp-red-200" : "text-kp-red-700")}>
              Think Global… Choose Global…
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export function KpguWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)} aria-hidden>
      <span className="flex">
        {[
          { l: "K", c: "#0B2B76" },
          { l: "P", c: "#C8102E" },
          { l: "G", c: "#F5A623" },
          { l: "U", c: "#00843D" },
        ].map((x) => (
          <span key={x.l} className="font-display text-4xl font-black leading-none" style={{ color: x.c }}>
            {x.l}
          </span>
        ))}
      </span>
    </span>
  );
}

export function CheckIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
