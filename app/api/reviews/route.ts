import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateAndStoreSummary } from "@/lib/generate-summary";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    professor_id,
    rating,
    difficulty,
    course,
    grade,
    would_take_again,
    comment,
  } = body;

  if (!professor_id || !rating || !difficulty || !course || !comment) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Fetch professor name for AI summary
  const { data: professor, error: profError } = await supabase
    .from("professors")
    .select("name")
    .eq("id", professor_id)
    .single();

  if (profError || !professor) {
    return NextResponse.json({ error: "Professor not found" }, { status: 404 });
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      professor_id,
      rating,
      difficulty,
      course: course.trim(),
      grade: grade || null,
      would_take_again: !!would_take_again,
      comment: comment.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire-and-forget AI summary generation
  generateAndStoreSummary(professor_id, professor.name).catch(console.error);

  return NextResponse.json(
    {
      review,
      message:
        "Review submitted! AI summary is updating in the background.",
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const professorId = searchParams.get("professor_id");

  if (!professorId) {
    return NextResponse.json(
      { error: "professor_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("professor_id", professorId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
