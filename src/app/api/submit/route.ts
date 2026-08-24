import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { activities, departments, notifications, submissions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSession } from "@/lib/session";

// Department submits (or resubmits) its report package for review.
export async function POST(req: Request) {
  await ensureSeeded();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { department?: string };
  const deptName = body.department ?? user.department ?? "Computer Engineering";

  const [dept] = await db.select().from(departments).where(eq(departments.name, deptName));
  if (!dept) return NextResponse.json({ error: "Department not found" }, { status: 404 });

  await db
    .update(submissions)
    .set({ status: "submitted", completion: 100, updatedAt: new Date() })
    .where(
      and(
        eq(submissions.departmentId, dept.id),
        inArray(submissions.status, ["draft", "changes_requested"])
      )
    );

  const deptSubs = await db.select().from(submissions).where(eq(submissions.departmentId, dept.id));
  const avg = deptSubs.length
    ? Math.round(deptSubs.reduce((a, s) => a + s.completion, 0) / deptSubs.length)
    : 100;

  await db
    .update(departments)
    .set({ status: "under_review", completion: Math.max(dept.completion, avg), updatedAt: new Date() })
    .where(eq(departments.id, dept.id));

  await db.insert(notifications).values({
    targetRole: "coordinator",
    title: "Submission received",
    body: `${deptName} submitted its annual report data for review.`,
    kind: "review",
  });
  await db.insert(activities).values({
    actor: user.name,
    role: user.role,
    action: `submitted ${deptName} annual report data for review`,
    target: deptName,
    status: "success",
  });

  return NextResponse.json({ ok: true });
}
