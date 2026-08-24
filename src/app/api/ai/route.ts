import { NextResponse } from "next/server";

// Mock AI assistant — deterministic, rule-based text generation so the demo
// works without external API keys. Structured like a real provider call so it
// can be swapped for OpenAI/Anthropic later.

function extractNumbers(text: string): { value: string; context: string }[] {
  const out: { value: string; context: string }[] = [];
  const re = /(\d[\d,.]*)\s*(%|percent)?\s*([a-zA-Z ]{0,40})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null && out.length < 8) {
    out.push({ value: m[1] + (m[2] ? "%" : ""), context: m[3].trim().split(/[,.]/)[0] });
  }
  return out;
}

export async function POST(req: Request) {
  const { mode, text, context } = (await req.json()) as { mode: string; text: string; context?: Record<string, unknown> };
  const clean = (text || "").trim();
  if (!clean) {
    return NextResponse.json({ error: "Please provide some input text." }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 900)); // simulate model latency

  const nums = extractNumbers(clean);
  const numPhrases = nums
    .filter((n) => n.context)
    .slice(0, 4)
    .map((n) => `${n.value} ${n.context.toLowerCase()}`);

  let output = "";
  if (mode === "summary") {
    output = `The department demonstrated strong academic and extracurricular performance during 2025–26${
      numPhrases.length ? ", " + formatList(numPhrases.map(achievementPhrase)) : ""
    }. These outcomes reflect the department's sustained commitment to academic excellence, research advancement and holistic student development.`;
  } else if (mode === "grammar") {
    output =
      clean
        .replace(/\s+/g, " ")
        .replace(/\bi\b/g, "I")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
        .replace(/([^.!?])$/, "$1.") +
      "\n\n(Grammar, capitalization and sentence flow refined. Please review before publication.)";
  } else if (mode === "executive") {
    output = `Executive Summary — Annual Report 2025–26\n\nDuring the academic year 2025–26, the institution recorded measurable progress across academics, research and student outcomes${
      numPhrases.length ? ". Key indicators include " + formatList(numPhrases) : ""
    }. The year was marked by disciplined execution of institutional priorities, deeper industry engagement and a strengthened research culture. The institution enters the coming year well-positioned to build on this momentum.`;
  } else if (mode === "highlights") {
    const items = numPhrases.length
      ? numPhrases.map((p) => `• Achieved ${p} during the reporting period`)
      : ["• Sustained improvement in academic outcomes", "• Expanded research output and industry collaboration", "• Strengthened student development initiatives"];
    output = `Key Achievement Highlights — 2025–26\n\n${items.join("\n")}\n• Recognized for excellence in institutional governance and reporting`;
  } else if (mode === "compile") {
    // Compile a structured annual report chapter from the submitted academic data.
    const dept = (context as { department?: string; subjects?: Array<{ code?: string; name?: string; syl?: number; att?: number; pass?: number; notes?: number; ppt?: number; assignments?: number; papers?: number; viva?: boolean; marksheet?: boolean }> } | undefined) ?? {};
    const subs = dept.subjects ?? [];
    const n = subs.length;
    const avg = (key: "syl" | "att" | "pass") =>
      n ? Math.round(subs.reduce((a, s) => a + (s[key] ?? 0), 0) / n) : 0;
    const avgSyl = avg("syl");
    const avgAtt = avg("att");
    const avgPass = avg("pass");
    const pending = subs.filter((s) => !s.marksheet || !s.viva).length;
    const totalNotes = subs.reduce((a, s) => a + (s.notes ?? 0), 0);
    const totalPpt = subs.reduce((a, s) => a + (s.ppt ?? 0), 0);
    const totalAssign = subs.reduce((a, s) => a + (s.assignments ?? 0), 0);
    const totalPapers = subs.reduce((a, s) => a + (s.papers ?? 0), 0);
    output = [
      `## ${dept.department ?? "Department"} — Annual Report 2025–26`,
      "",
      "### Overview",
      `The department delivered teaching across **${n}** subject${n === 1 ? "" : "s"} during 2025–26, achieving an average syllabus completion of **${avgSyl}%**, average attendance of **${avgAtt}%**, and an overall pass percentage of **${avgPass}%` +
        "**. " + (pending
          ? `**${pending}** subject${pending === 1 ? "" : "s"} remain pending finalisation (viva / mark sheet). `
          : "All mark sheets and practical viva records have been verified and uploaded. ") +
        "Teaching schedules, internal examinations and practical sessions were conducted as per the academic calendar, with deviations documented in the relevant subject files.",
      "",
      "### Teaching & Learning Material",
      `Faculty prepared **${totalNotes}** sets of unit-wise notes, delivered **${totalPpt}** lecture presentations, issued **${totalAssign}** assignments, and set **${totalPapers}** internal question papers. All material has been archived in the departmental repository and is accessible to students through the Classroom portal.`,
      "",
      "### Subject-wise Summary",
      ...(subs.length
        ? subs.map(
            (s) =>
              `- **${s.code ?? ""}${s.code ? " · " : ""}${s.name ?? "Subject"}** — syllabus ${s.syl ?? "—"}%, attendance ${s.att ?? "—"}%, pass ${s.pass ?? "—"}%${s.viva ? "" : " (viva pending)"}${s.marksheet ? "" : " (marksheet pending)"}.`
          )
        : ["- No subject data was supplied."]),
      "",
      "### Quality Initiatives",
      "- Student feedback collected for all subjects; corrective actions communicated to faculty.\n" +
        "- Remedial classes arranged for students scoring below 40% in internal tests.\n" +
        "- All internal question papers moderated to ensure alignment with CO/PO attainment.",
      "",
      "### Action Items",
      ...(pending
        ? [
            `- Complete mark-sheet uploads and viva formalities for ${pending} subject(s).`,
            "- Consolidate CO/PO attainment and submit to IQAC before 31 March.",
          ]
        : ["- No pending academic action items. Chapter ready for coordinator review."]),
      "",
      "_This chapter was compiled by the AI Report Assistant from verified submissions. Faculty should review all figures before publication._",
    ].join("\n");
  } else {
    output = clean;
  }

  return NextResponse.json({ output });
}

function achievementPhrase(p: string) {
  if (/event/i.test(p)) return `organizing ${p}`;
  if (/competition|victor|won|winner/i.test(p)) return `achieving ${p}`;
  if (/paper|publication|research/i.test(p)) return `contributing ${p}`;
  if (/placement|placed/i.test(p)) return `securing ${p}`;
  return `recording ${p}`;
}

function formatList(items: string[]) {
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}
