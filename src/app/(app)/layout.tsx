"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileEdit,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Logo, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { ROLE_LABEL, sectionLabel, type Role } from "@/lib/data";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "coordinator", "department"] },
  { href: "/departments", label: "Departments", icon: Building2, roles: ["admin", "coordinator"] },
  { href: "/academics", label: "Academic Records", icon: GraduationCap, roles: ["admin", "coordinator", "department"] },
  { href: "/classroom", label: "Classroom", icon: BookOpen, roles: ["admin", "coordinator", "department", "student"] },
  { href: "/submissions", label: "Submissions", icon: ClipboardList, roles: ["admin", "coordinator", "department"] },
  { href: "/approvals", label: "Approvals", icon: CheckSquare, roles: ["admin", "coordinator", "department"] },
  { href: "/report-builder", label: "Report Builder", icon: FileEdit, roles: ["admin", "coordinator"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "coordinator", "department"] },
  { href: "/archive", label: "Archive", icon: Archive, roles: ["admin", "coordinator", "department"] },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles, roles: ["admin", "coordinator", "department"] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["admin", "coordinator", "department"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin", "coordinator", "department"] },
];

const CRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  departments: "Departments",
  academics: "Academic Records",
  classroom: "Classroom",
  submissions: "Submissions",
  approvals: "Approval Center",
  "report-builder": "Report Builder",
  analytics: "Analytics",
  archive: "Archive",
  assistant: "AI Assistant",
  notifications: "Notifications",
  settings: "Settings",
  wizard: "Submission Wizard",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userLoaded, data, logout, loginDemo, toast } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const redirectedRef = useRef(false);

  const RESTRICTED_FOR_STUDENT = ["/approvals", "/report-builder", "/departments"];
  const isRestrictedForStudent = (p: string) =>
    user?.role === "student" && RESTRICTED_FOR_STUDENT.some((r) => p.startsWith(r));

  // Only bounce to /login once the session check has genuinely settled and no
  // session exists (cookie *and* local mirror), so this can never loop.
  useEffect(() => {
    if (userLoaded && !user) {
      redirectedRef.current = true;
      router.replace("/login");
    }
    if (user && user.role === "student" && isRestrictedForStudent(pathname)) {
      router.replace("/classroom");
    }
  }, [userLoaded, user, router, pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = data.notifications.filter((n) => !n.read).length;
  const role = (user?.role ?? "admin") as Role;
  const nav = NAV_ITEMS.filter((n) => n.roles.includes(role));

  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => CRUMB_LABELS[seg] ?? seg);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: { label: string; sub: string; href: string }[] = [];
    for (const d of data.departments) {
      if (d.name.toLowerCase().includes(q) || d.head.toLowerCase().includes(q))
        out.push({ label: d.name, sub: `Department · ${d.head}`, href: "/departments" });
    }
    for (const s of data.submissions) {
      const dept = data.departments.find((d) => d.id === s.departmentId);
      const label = `${dept?.name ?? ""} — ${sectionLabel(s.section)}`;
      if (label.toLowerCase().includes(q))
        out.push({ label: sectionLabel(s.section), sub: `Submission · ${dept?.name}`, href: `/approvals?open=${s.id}` });
    }
    for (const n of nav) {
      if (n.label.toLowerCase().includes(q)) out.push({ label: n.label, sub: "Page", href: n.href });
    }
    return out.slice(0, 7);
  }, [query, data, nav]);

  if (!userLoaded || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="animate-pulse-dot"><Logo /></div>
        <p className="text-sm font-medium text-slate-400" role="status">
          {redirectedRef.current ? "Redirecting to sign in…" : "Restoring your session…"}
        </p>
      </div>
    );
  }

  async function switchRole(r: Role) {
    setProfileOpen(false);
    await loginDemo(r);
    toast(`Switched to ${ROLE_LABEL[r]}`, "Demo role changed — dashboards updated.", "info");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/dashboard" aria-label="Dashboard home"><Logo dark /></Link>
      </div>
      <nav aria-label="Primary" className="thin-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map((n) => {
          const active = pathname.startsWith(n.href);
          const badge = n.href === "/notifications" && unread > 0 ? unread : null;
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <n.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span className="flex-1">{n.label}</span>
              {badge && (
                <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-extrabold text-navy-950">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-sm font-extrabold text-gold-300" aria-hidden>
            {user.name.split(" ").slice(-1)[0][0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-gold-300/90">
              {ROLE_LABEL[role]}
            </p>
          </div>
          <button onClick={logout} aria-label="Log out" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-950 lg:block" aria-label="Sidebar">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="absolute inset-0 bg-navy-950/50" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="animate-fade-in absolute inset-y-0 left-0 w-72 bg-navy-950 shadow-2xl">
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10">
              <X className="h-5 w-5" aria-hidden />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:left-64">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" aria-hidden />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
            <span className="font-semibold text-slate-400">GIT</span>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
                <span className={cn("truncate font-semibold", i === crumbs.length - 1 ? "text-navy-900" : "text-slate-400")}>{c}</span>
              </span>
            ))}
          </nav>

          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              role="combobox"
              aria-expanded={searchFocus && results.length > 0}
              aria-label="Global search"
              placeholder="Search departments, submissions, reports…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-navy-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-100"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
            />
            {searchFocus && results.length > 0 && (
              <ul className="animate-scale-in absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl" role="listbox">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-navy-50"
                      onMouseDown={() => {
                        setQuery("");
                        router.push(r.href);
                      }}
                    >
                      <span className="text-sm font-semibold text-navy-900">{r.label}</span>
                      <span className="text-xs text-slate-500">{r.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link href="/notifications" aria-label={`Notifications, ${unread} unread`} className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100">
            <Bell className="h-5 w-5" aria-hidden />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
                {unread}
              </span>
            )}
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-2.5 transition hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-extrabold text-gold-300" aria-hidden>
                {user.name.split(" ").slice(-1)[0][0]}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[120px] truncate text-xs font-bold text-navy-900">{user.name}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{ROLE_LABEL[role]}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </button>
            {profileOpen && (
              <div role="menu" className="animate-scale-in absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 pb-2.5 pt-1.5">
                  <p className="text-sm font-bold text-navy-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <p className="px-3 pb-1 pt-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Demo · Switch Role</p>
                {(["admin", "coordinator", "department"] as Role[]).map((r) => (
                  <button
                    key={r}
                    role="menuitem"
                    disabled={r === role}
                    onClick={() => switchRole(r)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold",
                      r === role ? "cursor-default bg-navy-50 text-navy-800" : "text-slate-600 hover:bg-slate-50 hover:text-navy-800"
                    )}
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                    {ROLE_LABEL[r]}
                    {r === role && <span className="ml-auto text-[10px] font-bold text-navy-500">Current</span>}
                  </button>
                ))}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <Link href="/settings" role="menuitem" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    <Settings className="h-4 w-4" aria-hidden /> Settings
                  </Link>
                  <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-4 w-4" aria-hidden /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="app-main" className="px-4 pb-24 pt-24 sm:px-6 lg:ml-64 lg:pb-12">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Bottom navigation" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {nav.slice(0, 5).map((n) => {
          const active = pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold",
                active ? "text-navy-800" : "text-slate-400"
              )}
            >
              <n.icon className="h-5 w-5" aria-hidden />
              {n.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
