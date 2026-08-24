"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  GripVertical,
  Loader2,
  Maximize2,
  Minimize2,
  Send,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PageHeader, btn, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { INSTITUTE, INSTITUTE_STATS, REPORT_CHAPTERS, REPORT_THEMES, type ReportTheme } from "@/lib/data";

const STORAGE_KEY = "arp_builder_v1";

interface BuilderState {
  chapters: string[];
  theme: string;
  pageSize: "A4" | "Letter";
  header: boolean;
  footer: boolean;
  margins: "narrow" | "normal" | "wide";
  fontScale: number;
}

const DEFAULT_STATE: BuilderState = {
  chapters: REPORT_CHAPTERS.map((c) => c.key),
    theme: "kpgu",
  pageSize: "A4",
  header: true,
  footer: true,
  margins: "normal",
  fontScale: 1,
};

export default function ReportBuilderPage() {
  const { toast } = useApp();
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(0.85);
  const [full, setFull] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);

  // Prefer a slightly smaller default zoom on narrow screens.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setZoom(mq.matches ? 1 : 0.85);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const theme: ReportTheme = REPORT_THEMES.find((t) => t.key === state.theme) ?? REPORT_THEMES[0];
  const chapters = state.chapters
    .map((k) => REPORT_CHAPTERS.find((c) => c.key === k)!)
    .filter(Boolean);
  const totalPages = useMemo(() => chapters.reduce((a, c) => a + c.pages, 0), [chapters]);
  const currentChapter = chapters[Math.min(page, chapters.length - 1)];
  const pageNumber = useMemo(
    () => chapters.slice(0, page).reduce((a, c) => a + c.pages, 0) + 1,
    [chapters, page]
  );

  function move(key: string, dir: -1 | 1) {
    setState((s) => {
      const arr = [...s.chapters];
      const i = arr.indexOf(key);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, chapters: arr };
    });
  }

  function onDropChapter(e: DragEvent, targetKey: string) {
    e.preventDefault();
    if (!dragKey || dragKey === targetKey) return;
    setState((s) => {
      const arr = s.chapters.filter((k) => k !== dragKey);
      arr.splice(arr.indexOf(targetKey), 0, dragKey);
      return { ...s, chapters: arr };
    });
    setDragKey(null);
  }

  function generate(action: string) {
    setGenerating(0);
    const timer = setInterval(() => {
      setGenerating((g) => {
        if (g === null) return null;
        const next = g + 8 + Math.random() * 14;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setGenerating(null);
            toast(`${action} ready`, `Annual Report ${INSTITUTE.year} compiled with ${totalPages} pages.`, "success");
          }, 300);
          return 100;
        }
        return next;
      });
    }, 180);
  }

  const marginPad = state.margins === "narrow" ? "p-6" : state.margins === "wide" ? "p-14" : "p-10";

  const preview = (
    <div
      className="a4-page mx-auto w-full max-w-[520px] origin-top overflow-hidden rounded-sm transition-transform"
      style={{ transform: `scale(${zoom})`, background: theme.bg, aspectRatio: state.pageSize === "A4" ? "210/297" : "216/279" }}
      aria-label={`Report preview page ${pageNumber} of ${totalPages}`}
    >
      {currentChapter?.key === "cover" ? (
        <div className="flex h-full flex-col items-center justify-between p-10 text-center" style={{ fontFamily: theme.font }}>
          <div className="mt-8 flex flex-col items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white" style={{ background: theme.primary }} aria-hidden>
              G
            </span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
              {INSTITUTE.name}
            </p>
          </div>
          <div>
            <p className="text-[42px] font-black leading-none tracking-tight" style={{ color: theme.primary, fontSize: 42 * state.fontScale }}>
              ANNUAL<br />REPORT
            </p>
            <p className="mt-3 text-2xl font-bold" style={{ color: theme.accent }}>{INSTITUTE.year}</p>
            <div className="mx-auto mt-6 h-0.5 w-16" style={{ background: theme.accent }} aria-hidden />
            <p className="mt-6 text-xs italic" style={{ color: theme.primary, opacity: 0.75 }}>
              “{INSTITUTE.tagline}”
            </p>
          </div>
          <p className="mb-6 text-[9px] font-semibold uppercase tracking-widest" style={{ color: theme.primary, opacity: 0.5 }}>
            {INSTITUTE.website} · {INSTITUTE.address.split(",").slice(-2).join(",")}
          </p>
        </div>
      ) : (
        <div className={cn("flex h-full flex-col", marginPad)} style={{ fontFamily: theme.font }}>
          {state.header && (
            <div className="flex items-center justify-between border-b pb-2 text-[8px] font-semibold uppercase tracking-widest" style={{ borderColor: theme.accent, color: theme.primary, opacity: 0.7 }}>
              <span>{INSTITUTE.short} · Annual Report {INSTITUTE.year}</span>
              <span>{currentChapter?.label}</span>
            </div>
          )}
          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: theme.accent }}>
            Chapter {page}
          </p>
          <h2 className="mt-1 font-black leading-tight" style={{ color: theme.primary, fontSize: 26 * state.fontScale }}>
            {currentChapter?.label}
          </h2>
          <div className="mt-1 h-1 w-12" style={{ background: theme.accent }} aria-hidden />
          <div className="mt-5 space-y-2.5" style={{ fontSize: 8.5 * state.fontScale, lineHeight: 1.7, color: "#334155" }}>
            <p>
              During the academic year {INSTITUTE.year}, {INSTITUTE.name} recorded outstanding progress across academics, research and student development. With {INSTITUTE_STATS.students.toLocaleString("en-IN")} students and {INSTITUTE_STATS.faculty} faculty members, the institute achieved a {INSTITUTE_STATS.placementRate}% placement rate and contributed {INSTITUTE_STATS.publications} research publications.
            </p>
            <p>
              The institute filed {INSTITUTE_STATS.patents} patents, organized {INSTITUTE_STATS.events} events and earned {INSTITUTE_STATS.awards} awards at state and national level. This chapter presents the detailed outcomes compiled from verified departmental submissions.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { l: "Placement Rate", v: `${INSTITUTE_STATS.placementRate}%` },
              { l: "Publications", v: INSTITUTE_STATS.publications },
              { l: "Awards", v: INSTITUTE_STATS.awards },
            ].map((s) => (
              <div key={s.l} className="rounded border p-2 text-center" style={{ borderColor: `${theme.primary}22`, background: `${theme.primary}08` }}>
                <p className="font-black" style={{ color: theme.primary, fontSize: 13 * state.fontScale }}>{s.v}</p>
                <p className="text-[6.5px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex-1 space-y-1.5 overflow-hidden" aria-hidden>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-1.5 rounded-full" style={{ background: `${theme.primary}12`, width: `${95 - (i % 3) * 14}%` }} />
            ))}
          </div>
          {state.footer && (
            <div className="mt-auto flex items-center justify-between border-t pt-2 text-[7px] font-semibold" style={{ borderColor: `${theme.primary}22`, color: theme.primary, opacity: 0.6 }}>
              <span>{INSTITUTE.name}</span>
              <span>Page {pageNumber} of {totalPages}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Report Builder"
        subtitle={`Annual Report ${INSTITUTE.year} · ${totalPages} pages · ${chapters.length} chapters`}
        actions={
          <>
            <button onClick={() => generate("PDF download")} className={btn.secondary} disabled={generating !== null}>
              <Download className="h-4 w-4" aria-hidden /> Download PDF
            </button>
            <button onClick={() => generate("Word export")} className={btn.secondary} disabled={generating !== null}>
              <FileText className="h-4 w-4" aria-hidden /> Export Word
            </button>
            <Link href="/reports/2025-26" className={btn.primary}>
              <Send className="h-4 w-4" aria-hidden /> Publish Web Version
            </Link>
          </>
        }
      />

      {generating !== null && (
        <div className="card animate-fade-in mb-6 p-5" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-navy-600" aria-hidden />
            <p className="text-sm font-bold text-navy-900">Generating report… {Math.round(generating)}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-navy-700 to-navy-500 transition-all duration-200" style={{ width: `${generating}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">Compiling approved sections → applying {theme.label} theme → rendering {totalPages} pages</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[260px_1fr_280px]">
        {/* Chapters */}
        <div className="card h-fit order-2 p-4 lg:order-1 xl:sticky xl:top-24">
          <h2 className="px-1 pb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">Chapters · drag to reorder</h2>
          <ul className="scroll-x flex gap-2 lg:block lg:max-h-none lg:space-y-1 lg:overflow-visible xl:max-h-[70vh] xl:overflow-y-auto">
            {chapters.map((c, i) => (
              <li
                key={c.key}
                draggable
                onDragStart={() => setDragKey(c.key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropChapter(e, c.key)}
                className={cn(
                  "group flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 transition lg:w-full",
                  i === page ? "border-navy-200 bg-navy-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                  dragKey === c.key && "opacity-40"
                )}
              >
                <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-slate-300 sm:block" aria-hidden />
                <button onClick={() => setPage(i)} className="min-w-0 flex-1 text-left">
                  <span className={cn("block whitespace-nowrap text-xs font-bold lg:truncate lg:whitespace-normal", i === page ? "text-navy-900" : "text-slate-600")}>{c.label}</span>
                  <span className="text-[10px] text-slate-400">{c.pages} {c.pages === 1 ? "page" : "pages"}</span>
                </button>
                <span className="hidden flex-col opacity-0 transition group-hover:opacity-100 sm:flex">
                  <button aria-label={`Move ${c.label} up`} onClick={() => move(c.key, -1)} className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-navy-700"><ChevronUp className="h-3.5 w-3.5" aria-hidden /></button>
                  <button aria-label={`Move ${c.label} down`} onClick={() => move(c.key, 1)} className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-navy-700"><ChevronDown className="h-3.5 w-3.5" aria-hidden /></button>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preview */}
        <div className={cn("order-1 lg:order-2", full && "fixed inset-0 z-[80] overflow-auto bg-navy-950/95 p-4 sm:p-6 md:p-12")}>
          <div className={cn("card p-3 sm:p-4 md:p-6", full && "border-none bg-transparent shadow-none")}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className={cn("text-sm font-bold", full ? "text-white" : "text-navy-900")}>
                Live Preview <span className={cn("ml-2 text-xs font-semibold", full ? "text-white/50" : "text-slate-400")}>Page {pageNumber} / {totalPages}</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <button aria-label="Previous chapter" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={cn(btn.secondary, "!min-h-9 !px-3 !py-1.5 text-xs")}>Previous</button>
                <button aria-label="Next chapter" onClick={() => setPage((p) => Math.min(chapters.length - 1, p + 1))} disabled={page === chapters.length - 1} className={cn(btn.secondary, "!min-h-9 !px-3 !py-1.5 text-xs")}>Next</button>
                <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.55, z - 0.1))} className={cn(btn.secondary, "!min-h-9 !p-2")}><ZoomOut className="h-4 w-4" aria-hidden /></button>
                <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} className={cn(btn.secondary, "!min-h-9 !p-2")}><ZoomIn className="h-4 w-4" aria-hidden /></button>
                <button aria-label={full ? "Exit fullscreen" : "Fullscreen"} onClick={() => setFull((f) => !f)} className={cn(btn.secondary, "!min-h-9 !p-2")}>
                  {full ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex min-h-[280px] justify-center sm:min-h-[360px]">
                {preview}
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card order-3 h-fit space-y-6 p-5 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-24">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Theme</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {REPORT_THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setState((s) => ({ ...s, theme: t.key }))}
                  aria-pressed={state.theme === t.key}
                  className={cn(
                    "rounded-xl border p-2.5 text-left transition",
                    state.theme === t.key ? "border-navy-500 ring-2 ring-navy-100" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <span className="flex gap-1" aria-hidden>
                    <span className="h-4 w-4 rounded-full" style={{ background: t.primary }} />
                    <span className="h-4 w-4 rounded-full" style={{ background: t.accent }} />
                  </span>
                  <span className="mt-1.5 block text-xs font-bold text-navy-900">{t.label}</span>
                  <span className="text-[10px] text-slate-400">{t.serif ? "Serif" : "Sans-serif"}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Typography Scale</h2>
            <input
              type="range"
              min={0.85}
              max={1.2}
              step={0.05}
              value={state.fontScale}
              aria-label="Typography scale"
              onChange={(e) => setState((s) => ({ ...s, fontScale: parseFloat(e.target.value) }))}
              className="mt-3 w-full accent-navy-700"
            />
            <p className="text-[11px] text-slate-400">{Math.round(state.fontScale * 100)}% of base size</p>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Page Size</h2>
            <div className="mt-2.5 flex gap-2">
              {(["A4", "Letter"] as const).map((p) => (
                <button key={p} onClick={() => setState((s) => ({ ...s, pageSize: p }))} aria-pressed={state.pageSize === p} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition", state.pageSize === p ? "border-navy-800 bg-navy-900 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Margins</h2>
            <div className="mt-2.5 flex gap-2">
              {(["narrow", "normal", "wide"] as const).map((m) => (
                <button key={m} onClick={() => setState((s) => ({ ...s, margins: m }))} aria-pressed={state.margins === m} className={cn("flex-1 rounded-xl border px-2 py-2 text-xs font-bold capitalize transition", state.margins === m ? "border-navy-800 bg-navy-900 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {(
              [
                ["header", "Page Header"],
                ["footer", "Page Footer & Numbers"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                <span className="text-xs font-bold text-slate-700">{label}</span>
                <input
                  type="checkbox"
                  checked={state[k]}
                  onChange={(e) => setState((s) => ({ ...s, [k]: e.target.checked }))}
                  className="h-4 w-4 accent-navy-700"
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl bg-navy-50 p-3.5 text-[11px] leading-relaxed text-navy-700">
            <strong>Logo & branding</strong> are inherited from Settings → Branding. Production export uses HTML/CSS templates rendered to PDF via Puppeteer.
          </div>
        </div>
      </div>
    </div>
  );
}
