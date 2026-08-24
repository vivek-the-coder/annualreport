import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, comments, departments, notifications, submissions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { sectionLabel } from "@/lib/data";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const { id } = await ctx.params;
  const subId = Number(id);
  const [sub] = await db.select().from(submissions).where(eq(submissions.id, subId));
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const commentRows = await db
    .select()
    .from(comments)
    .where(eq(comments.submissionId, subId))
    .orderBy(asc(comments.createdAt));
  const [dept] = await db.select().from(departments).where(eq(departments.id, sub.departmentId));
  return NextResponse.json({ submission: sub, comments: commentRows, department: dept });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const subId = Number(id);
  const body = (await req.json()) as { action: string; comment?: string };

  const [sub] = await db.select().from(submissions).where(eq(submissions.id, subId));
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [dept] = await db.select().from(departments).where(eq(departments.id, sub.departmentId));
  const deptName = dept?.name ?? "Department";
  const secLabel = sectionLabel(sub.section);

  // RBAC: only coordinators/admins may review
  if (["approve", "request_changes", "start_review"].includes(body.action) && user.role === "department") {
    return NextResponse.json({ error: "You do not have permission to review submissions." }, { status: 403 });
  }

  let newStatus = sub.status;
  if (body.action === "approve") newStatus = "approved";
  else if (body.action === "request_changes") newStatus = "changes_requested";
  else if (body.action === "start_review") newStatus = "under_review";
  else if (body.action === "resubmit") newStatus = "submitted";

  await db
    .update(submissions)
    .set({
      status: newStatus,
      reviewer: user.role === "department" ? sub.reviewer : user.name,
      updatedAt: new Date(),
      completion: body.action === "resubmit" ? 100 : sub.completion,
    })
    .where(eq(submissions.id, subId));

  if (body.comment && body.comment.trim().length > 0) {
    await db.insert(comments).values({
      submissionId: subId,
      author: user.name,
      role: user.role,
      body: body.comment.trim(),
    });
  }

  const actionText =
    body.action === "approve"
      ? `approved ${deptName} ${secLabel}`
      : body.action === "request_changes"
        ? `requested changes in ${deptName} ${secLabel}`
        : body.action === "resubmit"
          ? `resubmitted ${secLabel} after updates`
          : body.action === "comment"
            ? `commented on ${deptName} ${secLabel}`
            : `started reviewing ${deptName} ${secLabel}`;

  await db.insert(activities).values({
    actor: user.name,
    role: user.role,
    action: actionText,
    target: `${deptName} · ${secLabel}`,
    status: body.action === "request_changes" ? "warning" : "success",
  });

  if (body.action === "approve") {
    await db.insert(notifications).values({
      targetRole: "department",
      title: "Section approved",
      body: `${user.name} approved the ${secLabel} section of ${deptName}.`,
      kind: "success",
    });
  } else if (body.action === "request_changes") {
    await db.insert(notifications).values({
      targetRole: "department",
      title: "Changes requested",
      body: `${user.name} requested changes in ${deptName} — ${secLabel}.`,
      kind: "warning",
    });
  } else if (body.action === "resubmit") {
    await db.insert(notifications).values({
      targetRole: "coordinator",
      title: "Submission updated",
      body: `${deptName} resubmitted the ${secLabel} section for review.`,
      kind: "review",
    });
  }

  // Recompute department status
  if (dept) {
    const deptSubs = await db.select().from(submissions).where(eq(submissions.departmentId, dept.id));
    const hasChanges = deptSubs.some((s) => s.status === "changes_requested");
    const allApproved = deptSubs.length > 0 && deptSubs.every((s) => s.status === "approved");
    const hasReview = deptSubs.some((s) => ["submitted", "under_review"].includes(s.status));
    const newDeptStatus = hasChanges
      ? "changes_requested"
      : allApproved
        ? "approved"
        : hasReview
          ? "under_review"
          : dept.status;
    await db
      .update(departments)
      .set({ status: newDeptStatus, updatedAt: new Date() })
      .where(eq(departments.id, dept.id));
  }

  const [updated] = await db.select().from(submissions).where(eq(submissions.id, subId));
  return NextResponse.json({ submission: updated });
}
