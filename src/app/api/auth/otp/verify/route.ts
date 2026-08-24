import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, otpChallenges, users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { ensureAuthSeeded } from "@/db/auth-seed";
import { isValidPhone, maskPhone, normalizePhone } from "@/lib/data";
import { createSession } from "@/lib/session";

const MAX_ATTEMPTS = 5;

function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export async function POST(req: Request) {
  await ensureSeeded();
  await ensureAuthSeeded();
  const body = (await req.json().catch(() => ({}))) as { phone?: string; code?: string };
  const phone = normalizePhone(body.phone ?? "");
  const code = (body.code ?? "").replace(/\D/g, "");

  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Invalid mobile number." }, { status: 400 });
  }
  if (code.length !== 6) {
    return NextResponse.json({ error: "Enter the complete 6-digit code." }, { status: 400 });
  }

  const [challenge] = await db
    .select()
    .from(otpChallenges)
    .where(and(eq(otpChallenges.phone, phone), eq(otpChallenges.consumed, false)))
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1);

  if (!challenge) {
    return NextResponse.json(
      { error: "No active verification code. Please request a new OTP." },
      { status: 400 }
    );
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await db.update(otpChallenges).set({ consumed: true }).where(eq(otpChallenges.id, challenge.id));
    return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    await db.update(otpChallenges).set({ consumed: true }).where(eq(otpChallenges.id, challenge.id));
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 429 }
    );
  }

  if (challenge.codeHash !== hashCode(phone, code)) {
    const attempts = challenge.attempts + 1;
    await db.update(otpChallenges).set({ attempts }).where(eq(otpChallenges.id, challenge.id));
    return NextResponse.json(
      {
        error: `Incorrect code. ${MAX_ATTEMPTS - attempts} attempt${
          MAX_ATTEMPTS - attempts === 1 ? "" : "s"
        } remaining.`,
      },
      { status: 401 }
    );
  }

  // Resolve the account from PostgreSQL by phone number.
  const [row] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  if (!row) {
    return NextResponse.json({ error: "This mobile number is not registered." }, { status: 404 });
  }
  if (row.status !== "active") {
    return NextResponse.json(
      { error: "This account has been suspended. Please contact your administrator." },
      { status: 403 }
    );
  }

  await db.update(otpChallenges).set({ consumed: true }).where(eq(otpChallenges.id, challenge.id));
  const sessionToken = await createSession(row.id);
  await db
    .update(users)
    .set({ lastLogin: new Date(), failedAttempts: 0, lockedUntil: null })
    .where(eq(users.id, row.id));
  await db.insert(activities).values({
    actor: row.name,
    role: row.role,
    action: `signed in via mobile OTP (${maskPhone(phone)})`,
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
    sessionToken,
  });
}
