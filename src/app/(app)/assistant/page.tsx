"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles, Wand2 } from "lucide-react";
import { PageHeader, btn, cn, inputCls } from "@/components/ui";
import { api, useApp } from "@/lib/store";

const MODES = [
  { key: "summary", label: "Professional Summary", desc: "Turn raw notes into polished report prose." },
  { key: "grammar", label: "Grammar Improvement", desc: "Fix grammar, capitalization and flow." },
  { key: "executive", label: "Executive Summary", desc: "Produce a leadership-ready overview." },
  { key: "highlights", label: "Achievement Highlights", desc: "Extract bullet-point highlights." },
  { key: "compile", label: "Compile Report Chapter", desc: "From structured academic data, generates a full annual-report chapter with subject-wise KPIs and action items." },
];

const SAMPLE =
  "Department organized 12 events, students won 8 competitions and faculty published 23 research papers.";

const SAMPLE_COMPILE = JSON.stringify({
  department: "Computer Engineering",
  subjects: [
    { code: "CE301", name: "Data Structures & Algorithms", syl: 100, att: 91, pass: 96, notes: 6, ppt: 12, assignments: 4, papers: 2, viva: true, marksheet: true },
    { code: "CE302", name: "Database Management Systems", syl: 100, att: 88, pass: 94, notes: 5, ppt: 11, assignments: 4, papers: 2, viva: true, marksheet: true },
    { code: "CE401", name: "Operating Systems", syl: 96, att: 86, pass: 92, notes: 5, ppt: 10, assignments: 3, papers: 2, viva: true, marksheet: true },
    { code: "CE501", name: "Compiler Design", syl: 82, att: 81, pass: 87, notes: 4, ppt: 8, assignments: 3, papers: 1, viva: false, marksheet: false },
  ],
}, null, 2);

export default function AssistantPage() {
  const { toast } = useApp();
  const [mode, setMode] = useState("summary");
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function run() {
    setBusy(true);
    setOutput("");
    try {
      const res = await api("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          mode,
          text: input,
          context: mode === "compile" ? JSON.parse(input) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOutput(json.output);
    } catch (e) {
      toast("Generation failed", e instanceof Error ? e.message : "Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            AI Report Assistant
            <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gold-700">Bonus Feature</span>
          </span>
        }
        subtitle="Paste raw departmental notes and let AI draft professional report language. You always review and edit before publication."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="AI modes">
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              mode === m.key ? "border-navy-500 bg-navy-50/60 ring-2 ring-navy-100" : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <Wand2 className={cn("h-4 w-4", mode === m.key ? "text-navy-700" : "text-slate-400")} aria-hidden />
            <p className="mt-2 text-xs font-extrabold text-navy-900">{m.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <label htmlFor="ai-input" className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Raw Input
          </label>
          <textarea
            id="ai-input"
            rows={mode === "compile" ? 12 : 9}
            className={cn(inputCls, "mt-2")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "compile" ? "Paste the JSON payload with department name and subjects array…" : "Paste raw text here…"}
          />
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setInput(mode === 'compile' ? SAMPLE_COMPILE : SAMPLE)} className="text-xs font-bold text-navy-600 hover:underline">Use sample input</button>
            <button onClick={run} disabled={busy || !input.trim()} className={btn.primary}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {MODES.find((m) => m.key === mode)?.label}
            </button>
          </div>
        </div>

        <div className="card flex flex-col p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">AI Output · Editable</p>
            {output && (
              <button onClick={copy} className={cn(btn.ghost, "!px-2.5 !py-1.5 text-xs")}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {busy ? (
            <div className="mt-2 flex-1 space-y-2.5 py-4" aria-label="Generating" role="status">
              {[90, 100, 75, 95, 60].map((w, i) => (
                <div key={i} className="h-3 animate-pulse rounded-full bg-navy-100/70" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
              ))}
              <p className="pt-2 text-xs font-semibold text-slate-400">Drafting professional language…</p>
            </div>
          ) : output ? (
            <textarea
              aria-label="AI generated output — editable"
              rows={9}
              className={cn(inputCls, "mt-2 flex-1 bg-navy-50/30")}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
          ) : (
            <div className="mt-2 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
              <Sparkles className="h-6 w-6 text-slate-300" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-slate-400">Generated text will appear here</p>
              <p className="text-xs text-slate-300">Always review AI content before publication</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 rounded-2xl border border-gold-300/50 bg-gold-100/40 px-5 py-4 text-xs leading-relaxed text-gold-700">
        <strong>Human in the loop:</strong> AI-generated content is a draft. Department heads and coordinators review, edit and approve every sentence before it enters the annual report.
      </p>
    </div>
  );
}
