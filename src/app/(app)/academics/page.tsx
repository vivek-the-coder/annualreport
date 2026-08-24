"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Mic,
  Presentation,
  Search,
  TrendingDown,
} from "lucide-react";
import { SimpleBar } from "@/components/charts";
import { EmptyState, KpiCard, PageHeader, ProgressBar, btn, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { timeAgo, type Subject } from "@/lib/data";

/** Traffic-light thresholds used consistently across the academic views. */
function healthClass(v: number, warn = 80, bad = 70) {
  if (v >= warn) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (v >= bad) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}
function barClass(v: number, warn = 80, bad = 70) {
  if (v >= warn) return "bg-emerald-500";
  if (v >= bad) return "bg-amber-500";
  return "bg-rose-500";
}

function ArtefactChip({
  icon: Icon,
  count,
  label,
  done,
}: {
  icon: typeof FileText;
  count?: number;
  label: string;
  done?: boolean;
}) {
  const missing = done === false || count === 0;
  return (
    <span
      title={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
        missing ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      <span className="sr-only">{label}: </span>
      {count !== undefined ? count : done ? "Done" : "Pending"}
    </span>
  );
}

export default function AcademicsPage() {
  const { data, user } = useApp();
  const [q, setQ] = useState("");
  const [sem, setSem] = useState("All");
  const [dept, setDept] = useState("All");

  const isDept = user?.role === "department";
  const myDept = data.departments.find((d) => d.name === (user?.department ?? "Computer Engineering"));

  const scoped = useMemo(
    () => (isDept && myDept ? data.subjects.filter((s) => s.departmentId === myDept.id) : data.subjects),
    [data.subjects, isDept, myDept]
  );

  const rows = useMemo(
    () =>
      scoped.filter((s) => {
        const d = data.departments.find((x) => x.id === s.departmentId);
        const text = `${s.code} ${s.name} ${s.faculty} ${d?.name ?? ""}`.toLowerCase();
        return (
          text.includes(q.toLowerCase()) &&
          (sem === "All" || String(s.semester) === sem) &&
          (dept === "All" || d?.name === dept)
        );
      }),
    [scoped, data.departments, q, sem, dept]
  );

  const avg = (key: keyof Subject) =>
    scoped.length
      ? Math.round(scoped.reduce((a, s) => a + (s[key] as number), 0) / scoped.length)
      : 0;

  const atRisk = scoped.filter((s) => s.attendanceAvg < 75 || s.syllabusCompletion < 80);
  const pendingArtefacts = scoped.filter((s) => !s.marksheetUploaded || !s.vivaCompleted).length;

  const chartData = useMemo(
    () =>
      rows
        .slice()
        .sort((a, b) => a.syllabusCompletion - b.syllabusCompletion)
        .slice(0, 10)
        .map((s) => ({ name: s.code, Syllabus: s.syllabusCompletion, Attendance: s.attendanceAvg })),
    [rows]
  );

  const semesters = Array.from(new Set(scoped.map((s) => s.semester))).sort();

  return (
    <div>
      <PageHeader
        title="Academic Records"
        subtitle={
          isDept
            ? `Subject-wise teaching and assessment records for ${myDept?.name}`
            : "Subject-wise syllabus, attendance and assessment tracking across all departments"
        }
        actions={
          <button
            className={btn.secondary}
            onClick={() => {
              const header = "Code,Subject,Semester,Faculty,Syllabus%,Attendance%,Pass%,Notes,PPT,Assignments\n";
              const csv =
                header +
                rows
                  .map((s) =>
                    [s.code, `"${s.name}"`, s.semester, `"${s.faculty}"`, s.syllabusCompletion, s.attendanceAvg, s.passPercentage, s.notesCount, s.pptCount, s.assignmentsCount].join(",")
                  )
                  .join("\n");
              const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = "academic-records.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden /> Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Syllabus Completion" value={`${avg("syllabusCompletion")}%`} icon={<BookOpen className="h-5 w-5" />} accent="navy" sub={`${scoped.length} subjects tracked`} />
        <KpiCard label="Average Attendance" value={`${avg("attendanceAvg")}%`} icon={<CalendarCheck className="h-5 w-5" />} accent="blue" sub="Across all lecture registers" delay={70} />
        <KpiCard label="Pass Percentage" value={`${avg("passPercentage")}%`} icon={<GraduationCap className="h-5 w-5" />} accent="emerald" sub="Latest internal results" delay={140} />
        <KpiCard label="Pending Artefacts" value={String(pendingArtefacts)} icon={<ClipboardList className="h-5 w-5" />} accent="amber" sub="Marksheets or viva outstanding" delay={210} />
      </div>

      {atRisk.length > 0 && (
        <div className="card animate-fade-up mt-6 border-amber-200 bg-amber-50/50 p-5">
          <div className="flex items-start gap-3">
            <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                {atRisk.length} subject{atRisk.length === 1 ? "" : "s"} need attention
              </h2>
              <p className="mt-0.5 text-xs text-amber-800/80">
                Attendance below 75% or syllabus completion below 80%. Flagged for coordinator follow-up.
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {atRisk.slice(0, 8).map((s) => (
                  <li key={s.id} className="rounded-md border border-amber-200 bg-white px-2 py-1 text-[11px] font-bold text-amber-800">
                    {s.code} · {s.attendanceAvg}% att · {s.syllabusCompletion}% syl
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card animate-fade-up mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-navy-900">Syllabus vs Attendance</h2>
        <p className="mb-4 text-xs text-slate-400">Ten subjects with the lowest syllabus coverage</p>
        {chartData.length > 0 ? (
          <SimpleBar data={chartData} xKey="name" bars={[{ key: "Syllabus", color: "#1d3f84" }, { key: "Attendance", color: "#c99a3c" }]} height={280} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">No subjects match the current filters.</p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-5 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            aria-label="Search subjects"
            placeholder="Search subject, code or faculty…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {!isDept && (
          <select aria-label="Filter by department" value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-100">
            <option>All</option>
            {data.departments.map((d) => <option key={d.id}>{d.name}</option>)}
          </select>
        )}
        <select aria-label="Filter by semester" value={sem} onChange={(e) => setSem(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-100">
          <option>All</option>
          {semesters.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No subjects found" body="Try a different search term, semester or department filter." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-3 py-3.5">Sem</th>
                  <th className="px-4 py-3.5">Syllabus</th>
                  <th className="px-4 py-3.5">Attendance</th>
                  <th className="px-4 py-3.5">Pass %</th>
                  <th className="px-4 py-3.5">Artefacts</th>
                  <th className="px-6 py-3.5">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const d = data.departments.find((x) => x.id === s.departmentId);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 transition hover:bg-navy-50/40">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-navy-900">
                          <span className="font-mono text-xs text-navy-500">{s.code}</span> · {s.name}
                        </p>
                        <p className="text-xs text-slate-400">{s.faculty} · {d?.name} · {s.enrolled} students</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs font-bold text-slate-600">{s.semester}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={s.syllabusCompletion} className="h-1.5 w-16" barClassName={barClass(s.syllabusCompletion)} animate={false} label={`${s.name} syllabus ${s.syllabusCompletion}%`} />
                          <span className="text-xs font-bold text-slate-600">{s.syllabusCompletion}%</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400">{s.unitsCovered}/{s.unitsPlanned} units · {s.lecturesTaken}/{s.lecturesPlanned} lectures</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-bold", healthClass(s.attendanceAvg, 80, 75))}>
                          {s.attendanceAvg}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-bold", healthClass(s.passPercentage, 85, 75))}>
                          {s.passPercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          <ArtefactChip icon={FileText} count={s.notesCount} label="Subject notes" />
                          <ArtefactChip icon={Presentation} count={s.pptCount} label="Lecture PPTs" />
                          <ArtefactChip icon={ClipboardList} count={s.assignmentsCount} label="Assignments" />
                          <ArtefactChip icon={FileSpreadsheet} count={s.examPapersCount} label="Exam papers" />
                          <ArtefactChip icon={GraduationCap} done={s.marksheetUploaded} label="Marksheet" />
                          <ArtefactChip icon={Mic} done={s.vivaCompleted} label="Viva" />
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-medium text-slate-500">{timeAgo(s.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Red chips indicate a missing artefact. Status is shown with both colour and text so it is never colour-dependent.
      </p>
    </div>
  );
}
