"use client";

import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { KpguLogo } from "@/components/brand";
import { STATUS_META } from "@/lib/data";

export function cn(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return <KpguLogo dark={dark} compact={compact} />;
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        meta.badge,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
  barClassName,
  animate = true,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  animate?: boolean;
  label?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${value}% complete`}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-navy-600",
          animate && "animate-progress",
          barClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "navy",
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "navy" | "emerald" | "amber" | "blue";
  delay?: number;
}) {
  const accents = {
    navy: "bg-navy-50 text-navy-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div
      className="card card-hover animate-fade-up p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="font-display mt-1.5 text-2xl font-extrabold leading-none text-navy-900 sm:text-[28px]">
            {value}
          </p>
        </div>
        {icon && (
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accents[accent])} aria-hidden>
            {icon}
          </span>
        )}
      </div>
      {sub && <div className="mt-3 text-xs font-medium text-slate-500">{sub}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400" aria-hidden>
        <Inbox className="h-7 w-7" />
      </span>
      <h3 className="font-display mt-4 text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[22px] font-extrabold tracking-tight text-navy-900 sm:text-2xl md:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&_a]:w-full [&_a]:sm:w-auto [&_button]:w-full [&_button]:sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

/** Scrollable table shell — keeps wide tables usable on phones without breaking layout. */
export function TableScroll({ children, label = "Scroll horizontally to see more columns" }: { children: ReactNode; label?: string }) {
  return (
    <div className="scroll-x scroll-x-fade relative" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-navy-800 active:scale-[0.98]",
  danger:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50",
  success:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50",
};

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
