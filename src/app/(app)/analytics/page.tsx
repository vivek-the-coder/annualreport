"use client";

import { useMemo, useState } from "react";
import { Award, BookOpen, Briefcase, CalendarDays, TrendingUp, Users } from "lucide-react";
import { Donut, SimpleBar, SimpleLine } from "@/components/charts";
import { KpiCard, PageHeader, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { YEARLY, YEARS } from "@/lib/data";

export default function AnalyticsPage() {
  const { data } = useApp();
  const [year, setYear] = useState<(typeof YEARS)[number]>("2025–26");
  const [compare, setCompare] = useState<(typeof YEARS)[number]>("2024–25");

  const cur = YEARLY[year];
  const prev = YEARLY[compare];
  const delta = (a: number, b: number) => (((a - b) / b) * 100).toFixed(1);

  const trendData = useMemo(
    () =>
      YEARS.map((y) => ({
        year: y,
        Placement: YEARLY[y].placement,
        Publications: YEARLY[y].publications,
        Events: YEARLY[y].events,
        Students: YEARLY[y].students,
        FDPs: YEARLY[y].fdp,
        Awards: YEARLY[y].awards,
      })),
    []
  );

  const deptPerf = useMemo(
    () =>
      data.departments
        .slice()
        .sort((a, b) => b.placementRate - a.placementRate)
        .slice(0, 8)
        .map((d) => ({ name: d.code, Placement: d.placementRate, Completion: d.completion })),
    [data.departments]
  );

  const statusDonut = useMemo(() => {
    const counts: Record<string, number> = {};
    data.submissions.forEach((s) => (counts[s.status] = (counts[s.status] ?? 0) + 1));
    return [
      { name: "Approved", value: counts.approved ?? 0, color: "#059669" },
      { name: "Under Review", value: (counts.under_review ?? 0) + (counts.submitted ?? 0), color: "#2f6bdb" },
      { name: "Changes Requested", value: counts.changes_requested ?? 0, color: "#e11d48" },
      { name: "Draft", value: counts.draft ?? 0, color: "#94a3b8" },
    ];
  }, [data.submissions]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Institutional performance compiled automatically from verified departmental data."
        actions={
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-xs font-bold text-slate-500">Academic Year</label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(e.target.value as typeof year)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
            >
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Student Strength" value={cur.students.toLocaleString("en-IN")} icon={<Users className="h-5 w-5" />} accent="navy" sub={`${delta(cur.students, prev.students)}% vs ${compare}`} />
        <KpiCard label="Placement Rate" value={`${cur.placement}%`} icon={<Briefcase className="h-5 w-5" />} accent="emerald" sub={<span className="inline-flex items-center gap-1 font-bold text-emerald-600"><TrendingUp className="h-3.5 w-3.5" aria-hidden /> +{delta(cur.placement, prev.placement)}% improvement</span>} delay={70} />
        <KpiCard label="Research Publications" value={String(cur.publications)} icon={<BookOpen className="h-5 w-5" />} accent="blue" sub={`+${cur.publications - prev.publications} more than ${compare}`} delay={140} />
        <KpiCard label="Events Conducted" value={String(cur.events)} icon={<CalendarDays className="h-5 w-5" />} accent="amber" sub={`${cur.fdp} faculty development programs`} delay={210} />
      </div>

      {/* Year comparison strip */}
      <div className="card animate-fade-up mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-navy-900">Year-over-Year Comparison</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            Compare with
            <select
              aria-label="Comparison year"
              value={compare}
              onChange={(e) => setCompare(e.target.value as typeof compare)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-100"
            >
              {YEARS.filter((y) => y !== year).map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {(
            [
              { label: "Placement Rate", curV: `${cur.placement}%`, prevV: `${prev.placement}%`, d: delta(cur.placement, prev.placement) },
              { label: "Research Publications", curV: cur.publications, prevV: prev.publications, d: delta(cur.publications, prev.publications) },
              { label: "Awards Won", curV: cur.awards, prevV: prev.awards, d: delta(cur.awards, prev.awards) },
            ] as const
          ).map((c) => (
            <div key={c.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{c.label}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="font-display text-2xl font-extrabold text-navy-900">{c.curV}</p>
                <p className="text-sm font-semibold text-slate-400 line-through">{c.prevV}</p>
                <span className={cn("ml-auto rounded-full px-2 py-0.5 text-xs font-extrabold", Number(c.d) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                  {Number(c.d) >= 0 ? "+" : ""}{c.d}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{compare}: {c.prevV} → {year}: {c.curV}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card animate-fade-up p-6">
          <h2 className="font-display text-lg font-bold text-navy-900">Placement Percentage Trend</h2>
          <p className="mb-4 text-xs text-slate-400">Three-year institutional trend</p>
          <SimpleLine data={trendData} xKey="year" lines={[{ key: "Placement", color: "#059669" }]} />
        </div>
        <div className="card animate-fade-up delay-75 p-6">
          <h2 className="font-display text-lg font-bold text-navy-900">Research Publications & FDPs</h2>
          <p className="mb-4 text-xs text-slate-400">Publications and faculty development programs by year</p>
          <SimpleBar data={trendData} xKey="year" bars={[{ key: "Publications", color: "#1d3f84" }, { key: "FDPs", color: "#c99a3c" }]} />
        </div>
        <div className="card animate-fade-up delay-150 p-6">
          <h2 className="font-display text-lg font-bold text-navy-900">Student Strength</h2>
          <p className="mb-4 text-xs text-slate-400">Total enrollment across years</p>
          <SimpleBar data={trendData} xKey="year" bars={[{ key: "Students", color: "#2f6bdb" }]} />
        </div>
        <div className="card animate-fade-up delay-225 p-6">
          <h2 className="font-display text-lg font-bold text-navy-900">Events & Awards</h2>
          <p className="mb-4 text-xs text-slate-400">Institutional activity by year</p>
          <SimpleLine data={trendData} xKey="year" lines={[{ key: "Events", color: "#7c3aed" }, { key: "Awards", color: "#c99a3c" }]} />
        </div>
        <div className="card animate-fade-up delay-150 p-6">
          <h2 className="font-display text-lg font-bold text-navy-900">Department Performance</h2>
          <p className="mb-4 text-xs text-slate-400">Placement rate and submission completion by department</p>
          <SimpleBar data={deptPerf} xKey="name" bars={[{ key: "Placement", color: "#1d3f84" }, { key: "Completion", color: "#94b3e6" }]} height={280} />
        </div>
        <div className="card animate-fade-up delay-225 p-6">
          <h2 className="font-display text-lg font-bold text-navy-900">Submission Status Distribution</h2>
          <p className="mb-2 text-xs text-slate-400">All sections in the current cycle</p>
          <Donut data={statusDonut} centerValue={String(data.submissions.length)} centerLabel="Sections" height={230} />
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {statusDonut.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                {s.name} · {s.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
