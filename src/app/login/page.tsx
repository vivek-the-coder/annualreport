"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Logo, btn, cn, inputCls, Field } from "@/components/ui";
import { OtpInput } from "@/components/otp-input";
import { useApp } from "@/lib/store";
import { DEMO_USERS, INSTITUTE, isValidPhone, ROLE_LABEL, type Role } from "@/lib/data";

const DEMO_OPTIONS: { role: Role; title: string; body: string; icon: typeof ShieldCheck }[] = [
  { role: "admin", title: "Administrator Demo", body: "Full institute view, approvals, report builder & publishing.", icon: ShieldCheck },
  { role: "coordinator", title: "Coordinator Demo", body: "Review submissions, request changes, approve sections.", icon: ClipboardCheck },
  { role: "department", title: "Faculty / HOD Demo", body: "Submit academic records, post classroom material, share attendance with parents.", icon: Building2 },
  { role: "student", title: "Student Demo", body: "View enrolled subjects, download notes/PPTs/assignments and see announcements.", icon: GraduationCap },
];

export default function LoginPage() {
  const { login, loginDemo, requestOtp, verifyOtp, user, userLoaded } = useApp();
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "mobile">("email");

  // Email flow
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // Mobile OTP flow
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [masked, setMasked] = useState("");
  const [otpName, setOtpName] = useState("");
  const [demoCode, setDemoCode] = useState<string | undefined>();
  const [cooldown, setCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Already signed in (e.g. returned via browser back) — go straight in.
  useEffect(() => {
    if (userLoaded && user) router.replace("/dashboard");
  }, [userLoaded, user, router]);

  function switchMethod(m: "email" | "mobile") {
    setMethod(m);
    setError(null);
  }

  async function onSubmitEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your institutional email address.");
    if (!password.trim()) return setError("Please enter your password.");
    setBusy("form");
    const err = await login(email.trim(), password);
    if (err) {
      setError(err);
      setBusy(null);
    }
  }

  async function onSendOtp(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!isValidPhone(phone)) {
      return setError("Enter a valid 10-digit mobile number starting with 6–9.");
    }
    setBusy("otp-send");
    const res = await requestOtp(phone);
    setBusy(null);
    if (res.error) return setError(res.error);
    setMasked(res.masked ?? phone);
    setOtpName(res.name ?? "");
    setDemoCode(res.demoCode);
    setCode("");
    setStage("code");
    setCooldown(30);
  }

  async function onVerify(codeOverride?: string) {
    const finalCode = codeOverride ?? code;
    setError(null);
    if (finalCode.length !== 6) return setError("Enter the complete 6-digit code.");
    setBusy("otp-verify");
    const err = await verifyOtp(phone, finalCode);
    if (err) {
      setError(err);
      setBusy(null);
      setCode("");
    }
  }

  async function onDemo(role: Role) {
    setBusy(role);
    setError(null);
    await loginDemo(role);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left branding panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,rgba(53,103,194,0.35)_0%,transparent_60%)]" aria-hidden />
        <Link href="/" aria-label="Back to homepage" className="relative">
          <Logo dark />
        </Link>
        <div className="relative max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-300">{INSTITUTE.name}</p>
          <h1 className="font-display mt-4 text-4xl font-extrabold leading-tight tracking-tight">
            One portal. One workflow. One professional annual report.
          </h1>
          <p className="mt-4 leading-relaxed text-white/70">
            Departments submit, coordinators review, administrators approve — and the system compiles everything into a publication-ready annual report.
          </p>
          <ul className="mt-8 space-y-3.5">
            {[
              "Sign in with institutional email or mobile OTP",
              "Section-level review with comments & change requests",
              "Automatic report generation with live preview",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm font-medium text-white/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">
          Secured with role-based access control · Session activity is logged for audit
        </p>
      </div>

      {/* Right login card */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" aria-label="Back to homepage"><Logo /></Link>
          </div>

          <div className="card animate-fade-up p-7 sm:p-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy-900">Sign in</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {method === "email"
                ? "Welcome back. Enter your institutional credentials."
                : "Faculty on the move can sign in with a one-time passcode."}
            </p>

            {/* Method switcher */}
            <div role="tablist" aria-label="Sign-in method" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              {(
                [
                  { key: "email", label: "Email & Password", icon: Mail },
                  { key: "mobile", label: "Mobile OTP", icon: Smartphone },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  role="tab"
                  aria-selected={method === m.key}
                  onClick={() => switchMethod(m.key)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition",
                    method === m.key ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-800"
                  )}
                >
                  <m.icon className="h-4 w-4" aria-hidden /> {m.label}
                </button>
              ))}
            </div>

            {/* ------------------------- EMAIL ------------------------- */}
            {method === "email" && (
              <form onSubmit={onSubmitEmail} className="mt-6 space-y-4" noValidate>
                <Field
                  label="Email"
                  htmlFor="email"
                  hint="Try admin@git.edu.in, coordinator@git.edu.in or dept.ce@git.edu.in. A new institutional address creates an account."
                >
                  <input id="email" type="email" autoComplete="email" className={inputCls} placeholder="you@git.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Password" htmlFor="password" hint="Demo accounts use the password Demo@1234">
                  <input id="password" type="password" autoComplete="current-password" className={inputCls} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-navy-700" />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-semibold text-navy-600 hover:text-navy-800 hover:underline">
                    Forgot Password?
                  </button>
                </div>
                {error && (
                  <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
                )}
                <button type="submit" disabled={busy !== null} className={cn(btn.primary, "w-full py-3")}>
                  {busy === "form" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
                  Sign In
                </button>

                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Demo credentials · password Demo@1234
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {(Object.keys(DEMO_USERS) as Role[]).map((r) => (
                      <li key={r} className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600">{ROLE_LABEL[r]}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(DEMO_USERS[r].email);
                            setPassword("Demo@1234");
                            setError(null);
                          }}
                          className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-navy-700 transition hover:bg-navy-50"
                        >
                          {DEMO_USERS[r].email.replace("@kpgu.edu.in", "")}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </form>
            )}

            {/* ------------------------ MOBILE OTP ------------------------ */}
            {method === "mobile" && stage === "phone" && (
              <form onSubmit={onSendOtp} className="mt-6 space-y-4" noValidate>
                <Field label="Mobile Number" htmlFor="phone" hint="Registered institute mobile number. Standard SMS rates may apply.">
                  <div className="flex items-stretch gap-2">
                    <span className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-bold text-slate-600">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={14}
                      className={inputCls}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    />
                  </div>
                </Field>
                {error && (
                  <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
                )}
                <button type="submit" disabled={busy !== null} className={cn(btn.primary, "w-full py-3")}>
                  {busy === "otp-send" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Smartphone className="h-4 w-4" aria-hidden />}
                  Send OTP
                </button>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Demo numbers</p>
                  <ul className="mt-2 space-y-1.5">
                    {(Object.keys(DEMO_USERS) as Role[]).map((r) => (
                      <li key={r} className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600">{ROLE_LABEL[r]}</span>
                        <button
                          type="button"
                          onClick={() => { setPhone(DEMO_USERS[r].phone ?? ""); setError(null); }}
                          className="rounded-md px-2 py-0.5 font-mono text-xs font-bold text-navy-700 transition hover:bg-navy-50"
                        >
                          {DEMO_USERS[r].phone}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </form>
            )}

            {method === "mobile" && stage === "code" && (
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/60 px-4 py-3">
                  <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy-900">Code sent to {masked}</p>
                    {otpName && <p className="text-xs text-slate-500">Signing in as {otpName}</p>}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[13px] font-semibold text-slate-700">Enter 6-digit code</p>
                  <OtpInput
                    value={code}
                    onChange={setCode}
                    onComplete={(c) => onVerify(c)}
                    disabled={busy === "otp-verify"}
                    invalid={!!error}
                  />
                </div>

                {demoCode && (
                  <p className="rounded-xl border border-gold-300/60 bg-gold-100/50 px-4 py-2.5 text-xs font-semibold text-gold-700">
                    <Sparkles className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                    Demo mode — no SMS gateway configured. Your code is{" "}
                    <span className="font-mono text-sm font-extrabold tracking-widest">{demoCode}</span>
                  </p>
                )}

                {error && (
                  <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
                )}

                <button onClick={() => onVerify()} disabled={busy !== null || code.length !== 6} className={cn(btn.primary, "w-full py-3")}>
                  {busy === "otp-verify" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4" aria-hidden />}
                  Verify & Sign In
                </button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setStage("phone"); setError(null); setCode(""); }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Change number
                  </button>
                  <button
                    onClick={() => onSendOtp()}
                    disabled={cooldown > 0 || busy !== null}
                    className="text-sm font-semibold text-navy-600 hover:text-navy-800 hover:underline disabled:text-slate-400 disabled:no-underline"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>
                </div>
                <p className="text-center text-[11px] text-slate-400">
                  Code expires in 5 minutes · 5 attempts allowed
                </p>
              </div>
            )}

            {/* ------------------------- DEMO MODE ------------------------- */}
            <div className="my-6 flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-slate-200" />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <Sparkles className="h-3.5 w-3.5" /> Demo Mode
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="mb-3 text-center text-xs text-slate-500">
              Evaluating the platform? Enter instantly with a pre-loaded role:
            </p>
            <div className="space-y-2.5">
              {DEMO_OPTIONS.map((d) => (
                <button
                  key={d.role}
                  onClick={() => onDemo(d.role)}
                  disabled={busy !== null}
                  className="group flex w-full items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-navy-300 hover:bg-navy-50/50 disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-300" aria-hidden>
                    <d.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-navy-900">{d.title}</span>
                    <span className="block truncate text-xs text-slate-500">{d.body}</span>
                  </span>
                  {busy === d.role ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-navy-600" aria-hidden />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-navy-600" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Protected by institutional SSO-ready authentication · <Link href="/" className="font-semibold text-navy-600 hover:underline">Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
