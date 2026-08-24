import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, enrollments, parentSmsLogs, subjects } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  await ensureSeeded();
  const user = await getSession();
  if (!user || user.role === "student") {
    return NextResponse.json({ error: "Only faculty and admins can send SMS to parents." }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    subjectId?: number;
    message?: string;
  };
  if (!body.subjectId || !body.message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const [subject] = await db.select().from(subjects).where(eq(subjects.id, body.subjectId)).limit(1);
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  const [{ count }] = await db
    .select({ count: (await import("drizzle-orm")).sql<number>`count(*)::int` })
    .from(enrollments)
    .where(eq(enrollments.subjectId, body.subjectId));
  const recipients = Number(count ?? 0);

  const trimmed = body.message.trim().slice(0, 320);
  await db.insert(parentSmsLogs).values({
    subjectId: subject.id,
    recipients,
    message: trimmed,
    sentBy: user.name,
  });

  await db.insert(activities).values({
    actor: user.name,
    role: user.role,
    action: `sent an SMS to ${recipients} parents for ${subject.code}`,
    target: `${subject.name} · Parent SMS`,
    status: "success",
  });

  return NextResponse.json({ ok: true, recipients, preview: trimmed });
}
