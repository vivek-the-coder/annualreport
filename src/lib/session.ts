import { cookies, headers } from "next/headers";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { newSessionToken } from "@/lib/auth";
import type { Role, SessionUser } from "@/lib/data";

const COOKIE = "arp_session";
/**
 * Cross-site variant. Proxies don't reliably forward `x-forwarded-proto`, so
 * instead of guessing the scheme we always write both cookies:
 *   - `arp_session`   (Lax)            → same-site + plain-HTTP localhost
 *   - `arp_session_x` (None; Secure)   → cross-site iframe embedding over TLS
 * Browsers discard the Secure one on plain HTTP, so the right one always wins.
 */
const COOKIE_CROSS_SITE = "arp_session_x";

/**
 * Same-origin header fallback for browsers that block all cookies in iframes
 * (Safari ITP / third-party cookie blocking). It carries the same *opaque*
 * token as the cookie — never user data — so it grants no extra authority and
 * the session remains revocable server-side.
 */
export const SESSION_HEADER = "x-arp-session";

const SESSION_DAYS = 7;

function toSessionUser(row: typeof users.$inferSelect): SessionUser {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role as Role,
    department: row.department,
  };
}

async function readToken(): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get(COOKIE_CROSS_SITE)?.value ?? store.get(COOKIE)?.value;
  if (fromCookie) return fromCookie;
  const h = await headers();
  return h.get(SESSION_HEADER);
}

/** Resolves the signed-in user by looking the session token up in PostgreSQL. */
export async function getSession(): Promise<SessionUser | null> {
  const token = await readToken();
  if (!token) return null;

  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.token, token),
        eq(sessions.revoked, false),
        gt(sessions.expiresAt, new Date()),
        eq(users.status, "active")
      )
    )
    .limit(1);

  return row ? toSessionUser(row.user) : null;
}

/** Creates a persisted session row and sets the cookies. Returns the token. */
export async function createSession(userId: number): Promise<string> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const h = await headers();
  await db.insert(sessions).values({
    token,
    userId,
    expiresAt,
    userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
  });

  const store = await cookies();
  const base = { httpOnly: true, path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 } as const;
  store.set(COOKIE, token, { ...base, sameSite: "lax", secure: false });
  store.set(COOKIE_CROSS_SITE, token, { ...base, sameSite: "none", secure: true });

  // Opportunistic cleanup of dead rows.
  await db
    .delete(sessions)
    .where(or(lt(sessions.expiresAt, new Date()), eq(sessions.revoked, true)));

  return token;
}

export async function clearSession() {
  const token = await readToken();
  if (token) {
    await db.update(sessions).set({ revoked: true }).where(eq(sessions.token, token));
  }
  const store = await cookies();
  store.delete(COOKIE);
  store.delete(COOKIE_CROSS_SITE);
}
