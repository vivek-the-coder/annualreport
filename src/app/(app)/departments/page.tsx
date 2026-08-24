"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Search, Users } from "lucide-react";
import { EmptyState, PageHeader, ProgressBar, StatusBadge, btn, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { STATUS_META, timeAgo } from "@/lib/data";

const FILTERS = ["all", "approved", "under_review", "pending", "changes_requested"];

export default function DepartmentsPage() {
  const { data } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () =>
      data.departments.filter(
        (d) =>
          (filter === "all" || d.status === filter) &&
          (d.name.toLowerCase().includes(q.toLowerCase()) || d.head.toLowerCase().includes(q.toLowerCase()))
      ),
    [data.departments, q, filter]
  );

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${data.departments.length} departments contributing to the Annual Report 2025–26`}
        actions={<button className={btn.primary} onClick={() => alert("Invitation email sent to department head (demo).")}>Invite Department</button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            aria-label="Search departments"
            placeholder="Search departments…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
                filter === f ? "border-navy-800 bg-navy-900 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              {f === "all" ? "All" : STATUS_META[f].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No departments found" body="Try a different search term or status filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d, i) => (
            <div key={d.id} className="card card-hover animate-fade-up p-5" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-sm font-extrabold text-gold-300" aria-hidden>
                    {d.code}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold leading-tight text-navy-900">{d.name}</h2>
                    <p className="text-xs text-slate-500">{d.head}</p>
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="font-display text-base font-extrabold text-navy-900">{d.students}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Students</p>
                </div>
                <div>
                  <p className="font-display text-base font-extrabold text-navy-900">{d.faculty}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Faculty</p>
                </div>
                <div>
                  <p className="font-display text-base font-extrabold text-navy-900">{d.placementRate}%</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Placed</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={d.completion} className="h-2 flex-1" animate={false} label={`${d.name} submission ${d.completion}% complete`} />
                <span className="text-xs font-bold text-navy-700">{d.completion}%</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Users className="h-3.5 w-3.5" aria-hidden /> Updated {timeAgo(d.updatedAt)}
                </span>
                <Link href="/approvals" className="text-xs font-bold text-navy-600 hover:underline">
                  {d.status === "approved" ? "View" : "Review"} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 bg-navy-950 p-6 !text-white">
        <div className="flex items-center gap-4">
          <Building2 className="h-8 w-8 text-gold-300" aria-hidden />
          <div>
            <p className="font-display text-lg font-extrabold">2 departments haven’t started yet</p>
            <p className="text-sm text-white/60">Pharmacy and Design are yet to begin their 2025–26 submissions.</p>
          </div>
        </div>
        <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-slate-100" onClick={() => alert("Reminder sent to pending departments (demo).")}>
          Send Reminder
        </button>
      </div>
    </div>
  );
}
