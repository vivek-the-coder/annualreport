import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSession } from "@/lib/session";

export async function PATCH(req: Request) {
  await ensureSeeded();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id?: number; all?: boolean };

  if (body.all) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(inArray(notifications.targetRole, [user.role, "all"]));
  } else if (body.id) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, body.id));
  }
  return NextResponse.json({ ok: true });
}
