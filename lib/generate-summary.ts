import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { supabase } from "./supabase";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SummarySchema = z.object({
  teaching_style: z
    .string()
    .describe(
      "2-3 sentences describing the professor's teaching approach and communication style"
    ),
  difficulty_summary: z
    .string()
    .describe(
      "2-3 sentences about workload, exam difficulty, and grading expectations"
    ),
  who_thrives: z
    .string()
    .describe(
      "2-3 sentences about what type of students tend to do well in this class"
    ),
  tips: z
    .string()
    .describe(
      "2-3 specific, actionable tips for students taking this professor's class"
    ),
  overall_rating: z
    .number()
    .min(1)
    .max(5)
    .describe("Overall rating from 1.0 to 5.0 based on all reviews"),
});

export async function generateAndStoreSummary(
  professorId: string,
  professorName: string
) {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("professor_id", professorId)
    .order("created_at", { ascending: false });

  if (error || !reviews || reviews.length === 0) return;

  const reviewTexts = reviews
    .map(
      (r, i) =>
        `Review ${i + 1}:
  - Rating: ${r.rating}/5
  - Difficulty: ${r.difficulty}/5
  - Course: ${r.course}
  - Grade received: ${r.grade || "Not provided"}
  - Would take again: ${r.would_take_again ? "Yes" : "No"}
  - Comment: "${r.comment}"`
    )
    .join("\n\n");

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are generating a professor profile summary for Rate My DVC, a student review platform for Diablo Valley College.

Analyze the following ${reviews.length} student review(s) for Professor ${professorName} and generate a helpful, honest, and balanced summary.

${reviewTexts}

Average star rating: ${avgRating.toFixed(1)}/5

Write from the perspective of someone summarizing student feedback to help future DVC students decide whether to take this professor. Be specific and informative, not generic.`,
        },
      ],
      output_config: {
        format: zodOutputFormat(SummarySchema, "professor_summary"),
      },
    });

    if (!response.parsed_output) return;

    const summary = response.parsed_output;

    await supabase.from("ai_summaries").upsert(
      {
        professor_id: professorId,
        teaching_style: summary.teaching_style,
        difficulty_summary: summary.difficulty_summary,
        who_thrives: summary.who_thrives,
        tips: summary.tips,
        overall_rating: summary.overall_rating,
        review_count: reviews.length,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "professor_id" }
    );
  } catch (err) {
    console.error("Failed to generate AI summary:", err);
  }
}
