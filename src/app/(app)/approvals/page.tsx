"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
  XCircle,
} from "lucide-react";
import { EmptyState, PageHeader, StatusBadge, btn, cn, inputCls } from "@/components/ui";
import { api, useApp } from "@/lib/store";
import {
  ROLE_LABEL,
  sectionLabel,
  timeAgo,
  type CommentItem,
  type Role,
  type Submission,
} from "@/lib/data";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "changes_requested", label: "Changes Requested" },
  { key: "approved", label: "Approved" },
];

function ApprovalsInner() {
  const { user, data, refresh, toast } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const openId = params.get("open");
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState<{ submission: Submission; comments: CommentItem[] } | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const role = (user?.role ?? "admin") as Role;
  const isReviewer = role !== "department";

  const rows = useMemo(() => {
    let subs = data.submissions;
    if (role === "department") {
      const myDept = data.departments.find((d) => d.name === (user?.department ?? "Computer Engineering"));
      subs = subs.filter((s) => s.departmentId === myDept?.id);
    }
    if (tab === "pending") return subs.filter((s) => ["submitted", "draft"].includes(s.status));
    if (tab !== "all") return subs.filter((s) => s.status === tab);
    return subs;
  }, [data, tab, role, user]);

  useEffect(() => {
    if (!openId) {
      setDetail(null);
      return;
    }
    (async () => {
      const res = await api(`/api/submissions/${openId}`);
      if (res.ok) {
        const json = await res.json();
        setDetail({ submission: json.submission, comments: json.comments });
      }
    })();
  }, [openId, data.submissions]);

  async function act(action: string, successMsg: string) {
    if (!detail) return;
    setBusy(action);
    try {
      const res = await api(`/api/submissions/${detail.submission.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, comment: comment.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      setComment("");
      await refresh();
      toast(successMsg, undefined, action === "request_changes" ? "info" : "success");
    } catch (e) {
      toast("Something went wrong", e instanceof Error ? e.message : "Please try again.", "error");
    } finally {
      setBusy(null);
    }
  }

  /* ---------------- Detail (review) view ---------------- */
  if (openId && detail) {
    const sub = detail.submission;
    const dept = data.departments.find((d) => d.id === sub.departmentId);
    const deptSubs = data.submissions.filter((s) => s.departmentId === sub.departmentId);
    return (
      <div>
        <button onClick={() => router.push("/approvals")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-800">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Approval Center
        </button>
        <PageHeader
          title={`${dept?.name} — ${sectionLabel(sub.section)}`}
          subtitle={`Submitted by ${sub.submittedBy} · Last updated ${timeAgo(sub.updatedAt)}`}
          actions={<StatusBadge status={sub.status} className="!text-sm !px-3 !py-1" />}
        />

        <div className="grid gap-6 lg:grid-cols-[220px_1fr_320px]">
          {/* Section nav — horizontal scroll on mobile */}
          <nav aria-label="Department sections" className="card h-fit p-3 lg:sticky lg:top-24">
            <p className="px-2 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Sections</p>
            <ul className="scroll-x flex gap-1 lg:block lg:space-y-0.5 lg:overflow-visible">
              {deptSubs.map((s) => (
                <li key={s.id} className="shrink-0 lg:w-full">
                  <button
                    onClick={() => router.push(`/approvals?open=${s.id}`)}
                    aria-current={s.id === sub.id ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition",
                      s.id === sub.id ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.status === "approved" ? "bg-emerald-500" : s.status === "changes_requested" ? "bg-rose-500" : "bg-amber-400")} aria-hidden />
                    <span className="whitespace-nowrap lg:truncate">{sectionLabel(s.section)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Submitted content */}
          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-lg font-bold text-navy-900">Submitted Content</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{sub.summary ?? "No content submitted yet."}</p>
            {dept && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: "Students", v: dept.students },
                  { l: "Faculty", v: dept.faculty },
                  { l: "Placement", v: `${dept.placementRate}%` },
                  { l: "Publications", v: dept.publications },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                    <p className="font-display text-lg font-extrabold text-navy-900">{s.v}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.l}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-navy-900">Activity & Comments</h3>
              {detail.comments.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No comments yet. Comments attach directly to this section.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {detail.comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold", c.role === "coordinator" ? "bg-navy-100 text-navy-700" : c.role === "admin" ? "bg-gold-100 text-gold-700" : "bg-emerald-50 text-emerald-700")} aria-hidden>
                        {c.author.split(" ").slice(-1)[0][0]}
                      </span>
                      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p className="text-xs font-bold text-navy-900">{c.author}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {ROLE_LABEL[c.role as Role] ?? c.role} · {timeAgo(c.createdAt)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Review panel */}
          <div className="card h-fit p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-base font-bold text-navy-900">
              {isReviewer ? "Review Panel" : "Respond to Review"}
            </h2>
            <label htmlFor="review-comment" className="mt-4 block text-xs font-bold text-slate-600">
              Add Comment
            </label>
            <textarea
              id="review-comment"
              rows={4}
              className={cn(inputCls, "mt-1.5 text-sm")}
              placeholder={isReviewer ? "e.g. “Please verify the publication count with the research cell.”" : "Reply to the coordinator…"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-4 space-y-2.5">
              {isReviewer ? (
                <>
                  <button onClick={() => act("approve", "Section approved")} disabled={busy !== null || sub.status === "approved"} className={cn(btn.success, "w-full")}>
                    {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
                    Approve
                  </button>
                  <button onClick={() => act("request_changes", "Changes requested — department notified")} disabled={busy !== null} className={cn(btn.danger, "w-full !bg-rose-50 !text-rose-700 hover:!bg-rose-100")}>
                    {busy === "request_changes" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
                    Request Changes
                  </button>
                  <button onClick={() => act("comment", "Comment added")} disabled={busy !== null || !comment.trim()} className={cn(btn.secondary, "w-full")}>
                    {busy === "comment" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MessageSquare className="h-4 w-4" aria-hidden />}
                    Add Comment
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => act("comment", "Reply posted")} disabled={busy !== null || !comment.trim()} className={cn(btn.secondary, "w-full")}>
                    {busy === "comment" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                    Post Reply
                  </button>
                  {sub.status === "changes_requested" && (
                    <button onClick={() => act("resubmit", "Resubmitted for review")} disabled={busy !== null} className={cn(btn.primary, "w-full")}>
                      {busy === "resubmit" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCcw className="h-4 w-4" aria-hidden />}
                      Resubmit After Updates
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
              {isReviewer
                ? "Approving locks this section into the report draft. Requesting changes notifies the department instantly."
                : "Your reply is visible to the coordinator and attached to this section."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- List view ---------------- */
  return (
    <div>
      <PageHeader
        title="Approval Center"
        subtitle={
          isReviewer
            ? "Track every submission from draft to final approval."
            : "Track the approval status of your department’s sections."
        }
      />
      <div role="tablist" aria-label="Filter approvals" className="scroll-x mb-5 flex flex-nowrap gap-1.5 pb-1 sm:flex-wrap">
        {TABS.map((t) => {
          const count =
            t.key === "all"
              ? rows.length
              : undefined;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition sm:px-4",
                tab === t.key ? "border-navy-800 bg-navy-900 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              {t.label}
              {count !== undefined && tab === t.key && <span className="ml-1.5 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Submissions with this status will appear here as departments progress." />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {rows.map((s) => {
              const dept = data.departments.find((d) => d.id === s.departmentId);
              return (
                <li key={s.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy-900">{dept?.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{sectionLabel(s.section)}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{s.submittedBy} · {timeAgo(s.updatedAt)}</p>
                  <button onClick={() => router.push(`/approvals?open=${s.id}`)} className={cn(btn.secondary, "mt-3 w-full text-xs")}>
                    {isReviewer ? (s.status === "approved" ? "View" : "Review") : "Open"}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="card hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Section</th>
                  <th className="px-4 py-3.5">Submitted By</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Reviewer</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const dept = data.departments.find((d) => d.id === s.departmentId);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 transition hover:bg-navy-50/40">
                      <td className="px-6 py-3.5 font-semibold text-navy-900">{dept?.name}</td>
                      <td className="px-4 py-3.5 text-slate-700">{sectionLabel(s.section)}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{s.submittedBy}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{timeAgo(s.updatedAt)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{s.reviewer ?? "—"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => router.push(`/approvals?open=${s.id}`)} className="text-xs font-bold text-navy-600 hover:underline">
                          {isReviewer ? (s.status === "approved" ? "View" : "Review") : "Open"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse bg-slate-100/60" />}>
      <ApprovalsInner />
    </Suspense>
  );
}
