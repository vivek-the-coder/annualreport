"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  Download,
  GraduationCap,
  Lightbulb,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { Donut, SimpleBar, SimpleLine } from "@/components/charts";
import { btn, cn } from "@/components/ui";
import { INSTITUTE, INSTITUTE_STATS, YEARLY, YEARS } from "@/lib/data";

const NAV = ["Overview", "Academics", "Research", "Placements", "Departments", "Achievements", "Events"];

const DEPT_ROWS = [
  { name: "Computer Engineering", students: 720, placement: 96, pubs: 38 },
  { name: "Information Technology", students: 680, placement: 95, pubs: 27 },
  { name: "Mechanical Engineering", students: 640, placement: 89, pubs: 24 },
  { name: "Civil Engineering", students: 560, placement: 84, pubs: 18 },
  { name: "Electrical Engineering", students: 480, placement: 88, pubs: 21 },
  { name: "Electronics & Comm.", students: 440, placement: 86, pubs: 19 },
  { name: "Science", students: 420, placement: 71, pubs: 16 },
  { name: "MBA", students: 360, placement: 91, pubs: 12 },
  { name: "Humanities", students: 280, placement: 65, pubs: 6 },
  { name: "Architecture", students: 240, placement: 78, pubs: 6 },
];

export default function PublicReportPage() {
  const [shared, setShared] = useState(false);
  const trend = YEARS.map((y) => ({
    year: y,
    Placement: YEARLY[y].placement,
    Publications: YEARLY[y].publications,
    Events: YEARLY[y].events,
  }));

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 font-black text-gold-300" aria-hidden>G</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-navy-900">{INSTITUTE.name}</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-600">Annual Report {INSTITUTE.year}</p>
            </div>
          </div>
          <nav aria-label="Report sections" className="hidden gap-1 lg:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-navy-800">
                {n}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => window.print()} className={cn(btn.secondary, "!px-3 !py-2 text-xs")}>
              <Download className="h-3.5 w-3.5" aria-hidden /> <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button onClick={share} className={cn(btn.primary, "!px-3 !py-2 text-xs")}>
              {shared ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Share2 className="h-3.5 w-3.5" aria-hidden />}
              <span className="hidden sm:inline">{shared ? "Link Copied" : "Share Report"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cover */}
      <section id="overview" className="relative overflow-hidden bg-navy-950 py-24 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(200,16,46,0.25)_0%,transparent_70%)]" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-1.5 kpgu-stripe" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white text-2xl font-black text-kp-red-600" aria-hidden>
            KPGU
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-gold-300">Drs. Kiran & Pallavi Patel Global University</p>
          <h1 className="font-display mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">ANNUAL REPORT</h1>
          <p className="font-display mt-2 text-3xl font-bold text-gold-300">{INSTITUTE.year}</p>
          <div className="mx-auto mt-8 h-px w-24 bg-gold-500/60" aria-hidden />
          <p className="mt-6 text-lg italic text-white/70">“{INSTITUTE.tagline}”</p>
        </div>
      </section>

      {/* Key stats */}
      <section className="mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="card relative z-10 grid grid-cols-2 gap-6 !rounded-3xl p-8 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { icon: Users, v: INSTITUTE_STATS.students.toLocaleString("en-IN"), l: "Students" },
            { icon: GraduationCap, v: INSTITUTE_STATS.faculty, l: "Faculty" },
            { icon: Briefcase, v: `${INSTITUTE_STATS.placementRate}%`, l: "Placement Rate" },
            { icon: BookOpen, v: INSTITUTE_STATS.publications, l: "Publications" },
            { icon: Lightbulb, v: INSTITUTE_STATS.patents, l: "Patents" },
            { icon: CalendarDays, v: INSTITUTE_STATS.events, l: "Events" },
            { icon: Trophy, v: INSTITUTE_STATS.awards, l: "Awards" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <s.icon className="mx-auto h-5 w-5 text-gold-600" aria-hidden />
              <p className="font-display mt-2 text-2xl font-extrabold text-navy-900">{s.v}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Director message + academics */}
      <section id="academics" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600">From the Director’s Desk</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-navy-950">A year of measurable excellence</h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              The academic year {INSTITUTE.year} stands as a testament to what disciplined institutions can achieve. With a {INSTITUTE_STATS.placementRate}% placement rate, {INSTITUTE_STATS.publications} research publications and {INSTITUTE_STATS.patents} patents, our community of {INSTITUTE_STATS.students.toLocaleString("en-IN")} students and {INSTITUTE_STATS.faculty} faculty members has raised the bar once again.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              This report — compiled digitally through our Annual Report Portal from verified departmental submissions — presents a transparent account of our progress.
            </p>
            <p className="mt-6 font-display text-lg font-bold text-navy-900">Dr. Ramesh Chandra</p>
            <p className="text-sm text-slate-400">Director, {INSTITUTE.short}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-navy-900">Three-Year Performance Trend</h3>
            <p className="mb-4 text-xs text-slate-400">Placement rate, publications and events</p>
            <SimpleLine data={trend} xKey="year" lines={[{ key: "Placement", color: "#059669" }, { key: "Publications", color: "#1d3f84" }, { key: "Events", color: "#c99a3c" }]} height={300} />
          </div>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="border-y border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Research & Innovation</p>
          <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-navy-950">Research output grew 23% year over year</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-navy-900">Publications by Year</h3>
              <SimpleBar data={trend} xKey="year" bars={[{ key: "Publications", color: "#1d3f84" }]} height={260} />
            </div>
            <div className="space-y-4">
              {[
                { v: "₹4.8 Cr", l: "Sponsored research funding secured" },
                { v: "24", l: "Patents filed — an institutional record" },
                { v: "44", l: "Faculty development programs completed" },
              ].map((s) => (
                <div key={s.l} className="card p-5">
                  <p className="font-display text-2xl font-extrabold text-navy-900">{s.v}</p>
                  <p className="mt-1 text-sm text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Placements */}
      <section id="placements" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Placements</p>
        <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-navy-950">94% placement rate — best in institute history</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-navy-900">Placement Outcomes</h3>
            <Donut
              data={[
                { name: "Placed", value: 94, color: "#059669" },
                { name: "Higher Studies", value: 4, color: "#1d3f84" },
                { name: "Entrepreneurship", value: 2, color: "#c99a3c" },
              ]}
              centerValue="94%"
              centerLabel="Placed"
            />
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-display text-lg font-extrabold text-navy-900">₹42 LPA</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Highest Package</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-display text-lg font-extrabold text-navy-900">184</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recruiters</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold text-navy-900">Placement Rate by Department (%)</h3>
            <SimpleBar
              data={DEPT_ROWS.map((d) => ({ name: d.name.replace(" Engineering", " Engg."), Placement: d.placement }))}
              xKey="name"
              bars={[{ key: "Placement", color: "#1d3f84" }]}
              horizontal
              height={340}
            />
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="border-y border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Departments</p>
          <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-navy-950">Ten departments, one standard of excellence</h2>
          <div className="card mt-10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-navy-950 text-[11px] font-bold uppercase tracking-wider text-white/80">
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Students</th>
                    <th className="px-4 py-3.5">Placement</th>
                    <th className="px-6 py-3.5">Publications</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPT_ROWS.map((d, i) => (
                    <tr key={d.name} className={cn("border-b border-slate-50", i % 2 === 1 && "bg-slate-50/50")}>
                      <td className="px-6 py-3 font-semibold text-navy-900">{d.name}</td>
                      <td className="px-4 py-3 text-slate-600">{d.students}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{d.placement}%</td>
                      <td className="px-6 py-3 text-slate-600">{d.pubs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements + events */}
      <section id="achievements" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Achievements</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-navy-950">73 awards across state & national platforms</h2>
            <ul className="mt-8 space-y-5">
              {[
                "Winners — Smart India Hackathon 2025 (Software Edition)",
                "Best Emerging Engineering Institute — State Education Awards",
                "NAAC A+ accreditation reaffirmed with a CGPA of 3.42",
                "156 student achievements recorded across cultural, sports and technical events",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700" aria-hidden>
                    <Award className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-slate-700">{t}</p>
                </li>
              ))}
            </ul>
          </div>
          <div id="events">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Events</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-navy-950">146 events that shaped the year</h2>
            <div className="mt-8 space-y-4">
              {[
                { t: "TechNova 2025", d: "Flagship technical festival · 3,000+ participants from 40+ colleges" },
                { t: "International Research Conclave", d: "220 papers presented across 6 tracks" },
                { t: "Annual Sports Meet 2025", d: "Inter-college competition across 14 sports disciplines" },
                { t: "Industry Connect Series", d: "28 expert sessions with leaders from Microsoft, TCS and ISRO" },
              ].map((e) => (
                <div key={e.t} className="card card-hover flex items-start gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-300" aria-hidden>
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-navy-900">{e.t}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{e.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 py-14 text-center text-white">
        <Building2 className="mx-auto h-8 w-8 text-gold-300" aria-hidden />
        <p className="font-display mt-4 text-xl font-extrabold">{INSTITUTE.name}</p>
        <p className="mt-1 text-sm text-white/60">Vadodara, Gujarat</p>
        <p className="mt-1 text-sm text-white/60">{INSTITUTE.website} · {INSTITUTE.email}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => window.print()} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-slate-100">
            Download PDF
          </button>
          <Link href="/" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
            Built with AnnualReport
          </Link>
        </div>
        <p className="mt-8 text-xs text-white/40">Published via the Annual Report Portal · {INSTITUTE.year}</p>
      </footer>
    </div>
  );
}
