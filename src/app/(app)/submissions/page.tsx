"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ClipboardList, PencilLine, Search } from "lucide-react";
import { EmptyState, PageHeader, ProgressBar, StatusBadge, btn, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { SECTIONS, STATUS_META, sectionLabel, timeAgo } from "@/lib/data";

const FILTERS = ["all", "draft", "submitted", "under_review", "changes_requested", "approved"];

export default function SubmissionsPage() {
  const { user, data } = useApp();
  const isDept = user?.role === "department";
  const myDept = data.departments.find((d) => d.name === (user?.department ?? "Computer Engineering"));
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    let subs = data.submissions;
    if (isDept && myDept) subs = subs.filter((s) => s.departmentId === myDept.id);
    return subs.filter((s) => {
      const dept = data.departments.find((d) => d.id === s.departmentId);
      const text = `${dept?.name} ${sectionLabel(s.section)} ${s.submittedBy}`.toLowerCase();
      return (filter === "all" || s.status === filter) && text.includes(q.toLowerCase());
    });
  }, [data, isDept, myDept, q, filter]);

  return (
    <div>
      <PageHeader
        title={isDept ? "My Submissions" : "Submissions"}
        subtitle={
          isDept
            ? `Track every section of your ${myDept?.name} report — Annual Report 2025–26`
            : "All departmental submissions for the 2025–26 report cycle"
        }
        actions={
          isDept && (
            <Link href="/submissions/wizard" className={btn.primary}>
              Continue Submission <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )
        }
      />

      {isDept && myDept && (
        <div className="card animate-fade-up mb-6 flex flex-wrap items-center gap-6 p-5">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Overall Progress</p>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={myDept.completion} className="h-2.5 flex-1" label="Overall progress" />
              <span className="font-display text-xl font-extrabold text-navy-900">{myDept.completion}%</span>
            </div>
          </div>
          <StatusBadge status={myDept.status} />
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            aria-label="Search submissions"
            placeholder="Search submissions…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter submissions">
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

      {rows.length === 0 ? (
        <EmptyState
          title="No submissions yet."
          body="Once departments submit their information, it will appear here."
          action={
            isDept ? (
              <Link href="/submissions/wizard" className={btn.primary}>Start Submission</Link>
            ) : (
              <button className={btn.primary}>Invite Department</button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {!isDept && <th className="px-6 py-3.5">Department</th>}
                  <th className={cn("py-3.5", isDept ? "px-6" : "px-4")}>Section</th>
                  <th className="px-4 py-3.5">Completion</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted By</th>
                  <th className="px-4 py-3.5">Updated</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const dept = data.departments.find((d) => d.id === s.departmentId);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 transition hover:bg-navy-50/40">
                      {!isDept && <td className="px-6 py-3.5 font-semibold text-navy-900">{dept?.name}</td>}
                      <td className={cn("py-3.5 font-semibold text-navy-900", isDept ? "px-6" : "px-4")}>
                        {sectionLabel(s.section)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={s.completion} className="h-1.5 w-16" animate={false} label={`${s.completion}%`} />
                          <span className="text-xs font-bold text-slate-600">{s.completion}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{s.submittedBy}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{timeAgo(s.updatedAt)}</td>
                      <td className="px-6 py-3.5 text-right">
                        {isDept ? (
                          <Link href="/submissions/wizard" className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 hover:underline">
                            <PencilLine className="h-3.5 w-3.5" aria-hidden /> Edit
                          </Link>
                        ) : (
                          <Link href={`/approvals?open=${s.id}`} className="text-xs font-bold text-navy-600 hover:underline">
                            {s.status === "approved" ? "View" : "Review"}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isDept && (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <ClipboardList className="h-4 w-4" aria-hidden />
          {SECTIONS.length} standard sections keep every department’s data consistent for the final report.
        </p>
      )}
    </div>
  );
}
