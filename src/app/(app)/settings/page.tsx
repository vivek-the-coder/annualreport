"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  KeyRound,
  Palette,
  Save,
  ShieldCheck,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";
import { Field, PageHeader, btn, cn, inputCls } from "@/components/ui";
import { useApp } from "@/lib/store";
import { DEMO_USERS, INSTITUTE, ROLE_LABEL, timeAgo, type Role } from "@/lib/data";

const TABS = [
  { key: "profile", label: "Profile", icon: UserRound },
  { key: "institute", label: "Institute & Branding", icon: Building2 },
  { key: "users", label: "Users & Roles", icon: Users },
  { key: "templates", label: "Report Templates", icon: Palette },
  { key: "security", label: "Security & Audit", icon: ShieldCheck },
];

const PERMISSIONS: Record<Role, string[]> = {
  admin: ["View everything", "Manage users & departments", "Approve reports", "Customize templates", "Generate & publish reports", "View analytics & archive"],
  coordinator: ["Review submissions", "Request changes", "Approve departmental submissions", "Manage report sections", "Generate draft reports", "View analytics"],
  department: ["Submit academic records", "Upload documents & images", "Edit drafts", "Respond to review comments", "Post classroom material", "Share attendance with parents"],
  student: ["View enrolled subjects", "Download notes, PPTs & assignments", "See announcements & marks", "Update profile"],
};

function SettingsInner() {
  const params = useSearchParams();
  const { user, data, toast } = useApp();
  const [tab, setTab] = useState(params.get("tab") ?? "profile");
  const [primary, setPrimary] = useState("#0B2B76");
  const [secondary, setSecondary] = useState("#C8102E");

  const save = () => toast("Settings saved", "Your changes have been applied.", "success");

  return (
    <div>
      <PageHeader title="Settings" subtitle="Institute configuration, branding, roles and security." />
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Settings sections" className="card h-fit p-3 lg:sticky lg:top-24">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <li key={t.key} className="min-w-fit">
                <button
                  onClick={() => setTab(t.key)}
                  aria-current={tab === t.key ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition",
                    tab === t.key ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <t.icon className="h-4 w-4 shrink-0" aria-hidden /> {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {tab === "profile" && (
            <div className="card animate-fade-in space-y-5 p-6">
              <h2 className="font-display text-lg font-bold text-navy-900">Profile</h2>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-xl font-extrabold text-gold-300" aria-hidden>
                  {user?.name.split(" ").slice(-1)[0][0]}
                </span>
                <div>
                  <p className="font-bold text-navy-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-navy-700">
                    {ROLE_LABEL[(user?.role ?? "admin") as Role]}
                  </span>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" htmlFor="pf-name"><input id="pf-name" className={inputCls} defaultValue={user?.name} /></Field>
                <Field label="Email" htmlFor="pf-email"><input id="pf-email" className={inputCls} defaultValue={user?.email} readOnly /></Field>
                <Field label="Phone" htmlFor="pf-phone"><input id="pf-phone" className={inputCls} defaultValue="+91 98765 43210" /></Field>
                <Field label="Designation" htmlFor="pf-desig"><input id="pf-desig" className={inputCls} defaultValue={ROLE_LABEL[(user?.role ?? "admin") as Role]} /></Field>
              </div>
              <button onClick={save} className={btn.primary}><Save className="h-4 w-4" aria-hidden /> Save Changes</button>
            </div>
          )}

          {tab === "institute" && (
            <div className="space-y-6">
              <div className="card animate-fade-in space-y-5 p-6">
                <h2 className="font-display text-lg font-bold text-navy-900">Institute Information</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Institute Name" htmlFor="in-name"><input id="in-name" className={inputCls} defaultValue={INSTITUTE.name} /></Field>
                  <Field label="Website" htmlFor="in-web"><input id="in-web" className={inputCls} defaultValue={INSTITUTE.website} /></Field>
                  <Field label="Contact Email" htmlFor="in-email"><input id="in-email" className={inputCls} defaultValue={INSTITUTE.email} /></Field>
                  <Field label="Phone" htmlFor="in-phone"><input id="in-phone" className={inputCls} defaultValue={INSTITUTE.phone} /></Field>
                </div>
                <Field label="Address" htmlFor="in-addr"><textarea id="in-addr" rows={2} className={inputCls} defaultValue={INSTITUTE.address} /></Field>
              </div>
              <div className="card space-y-5 p-6">
                <h2 className="font-display text-lg font-bold text-navy-900">Branding</h2>
                <div className="flex flex-col items-start gap-5 sm:flex-row">
                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                    <UploadCloud className="h-6 w-6" aria-hidden />
                    <span className="mt-1 text-[10px] font-bold">Upload Logo</span>
                  </div>
                  <div className="grid flex-1 gap-5 sm:grid-cols-2">
                    <Field label="Primary Color" htmlFor="br-primary">
                      <div className="flex items-center gap-2">
                        <input type="color" id="br-primary" aria-label="Primary color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200" />
                        <input className={inputCls} value={primary} onChange={(e) => setPrimary(e.target.value)} aria-label="Primary color hex" />
                      </div>
                    </Field>
                    <Field label="Secondary Color" htmlFor="br-secondary">
                      <div className="flex items-center gap-2">
                        <input type="color" id="br-secondary" aria-label="Secondary color" value={secondary} onChange={(e) => setSecondary(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200" />
                        <input className={inputCls} value={secondary} onChange={(e) => setSecondary(e.target.value)} aria-label="Secondary color hex" />
                      </div>
                    </Field>
                  </div>
                </div>
                <div className="rounded-xl p-4 text-white" style={{ background: primary }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: secondary }}>Live Preview</p>
                  <p className="font-display mt-1 text-lg font-extrabold">Annual Report {INSTITUTE.year} — {INSTITUTE.name}</p>
                </div>
                <button onClick={save} className={btn.primary}><Save className="h-4 w-4" aria-hidden /> Save Branding</button>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-6">
              <div className="card animate-fade-in overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="font-display text-lg font-bold text-navy-900">Users & Roles</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3">User</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.keys(DEMO_USERS) as Role[]).map((r) => {
                        const u = DEMO_USERS[r];
                        return (
                          <tr key={r} className="border-b border-slate-50">
                            <td className="px-6 py-3.5">
                              <p className="font-semibold text-navy-900">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-navy-700">{ROLE_LABEL[r]}</span>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{u.department ?? "Institute-wide"}</td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> Active</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(Object.keys(PERMISSIONS) as Role[]).map((r) => (
                  <div key={r} className="card p-5">
                    <h3 className="text-sm font-extrabold text-navy-900">{ROLE_LABEL[r]}</h3>
                    <ul className="mt-3 space-y-2">
                      {PERMISSIONS[r].map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "templates" && (
            <div className="card animate-fade-in p-6">
              <h2 className="font-display text-lg font-bold text-navy-900">Report Templates</h2>
              <p className="mt-1 text-sm text-slate-500">Default chapter structures for report generation. Customize per year in the Report Builder.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {["Standard Annual Report (13 chapters)", "NAAC-Aligned Report", "Compact Executive Report", "Department-Only Report"].map((t, i) => (
                  <div key={t} className={cn("rounded-xl border p-4", i === 0 ? "border-navy-300 bg-navy-50/50" : "border-slate-200")}>
                    <p className="text-sm font-bold text-navy-900">{t}</p>
                    <p className="mt-1 text-xs text-slate-400">{i === 0 ? "Default template · in use for 2025–26" : "Available"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-6">
              <div className="card animate-fade-in p-6">
                <h2 className="font-display text-lg font-bold text-navy-900">Session & Security</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[
                    { l: "Last Login", v: "Today, 09:12 AM", icon: KeyRound },
                    { l: "Active Sessions", v: "2 devices", icon: ShieldCheck },
                    { l: "2FA", v: "Enabled (TOTP)", icon: ShieldCheck },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <s.icon className="h-4 w-4 text-navy-500" aria-hidden />
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">{s.l}</p>
                      <p className="text-sm font-bold text-navy-900">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="font-display text-lg font-bold text-navy-900">Audit Log</h2>
                  <p className="text-xs text-slate-400">Every action is recorded with user, timestamp, device and IP.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3">User</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">IP / Device</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.activities.map((a) => (
                        <tr key={a.id} className="border-b border-slate-50">
                          <td className="px-6 py-3">
                            <p className="text-xs font-bold text-navy-900">{a.actor}</p>
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">{ROLE_LABEL[a.role as Role] ?? a.role}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{a.action}</td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-500">{timeAgo(a.createdAt)}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{a.ip} · {a.device}</td>
                          <td className="px-6 py-3">
                            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", a.status === "success" ? "bg-emerald-50 text-emerald-700" : a.status === "warning" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700")}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse bg-slate-100/60" />}>
      <SettingsInner />
    </Suspense>
  );
}
