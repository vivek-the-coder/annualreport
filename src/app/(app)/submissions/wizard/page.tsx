"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Field, btn, cn, inputCls } from "@/components/ui";
import { api, useApp } from "@/lib/store";

const STEPS = [
  "Subject Details",
  "Student Records",
  "Attendance",
  "Syllabus Completion",
  "Teaching Material",
  "Assessment & Results",
  "Uploads",
  "Review",
];

interface UploadItem {
  id: number;
  name: string;
  size: string;
  progress: number;
  caption: string;
  kind: "image" | "doc";
}

interface WizardData {
  deptName: string;
  hod: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
  facultyName: string;
  totalStudents: string;
  maleStudents: string;
  femaleStudents: string;
  lecturesPlanned: string;
  lecturesTaken: string;
  studentsAbove75: string;
  unitsPlanned: string;
  unitsCovered: string;
  syllabusRemarks: string;
  notesCount: string;
  pptCount: string;
  labManuals: string;
  assignmentsIssued: string;
  assignmentsSubmitted: string;
  examPapers: string;
  studentsAppeared: string;
  studentsPassed: string;
  vivaCompleted: string;
  resultRemarks: string;
}

const DEFAULTS: WizardData = {
  deptName: "Computer Engineering",
  hod: "Dr. Meera Shah",
  subjectCode: "CE301",
  subjectName: "Data Structures & Algorithms",
  semester: "3",
  facultyName: "Dr. Meera Shah",
  totalStudents: "118",
  maleStudents: "72",
  femaleStudents: "46",
  lecturesPlanned: "45",
  lecturesTaken: "45",
  studentsAbove75: "107",
  unitsPlanned: "5",
  unitsCovered: "5",
  syllabusRemarks: "All five units completed as per the academic calendar. Two extra tutorial sessions conducted on graph algorithms.",
  notesCount: "6",
  pptCount: "12",
  labManuals: "1",
  assignmentsIssued: "4",
  assignmentsSubmitted: "112",
  examPapers: "2",
  studentsAppeared: "118",
  studentsPassed: "113",
  vivaCompleted: "yes",
  resultRemarks: "Internal assessment completed. Five students placed in the remedial batch for re-examination.",
};

const STORAGE_KEY = "arp_wizard_draft_v1";

function numErr(v: string, label: string): string | undefined {
  if (v.trim() === "") return `${label} is required.`;
  if (!/^\d+(\.\d+)?$/.test(v.trim())) return `${label} must be a valid number.`;
  return undefined;
}

export default function WizardPage() {
  const { toast, refresh, user } = useApp();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<WizardData>(DEFAULTS);
  const [uploads, setUploads] = useState<UploadItem[]>([
    { id: 1, name: "CE301-internal-question-paper.pdf", size: "412 KB", progress: 100, caption: "Internal examination question paper with CO/PO blueprint.", kind: "doc" },
    { id: 2, name: "CE301-attendance-register.xlsx", size: "148 KB", progress: 100, caption: "", kind: "doc" },
    { id: 3, name: "CE301-unit3-notes.pdf", size: "1.8 MB", progress: 100, caption: "", kind: "doc" },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const idRef = useRef(10);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setD({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const set =
    (k: keyof WizardData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setD((prev) => ({ ...prev, [k]: e.target.value }));

  const attendanceRate = useMemo(() => {
    const p = parseFloat(d.lecturesTaken), t = parseFloat(d.totalStudents), a = parseFloat(d.studentsAbove75);
    if (!isFinite(t) || !isFinite(a) || t <= 0) return null;
    void p;
    return Math.min(100, (a / t) * 100).toFixed(1);
  }, [d.studentsAbove75, d.totalStudents, d.lecturesTaken]);

  const syllabusRate = useMemo(() => {
    const c = parseFloat(d.unitsCovered), t = parseFloat(d.unitsPlanned);
    if (!isFinite(c) || !isFinite(t) || t <= 0) return null;
    return Math.min(100, (c / t) * 100).toFixed(1);
  }, [d.unitsCovered, d.unitsPlanned]);

  const lectureRate = useMemo(() => {
    const c = parseFloat(d.lecturesTaken), t = parseFloat(d.lecturesPlanned);
    if (!isFinite(c) || !isFinite(t) || t <= 0) return null;
    return Math.min(100, (c / t) * 100).toFixed(1);
  }, [d.lecturesTaken, d.lecturesPlanned]);

  const passRate = useMemo(() => {
    const p = parseFloat(d.studentsPassed), a = parseFloat(d.studentsAppeared);
    if (!isFinite(p) || !isFinite(a) || a <= 0) return null;
    return Math.min(100, (p / a) * 100).toFixed(1);
  }, [d.studentsPassed, d.studentsAppeared]);

  const submissionRate = useMemo(() => {
    const sub = parseFloat(d.assignmentsSubmitted), tot = parseFloat(d.totalStudents);
    if (!isFinite(sub) || !isFinite(tot) || tot <= 0) return null;
    return Math.min(100, (sub / tot) * 100).toFixed(1);
  }, [d.assignmentsSubmitted, d.totalStudents]);

  const genderCheck = useMemo(() => {
    const t = parseInt(d.totalStudents), m = parseInt(d.maleStudents), f = parseInt(d.femaleStudents);
    if ([t, m, f].some((x) => !isFinite(x))) return null;
    return m + f === t;
  }, [d.totalStudents, d.maleStudents, d.femaleStudents]);

  function saveDraft(silent = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      if (!silent) toast("Draft saved", "Your progress is stored safely on this device.", "success");
    } catch {
      toast("Could not save draft", "Your changes could not be saved. Please try again.", "error");
    }
  }

  function validateStep(s: number): boolean {
    const errs: Record<string, string | undefined> = {};
    if (s === 1) {
      errs.totalStudents = numErr(d.totalStudents, "Total students");
      errs.maleStudents = numErr(d.maleStudents, "Male students");
      errs.femaleStudents = numErr(d.femaleStudents, "Female students");
    }
    if (s === 2) {
      errs.lecturesPlanned = numErr(d.lecturesPlanned, "Lectures planned");
      errs.lecturesTaken = numErr(d.lecturesTaken, "Lectures taken");
      errs.studentsAbove75 = numErr(d.studentsAbove75, "Students above 75%");
      if (!errs.studentsAbove75 && parseFloat(d.studentsAbove75) > parseFloat(d.totalStudents || "0")) {
        errs.studentsAbove75 = "Cannot exceed the total number of students.";
      }
    }
    if (s === 3) {
      errs.unitsPlanned = numErr(d.unitsPlanned, "Units planned");
      errs.unitsCovered = numErr(d.unitsCovered, "Units covered");
      if (!errs.unitsCovered && parseFloat(d.unitsCovered) > parseFloat(d.unitsPlanned || "0")) {
        errs.unitsCovered = "Units covered cannot exceed units planned.";
      }
    }
    if (s === 5) {
      errs.studentsAppeared = numErr(d.studentsAppeared, "Students appeared");
      errs.studentsPassed = numErr(d.studentsPassed, "Students passed");
      if (!errs.studentsPassed && parseFloat(d.studentsPassed) > parseFloat(d.studentsAppeared || "0")) {
        errs.studentsPassed = "Passed cannot exceed the number who appeared.";
      }
    }
    setErrors(errs);
    return Object.values(errs).every((e) => !e);
  }

  function next() {
    if (!validateStep(step)) {
      toast("Please fix the highlighted fields", "Some values are missing or invalid.", "error");
      return;
    }
    saveDraft(true);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const items: UploadItem[] = Array.from(files).map((f) => ({
      id: idRef.current++,
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      progress: 0,
      caption: "",
      kind: /\.(jpe?g|png|gif|webp)$/i.test(f.name) ? "image" : "doc",
    }));
    setUploads((u) => [...u, ...items]);
    items.forEach((item) => {
      let p = 0;
      const timer = setInterval(() => {
        p += 12 + Math.random() * 18;
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, progress: Math.min(100, Math.round(p)) } : x)));
        if (p >= 100) clearInterval(timer);
      }, 220);
    });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  async function polishWithAI() {
    setAiBusy(true);
    try {
      const res = await api("/api/ai", {
        method: "POST",
        body: JSON.stringify({ mode: "summary", text: d.syllabusRemarks }),
      });
      const json = await res.json();
      if (res.ok) {
        setD((prev) => ({ ...prev, syllabusRemarks: json.output }));
        toast("AI summary generated", "Review and edit the text before submitting.", "info");
      }
    } finally {
      setAiBusy(false);
    }
  }

  async function submitForReview() {
    setSubmitting(true);
    try {
      const res = await api("/api/submit", {
        method: "POST",
        body: JSON.stringify({ department: user?.department ?? "Computer Engineering" }),
      });
      if (!res.ok) throw new Error();
      await refresh();
      setDone(true);
    } catch {
      toast("Something went wrong", "Your submission could not be sent. Please retry or save offline.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="animate-check-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
        </span>
        <h1 className="font-display mt-6 text-2xl font-extrabold text-navy-900">Submission sent successfully</h1>
        <p className="mt-2 text-slate-500">
          Your academic records have been submitted to the coordinator for verification. You’ll be notified when they are approved or if changes are requested.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard" className={btn.primary}>Back to Dashboard</Link>
          <Link href="/approvals" className={btn.secondary}>Track Approval Status</Link>
        </div>
      </div>
    );
  }

  const num = (k: keyof WizardData, label: string, hint?: string) => (
    <Field label={label} htmlFor={k} error={errors[k]} hint={hint}>
      <input id={k} inputMode="numeric" className={cn(inputCls, errors[k] && "border-rose-300 ring-2 ring-rose-100")} value={d[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
    </Field>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-2 flex items-center justify-between">
        <Link href="/submissions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-800">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to submissions
        </Link>
        <span className="text-xs font-bold text-slate-400">Annual Report 2025–26</span>
      </div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Academic Record Submission</h1>
      <p className="mt-1 text-sm text-slate-500">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

      {/* Stepper */}
      <ol className="thin-scroll mt-6 flex gap-1 overflow-x-auto pb-2" aria-label="Submission steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex min-w-fit items-center gap-1">
            <button
              onClick={() => i <= step && setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition",
                i === step ? "bg-navy-900 text-white" : i < step ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
              )}
            >
              <span aria-hidden>{i < step ? "✓" : i + 1}</span> {s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-3 shrink-0 bg-slate-200" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="card animate-fade-in mt-4 p-6 sm:p-8" key={step}>
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-navy-900">Subject Details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Subject Code" htmlFor="subjectCode"><input id="subjectCode" className={inputCls} value={d.subjectCode} onChange={set("subjectCode")} /></Field>
              <Field label="Semester" htmlFor="semester"><input id="semester" inputMode="numeric" className={inputCls} value={d.semester} onChange={set("semester")} /></Field>
            </div>
            <Field label="Subject Name" htmlFor="subjectName"><input id="subjectName" className={inputCls} value={d.subjectName} onChange={set("subjectName")} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Faculty In-charge" htmlFor="facultyName"><input id="facultyName" className={inputCls} value={d.facultyName} onChange={set("facultyName")} /></Field>
              <Field label="Department" htmlFor="deptName"><input id="deptName" className={inputCls} value={d.deptName} onChange={set("deptName")} /></Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display mb-1 text-lg font-bold text-navy-900">Student Records</h2>
            <p className="mb-5 text-sm text-slate-500">Enrollment for this subject. Totals are cross-checked automatically.</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {num("totalStudents", "Total Students")}
              {num("maleStudents", "Male Students")}
              {num("femaleStudents", "Female Students")}
            </div>
            {genderCheck === false && (
              <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Male + Female ({parseInt(d.maleStudents) + parseInt(d.femaleStudents)}) does not equal Total Students ({d.totalStudents}). Please verify against the roll list.
              </p>
            )}
            {genderCheck === true && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Roll list totals are consistent.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-navy-900">Attendance</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {num("lecturesPlanned", "Lectures Planned")}
              {num("lecturesTaken", "Lectures Taken")}
              {num("studentsAbove75", "Students Above 75%")}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div aria-live="polite" className={cn("rounded-xl border px-5 py-4", lectureRate ? "border-navy-100 bg-navy-50" : "border-slate-200 bg-slate-50")}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lecture Delivery</p>
                <p className={cn("font-display mt-1 text-3xl font-extrabold", lectureRate ? "text-navy-800" : "text-slate-300")}>{lectureRate ? `${lectureRate}%` : "—"}</p>
                <p className="mt-1 text-xs text-slate-500">{d.lecturesTaken || "—"} of {d.lecturesPlanned || "—"} lectures conducted</p>
              </div>
              <div aria-live="polite" className={cn("rounded-xl border px-5 py-4", attendanceRate ? "border-emerald-100 bg-emerald-50" : "border-slate-200 bg-slate-50")}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Attendance Compliance</p>
                <p className={cn("font-display mt-1 text-3xl font-extrabold", attendanceRate ? "text-emerald-700" : "text-slate-300")}>{attendanceRate ? `${attendanceRate}%` : "—"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {d.studentsAbove75 || "—"} of {d.totalStudents || "—"} students meet the 75% requirement
                </p>
              </div>
            </div>
            {attendanceRate && parseFloat(attendanceRate) < 75 && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                Attendance compliance is below 75%. A detention list and parent intimation record must be attached in Uploads.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-navy-900">Syllabus Completion</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {num("unitsPlanned", "Units Planned")}
              {num("unitsCovered", "Units Covered")}
            </div>
            <div aria-live="polite" className={cn("rounded-xl border px-5 py-4", syllabusRate ? "border-navy-100 bg-navy-50" : "border-slate-200 bg-slate-50")}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Syllabus Completion (auto-calculated)</p>
              <p className={cn("font-display mt-1 text-3xl font-extrabold", syllabusRate ? "text-navy-800" : "text-slate-300")}>{syllabusRate ? `${syllabusRate}%` : "—"}</p>
            </div>
            <Field label="Deviation / Remarks" htmlFor="syllabusRemarks" hint="Required if completion is below 100%.">
              <textarea id="syllabusRemarks" rows={4} className={inputCls} value={d.syllabusRemarks} onChange={set("syllabusRemarks")} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-navy-900">Teaching Material</h2>
            <p className="text-sm text-slate-500">Counts of material prepared and uploaded to the subject repository.</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {num("notesCount", "Unit-wise Notes")}
              {num("pptCount", "Lecture PPTs")}
              {num("labManuals", "Lab Manuals")}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {num("assignmentsIssued", "Assignments Issued")}
              {num("assignmentsSubmitted", "Assignment Submissions Received")}
            </div>
            {submissionRate && (
              <p className="rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-800">
                Assignment submission rate: <strong>{submissionRate}%</strong>
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-navy-900">Assessment & Results</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {num("examPapers", "Question Papers Set")}
              {num("studentsAppeared", "Students Appeared")}
              {num("studentsPassed", "Students Passed")}
            </div>
            <div aria-live="polite" className={cn("flex items-center justify-between rounded-xl border px-5 py-4", passRate ? "border-emerald-100 bg-emerald-50" : "border-slate-200 bg-slate-50")}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pass Percentage (auto-calculated)</p>
                <p className={cn("font-display mt-1 text-3xl font-extrabold", passRate ? "text-emerald-700" : "text-slate-300")}>{passRate ? `${passRate}%` : "—"}</p>
              </div>
              <p className="max-w-[180px] text-right text-xs text-slate-500">
                {d.studentsPassed || "—"} passed of {d.studentsAppeared || "—"} appeared
              </p>
            </div>
            <Field label="Viva / Practical Completed" htmlFor="vivaCompleted">
              <select id="vivaCompleted" className={inputCls} value={d.vivaCompleted} onChange={set("vivaCompleted")}>
                <option value="yes">Yes — viva and practicals completed</option>
                <option value="partial">Partially completed</option>
                <option value="no">Not yet conducted</option>
              </select>
            </Field>
            <Field label="Result Remarks" htmlFor="resultRemarks">
              <textarea id="resultRemarks" rows={3} className={inputCls} value={d.resultRemarks} onChange={set("resultRemarks")} />
            </Field>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className="font-display text-lg font-bold text-navy-900">Upload Records</h2>
            <p className="mt-1 text-sm text-slate-500">Question papers, marksheets, attendance registers, notes, PPTs and lab manuals. PDF, DOCX, PPTX, XLSX, JPG, PNG · Max 25 MB per file</p>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
                dragOver ? "border-navy-500 bg-navy-50" : "border-slate-200 bg-slate-50/60 hover:border-navy-300 hover:bg-navy-50/40"
              )}
            >
              <UploadCloud className={cn("h-10 w-10", dragOver ? "text-navy-600" : "text-slate-400")} aria-hidden />
              <p className="mt-3 text-sm font-bold text-navy-900">Drag files here or browse</p>
              <p className="mt-1 text-xs text-slate-400">Files are attached to this subject’s academic record</p>
              <input type="file" multiple className="sr-only" aria-label="Upload files" onChange={(e) => addFiles(e.target.files)} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" />
            </label>

            <ul className="mt-5 space-y-3">
              {uploads.map((u) => (
                <li key={u.id} className="animate-fade-up rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", u.kind === "image" ? "bg-navy-50 text-navy-600" : "bg-gold-100 text-gold-700")} aria-hidden>
                      {u.kind === "image" ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.size} · {u.progress < 100 ? `Uploading ${u.progress}%` : "Uploaded"}</p>
                    </div>
                    {u.progress === 100 && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />}
                    <button aria-label={`Delete ${u.name}`} onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {u.progress < 100 && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-navy-600 transition-all duration-200" style={{ width: `${u.progress}%` }} />
                    </div>
                  )}
                  {u.progress === 100 && (
                    <input
                      aria-label={`Caption for ${u.name}`}
                      placeholder="Add a caption, e.g. “Unit 3 notes — Trees & Graphs”"
                      className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      value={u.caption}
                      onChange={(e) => setUploads((x) => x.map((y) => (y.id === u.id ? { ...y, caption: e.target.value } : y)))}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 className="font-display text-lg font-bold text-navy-900">Review & Submit</h2>
            <p className="mt-1 text-sm text-slate-500">Verify your data before sending it to the coordinator.</p>
            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {[
                ["Subject", `${d.subjectCode} — ${d.subjectName}`],
                ["Semester / Faculty", `Semester ${d.semester} · ${d.facultyName}`],
                ["Students", `${d.totalStudents} (${d.maleStudents} male · ${d.femaleStudents} female)`],
                ["Lectures", `${d.lecturesTaken} of ${d.lecturesPlanned} conducted${lectureRate ? ` (${lectureRate}%)` : ""}`],
                ["Attendance Compliance", attendanceRate ? `${attendanceRate}% above 75%` : "—"],
                ["Syllabus Completion", syllabusRate ? `${syllabusRate}% (${d.unitsCovered}/${d.unitsPlanned} units)` : "—"],
                ["Teaching Material", `${d.notesCount} notes · ${d.pptCount} PPTs · ${d.labManuals} lab manuals`],
                ["Assignments", `${d.assignmentsIssued} issued · ${d.assignmentsSubmitted} submissions${submissionRate ? ` (${submissionRate}%)` : ""}`],
                ["Exam Papers", `${d.examPapers} question papers set`],
                ["Pass Percentage", passRate ? `${passRate}% (${d.studentsPassed}/${d.studentsAppeared})` : "—"],
                ["Viva / Practical", d.vivaCompleted === "yes" ? "Completed" : d.vivaCompleted === "partial" ? "Partially completed" : "Not conducted"],
                ["Files Attached", `${uploads.length} files`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{k}</dt>
                  <dd className="text-right text-sm font-semibold text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-xs leading-relaxed text-navy-700">
              On submission, the coordinator will be notified. Sections marked <strong>Draft</strong> or <strong>Changes Requested</strong> will be sent for review. You can still respond to comments afterwards.
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => saveDraft()} className={btn.secondary}>
            <Save className="h-4 w-4" aria-hidden /> Save Draft
          </button>
          {step < 7 && (
            <button onClick={() => { saveDraft(true); setStep(7); }} className={btn.ghost}>
              <Eye className="h-4 w-4" aria-hidden /> Preview
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className={btn.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className={btn.primary}>
              Save & Continue <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button onClick={submitForReview} disabled={submitting} className={cn(btn.success)}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              Submit for Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
