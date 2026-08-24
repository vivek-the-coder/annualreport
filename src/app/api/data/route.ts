import { NextResponse } from "next/server";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { activities, classMaterials, departments, enrollments, notifications, students, subjects, submissions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSession } from "@/lib/session";

export async function GET() {
  await ensureSeeded();
  const user = await getSession();
  const role = user?.role ?? "admin";

  const [depts, subs, subjectRows, materials, studentsRows, enrollmentsRows, notifs, acts] = await Promise.all([
    db.select().from(departments).orderBy(departments.id),
    db.select().from(submissions).orderBy(desc(submissions.updatedAt)),
    db.select().from(subjects).orderBy(subjects.code),
    db.select().from(classMaterials).orderBy(classMaterials.createdAt),
    db.select().from(students).orderBy(students.rollNo),
    db.select().from(enrollments),
    db
      .select()
      .from(notifications)
      .where(inArray(notifications.targetRole, [role, "all"]))
      .orderBy(desc(notifications.createdAt)),
    db.select().from(activities).orderBy(desc(activities.createdAt)).limit(30),
  ]);

  return NextResponse.json({
    departments: depts,
    submissions: subs,
    subjects: subjectRows,
    classMaterials: materials,
    students: studentsRows,
    enrollments: enrollmentsRows,
    notifications: notifs,
    activities: acts,
  });
}
