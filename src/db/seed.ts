import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  classMaterials,
  comments,
  departments,
  enrollments,
  notifications,
  parentSmsLogs,
  students,
  subjects,
  submissions,
  users,
} from "@/db/schema";

const DEPTS = [
  { name: "Computer Engineering", code: "CE", head: "Dr. Meera Shah", completion: 100, status: "approved", students: 720, faculty: 42, placementRate: 96, publications: 38 },
  { name: "Mechanical Engineering", code: "ME", head: "Dr. Rajesh Patel", completion: 92, status: "under_review", students: 640, faculty: 38, placementRate: 89, publications: 24 },
  { name: "Civil Engineering", code: "CV", head: "Dr. Anil Desai", completion: 76, status: "changes_requested", students: 560, faculty: 32, placementRate: 84, publications: 18 },
  { name: "Electrical Engineering", code: "EE", head: "Dr. Kavita Joshi", completion: 84, status: "under_review", students: 480, faculty: 30, placementRate: 88, publications: 21 },
  { name: "Electronics & Communication", code: "EC", head: "Dr. Suresh Iyer", completion: 68, status: "pending", students: 440, faculty: 28, placementRate: 86, publications: 19 },
  { name: "Information Technology", code: "IT", head: "Dr. Nisha Trivedi", completion: 100, status: "approved", students: 680, faculty: 36, placementRate: 95, publications: 27 },
  { name: "MBA", code: "MB", head: "Dr. Vikram Mehta", completion: 100, status: "approved", students: 360, faculty: 24, placementRate: 91, publications: 12 },
  { name: "Science", code: "SC", head: "Dr. Priya Nair", completion: 64, status: "pending", students: 420, faculty: 26, placementRate: 71, publications: 16 },
  { name: "Humanities", code: "HU", head: "Dr. Arjun Rao", completion: 62, status: "pending", students: 280, faculty: 16, placementRate: 65, publications: 6 },
  { name: "Architecture", code: "AR", head: "Dr. Sneha Kulkarni", completion: 72, status: "under_review", students: 240, faculty: 14, placementRate: 78, publications: 6 },
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600 * 1000);
}

let seeding: Promise<void> | null = null;

export async function ensureSeeded() {
  if (!seeding) {
    seeding = seedOnce().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

async function seedOnce() {
  const existing = await db.execute(sql`SELECT COUNT(*)::int AS c FROM departments`);
  const count = (existing.rows[0] as { c: number }).c;
  const fresh = count === 0;

  if (fresh) {
    // Idempotent: auth seeding may already have created these accounts.
    await db
    .insert(users)
    .values([
      { name: "Dr. Ramesh Chandra", email: "admin@git.edu.in", phone: "9876543210", role: "admin", lastLogin: hoursAgo(26) },
      { name: "Prof. Anjali Verma", email: "coordinator@git.edu.in", phone: "9876500011", role: "coordinator", lastLogin: hoursAgo(5) },
      { name: "Dr. Meera Shah", email: "dept.ce@git.edu.in", phone: "9812345678", role: "department", department: "Computer Engineering", lastLogin: hoursAgo(2) },
    ])
    .onConflictDoNothing({ target: users.email });

  const inserted = await db
    .insert(departments)
    .values(
      DEPTS.map((d, i) => ({
        ...d,
        updatedAt: hoursAgo(i % 3 === 0 ? 3 : i % 3 === 1 ? 20 : 50),
      }))
    )
    .returning({ id: departments.id, name: departments.name });

  const idOf = (name: string) => inserted.find((d) => d.name === name)!.id;

  const ce = idOf("Computer Engineering");
  const me = idOf("Mechanical Engineering");
  const cv = idOf("Civil Engineering");
  const ee = idOf("Electrical Engineering");
  const mba = idOf("MBA");
  const ec = idOf("Electronics & Communication");

  const subRows = [
    // Computer Engineering — complete academic record set
    { departmentId: ce, section: "students", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "720 students enrolled across 4 programmes (438 male, 282 female). Roll lists verified against the admission register for all 8 semesters.", updatedAt: hoursAgo(70) },
    { departmentId: ce, section: "attendance", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "Average attendance 87.4% across 32 subjects. 14 students below the 75% detention threshold; parent intimation issued.", updatedAt: hoursAgo(66) },
    { departmentId: ce, section: "syllabus", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "Syllabus completion 96% — 154 of 160 units covered. Deviation report filed for Compiler Design (Unit 5 pending).", updatedAt: hoursAgo(60) },
    { departmentId: ce, section: "notes", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "148 unit-wise notes uploaded covering all 32 subjects, peer-reviewed by module coordinators.", updatedAt: hoursAgo(30) },
    { departmentId: ce, section: "ppt", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "212 lecture presentations archived to the subject repository.", updatedAt: hoursAgo(28) },
    { departmentId: ce, section: "assignments", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "96 assignments issued, 94% submission rate, all evaluated and returned within 7 days.", updatedAt: hoursAgo(26) },
    { departmentId: ce, section: "exam_papers", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "64 internal question papers with blueprints and CO/PO mapping submitted for moderation.", updatedAt: hoursAgo(25) },
    { departmentId: ce, section: "marksheets", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "Internal marks uploaded for all 32 subjects. Department pass percentage 94.2%.", updatedAt: hoursAgo(24) },
    { departmentId: ce, section: "viva", status: "submitted", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: null, summary: "Practical viva completed for 18 lab courses; 6 lab record books pending external sign-off.", updatedAt: hoursAgo(3) },
    { departmentId: ce, section: "lab_manuals", status: "approved", completion: 100, submittedBy: "Dr. Meera Shah", reviewer: "Prof. Anjali Verma", summary: "18 lab manuals revised with new AI/HPC experiments.", updatedAt: hoursAgo(40) },
    { departmentId: ce, section: "feedback", status: "draft", completion: 60, submittedBy: "Dr. Meera Shah", reviewer: null, summary: "Course-end feedback collected for 24 of 32 subjects; analysis in progress.", updatedAt: hoursAgo(2) },
    { departmentId: ce, section: "documents", status: "draft", completion: 45, submittedBy: "Dr. Meera Shah", reviewer: null, summary: "NAAC annexures and CO/PO attainment sheets pending upload.", updatedAt: hoursAgo(2) },
    // Mechanical
    { departmentId: me, section: "attendance", status: "submitted", completion: 100, submittedBy: "Dr. Rajesh Patel", reviewer: null, summary: "Average attendance 82.1% across 28 subjects. 22 students below threshold.", updatedAt: hoursAgo(6) },
    { departmentId: me, section: "syllabus", status: "under_review", completion: 100, submittedBy: "Dr. Rajesh Patel", reviewer: "Prof. Anjali Verma", summary: "Syllabus completion 91% — Thermodynamics and Machine Design lagging by one unit each.", updatedAt: hoursAgo(8) },
    { departmentId: me, section: "exam_papers", status: "approved", completion: 100, submittedBy: "Dr. Rajesh Patel", reviewer: "Prof. Anjali Verma", summary: "52 internal question papers moderated and approved.", updatedAt: hoursAgo(20) },
    { departmentId: me, section: "marksheets", status: "submitted", completion: 100, submittedBy: "Dr. Rajesh Patel", reviewer: null, summary: "Internal marks uploaded for 26 of 28 subjects. Pass percentage 88.6%.", updatedAt: hoursAgo(5) },
    // Civil
    { departmentId: cv, section: "attendance", status: "changes_requested", completion: 90, submittedBy: "Dr. Anil Desai", reviewer: "Prof. Anjali Verma", summary: "Attendance register shows 78.3% average, but three subjects have missing lecture entries for February.", updatedAt: hoursAgo(22) },
    { departmentId: cv, section: "notes", status: "submitted", completion: 100, submittedBy: "Dr. Anil Desai", reviewer: null, summary: "82 unit-wise notes uploaded across 24 subjects.", updatedAt: hoursAgo(12) },
    { departmentId: cv, section: "viva", status: "draft", completion: 35, submittedBy: "Dr. Anil Desai", reviewer: null, summary: "Survey camp viva scheduled; lab records being compiled.", updatedAt: hoursAgo(26) },
    // Electrical
    { departmentId: ee, section: "assignments", status: "submitted", completion: 100, submittedBy: "Dr. Kavita Joshi", reviewer: null, summary: "68 assignments issued with 91% submission rate.", updatedAt: hoursAgo(10) },
    { departmentId: ee, section: "syllabus", status: "under_review", completion: 100, submittedBy: "Dr. Kavita Joshi", reviewer: "Prof. Anjali Verma", summary: "Syllabus completion 89% across 26 subjects.", updatedAt: hoursAgo(15) },
    // EC
    { departmentId: ec, section: "ppt", status: "draft", completion: 40, submittedBy: "Dr. Suresh Iyer", reviewer: null, summary: "Lecture decks being consolidated from faculty drives.", updatedAt: hoursAgo(30) },
    // MBA
    { departmentId: mba, section: "marksheets", status: "approved", completion: 100, submittedBy: "Dr. Vikram Mehta", reviewer: "Prof. Anjali Verma", summary: "All internal marks uploaded. Pass percentage 96.1%.", updatedAt: hoursAgo(48) },
    { departmentId: mba, section: "feedback", status: "approved", completion: 100, submittedBy: "Dr. Vikram Mehta", reviewer: "Prof. Anjali Verma", summary: "Course-end feedback: 4.4/5 average across 18 subjects.", updatedAt: hoursAgo(46) },
  ];

  const insertedSubs = await db.insert(submissions).values(subRows).returning({ id: submissions.id, section: submissions.section, departmentId: submissions.departmentId });

  const cvStudents = insertedSubs.find((s) => s.departmentId === cv && s.section === "attendance");
  if (cvStudents) {
    await db.insert(comments).values([
      { submissionId: cvStudents.id, author: "Prof. Anjali Verma", role: "coordinator", body: "Three subjects have missing lecture entries for February. Please reconcile the attendance register before we sign off.", createdAt: hoursAgo(22) },
      { submissionId: cvStudents.id, author: "Dr. Anil Desai", role: "department", body: "Noted. Faculty have been asked to update the February entries; we will resubmit by tomorrow.", createdAt: hoursAgo(18) },
    ]);
  }
  const meResearch = insertedSubs.find((s) => s.departmentId === me && s.section === "syllabus");
  if (meResearch) {
    await db.insert(comments).values([
      { submissionId: meResearch.id, author: "Prof. Anjali Verma", role: "coordinator", body: "Please attach the deviation report for the two lagging units before approval.", createdAt: hoursAgo(5) },
    ]);
  }

  // ---- Subject-wise academic records ----
  const SUBJECTS: [number, string, string, number, string, number, number, number, number, number, number, number, number, boolean, boolean][] = [
    // deptId, code, name, sem, faculty, enrolled, syllabus%, lecturesTaken, attendance%, pass%, notes, ppt, assignments, viva, marksheet
    [ce, "CE301", "Data Structures & Algorithms", 3, "Dr. Meera Shah", 118, 100, 45, 91, 96, 6, 12, 4, true, true],
    [ce, "CE302", "Database Management Systems", 3, "Prof. Nikhil Rao", 118, 100, 44, 88, 94, 5, 11, 4, true, true],
    [ce, "CE401", "Operating Systems", 4, "Dr. Sanjay Bhatt", 112, 96, 43, 86, 92, 5, 10, 3, true, true],
    [ce, "CE402", "Computer Networks", 4, "Prof. Ritu Shah", 112, 98, 44, 89, 93, 6, 12, 4, true, true],
    [ce, "CE501", "Compiler Design", 5, "Dr. Amit Kulkarni", 104, 82, 37, 81, 87, 4, 8, 3, false, true],
    [ce, "CE502", "Machine Learning", 5, "Dr. Priya Menon", 104, 100, 46, 93, 97, 7, 14, 5, true, true],
    [ce, "CE601", "Cloud Computing", 6, "Prof. Karan Joshi", 98, 94, 42, 85, 91, 5, 10, 4, true, true],
    [ce, "CE602", "Cyber Security", 6, "Dr. Neha Pandya", 98, 92, 41, 84, 90, 5, 9, 3, true, false],
    [me, "ME301", "Thermodynamics", 3, "Dr. Rajesh Patel", 106, 88, 39, 82, 86, 4, 8, 3, true, true],
    [me, "ME302", "Fluid Mechanics", 3, "Prof. Deepak Shah", 106, 92, 41, 84, 88, 5, 9, 3, true, true],
    [me, "ME401", "Machine Design", 4, "Dr. Alok Verma", 102, 85, 38, 79, 84, 4, 7, 3, false, true],
    [me, "ME402", "Manufacturing Processes", 4, "Prof. Sunita Rao", 102, 95, 43, 86, 90, 5, 10, 4, true, true],
    [cv, "CV301", "Structural Analysis", 3, "Dr. Anil Desai", 94, 80, 36, 78, 82, 3, 6, 2, false, true],
    [cv, "CV302", "Geotechnical Engineering", 3, "Prof. Manish Rana", 94, 84, 38, 76, 81, 4, 7, 3, true, true],
    [cv, "CV401", "Transportation Engineering", 4, "Dr. Reena Shah", 90, 76, 34, 77, 80, 3, 6, 2, false, false],
    [ee, "EE301", "Electrical Machines", 3, "Dr. Kavita Joshi", 88, 90, 40, 85, 89, 5, 9, 4, true, true],
    [ee, "EE401", "Power Systems", 4, "Prof. Harsh Mehta", 84, 88, 39, 83, 87, 4, 8, 3, true, true],
    [ee, "EE402", "Control Systems", 4, "Dr. Sneha Iyer", 84, 86, 38, 82, 85, 4, 8, 3, true, false],
    [ec, "EC301", "Digital Electronics", 3, "Dr. Suresh Iyer", 80, 72, 33, 80, 83, 3, 5, 2, false, false],
    [ec, "EC401", "Signals & Systems", 4, "Prof. Divya Nair", 78, 68, 31, 78, 81, 3, 5, 2, false, false],
    [mba, "MB301", "Marketing Management", 3, "Dr. Vikram Mehta", 92, 100, 45, 92, 97, 6, 13, 5, true, true],
    [mba, "MB302", "Financial Management", 3, "Prof. Anita Desai", 92, 100, 44, 90, 96, 6, 12, 5, true, true],
  ];

  await db.insert(subjects).values(
    SUBJECTS.map(([departmentId, code, name, semester, faculty, enrolled, syl, lecturesTaken, att, pass, notes, ppt, assign, viva, ms]) => ({
      departmentId,
      code,
      name,
      semester,
      faculty,
      credits: 4,
      enrolled,
      syllabusCompletion: syl,
      unitsPlanned: 5,
      unitsCovered: Math.round((syl / 100) * 5),
      lecturesPlanned: 45,
      lecturesTaken,
      attendanceAvg: att,
      passPercentage: pass,
      notesCount: notes,
      pptCount: ppt,
      assignmentsCount: assign,
      examPapersCount: 2,
      vivaCompleted: viva,
      marksheetUploaded: ms,
    }))
  );
  } // end if (fresh)

  // Academic-reference data is always required; fetch existing subjects.
  const allSubjects = await db.select().from(subjects);

  // ---- Students, enrollments & classroom material ----
  const liveDepts = await db.select().from(departments);
  const deptIdByCode: Record<string, number> = {};
  for (const d of liveDepts) {
    const code = DEPTS.find((x) => x.name === d.name)?.code;
    if (code) deptIdByCode[code] = d.id;
  }

  const SAMPLE_STUDENTS: {
    roll: string;
    name: string;
    email: string;
    phone: string;
    parent: string;
    code: string;
    sem: number;
    section: string;
  }[] = [
    { roll: "CE2301", name: "Aarav Patel", email: "student.ce@kpgu.edu.in", phone: "9898912345", parent: "9876501100", code: "CE", sem: 3, section: "A" },
    { roll: "CE2302", name: "Priya Shah", email: "priya.shah@kpgu.edu.in", phone: "9898912346", parent: "9876501101", code: "CE", sem: 3, section: "A" },
    { roll: "CE2303", name: "Riya Mehta", email: "riya.mehta@kpgu.edu.in", phone: "9898912347", parent: "9876501102", code: "CE", sem: 3, section: "B" },
    { roll: "CE2304", name: "Dev Joshi", email: "dev.joshi@kpgu.edu.in", phone: "9898912348", parent: "9876501103", code: "CE", sem: 3, section: "B" },
    { roll: "CE2305", name: "Ishita Desai", email: "ishita.desai@kpgu.edu.in", phone: "9898912349", parent: "9876501104", code: "CE", sem: 4, section: "A" },
    { roll: "ME2301", name: "Yash Trivedi", email: "yash.t@kpgu.edu.in", phone: "9898933110", parent: "9876502200", code: "ME", sem: 3, section: "A" },
    { roll: "ME2302", name: "Kavya Rana", email: "kavya.r@kpgu.edu.in", phone: "9898933111", parent: "9876502201", code: "ME", sem: 3, section: "A" },
    { roll: "CV2301", name: "Mohit Suthar", email: "mohit.s@kpgu.edu.in", phone: "9898944001", parent: "9876503300", code: "CV", sem: 3, section: "A" },
    { roll: "EE2301", name: "Nisha Parmar", email: "nisha.p@kpgu.edu.in", phone: "9898955001", parent: "9876504400", code: "EE", sem: 4, section: "B" },
    { roll: "MB2301", name: "Aman Vyas", email: "aman.v@kpgu.edu.in", phone: "9898966001", parent: "9876505500", code: "MB", sem: 3, section: "A" },
  ];

  const _sc = await db.execute(sql`SELECT COUNT(*)::int AS c FROM students`);
  const _c_sc = (_sc.rows[0] as { c: number }).c;
  let insertedStudents: any[] = [];
  if (_c_sc === 0) {
    insertedStudents = await db
      .insert(students)
      .values(
        SAMPLE_STUDENTS.map((s) => ({
          rollNo: s.roll,
          name: s.name,
          email: s.email,
          phone: s.phone,
          parentPhone: s.parent,
          department: DEPTS.find((d) => d.code === s.code)!.name,
          semester: s.sem,
          section: s.section,
        }))
      )
      .returning();
  } else {
    insertedStudents = await db.select().from(students);
  }

  // Enrollments (idempotent)
  const _ec = await db.execute(sql`SELECT COUNT(*)::int AS c FROM enrollments`);
  const _c_ec = (_ec.rows[0] as { c: number }).c;
  if (_c_ec === 0) {
    for (const stu of insertedStudents) {
      const meta = SAMPLE_STUDENTS.find((x) => x.email === stu.email)!;
      const matching = allSubjects.filter(
        (sj) => sj.departmentId === deptIdByCode[meta.code] && sj.semester === meta.sem
      );
      for (const sj of matching) {
        await db.insert(enrollments).values({
          studentId: stu.id,
          subjectId: sj.id,
          present: 30 + Math.floor(Math.random() * 14),
          absent: 1 + Math.floor(Math.random() * 6),
          marks: 40 + Math.floor(Math.random() * 50),
        });
      }
    }
  }

  // Classroom feed (idempotent)
  const _mc = await db.execute(sql`SELECT COUNT(*)::int AS c FROM class_materials`);
  const _c_mc = (_mc.rows[0] as { c: number }).c;
  if (_c_mc === 0) {
    const ceSem3 = allSubjects.filter((sj) => sj.departmentId === deptIdByCode.CE && sj.semester === 3);
    const ds = ceSem3.find((s) => s.code === "CE301") ?? ceSem3[0];
    const dbms = ceSem3.find((s) => s.code === "CE302");
    if (ds && dbms) {
      await db.insert(classMaterials).values([
        {
          subjectId: ds.id,
          kind: "note",
          title: "Unit 3 — Trees & Graphs",
          description: "Complete typed notes with solved examples. Revised edition for 2025–26.",
          attachmentName: "Unit3-Trees-Graphs.pdf",
          postedBy: "Dr. Meera Shah",
        },
        {
          subjectId: ds.id,
          kind: "assignment",
          title: "Assignment 4 — Graph Traversals",
          description: "Submit handwritten or typed solutions; deadline 18 March 2026.",
          attachmentName: "A4-Graph-Traversals.pdf",
          postedBy: "Dr. Meera Shah",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
        {
          subjectId: dbms.id,
          kind: "ppt",
          title: "Lecture 10 — Normalisation",
          description: "Slides for Tuesday's class on 1NF → BCNF.",
          attachmentName: "Lec10-Normalisation.pptx",
          postedBy: "Prof. Nikhil Rao",
        },
        {
          subjectId: ds.id,
          kind: "announcement",
          title: "Internal exam schedule",
          description: "Internal exam will be held 22 March 2026. Hall tickets will be issued on 19 March.",
          attachmentName: null,
          postedBy: "Dr. Meera Shah",
        },
        {
          subjectId: dbms.id,
          kind: "marksheet",
          title: "Internal Marks — Unit Test 2",
          description: "Marks for the second unit test. Students with < 40% must see the faculty during office hours.",
          attachmentName: "CE302-UT2-marks.xlsx",
          postedBy: "Prof. Nikhil Rao",
        },
      ]);
    }
  }

  // Parent SMS logs (idempotent)
  const _pc = await db.execute(sql`SELECT COUNT(*)::int AS c FROM parent_sms_logs`);
  const _c_pc = (_pc.rows[0] as { c: number }).c;
  if (_c_pc === 0) {
    const ceSem3 = allSubjects.filter((sj) => sj.departmentId === deptIdByCode.CE && sj.semester === 3);
    const ds = ceSem3.find((s) => s.code === "CE301") ?? ceSem3[0];
    const dbms = ceSem3.find((s) => s.code === "CE302");
    if (ds) {
      await db.insert(parentSmsLogs).values([
        {
          subjectId: ds.id,
          recipients: 4,
          message:
            "Dear Parent, your ward's attendance for CE301 Data Structures is 88%. Please ensure they attend remaining lectures regularly. - KPGU Vadodara",
          sentBy: "Dr. Meera Shah",
        },
        ...(dbms
          ? [
              {
                subjectId: dbms.id,
                recipients: 4,
                message:
                  "Dear Parent, Unit Test 2 marks for CE302 DBMS have been shared with students. Kindly review. - KPGU Vadodara",
                sentBy: "Prof. Nikhil Rao",
              },
            ]
          : []),
      ]);
    }
  }

  if (fresh) {
    await db.insert(notifications).values([
      { targetRole: "coordinator", title: "New submission received", body: "Mechanical Engineering submitted the Attendance records for review.", kind: "review", read: false, createdAt: hoursAgo(6) },
      { targetRole: "coordinator", title: "Viva submitted", body: "Computer Engineering submitted Viva & Practicals for review.", kind: "review", read: false, createdAt: hoursAgo(3) },
      { targetRole: "department", title: "Changes requested", body: "Coordinator requested changes in Civil Engineering attendance records.", kind: "warning", read: false, createdAt: hoursAgo(22) },
      { targetRole: "department", title: "Section approved", body: "Your Marksheets & Results section has been approved by the coordinator.", kind: "success", read: true, createdAt: hoursAgo(4) },
      { targetRole: "admin", title: "Milestone reached", body: "Academic record verification 82% complete — 76 sections approved.", kind: "success", read: false, createdAt: hoursAgo(9) },
      { targetRole: "admin", title: "Report draft ready", body: "Annual Report 2025–26 draft compiled and is ready for final approval.", kind: "info", read: false, createdAt: hoursAgo(7) },
      { targetRole: "all", title: "Deadline reminder", body: "All departments must complete submissions by 15 March 2026.", kind: "warning", read: true, createdAt: hoursAgo(70) },
    ]);

    await db.insert(activities).values([
      { actor: "Dr. Meera Shah", role: "department", action: "submitted viva & practical records", target: "Computer Engineering · Viva & Practicals", createdAt: hoursAgo(4), device: "Web · Chrome", ip: "103.240.12.44", status: "success" },
      { actor: "Prof. Anjali Verma", role: "coordinator", action: "approved Mechanical Engineering exam papers", target: "Mechanical Engineering · Exam Question Papers", createdAt: hoursAgo(20), device: "Web · Edge", ip: "103.240.12.61", status: "success" },
      { actor: "Dr. Vikram Mehta", role: "department", action: "uploaded internal marksheets", target: "MBA · Marksheets & Results", createdAt: hoursAgo(48), device: "Mobile · Safari", ip: "49.36.88.102", status: "success" },
      { actor: "Prof. Anjali Verma", role: "coordinator", action: "requested changes in attendance records", target: "Civil Engineering · Attendance", createdAt: hoursAgo(22), device: "Web · Edge", ip: "103.240.12.61", status: "warning" },
      { actor: "Dr. Ramesh Chandra", role: "admin", action: "approved Information Technology report", target: "Information Technology", createdAt: hoursAgo(26), device: "Web · Chrome", ip: "103.240.12.10", status: "success" },
      { actor: "Dr. Ramesh Chandra", role: "admin", action: "signed in", target: "Session", createdAt: hoursAgo(26), device: "Web · Chrome", ip: "103.240.12.10", status: "success" },
    ]);
  }
}
