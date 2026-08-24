"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  CalendarClock,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Megaphone,
  Paperclip,
  Presentation,
  Send,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { EmptyState, PageHeader, btn, cn, inputCls } from "@/components/ui";
import { api, useApp } from "@/lib/store";
import type { ClassMaterial, Subject } from "@/lib/data";
import { timeAgo } from "@/lib/data";

const KIND_META: Record<string, { label: string; icon: typeof FileText; cls: string }> = {
  note: { label: "Notes", icon: FileText, cls: "bg-navy-50 text-navy-700" },
  ppt: { label: "PPT", icon: Presentation, cls: "bg-kp-red-50 text-kp-red-700" },
  assignment: { label: "Assignment", icon: BookOpenCheck, cls: "bg-gold-100 text-gold-700" },
  announcement: { label: "Announcement", icon: Megaphone, cls: "bg-emerald-50 text-emerald-700" },
  marksheet: { label: "Marksheet", icon: FileSpreadsheet, cls: "bg-kp-green-50 text-kp-green-700" },
};

export default function ClassroomPage() {
  return (
    <Suspense>
      <ClassroomInner />
    </Suspense>
  );
}

function Suspense({ children }: { children: React.ReactNode }) {
  return children;
}

function ClassroomInner() {
  const { user, data, toast, refresh } = useApp();
  const params = useSearchParams();
  const isStudent = user?.role === "student";
  const myDeptName = user?.department ?? "Computer Engineering";
  const mySubjects = useMemo(
    () =>
      isStudent
        ? data.subjects.filter((s) => s.name && s.departmentId) // refined below via enrollments; for simplicity keep all subjects of the student's department+sem
        : data.subjects,
    [data.subjects, isStudent]
  );
  const deptOfSubject = (sj: Subject) => data.departments.find((d) => d.id === sj.departmentId);
  const visibleSubjects = useMemo(
    () =>
      isStudent
        ? data.subjects.filter((sj) => {
            const d = deptOfSubject(sj);
            return d?.name === myDeptName && sj.semester === 3; // demo student is sem 3 CE
          })
        : mySubjects,
    [data.subjects, isStudent, myDeptName, mySubjects]
  );

  const initialSubjectId = useMemo(() => {
    const forced = params.get("subject");
    if (forced) return parseInt(forced, 10);
    return visibleSubjects[0]?.id ?? 0;
  }, [params, visibleSubjects]);

  const [activeId, setActiveId] = useState<number>(initialSubjectId);
  useEffect(() => {
    if (activeId === 0 && visibleSubjects[0]) setActiveId(visibleSubjects[0].id);
  }, [visibleSubjects, activeId]);

  const activeSubject = data.subjects.find((s) => s.id === activeId);
  const materials = useMemo(
    () => data.classMaterials.filter((m) => m.subjectId === activeId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [data.classMaterials, activeId]
  );

  // -------- Teacher compose post --------
  const [postKind, setPostKind] = useState<ClassMaterial["kind"]>("note");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [fileName, setFileName] = useState("");
  const [postBusy, setPostBusy] = useState(false);

  async function addPost(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSubject || !postTitle.trim()) {
      toast("Add a title", "Every post needs a clear title.", "error");
      return;
    }
    setPostBusy(true);
    const res = await api("/api/classroom/post", {
      method: "POST",
      body: JSON.stringify({
        subjectId: activeSubject.id,
        kind: postKind,
        title: postTitle.trim(),
        description: postBody.trim() || null,
        attachmentName: fileName || null,
      }),
    });
    const json = await res.json();
    setPostBusy(false);
    if (!res.ok) return toast("Could not post", json.error ?? "Please try again.", "error");
    setPostTitle("");
    setPostBody("");
    setFileName("");
    toast("Posted", `${postKind} shared to ${activeSubject.code} stream.`, "success");
    refresh();
  }

  // -------- Parent SMS --------
  const [smsMsg, setSmsMsg] = useState("");
  const [smsBusy, setSmsBusy] = useState(false);
  async function shareToParents() {
    if (!activeSubject) return;
    setSmsBusy(true);
    const res = await api("/api/sms/send", {
      method: "POST",
      body: JSON.stringify({ subjectId: activeSubject.id, message: smsMsg }),
    });
    const json = await res.json();
    setSmsBusy(false);
    if (!res.ok) return toast("SMS failed", json.error ?? "Please try again.", "error");
    toast("SMS queued", `Sent to ${json.recipients} parents for ${activeSubject.code}.`, "success");
    refresh();
  }

  return (
    <div>
      <PageHeader
        title={isStudent ? "My Classroom" : "Classroom"}
        subtitle={
          isStudent
            ? "All notes, PPTs, assignments and announcements from your teachers, in one place."
            : "Share notes, PPTs, assignments and announcements directly with students — no more email chains."
        }
        actions={
          !isStudent && activeSubject ? (
            <button
              onClick={shareToParents}
              disabled={smsBusy}
              className={cn(btn.secondary, "!bg-kp-red-600 !text-white hover:!bg-kp-red-700")}
            >
              {smsBusy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" /> : <Smartphone className="h-4 w-4" aria-hidden />}
              Share Attendance to Parents
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Subject list */}
        <aside aria-label="Subjects" className="card h-fit p-3 lg:sticky lg:top-24">
          <p className="px-2 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            {isStudent ? "My Subjects" : "Subjects I teach"}
          </p>
          <ul className="space-y-1">
            {visibleSubjects.map((s) => {
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveId(s.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition",
                      active ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold opacity-80">{s.code}</span>
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold", active ? "bg-white/10 text-gold-300" : "bg-slate-100 text-slate-500")}>
                        Sem {s.semester}
                      </span>
                    </span>
                    <span className="text-sm font-bold leading-tight">{s.name}</span>
                    <span className={cn("text-[11px]", active ? "text-white/60" : "text-slate-400")}>
                      {s.faculty} · {s.enrolled} students
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="space-y-5">
          {activeSubject ? (
            <>
              {/* Subject header card */}
              <div className="card overflow-hidden">
                <div className="kpgu-stripe h-1.5" aria-hidden />
                <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-kp-red-600">
                      {deptOfSubject(activeSubject)?.name}
                    </p>
                    <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
                      {activeSubject.code} · {activeSubject.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeSubject.faculty} · Semester {activeSubject.semester} · {activeSubject.credits} credits
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { icon: Users, v: activeSubject.enrolled, l: "Students" },
                      { icon: GraduationCap, v: `${activeSubject.passPercentage}%`, l: "Pass" },
                      { icon: BookOpenCheck, v: `${activeSubject.syllabusCompletion}%`, l: "Syllabus" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl bg-slate-50 px-3 py-2">
                        <s.icon className="mx-auto h-4 w-4 text-navy-700" aria-hidden />
                        <p className="font-display mt-1 text-base font-extrabold text-navy-900">{s.v}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compose (teachers only) */}
              {!isStudent && (
                <form onSubmit={addPost} className="card animate-fade-in p-5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(Object.keys(KIND_META) as Array<keyof typeof KIND_META>).map((k) => {
                      const m = KIND_META[k];
                      return (
                        <button
                          type="button"
                          key={k}
                          onClick={() => setPostKind(k as ClassMaterial["kind"])}
                          aria-pressed={postKind === k}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
                            postKind === k ? "border-navy-800 bg-navy-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <m.icon className="h-3.5 w-3.5" aria-hidden /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      aria-label="Title"
                      placeholder="Title — e.g. Unit 3 Notes or Assignment 4"
                      className={inputCls}
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                    />
                    <label className={cn(btn.secondary, "cursor-pointer")}>
                      <Paperclip className="h-4 w-4" aria-hidden /> Attach
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                      />
                    </label>
                  </div>
                  {fileName && (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      <Paperclip className="h-3 w-3" aria-hidden /> {fileName}
                    </p>
                  )}
                  <textarea
                    aria-label="Description"
                    rows={2}
                    className={cn(inputCls, "mt-3")}
                    placeholder="Optional description or instructions for students…"
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Sparkles className="h-3.5 w-3.5 text-gold-500" aria-hidden /> AI can draft announcements and assignment briefs
                    </p>
                    <button type="submit" disabled={postBusy} className={btn.primary}>
                      {postBusy ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden />} Post
                    </button>
                  </div>
                </form>
              )}

              {/* Stream */}
              {materials.length === 0 ? (
                <EmptyState
                  title="Nothing posted yet"
                  body={isStudent ? "Your teacher will post notes and assignments here soon." : "Post your first note, PPT, assignment or announcement for students."}
                  action={
                    isStudent ? null : (
                      <span className="text-xs font-semibold text-slate-400">Use the compose panel above.</span>
                    )
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {materials.map((m) => {
                    const meta = KIND_META[m.kind] ?? KIND_META.note;
                    const Icon = meta.icon;
                    const due = m.dueDate ? new Date(m.dueDate) : null;
                    return (
                      <li key={m.id} className="card card-hover animate-fade-up p-5">
                        <div className="flex items-start gap-4">
                          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.cls)} aria-hidden>
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h3 className="text-sm font-bold text-navy-900">{m.title}</h3>
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", meta.cls)}>
                                {meta.label}
                              </span>
                            </div>
                            {m.description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{m.description}</p>}
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-400">
                              <span>{m.postedBy}</span>
                              <span>·</span>
                              <span>{timeAgo(m.createdAt)}</span>
                              {due && (
                                <>
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-1 text-kp-red-700">
                                    <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Due {due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </span>
                                </>
                              )}
                            </div>
                            {m.attachmentName && (
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (isStudent) toast("Download started", m.attachmentName ?? "file", "success");
                                }}
                                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-navy-800 transition hover:border-navy-300 hover:bg-navy-50"
                              >
                                <Paperclip className="h-3.5 w-3.5" aria-hidden /> {m.attachmentName}
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Parent SMS panel (teachers) */}
              {!isStudent && (
                <div className="card p-5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-kp-red-600" aria-hidden />
                    <h3 className="text-sm font-bold text-navy-900">Share Attendance / Results with Parents</h3>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Sends an SMS to the parents of all {activeSubject.enrolled} students enrolled in {activeSubject.code}.
                    Delivery is queued via the integrated SMS gateway and logged for audit.
                  </p>
                  <textarea
                    aria-label="SMS message"
                    rows={2}
                    maxLength={320}
                    className={cn(inputCls, "mt-3")}
                    placeholder="Dear Parent, attendance for CE301 is 88%. Please ensure your ward attends remaining lectures. — KPGU"
                    value={smsMsg}
                    onChange={(e) => setSmsMsg(e.target.value)}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">{smsMsg.length}/320 characters</span>
                    <button onClick={shareToParents} disabled={smsBusy || !smsMsg.trim()} className={cn(btn.secondary, "!bg-kp-red-600 !text-white hover:!bg-kp-red-700")}>
                      {smsBusy ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" aria-hidden />} Send to Parents
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="No subject selected" body="Choose a subject from the list to view the classroom stream." />
          )}
        </section>
      </div>
    </div>
  );
}

function LoaderIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
