"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileStack,
  GitBranch,
  Layers,
  LineChart,
  Menu,
  PieChart,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Logo, btn, cn } from "@/components/ui";
import { INSTITUTE } from "@/lib/data";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Analytics", href: "#analytics" },
  { label: "Archive", href: "#archive" },
  { label: "About", href: "#about" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    body: "Separate permissions for administrators, coordinators and departments, with a full audit trail of every action.",
  },
  {
    icon: Database,
    title: "Smart Data Collection",
    body: "Standardized, validated forms prevent inconsistent submissions — no more mismatched Word files and spreadsheets.",
  },
  {
    icon: Layers,
    title: "Report Builder",
    body: "Arrange chapters, customize branding and typography, and preview the final report page-by-page in real time.",
  },
  {
    icon: GitBranch,
    title: "Approval Workflow",
    body: "Track every submission from draft to final approval with section-level comments and change requests.",
  },
  {
    icon: PieChart,
    title: "Data Visualization",
    body: "Statistics automatically become professional charts — placements, research, events and year-over-year trends.",
  },
  {
    icon: FileStack,
    title: "Historical Archive",
    body: "Store, search and compare annual reports across multiple years from one permanent institutional archive.",
  },
];

const STEPS = [
  { num: "01", title: "Collect", body: "Departments enter structured information through guided forms.", icon: Database },
  { num: "02", title: "Review", body: "Coordinators verify submissions and request changes where needed.", icon: ClipboardCheck },
  { num: "03", title: "Approve", body: "Institute administrators approve final content section by section.", icon: FileCheck2 },
  { num: "04", title: "Publish", body: "Generate polished PDF, Word and interactive web versions instantly.", icon: Sparkles },
];

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function HeroPreview() {
  const completion = useCountUp(82);
  const placement = useCountUp(94);
  return (
    <div className="animate-fade-up delay-150 relative mx-auto w-full max-w-[520px] px-1 sm:px-0">
      <div className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-navy-100 via-white to-gold-100 opacity-70 blur-2xl sm:-inset-6" aria-hidden />
      <div className="card overflow-hidden !rounded-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-navy-900 px-3 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
          </div>
          <p className="truncate text-[10px] font-semibold text-white/80 sm:text-xs">Annual Report 2025–26 · Live Progress</p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-5 sm:grid-cols-4">
          {[
            { label: "Completion", value: `${completion}%`, color: "text-navy-700" },
            { label: "Departments", value: "12", color: "text-navy-700" },
            { label: "Pending", value: "8", color: "text-amber-600" },
            { label: "Achievements", value: "156", color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className={cn("font-display text-xl font-extrabold", s.color)}>{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Report generation</span>
            <span className="text-navy-700">{completion}% complete</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-navy-700 to-navy-500 transition-all duration-300" style={{ width: `${completion}%` }} />
          </div>
          <div className="mt-4 flex items-end gap-2" aria-hidden>
            {[38, 52, 44, 61, 70, 58, 78, 84, 76, 92].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-navy-100" style={{ height: 4 + h * 0.6, animation: `fade-up 0.6s ease both`, animationDelay: `${i * 60}ms` }}>
                <div className="h-full w-full rounded-t-md bg-gradient-to-t from-navy-600 to-navy-400 opacity-90" style={{ height: "100%" }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 h-5 w-5 text-emerald-600" aria-hidden />
              <div>
                <p className="text-xs font-bold text-emerald-800">Placement Rate: {placement}%</p>
                <p className="text-[11px] text-emerald-700/70">+6.8% over last year</p>
              </div>
            </div>
            <span className="animate-pulse-dot inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-navy-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> Compiling
            </span>
          </div>
        </div>
      </div>
      <div className="card animate-fade-up delay-300 absolute -left-2 bottom-[-1.25rem] hidden max-w-[calc(100%-1rem)] items-center gap-3 !rounded-xl px-3 py-2.5 shadow-lg sm:-left-4 sm:-bottom-6 sm:flex sm:px-4 sm:py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700" aria-hidden>
          <FileCheck2 className="h-4.5 w-4.5 h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold text-navy-900">8 pending approvals</p>
          <p className="text-[11px] text-slate-500">Coordinator queue</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Skip link */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="AnnualReport home">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-navy-800">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link href="/login" className={btn.ghost}>Sign In</Link>
            <Link href="/login" className={btn.primary}>Get Started <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
        {menuOpen && (
          <div className="animate-fade-in border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV.map((n) => (
                <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {n.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Link href="/login" className={cn(btn.secondary, "flex-1")}>Sign In</Link>
                <Link href="/login" className={cn(btn.primary, "flex-1")}>Get Started</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,#eef3fc_0%,transparent_70%)]" aria-hidden />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:gap-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-2 lg:gap-14 lg:pt-24">
            <div className="animate-fade-up">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-3 py-1.5 text-[11px] font-bold text-navy-700 sm:px-3.5 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden /> <span className="truncate">Built for colleges, universities & institutes</span>
              </p>
              <h1 className="font-display mt-4 text-[1.85rem] font-extrabold leading-[1.12] tracking-tight text-navy-950 sm:mt-5 sm:text-4xl md:text-5xl lg:text-[56px]">
                Build Your Institute’s Annual Report — <span className="text-navy-500">Automatically.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:mt-5 sm:text-lg">
                Collect departmental data, manage approvals, visualize institutional performance and generate a professional annual report from one centralized platform.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/login" className={cn(btn.primary, "w-full px-6 py-3 text-base sm:w-auto")}>
                  Create Annual Report <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link href="/reports/2025-26" className={cn(btn.secondary, "w-full px-6 py-3 text-base sm:w-auto")}>
                  <Play className="h-4 w-4" aria-hidden /> View Demo
                </Link>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400">No credit card · Demo accounts available for evaluation</p>
            </div>
            <div className="px-1 sm:px-0">
              <HeroPreview />
            </div>
          </div>

          {/* Trust strip */}
          <div className="border-y border-slate-100 bg-slate-50/70">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:grid-cols-4">
              {[
                { v: "12+", l: "Departments" },
                { v: "500+", l: "Data Points" },
                { v: "98%", l: "Submission Accuracy" },
                { v: "1", l: "Centralized Report" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">{s.v}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-navy-500">How It Works</p>
            <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl md:text-4xl">
              From scattered files to a finished report
            </h2>
            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              One clear workflow replaces weeks of chasing Word documents, spreadsheets and email attachments.
            </p>
          </div>
          <div className="relative mt-10 grid grid-cols-2 gap-6 sm:mt-14 sm:gap-8 md:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-navy-200 md:block" aria-hidden />
            {STEPS.map((s, i) => (
              <div key={s.num} className="animate-fade-up relative text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-navy-100 bg-white text-navy-700 shadow-sm sm:h-16 sm:w-16">
                  <s.icon className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                </div>
                <p className="mt-3 text-[10px] font-extrabold tracking-widest text-gold-600 sm:mt-4 sm:text-xs">{s.num}</p>
                <h3 className="font-display mt-1 text-base font-bold text-navy-900 sm:text-lg">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[240px] text-xs leading-relaxed text-slate-500 sm:text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-slate-100 bg-slate-50/60 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-navy-500">Platform</p>
              <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl md:text-4xl">
                Everything an institution needs to report with confidence
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="card card-hover animate-fade-up p-5 sm:p-6" style={{ animationDelay: `${i * 70}ms` }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-300" aria-hidden>
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-bold text-navy-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics teaser */}
        <section id="analytics" className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy-500">Analytics</p>
            <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl md:text-4xl">
              Institutional performance, visualized
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Every number a department submits becomes part of a living analytics layer — placements, research output, events and year-over-year comparisons, ready for management review and NAAC/NBA documentation.
            </p>
            <ul className="mt-6 space-y-3">
              {["Year-over-year comparison across 3+ academic years", "Department performance ranking and completion tracking", "Charts generated automatically from submitted data"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <Link href="/login" className={cn(btn.primary, "mt-8 w-full sm:w-auto")}>Explore Analytics <BarChart3 className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="card p-4 sm:p-6">
            <p className="text-sm font-bold text-navy-900">Placement Rate — Year over Year</p>
            <div className="mt-6 flex items-end gap-3 sm:gap-6" aria-hidden>
              {[
                { y: "2023–24", v: 84 },
                { y: "2024–25", v: 88 },
                { y: "2025–26", v: 94 },
              ].map((b, i) => (
                <div key={b.y} className="flex flex-1 flex-col items-center gap-2">
                  <p className="font-display text-base font-extrabold text-navy-800 sm:text-lg">{b.v}%</p>
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-navy-700 to-navy-400" style={{ height: b.v * 1.8 - 100, animation: "fade-up 0.7s ease both", animationDelay: `${i * 120}ms` }} />
                  <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">{b.y}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-bold text-emerald-700 sm:px-4 sm:text-sm">
              <LineChart className="h-4 w-4 shrink-0" aria-hidden /> +6.8% improvement this year
            </div>
          </div>
        </section>

        {/* Archive teaser */}
        <section id="archive" className="border-t border-slate-100 bg-navy-950 py-14 text-white sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Historical Archive</p>
                <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                  Every year’s story, preserved forever
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                  Reports don’t disappear into filing cabinets. The archive keeps every published annual report searchable, downloadable and comparable — an institutional memory that compounds in value.
                </p>
                <Link href="/reports/2025-26" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-slate-100 sm:w-auto">
                  View Published Report <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {["2025–26", "2024–25", "2023–24"].map((y, i) => (
                  <div key={y} className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur" style={{ animationDelay: `${i * 100}ms` }}>
                    <FileStack className="h-6 w-6 text-gold-300" aria-hidden />
                    <p className="font-display mt-4 text-xl font-extrabold">{y}</p>
                    <p className="mt-1 text-xs text-white/60">Annual Report · Published</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About / CTA */}
        <section id="about" className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
          <Users className="mx-auto h-10 w-10 text-navy-400" aria-hidden />
          <h2 className="font-display mt-5 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl md:text-4xl">
            Replace weeks of manual compilation with one workflow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            AnnualReport centralizes submissions, reviews and approvals so your institution publishes a professional annual report on time, every year. Built for Indian colleges and universities — from a single institute to a multi-campus university.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/login" className={cn(btn.primary, "w-full px-6 py-3 text-base sm:w-auto")}>Get Started Free</Link>
            <Link href="/reports/2025-26" className={cn(btn.secondary, "w-full px-6 py-3 text-base sm:w-auto")}>See a Published Report</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-xs text-slate-500">
            © 2026 AnnualReport · Demo instance for {INSTITUTE.name}
          </p>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <a href="#features" className="hover:text-navy-700">Features</a>
            <a href="#how-it-works" className="hover:text-navy-700">Workflow</a>
            <Link href="/login" className="hover:text-navy-700">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
