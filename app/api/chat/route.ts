import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

async function buildContext() {
  const [{ data: professors }, { data: reviews }, { data: summaries }] =
    await Promise.all([
      supabase.from("professors").select("*").order("name"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_summaries").select("*"),
    ]);

  if (!professors) return "";

  const reviewsByProf: Record<string, typeof reviews> = {};
  (reviews || []).forEach((r) => {
    if (!reviewsByProf[r.professor_id]) reviewsByProf[r.professor_id] = [];
    reviewsByProf[r.professor_id]!.push(r);
  });

  const summaryByProf: Record<string, (typeof summaries)[0]> = {};
  (summaries || []).forEach((s) => (summaryByProf[s.professor_id] = s));

  // Group by department
  const byDept: Record<string, typeof professors> = {};
  professors.forEach((p) => {
    if (!byDept[p.department]) byDept[p.department] = [];
    byDept[p.department].push(p);
  });

  let ctx = "=== DVC PROFESSOR DATABASE ===\n\n";

  for (const dept of Object.keys(byDept).sort()) {
    ctx += `[${dept}]\n`;
    for (const prof of byDept[dept]) {
      const profReviews = reviewsByProf[prof.id] || [];
      const summary = summaryByProf[prof.id];
      const reviewCount = profReviews.length;

      const avgRating =
        reviewCount > 0
          ? (profReviews.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1)
          : null;
      const avgDiff =
        reviewCount > 0
          ? (profReviews.reduce((s, r) => s + r.difficulty, 0) / reviewCount).toFixed(1)
          : null;
      const wouldAgainPct =
        reviewCount > 0
          ? Math.round(
              (profReviews.filter((r) => r.would_take_again).length / reviewCount) * 100
            )
          : null;

      ctx += `• ${prof.name} (${prof.department})`;
      if (prof.courses) ctx += ` — teaches: ${prof.courses}`;
      if (reviewCount > 0) {
        ctx += `\n  Stats: ${reviewCount} review${reviewCount !== 1 ? "s" : ""}, avg rating ${avgRating}/5, avg difficulty ${avgDiff}/5, ${wouldAgainPct}% would take again`;
      } else {
        ctx += `\n  No reviews yet`;
      }

      if (summary) {
        ctx += `\n  Teaching style: ${summary.teaching_style}`;
        ctx += `\n  Difficulty: ${summary.difficulty_summary}`;
        ctx += `\n  Who thrives: ${summary.who_thrives}`;
        ctx += `\n  Tips: ${summary.tips}`;
      }

      if (profReviews.length > 0) {
        ctx += `\n  Student reviews:`;
        profReviews.slice(0, 6).forEach((r) => {
          ctx += `\n    - [${r.rating}/5, difficulty ${r.difficulty}/5, ${r.course}${r.grade ? `, got ${r.grade}` : ""}] "${r.comment}"`;
        });
      }

      ctx += "\n\n";
    }
  }

  return ctx;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const context = await buildContext();

  const system = `You are a knowledgeable and friendly AI advisor for Diablo Valley College (DVC) students in Pleasant Hill, CA.

You have access to a live database of DVC professors, their courses, student reviews, ratings, and AI-generated summaries. Use this data to give specific, honest, and helpful advice.

When answering:
- Be direct and specific — name actual professors with their actual stats
- If asked for "easiest" or "hardest", compare ratings and difficulty scores
- If asked about a specific professor, summarize what students say about them
- If asked about a course (like HIST-122), list which professors teach it and compare them
- If a professor has no reviews yet, say so honestly and share what you know from their course list
- Be conversational and student-friendly, not overly formal
- Keep responses concise but complete — students want answers, not essays
- You can recommend professors, but always back it up with the data

${context}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 1024,
          system,
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
