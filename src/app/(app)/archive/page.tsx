"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Download, Eye, FileStack, Search, X } from "lucide-react";
import { EmptyState, PageHeader, btn, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { ARCHIVE_REPORTS } from "@/lib/data";

export default function ArchivePage() {
  const { toast } = useApp();
  const [q, setQ] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [compareA, setCompareA] = useState("2025–26");
  const [compareB, setCompareB] = useState("2024–25");
  const [comparing, setComparing] = useState(false);

  const filtered = useMemo(
    () =>
      ARCHIVE_REPORTS.filter(
        (r) =>
          (yearFilter === "All Years" || r.year === yearFilter) &&
          (typeFilter === "All Types" || r.title === typeFilter) &&
          `${r.year} ${r.title}`.toLowerCase().includes(q.toLowerCase())
      ),
    [q, yearFilter, typeFilter]
  );

  const a = ARCHIVE_REPORTS.find((r) => r.year === compareA)!;
  const b = ARCHIVE_REPORTS.find((r) => r.year === compareB)!;

  return (
    <div>
      <PageHeader
        title="Annual Report Archive"
        subtitle="Every published report, permanently searchable and comparable."
        actions={
          <button onClick={() => setComparing((v) => !v)} className={btn.secondary}>
            <ArrowLeftRight className="h-4 w-4" aria-hidden /> {comparing ? "Hide Comparison" : "Compare Years"}
          </button>
        }
      />

      {comparing && (
        <div className="card animate-fade-up mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-navy-900">Year Comparison</h2>
            <button aria-label="Close comparison" onClick={() => setComparing(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden /></button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { v: compareA, set: setCompareA, label: "Year A" },
              { v: compareB, set: setCompareB, label: "Year B" },
            ].map((s) => (
              <label key={s.label} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                {s.label}
                <select value={s.v} onChange={(e) => s.set(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-100">
                  {ARCHIVE_REPORTS.map((r) => <option key={r.year}>{r.year}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 pr-4">Metric</th>
                  <th className="px-4 py-2.5">{compareA}</th>
                  <th className="px-4 py-2.5">{compareB}</th>
                  <th className="px-4 py-2.5">Change</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Pages", a.pages, b.pages],
                    ["Placement Rate", `${a.highlights.placement}%`, `${b.highlights.placement}%`],
                    ["Publications", a.highlights.publications, b.highlights.publications],
                    ["Events", a.highlights.events, b.highlights.events],
                  ] as const
                ).map(([m, va, vb]) => {
                  const na = parseFloat(String(va)), nb = parseFloat(String(vb));
                  const d = nb ? (((na - nb) / nb) * 100).toFixed(1) : "0";
                  return (
                    <tr key={m} className="border-b border-slate-50">
                      <td className="py-3 pr-4 font-semibold text-navy-900">{m}</td>
                      <td className="px-4 py-3 font-bold text-navy-700">{va}</td>
                      <td className="px-4 py-3 text-slate-500">{vb}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-extrabold", Number(d) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                          {Number(d) >= 0 ? "+" : ""}{d}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            aria-label="Search reports"
            placeholder="Search reports…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select aria-label="Filter by academic year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-100">
          <option>All Years</option>
          {ARCHIVE_REPORTS.map((r) => <option key={r.year}>{r.year}</option>)}
        </select>
        <select aria-label="Filter by report type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-100">
          <option>All Types</option>
          <option>Annual Report</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No reports found" body="Try adjusting your search or filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((r, i) => (
            <div key={r.year} className="card card-hover animate-fade-up flex flex-col overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex h-36 items-center justify-center bg-navy-950">
                <div className="text-center">
                  <FileStack className="mx-auto h-8 w-8 text-gold-300" aria-hidden />
                  <p className="font-display mt-2 text-2xl font-extrabold text-white">{r.year}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-navy-900">{r.title}</h2>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", r.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{r.pages} Pages · {r.size} · {r.downloads.toLocaleString("en-IN")} downloads</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <Link href="/reports/2025-26" className={cn(btn.secondary, "flex-1 !px-2 !py-2 text-xs")}><Eye className="h-3.5 w-3.5" aria-hidden /> View</Link>
                  <button onClick={() => toast("Download started", `Annual Report ${r.year} (${r.size}) is downloading.`)} className={cn(btn.secondary, "flex-1 !px-2 !py-2 text-xs")}>
                    <Download className="h-3.5 w-3.5" aria-hidden /> Download
                  </button>
                  <button onClick={() => { setComparing(true); setCompareA(r.year); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={cn(btn.secondary, "!px-2 !py-2 text-xs")} aria-label={`Compare ${r.year}`}>
                    <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
