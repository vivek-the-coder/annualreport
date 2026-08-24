import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"), // normalized 10-digit Indian mobile number
  role: text("role").notNull(), // admin | coordinator | department
  department: text("department"),
  // scrypt:<salt>:<hash> — null for OTP-only accounts.
  passwordHash: text("password_hash"),
  status: text("status").notNull().default("active"), // active | suspended
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Server-side sessions. The cookie only ever carries an opaque random token,
// so a client can never forge or tamper with its own identity, and sessions
// can be revoked centrally.
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One-time passcodes for mobile sign-in.
export const otpChallenges = pgTable("otp_challenges", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  consumed: boolean("consumed").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  head: text("head").notNull(),
  completion: integer("completion").notNull().default(0),
  status: text("status").notNull().default("pending"), // approved | under_review | pending | changes_requested
  students: integer("students").notNull().default(0),
  faculty: integer("faculty").notNull().default(0),
  placementRate: integer("placement_rate").notNull().default(0),
  publications: integer("publications").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Subject-wise academic record tracking — the unit faculty actually work in.
 * Each row rolls up the teaching/assessment artefacts for one subject.
 */
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  semester: integer("semester").notNull(),
  faculty: text("faculty").notNull(),
  credits: integer("credits").notNull().default(4),
  enrolled: integer("enrolled").notNull().default(0),
  syllabusCompletion: integer("syllabus_completion").notNull().default(0),
  unitsPlanned: integer("units_planned").notNull().default(5),
  unitsCovered: integer("units_covered").notNull().default(0),
  lecturesPlanned: integer("lectures_planned").notNull().default(45),
  lecturesTaken: integer("lectures_taken").notNull().default(0),
  attendanceAvg: integer("attendance_avg").notNull().default(0),
  passPercentage: integer("pass_percentage").notNull().default(0),
  notesCount: integer("notes_count").notNull().default(0),
  pptCount: integer("ppt_count").notNull().default(0),
  assignmentsCount: integer("assignments_count").notNull().default(0),
  examPapersCount: integer("exam_papers_count").notNull().default(0),
  vivaCompleted: boolean("viva_completed").notNull().default(false),
  marksheetUploaded: boolean("marksheet_uploaded").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Student users — can log in with email/OTP, see their enrolled subjects and
 * teaching material (notes / PPTs / assignments) posted by faculty.
 */
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNo: text("roll_no").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  parentPhone: text("parent_phone"),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  section: text("section"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  present: integer("present").notNull().default(0),
  absent: integer("absent").notNull().default(0),
  marks: integer("marks"),
});

/**
 * Classroom feed — Google-Classroom-style material posted by faculty.
 */
export const classMaterials = pgTable("class_materials", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // note | ppt | assignment | announcement | marksheet
  title: text("title").notNull(),
  description: text("description"),
  attachmentName: text("attachment_name"),
  postedBy: text("posted_by").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Parent SMS log — every attendance/results share is recorded for audit.
 */
export const parentSmsLogs = pgTable("parent_sms_logs", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  recipients: integer("recipients").notNull().default(0),
  message: text("message").notNull(),
  sentBy: text("sent_by").notNull(),
  channel: text("channel").notNull().default("sms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id),
  section: text("section").notNull(), // section key
  status: text("status").notNull().default("draft"), // draft | submitted | under_review | changes_requested | approved
  completion: integer("completion").notNull().default(0),
  submittedBy: text("submitted_by").notNull(),
  reviewer: text("reviewer"),
  summary: text("summary"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => submissions.id),
  author: text("author").notNull(),
  role: text("role").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  targetRole: text("target_role").notNull(), // admin | coordinator | department | all
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("info"), // info | success | warning | review
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  actor: text("actor").notNull(),
  role: text("role").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  device: text("device").notNull().default("Web · Chrome"),
  ip: text("ip").notNull().default("103.240.12.44"),
  status: text("status").notNull().default("success"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
