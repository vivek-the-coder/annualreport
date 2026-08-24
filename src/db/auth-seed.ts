import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { DEMO_USERS, type Role } from "@/lib/data";

/** Shared password for the three demo accounts (shown on the login screen). */
export const DEMO_PASSWORD = "Demo@1234";

let running: Promise<void> | null = null;

/**
 * Idempotently ensures the three demo accounts exist in PostgreSQL with a real
 * scrypt password hash. Safe to call on every auth request.
 */
export async function ensureAuthSeeded() {
  if (!running) {
    running = seed().catch((err) => {
      running = null;
      throw err;
    });
  }
  return running;
}

async function seed() {
  const hash = await hashPassword(DEMO_PASSWORD);

  for (const role of Object.keys(DEMO_USERS) as Role[]) {
    const demo = DEMO_USERS[role];
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, demo.email))
      .limit(1);

    if (!existing) {
      await db.insert(users).values({
        name: demo.name,
        email: demo.email,
        phone: demo.phone ?? null,
        role: demo.role,
        department: demo.department ?? null,
        passwordHash: hash,
        status: "active",
      });
    } else if (!existing.passwordHash) {
      // Rows seeded before password auth existed — backfill the hash.
      await db
        .update(users)
        .set({ passwordHash: hash, phone: existing.phone ?? demo.phone ?? null })
        .where(eq(users.id, existing.id));
    }
  }
}
