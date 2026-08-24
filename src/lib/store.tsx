"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import type {
  ActivityItem,
  Department,
  NotificationItem,
  Role,
  SessionUser,
  Subject,
  Submission,
  Student,
  ClassMaterial,
  Enrollment,
} from "@/lib/data";

interface AppData {
  departments: Department[];
  submissions: Submission[];
  subjects: Subject[];
  students: Student[];
  classMaterials: ClassMaterial[];
  enrollments: Enrollment[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
}

interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  title: string;
  body?: string;
}

interface AppContextValue {
  user: SessionUser | null;
  userLoaded: boolean;
  data: AppData;
  dataLoaded: boolean;
  refresh: () => Promise<void>;
  loginDemo: (role: Role) => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  requestOtp: (phone: string) => Promise<{ error?: string; masked?: string; name?: string; demoCode?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<string | null>;
  logout: () => Promise<void>;
  markRead: (opts: { id?: number; all?: boolean }) => Promise<void>;
  toast: (title: string, body?: string, kind?: Toast["kind"]) => void;
}

const emptyData: AppData = { departments: [], submissions: [], subjects: [], students: [], classMaterials: [], enrollments: [], notifications: [], activities: [] };
const AppContext = createContext<AppContextValue | null>(null);

const TOKEN_KEY = "arp_session_token";
const USER_KEY = "arp_session_user";
const SESSION_HEADER = "x-arp-session";

/**
 * Mirror of the *opaque* session token, replayed on a same-origin header when
 * cookies are blocked (cross-site iframes / Safari ITP). The token grants no
 * authority by itself — the server validates it against the sessions table and
 * can revoke it at any time. The cached user is presentational only, so the UI
 * can paint instantly; every request is still authorised server-side.
 */
function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function readCachedUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function writeMirror(user: SessionUser | null, token?: string | null) {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    if (token === null) window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — cookie path still applies */
  }
}

/**
 * fetch wrapper that always sends credentials and replays the mirrored session
 * on a same-origin header so API calls keep working without third-party cookies.
 */
export async function api(input: string, init: RequestInit = {}) {
  const token = readToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set(SESSION_HEADER, token);
  return fetch(input, { ...init, headers, credentials: "include", cache: "no-store" });
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [data, setData] = useState<AppData>(emptyData);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);
  const router = useRouter();

  const toast = useCallback((title: string, body?: string, kind: Toast["kind"] = "success") => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, title, body, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await api("/api/data");
      if (res.ok) {
        setData(await res.json());
        setDataLoaded(true);
      }
    } catch {
      // network error — keep previous data
    }
  }, []);

  useEffect(() => {
    // Hydrate instantly from the mirror so the route guard never bounces the
    // user back to /login while the session check is still in flight.
    const cached = readCachedUser();
    if (cached) setUser(cached);

    (async () => {
      try {
        const res = await api("/api/auth/me");
        const json = await res.json();
        if (json.user) {
          setUser(json.user);
          writeMirror(json.user);
        } else if (!cached) {
          setUser(null);
        }
      } catch {
        if (!cached) setUser(null);
      } finally {
        setUserLoaded(true);
      }
    })();
    refresh();
  }, [refresh]);

  const loginDemo = useCallback(
    async (role: Role) => {
      try {
        const res = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ role }),
        });
        const json = await res.json();
        if (!res.ok || !json.user) return;
        setUser(json.user);
        writeMirror(json.user, json.sessionToken);
        setUserLoaded(true);
        await refresh();
        router.replace("/dashboard");
      } catch {
        toast("Sign in failed", "Please check your connection and try again.", "error");
      }
    },
    [refresh, router, toast]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const res = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) return json.error ?? "Sign in failed.";
        setUser(json.user);
        writeMirror(json.user, json.sessionToken);
        setUserLoaded(true);
        await refresh();
        router.replace("/dashboard");
        return null;
      } catch {
        return "Network error. Please check your connection and try again.";
      }
    },
    [refresh, router]
  );

  const requestOtp = useCallback(async (phone: string) => {
    try {
      const res = await api("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.error ?? "Could not send the verification code." };
      return { masked: json.masked as string, name: json.name as string, demoCode: json.demoCode as string | undefined };
    } catch {
      return { error: "Network error. Please check your connection and try again." };
    }
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string): Promise<string | null> => {
      try {
        const res = await api("/api/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ phone, code }),
        });
        const json = await res.json();
        if (!res.ok) return json.error ?? "Verification failed.";
        setUser(json.user);
        writeMirror(json.user, json.sessionToken);
        setUserLoaded(true);
        await refresh();
        router.replace("/dashboard");
        return null;
      } catch {
        return "Network error. Please try again.";
      }
    },
    [refresh, router]
  );

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* clear locally regardless */
    }
    writeMirror(null, null);
    setUser(null);
    setUserLoaded(true);
    router.replace("/login");
  }, [router]);

  const markRead = useCallback(
    async (opts: { id?: number; all?: boolean }) => {
      setData((d) => ({
        ...d,
        notifications: d.notifications.map((n) =>
          opts.all || n.id === opts.id ? { ...n, read: true } : n
        ),
      }));
      await api("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify(opts),
      });
    },
    []
  );

  return (
    <AppContext.Provider
      value={{ user, userLoaded, data, dataLoaded, refresh, loginDemo, login, requestOtp, verifyOtp, logout, markRead, toast }}
    >
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-[calc(4.5rem+var(--safe-bottom))] z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[min(380px,calc(100vw-2rem))] lg:bottom-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-scale-in pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-navy-900/10"
          >
            {t.kind === "success" && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            )}
            {t.kind === "error" && (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
            )}
            {t.kind === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy-600" aria-hidden />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.body && <p className="mt-0.5 text-sm text-slate-600">{t.body}</p>}
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
