import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { activities, otpChallenges, users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { ensureAuthSeeded } from "@/db/auth-seed";
import { isValidPhone, maskPhone, normalizePhone } from "@/lib/data";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_WINDOW_MS = 30 * 1000; // throttle repeat sends
const MAX_PER_HOUR = 5;

export function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

/**
 * Sends a one-time passcode to a mobile number.
 * In production this would call an SMS gateway (MSG91 / Twilio / Gupshup).
 * Without provider credentials the code is returned in `demoCode` so the flow
 * remains fully testable — this is disabled when SMS_API_KEY is configured.
 */
export async function POST(req: Request) {
  await ensureSeeded();
  await ensureAuthSeeded();
  const body = (await req.json().catch(() => ({}))) as { phone?: string };
  const phone = normalizePhone(body.phone ?? "");

  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number starting with 6–9." },
      { status: 400 }
    );
  }

  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  if (!user) {
    return NextResponse.json(
      {
        error:
          "This mobile number is not registered with the institute. Please contact your administrator or use a demo number.",
      },
      { status: 404 }
    );
  }

  const now = new Date();

  // Throttle: recent send?
  const [recent] = await db
    .select()
    .from(otpChallenges)
    .where(
      and(
        eq(otpChallenges.phone, phone),
        eq(otpChallenges.consumed, false),
        gt(otpChallenges.createdAt, new Date(now.getTime() - RESEND_WINDOW_MS))
      )
    )
    .limit(1);

  if (recent) {
    const wait = Math.ceil((RESEND_WINDOW_MS - (now.getTime() - recent.createdAt.getTime())) / 1000);
    return NextResponse.json(
      { error: `Please wait ${wait}s before requesting another code.` },
      { status: 429 }
    );
  }

  // Hourly cap
  const hourly = await db.execute(
    sql`SELECT COUNT(*)::int AS c FROM otp_challenges WHERE phone = ${phone} AND created_at > NOW() - INTERVAL '1 hour'`
  );
  if ((hourly.rows[0] as { c: number }).c >= MAX_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many verification requests. Please try again after an hour." },
      { status: 429 }
    );
  }

  // Invalidate previous outstanding codes, then issue a new one.
  await db
    .update(otpChallenges)
    .set({ consumed: true })
    .where(and(eq(otpChallenges.phone, phone), eq(otpChallenges.consumed, false)));

  const code = String(randomInt(100000, 1000000));
  await db.insert(otpChallenges).values({
    phone,
    codeHash: hashCode(phone, code),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
  });

  await db.insert(activities).values({
    actor: user.name,
    role: user.role,
    action: `requested a mobile OTP for ${maskPhone(phone)}`,
    target: "Authentication",
    status: "success",
  });

  const smsConfigured = Boolean(process.env.SMS_API_KEY);
  if (smsConfigured) {
    // await sendSms(phone, `Your AnnualReport verification code is ${code}. Valid for 5 minutes.`);
  }

  return NextResponse.json({
    ok: true,
    masked: maskPhone(phone),
    name: user.name,
    expiresInSeconds: OTP_TTL_MS / 1000,
    // Demo convenience only — omitted once a real SMS provider is wired up.
    demoCode: smsConfigured ? undefined : code,
  });
}
