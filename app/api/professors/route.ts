import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("professors")
    .select(`*, reviews(rating, difficulty, would_take_again)`)
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const professors = (data || []).map((p) => {
    const reviews = p.reviews || [];
    const review_count = reviews.length;
    const avg_rating =
      review_count > 0
        ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / review_count
        : 0;
    const avg_difficulty =
      review_count > 0
        ? reviews.reduce((s: number, r: { difficulty: number }) => s + r.difficulty, 0) / review_count
        : 0;
    const would_take_again_pct =
      review_count > 0
        ? (reviews.filter((r: { would_take_again: boolean }) => r.would_take_again).length /
            review_count) *
          100
        : 0;

    return {
      id: p.id,
      name: p.name,
      department: p.department,
      courses: p.courses || "",
      created_at: p.created_at,
      avg_rating: Math.round(avg_rating * 10) / 10,
      avg_difficulty: Math.round(avg_difficulty * 10) / 10,
      would_take_again_pct: Math.round(would_take_again_pct),
      review_count,
    };
  });

  return NextResponse.json(professors);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, department } = body;

  if (!name || !department) {
    return NextResponse.json(
      { error: "Name and department are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("professors")
    .insert({ name: name.trim(), department: department.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
