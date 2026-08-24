// Shared constants and types used by both server and client code.

export type Role = "admin" | "coordinator" | "department" | "student";

export interface SessionUser {
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  department?: string | null;
}

/** Keep only digits and reduce to the last 10 (Indian mobile format). */
export function normalizePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function isValidPhone(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(input));
}

export function maskPhone(input: string): string {
  const p = normalizePhone(input);
  if (p.length !== 10) return input;
  return `+91 ${p.slice(0, 2)}••• ••${p.slice(8)}`;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  head: string;
  completion: number;
  status: string;
  students: number;
  faculty: number;
  placementRate: number;
  publications: number;
  updatedAt: string;
}

export interface Subject {
  id: number;
  departmentId: number;
  code: string;
  name: string;
  semester: number;
  faculty: string;
  credits: number;
  enrolled: number;
  syllabusCompletion: number;
  unitsPlanned: number;
  unitsCovered: number;
  lecturesPlanned: number;
  lecturesTaken: number;
  attendanceAvg: number;
  passPercentage: number;
  notesCount: number;
  pptCount: number;
  assignmentsCount: number;
  examPapersCount: number;
  vivaCompleted: boolean;
  marksheetUploaded: boolean;
  updatedAt: string;
}

export interface Student {
  id: number;
  rollNo: string;
  name: string;
  email: string;
  phone: string | null;
  parentPhone: string | null;
  department: string;
  semester: number;
  section: string | null;
}

export interface Enrollment {
  id: number;
  studentId: number;
  subjectId: number;
  present: number;
  absent: number;
  marks: number | null;
}

export interface ClassMaterial {
  id: number;
  subjectId: number;
  kind: "note" | "ppt" | "assignment" | "announcement" | "marksheet";
  title: string;
  description: string | null;
  attachmentName: string | null;
  postedBy: string;
  dueDate: string | null;
  createdAt: string;
}

export interface Submission {
  id: number;
  departmentId: number;
  section: string;
  status: string;
  completion: number;
  submittedBy: string;
  reviewer: string | null;
  summary: string | null;
  updatedAt: string;
}

export interface CommentItem {
  id: number;
  submissionId: number;
  author: string;
  role: string;
  body: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  targetRole: string;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: number;
  actor: string;
  role: string;
  action: string;
  target: string | null;
  device: string;
  ip: string;
  status: string;
  createdAt: string;
}

export const INSTITUTE = {
  name: "Drs. Kiran & Pallavi Patel Global University",
  short: "KPGU",
  branded: "KPGU Vadodara",
  tagline: "Think Global… Choose Global…",
  address: "KPGU Campus, Vadodara, Gujarat 390019",
  website: "www.kpgu.edu.in",
  phone: "+91 265 123 4567",
  email: "info@kpgu.edu.in",
  year: "2025–26",
};

export const INSTITUTE_STATS = {
  students: 6240,
  faculty: 362,
  placementRate: 94,
  publications: 214,
  patents: 28,
  events: 182,
  awards: 87,
};

/**
 * Academic record categories every subject/department must submit each term.
 * These map 1:1 to the artefacts faculty actually produce during teaching.
 */
export const SECTIONS: { key: string; label: string; desc: string; group: string }[] = [
  { key: "students", label: "Student Records", desc: "Enrollment, roll lists, demographics and batch details.", group: "Records" },
  { key: "attendance", label: "Attendance", desc: "Lecture-wise attendance registers and monthly percentages.", group: "Records" },
  { key: "syllabus", label: "Syllabus Completion", desc: "Unit-wise coverage against the planned academic calendar.", group: "Teaching" },
  { key: "notes", label: "Subject Notes", desc: "Unit-wise teaching notes and study material.", group: "Teaching" },
  { key: "ppt", label: "Lecture PPTs", desc: "Presentation decks used in classroom delivery.", group: "Teaching" },
  { key: "assignments", label: "Assignments", desc: "Assignment sheets, submissions and evaluation status.", group: "Assessment" },
  { key: "exam_papers", label: "Exam Question Papers", desc: "Internal and university question papers with blueprints.", group: "Assessment" },
  { key: "marksheets", label: "Marksheets & Results", desc: "Internal marks, results and pass percentages.", group: "Assessment" },
  { key: "viva", label: "Viva & Practicals", desc: "Practical batches, lab records and viva evaluation.", group: "Assessment" },
  { key: "lab_manuals", label: "Lab Manuals", desc: "Experiment lists, manuals and lab rubrics.", group: "Teaching" },
  { key: "feedback", label: "Student Feedback", desc: "Course-end feedback and corrective actions.", group: "Quality" },
  { key: "documents", label: "Additional Documents", desc: "Annexures, circulars and supporting files.", group: "Quality" },
];

export const SECTION_GROUPS = ["Records", "Teaching", "Assessment", "Quality"] as const;

/** Artefact types accepted by the upload pipeline. */
export const ARTEFACT_TYPES = [
  { ext: "PDF", label: "Question papers, marksheets, manuals" },
  { ext: "DOCX", label: "Notes, assignment sheets" },
  { ext: "PPTX", label: "Lecture presentations" },
  { ext: "XLSX", label: "Attendance & marks registers" },
  { ext: "JPG/PNG", label: "Scanned records, photographs" },
];

export function sectionLabel(key: string) {
  return SECTIONS.find((s) => s.key === key)?.label ?? key;
}

export const STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  approved: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  under_review: {
    label: "Under Review",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  submitted: {
    label: "Submitted",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  changes_requested: {
    label: "Changes Requested",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  draft: {
    label: "Draft",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export const DEMO_USERS: Record<Role, SessionUser> = {
  admin: {
    name: "Dr. Ramesh Chandra",
    email: "admin@kpgu.edu.in",
    phone: "9876543210",
    role: "admin",
    department: null,
  },
  coordinator: {
    name: "Prof. Anjali Verma",
    email: "coordinator@kpgu.edu.in",
    phone: "9876500011",
    role: "coordinator",
    department: null,
  },
  department: {
    name: "Dr. Meera Shah",
    email: "dept.ce@kpgu.edu.in",
    phone: "9812345678",
    role: "department",
    department: "Computer Engineering",
  },
  student: {
    name: "Aarav Patel",
    email: "student.ce@kpgu.edu.in",
    phone: "9898912345",
    role: "student",
    department: "Computer Engineering",
  },
};

export const DEPARTMENT_NAMES = [
  "Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Electronics & Communication",
  "Information Technology",
  "MBA",
  "Science",
  "Humanities",
  "Architecture",
];

const DEPT_CODE_MAP: Record<string, string> = {
  ce: "Computer Engineering",
  cse: "Computer Engineering",
  me: "Mechanical Engineering",
  cv: "Civil Engineering",
  civil: "Civil Engineering",
  ee: "Electrical Engineering",
  ec: "Electronics & Communication",
  it: "Information Technology",
  mba: "MBA",
  sc: "Science",
  hu: "Humanities",
  ar: "Architecture",
};

/**
 * Resolves any institutional email to a usable account so evaluators are never
 * locked out. Seeded accounts win; otherwise the role is inferred from the
 * local part of the address (admin… / coordinator… / dept.<code>…).
 */
export function resolveUserFromEmail(email: string): SessionUser | null {
  const clean = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return null;

  const seeded = (Object.values(DEMO_USERS) as SessionUser[]).find(
    (u) => u.email.toLowerCase() === clean
  );
  if (seeded) return seeded;

  const local = clean.split("@")[0];

  if (/^(admin|principal|director|registrar|dean)/.test(local)) {
    return { name: titleFromLocal(local), email: clean, role: "admin", department: null };
  }
  if (/(coord|convenor|iqac)/.test(local)) {
    return { name: titleFromLocal(local), email: clean, role: "coordinator", department: null };
  }

  const codeMatch = local.match(/(?:dept|hod)[._-]?([a-z]+)/);
  const code = codeMatch?.[1] ?? "";
  const department =
    DEPT_CODE_MAP[code] ??
    DEPARTMENT_NAMES.find((d) => d.toLowerCase().replace(/[^a-z]/g, "").includes(local.replace(/[^a-z]/g, ""))) ??
    "Computer Engineering";

  return { name: titleFromLocal(local), email: clean, role: "department", department };
}

function titleFromLocal(local: string) {
  const words = local
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "Institute User";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/** Lookup helper shared by the email and OTP sign-in paths. */
export function findDemoUserByPhone(phone: string): SessionUser | null {
  const p = normalizePhone(phone);
  return (
    (Object.values(DEMO_USERS) as SessionUser[]).find(
      (u) => normalizePhone(u.phone ?? "") === p
    ) ?? null
  );
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  coordinator: "Report Coordinator",
  department: "Department Head",
  student: "Student",
};

// ---------- Analytics demo datasets ----------

export const YEARS = ["2023–24", "2024–25", "2025–26"] as const;

export const YEARLY = {
  "2023–24": { students: 4310, placement: 84, publications: 121, fdp: 28, events: 104, awards: 48, patents: 11 },
  "2024–25": { students: 4560, placement: 88, publications: 152, fdp: 36, events: 128, awards: 61, patents: 17 },
  "2025–26": { students: 4820, placement: 94, publications: 187, fdp: 44, events: 146, awards: 73, patents: 24 },
};

export const MONTHLY_SUBMISSIONS = [
  { month: "Jul", submissions: 8 },
  { month: "Aug", submissions: 14 },
  { month: "Sep", submissions: 22 },
  { month: "Oct", submissions: 31 },
  { month: "Nov", submissions: 46 },
  { month: "Dec", submissions: 58 },
  { month: "Jan", submissions: 72 },
  { month: "Feb", submissions: 84 },
];

// ---------- Report builder ----------

export const REPORT_CHAPTERS = [
  { key: "cover", label: "Cover Page", pages: 1 },
  { key: "director", label: "Director's Message", pages: 2 },
  { key: "institute", label: "Institute Overview", pages: 4 },
  { key: "academics", label: "Academic Performance", pages: 6 },
  { key: "departments", label: "Department Reports", pages: 14 },
  { key: "research", label: "Research", pages: 5 },
  { key: "placements", label: "Placements", pages: 4 },
  { key: "events", label: "Events", pages: 4 },
  { key: "sports", label: "Sports", pages: 2 },
  { key: "achievements", label: "Achievements", pages: 3 },
  { key: "infrastructure", label: "Infrastructure", pages: 2 },
  { key: "financial", label: "Financial Overview", pages: 1 },
  { key: "conclusion", label: "Conclusion", pages: 1 },
];

export interface ReportTheme {
  key: string;
  label: string;
  primary: string;
  accent: string;
  bg: string;
  font: string;
  serif: boolean;
}

export const REPORT_THEMES: ReportTheme[] = [
  { key: "kpgu", label: "KPGU Official", primary: "#0B2B76", accent: "#C8102E", bg: "#ffffff", font: "Inter, sans-serif", serif: false },
  { key: "crest", label: "KPGU Crest", primary: "#C8102E", accent: "#F5A623", bg: "#ffffff", font: "Georgia, serif", serif: true },
  { key: "classic", label: "Classic", primary: "#0B2B76", accent: "#F5A623", bg: "#ffffff", font: "Georgia, serif", serif: true },
  { key: "modern", label: "Modern", primary: "#0B2B76", accent: "#00843D", bg: "#ffffff", font: "Inter, sans-serif", serif: false },
  { key: "minimal", label: "Minimal", primary: "#0f172a", accent: "#64748b", bg: "#ffffff", font: "Inter, sans-serif", serif: false },
  { key: "academic", label: "Academic", primary: "#14532d", accent: "#a16207", bg: "#fffdf5", font: "Georgia, serif", serif: true },
];

export const ARCHIVE_REPORTS = [
  { year: "2025–26", title: "Annual Report", pages: 48, status: "Published", size: "18.4 MB", downloads: 1240, highlights: { placement: 94, publications: 187, events: 146 } },
  { year: "2024–25", title: "Annual Report", pages: 42, status: "Published", size: "15.1 MB", downloads: 3182, highlights: { placement: 88, publications: 152, events: 128 } },
  { year: "2023–24", title: "Annual Report", pages: 39, status: "Published", size: "13.8 MB", downloads: 4076, highlights: { placement: 84, publications: 121, events: 104 } },
  { year: "2022–23", title: "Annual Report", pages: 36, status: "Archived", size: "12.2 MB", downloads: 4890, highlights: { placement: 81, publications: 98, events: 92 } },
];

export function timeAgo(dateStr: string) {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
