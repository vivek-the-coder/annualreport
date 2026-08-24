"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileEdit,
  Gauge,
  Layers,
  PencilLine,
  Sparkles,
} from "lucide-react";
import {
  EmptyState,
  KpiCard,
  PageHeader,
  ProgressBar,
  StatusBadge,
  btn,
  cn,
} from "@/components/ui";
import { useApp } from "@/lib/store";
import {
  INSTITUTE,
  ROLE_LABEL,
  SECTIONS,
  sectionLabel,
  timeAgo,
  type Role,
} from "@/lib/data";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const MILESTONES = [
  { label: "Data Collection", state: "done" },
  { label: "Department Review", state: "done" },
  { label: "Admin Approval", state: "active" },
  { label: "Report Generation", state: "todo" },
  { label: "Publication", state: "todo" },
];

export default function DashboardPage() {
  const { user, data, dataLoaded } = useApp();
  const role = (user?.role ?? "admin") as Role;

  const overall = useMemo(() => {
    if (!data.departments.length) return 82;
    return Math.round(data.departments.reduce((a, d) => a + d.completion, 0) / data.departments.length);
  }, [data.departments]);

  const pendingReviews = data.submissions.filter((s) => ["submitted", "under_review"].includes(s.status)).length;
  const approvedSections = data.submissions.filter((s) => s.status === "approved").length;
  const submittedDepts = data.departments.filter((d) => d.completion >= 90).length;

  const myDept = data.departments.find((d) => d.name === (user?.department ?? "Computer Engineering"));
  const mySubs = data.submissions.filter((s) => s.departmentId === myDept?.id);

  if (!dataLoaded) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading dashboard">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-28 animate-pulse bg-slate-100/60" />
        ))}
      </div>
    );
  }

  /* ------------------------------ DEPARTMENT ------------------------------ */
  if (role === "department") {
    const deptCompletion = mySubs.length
      ? Math.round(mySubs.reduce((a, s) => a + s.completion, 0) / mySubs.length)
      : 0;
    return (
      <div>
        <PageHeader
          title={`${myDept?.name ?? "Department"} Department`}
          subtitle={`Annual Report ${INSTITUTE.year} · ${greeting()}, ${user?.name}`}
          actions={
            <Link href="/submissions/wizard" className={btn.primary}>
              Continue Submission <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />

        <div className="card animate-fade-up mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Submission Progress</p>
              <p className="font-display mt-1 text-4xl font-extrabold text-navy-900">{deptCompletion}%</p>
            </div>
            <StatusBadge status={myDept?.status ?? "pending"} />
          </div>
          <ProgressBar value={deptCompletion} className="mt-4 h-3" label="Department submission progress" />
          <p className="mt-3 text-xs text-slate-500">
            {mySubs.filter((s) => s.status === "approved").length} of {SECTIONS.length} sections approved ·{" "}
            {mySubs.filter((s) => s.status === "changes_requested").length} awaiting your changes
          </p>
        </div>

        <h2 className="font-display mb-4 text-lg font-bold text-navy-900">Report Sections</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map((sec, i) => {
            const sub = mySubs.find((s) => s.section === sec.key);
            const completion = sub?.completion ?? 0;
            const status = sub?.status ?? "pending";
            return (
              <div key={sec.key} className="card card-hover animate-fade-up flex flex-col p-5" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-navy-900">{sec.label}</h3>
                  <StatusBadge status={status} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{sec.desc}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={completion} className="h-1.5 flex-1" animate={false} label={`${sec.label} ${completion}% complete`} />
                  <span className="text-xs font-bold text-navy-700">{completion}%</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {sub ? timeAgo(sub.updatedAt) : "Not started"}
                  </span>
                  <Link href="/submissions/wizard" className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 hover:text-navy-800">
                    <PencilLine className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* --------------------------- ADMIN / COORDINATOR --------------------------- */
  const isAdmin = role === "admin";
  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${isAdmin ? "Administrator" : "Coordinator"}`}
        subtitle={`Here’s the current progress of the ${INSTITUTE.year} Annual Report.`}
        actions={
          isAdmin ? (
            <Link href="/report-builder" className={btn.primary}>
              <FileEdit className="h-4 w-4" aria-hidden /> Open Report Builder
            </Link>
          ) : (
            <Link href="/approvals" className={btn.primary}>
              <ClipboardCheck className="h-4 w-4" aria-hidden /> Review Queue ({pendingReviews})
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Overall Completion" value={`${overall}%`} icon={<Gauge className="h-5 w-5" />} accent="navy" sub={<ProgressBar value={overall} className="h-1.5" label="Overall completion" />} />
        <KpiCard label="Departments Submitted" value={`${submittedDepts} / ${data.departments.length}`} icon={<Building2 className="h-5 w-5" />} accent="blue" sub={`${data.departments.length - submittedDepts} still collecting data`} delay={70} />
        <KpiCard label="Pending Reviews" value={String(pendingReviews)} icon={<Clock className="h-5 w-5" />} accent="amber" sub="Awaiting coordinator action" delay={140} />
        <KpiCard label="Approved Sections" value={String(approvedSections)} icon={<CheckCircle2 className="h-5 w-5" />} accent="emerald" sub="Across all departments" delay={210} />
      </div>

      {/* Progress + milestones */}
      <div className="card animate-fade-up delay-150 mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-navy-900">Annual Report Progress</h2>
          <span className="text-sm font-bold text-navy-700">{overall}% Complete</span>
        </div>
        <ProgressBar value={overall} className="mt-4 h-3.5" barClassName="bg-gradient-to-r from-navy-800 to-navy-500" label="Annual report progress" />
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4" aria-label="Report milestones">
          {MILESTONES.map((m) => (
            <li key={m.label} className="flex items-center gap-2.5 lg:flex-col lg:text-center">
              <span
                aria-hidden
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold",
                  m.state === "done" && "border-emerald-500 bg-emerald-500 text-white",
                  m.state === "active" && "animate-pulse-dot border-navy-600 bg-navy-50 text-navy-700",
                  m.state === "todo" && "border-slate-200 bg-white text-slate-300"
                )}
              >
                {m.state === "done" ? <CheckCircle2 className="h-5 w-5" /> : m.state === "active" ? "●" : "○"}
              </span>
              <div>
                <p className={cn("text-xs font-bold", m.state === "todo" ? "text-slate-400" : "text-navy-900")}>{m.label}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {m.state === "done" ? "Complete" : m.state === "active" ? "In progress" : "Upcoming"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Department table */}
        <div className="card animate-fade-up delay-225 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <h2 className="font-display text-base font-bold text-navy-900 sm:text-lg">Department Submission Status</h2>
            <Link href="/departments" className="shrink-0 text-xs font-bold text-navy-600 hover:text-navy-800">View all</Link>
          </div>
          {data.departments.length === 0 ? (
            <EmptyState title="No submissions yet." body="Once departments submit their information, it will appear here." action={<button className={btn.primary}>Invite Department</button>} />
          ) : (
            <>
              <ul className="divide-y divide-slate-100 md:hidden">
                {data.departments.slice(0, 8).map((d) => (
                  <li key={d.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-navy-900">{d.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{timeAgo(d.updatedAt)}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar value={d.completion} className="h-1.5 flex-1" animate={false} label={`${d.name} ${d.completion}%`} />
                      <span className="text-xs font-bold text-navy-700">{d.completion}%</span>
                    </div>
                    <Link href="/approvals" className="mt-3 inline-block text-xs font-bold text-navy-600 hover:underline">
                      {d.status === "approved" ? "View" : "Review"}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3">Department</th>
                    <th className="px-4 py-3">Completion</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Updated</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.departments.slice(0, 8).map((d) => (
                    <tr key={d.id} className="border-b border-slate-50 transition hover:bg-navy-50/40">
                      <td className="px-6 py-3.5 font-semibold text-navy-900">{d.name}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <ProgressBar value={d.completion} className="h-1.5 w-20" animate={false} label={`${d.name} ${d.completion}%`} />
                          <span className="text-xs font-bold text-slate-600">{d.completion}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{timeAgo(d.updatedAt)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <Link href="/approvals" className="text-xs font-bold text-navy-600 hover:text-navy-800 hover:underline">
                          {d.status === "approved" ? "View" : "Review"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>

        {/* Recent activity */}
        <div className="card animate-fade-up delay-300 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-900">Recent Activity</h2>
            <Link href="/settings?tab=security" className="text-xs font-bold text-navy-600 hover:text-navy-800">Audit log</Link>
          </div>
          <ol className="mt-5 space-y-0">
            {data.activities.slice(0, 6).map((a, i) => (
              <li key={a.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < Math.min(data.activities.length, 6) - 1 && (
                  <span className="absolute left-[13px] top-7 bottom-0 w-px bg-slate-100" aria-hidden />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    a.status === "warning" ? "bg-amber-50 text-amber-600" : a.status === "failed" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  )}
                >
                  {a.status === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-snug text-slate-700">
                    <span className="font-bold text-navy-900">{a.actor}</span> {a.action}.
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">{timeAgo(a.createdAt)} · {ROLE_LABEL[a.role as Role] ?? a.role}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Coordinator quick queue */}
      {!isAdmin && (
        <div className="card animate-fade-up mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-display text-lg font-bold text-navy-900">Waiting for Your Review</h2>
            <Link href="/approvals" className="text-xs font-bold text-navy-600 hover:text-navy-800">Open Approval Center</Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {data.submissions
              .filter((s) => ["submitted", "under_review"].includes(s.status))
              .slice(0, 5)
              .map((s) => {
                const dept = data.departments.find((d) => d.id === s.departmentId);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                    <Sparkles className="h-4 w-4 text-gold-500" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy-900">{dept?.name} — {sectionLabel(s.section)}</p>
                      <p className="text-xs text-slate-400">Submitted by {s.submittedBy} · {timeAgo(s.updatedAt)}</p>
                    </div>
                    <StatusBadge status={s.status} />
                    <Link href={`/approvals?open=${s.id}`} className={cn(btn.secondary, "!px-3 !py-1.5 text-xs")}>Review</Link>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
