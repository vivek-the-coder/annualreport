import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, classMaterials, subjects } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSession } from "@/lib/session";

const ALLOWED_KINDS = new Set(["note", "ppt", "assignment", "announcement", "marksheet"]);

export async function POST(req: Request) {
  await ensureSeeded();
  const user = await getSession();
  if (!user || user.role === "student") {
    return NextResponse.json({ error: "Only faculty, coordinators and admins can post material." }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    subjectId?: number;
    kind?: string;
    title?: string;
    description?: string;
    attachmentName?: string;
    dueDate?: string;
  };
  if (!body.subjectId || !body.title || !body.kind || !ALLOWED_KINDS.has(body.kind)) {
    return NextResponse.json({ error: "Subject, kind and title are required." }, { status: 400 });
  }
  const [subject] = await db.select().from(subjects).where(eq(subjects.id, body.subjectId)).limit(1);
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  const [post] = await db
    .insert(classMaterials)
    .values({
      subjectId: subject.id,
      kind: body.kind,
      title: body.title.trim().slice(0, 200),
      description: (body.description ?? "").trim().slice(0, 2000) || null,
      attachmentName: body.attachmentName ?? null,
      postedBy: user.name,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    })
    .returning();

  await db.insert(activities).values({
    actor: user.name,
    role: user.role,
    action: `posted ${body.kind} “${body.title}” to ${subject.code}`,
    target: subject.name,
    status: "success",
  });

  return NextResponse.json({ post });
}
