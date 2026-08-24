import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { DEMO_PASSWORD, ensureAuthSeeded } from "@/db/auth-seed";
import {
  LOCKOUT_MINUTES,
  MAX_FAILED_ATTEMPTS,
  hashPassword,
  passwordProblem,
  verifyPassword,
} from "@/lib/auth";
import { DEMO_USERS, resolveUserFromEmail, type Role } from "@/lib/data";
import { createSession } from "@/lib/session";

/**
 * Allows an unknown institutional address to be provisioned on first sign-in
 * (handy for demos and pilot rollouts). Set AUTH_ALLOW_SELF_PROVISION=false to
 * require an administrator to create every account.
 */
const ALLOW_SELF_PROVISION = process.env.AUTH_ALLOW_SELF_PROVISION !== "false";

export async function POST(req: Request) {
  await ensureSeeded();
  await ensureAuthSeeded();

  const body = (await req.json().catch(() => ({}))) as {
    role?: Role;
    email?: string;
    password?: string;
  };

  // ---- Demo role buttons: look the seeded account up in PostgreSQL ----
  if (body.role && DEMO_USERS[body.role]) {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, DEMO_USERS[body.role].email))
      .limit(1);
    if (!row) {
      return NextResponse.json({ error: "Demo account unavailable." }, { status: 500 });
    }
    return finish(row.id, row, "signed in with a demo account");
  }

  // ---- Email + password ----
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email) {
    return NextResponse.json({ error: "Please enter your email address." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That doesn’t look like a valid email address." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Please enter your password." }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // ---- First-time provisioning for unknown institutional addresses ----
  if (!existing) {
    if (!ALLOW_SELF_PROVISION) {
      return NextResponse.json(
        { error: "No account found for this email. Please contact your administrator." },
        { status: 401 }
      );
    }
    const problem = passwordProblem(password);
    if (problem) {
      return NextResponse.json({ error: `${problem} This creates your account.` }, { status: 400 });
    }
    const profile = resolveUserFromEmail(email);
    if (!profile) {
      return NextResponse.json({ error: "That doesn’t look like a valid email address." }, { status: 400 });
    }
    const [created] = await db
      .insert(users)
      .values({
        name: profile.name,
        email,
        role: profile.role,
        department: profile.department ?? null,
        passwordHash: await hashPassword(password),
        status: "active",
      })
      .returning();
    return finish(created.id, created, "created an account and signed in");
  }

  // ---- Account state checks ----
  if (existing.status !== "active") {
    return NextResponse.json(
      { error: "This account has been suspended. Please contact your administrator." },
      { status: 403 }
    );
  }
  if (existing.lockedUntil && existing.lockedUntil > new Date()) {
    const mins = Math.ceil((existing.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  // ---- Verify against the stored scrypt hash ----
  const ok = await verifyPassword(password, existing.passwordHash);
  if (!ok) {
    const failedAttempts = existing.failedAttempts + 1;
    const lock = failedAttempts >= MAX_FAILED_ATTEMPTS;
    await db
      .update(users)
      .set({
        failedAttempts: lock ? 0 : failedAttempts,
        lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null,
      })
      .where(eq(users.id, existing.id));

    await db.insert(activities).values({
      actor: existing.name,
      role: existing.role,
      action: "failed sign-in attempt",
      target: existing.email,
      status: "failed",
    });

    if (lock) {
      return NextResponse.json(
        { error: `Too many failed attempts. This account is locked for ${LOCKOUT_MINUTES} minutes.` },
        { status: 429 }
      );
    }
    const left = MAX_FAILED_ATTEMPTS - failedAttempts;
    const hint = existing.passwordHash ? "" : " This account uses mobile OTP sign-in.";
    return NextResponse.json(
      { error: `Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.${hint}` },
      { status: 401 }
    );
  }

  return finish(existing.id, existing, "signed in with email");
}

async function finish(
  userId: number,
  row: typeof users.$inferSelect,
  action: string
) {
  const sessionToken = await createSession(userId);
  await db
    .update(users)
    .set({ lastLogin: new Date(), failedAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId));
  await db.insert(activities).values({
    actor: row.name,
    role: row.role,
    action,
    target: "Session",
    status: "success",
  });

  return NextResponse.json({
    user: {
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      department: row.department,
    },
    // Mirrored by the client only to survive cookie-blocking iframes. It is an
    // opaque, server-revocable token — it carries no identity of its own.
    sessionToken,
    demoPassword: DEMO_PASSWORD,
  });
}
