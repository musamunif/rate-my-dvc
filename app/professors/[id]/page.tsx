import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Review, AiSummary } from "@/lib/types";

async function getProfessor(id: string) {
  const { data } = await supabase
    .from("professors")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

async function getReviews(professorId: string): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("professor_id", professorId)
    .order("created_at", { ascending: false });
  return data || [];
}

async function getSummary(professorId: string): Promise<AiSummary | null> {
  const { data } = await supabase
    .from("ai_summaries")
    .select("*")
    .eq("professor_id", professorId)
    .single();
  return data;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= Math.round(rating) ? "text-[#F5A800] text-lg" : "text-white/20 text-lg"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <StarDisplay rating={review.rating} />
          <p className="text-sm text-white/50 mt-1">{review.course}</p>
        </div>
        <div className="text-right text-sm text-white/40">
          <p>{date}</p>
          {review.grade && <p className="mt-0.5">Grade: {review.grade}</p>}
        </div>
      </div>
      <p className="text-white/80 text-sm leading-relaxed mb-3">{review.comment}</p>
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>Difficulty: {review.difficulty}/5</span>
        <span
          className={review.would_take_again ? "text-green-400" : "text-red-400"}
        >
          {review.would_take_again ? "✓ Would take again" : "✗ Would not take again"}
        </span>
      </div>
    </div>
  );
}

export default async function ProfessorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [professor, reviews, summary] = await Promise.all([
    getProfessor(id),
    getReviews(id),
    getSummary(id),
  ]);

  if (!professor) notFound();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const avgDifficulty =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.difficulty, 0) / reviews.length
      : 0;
  const wouldTakeAgainPct =
    reviews.length > 0
      ? Math.round(
          (reviews.filter((r) => r.would_take_again).length / reviews.length) * 100
        )
      : 0;

  const summaryCards = summary
    ? [
        { label: "Teaching Style", icon: "🎓", text: summary.teaching_style },
        { label: "Difficulty", icon: "📊", text: summary.difficulty_summary },
        { label: "Who Thrives", icon: "🌟", text: summary.who_thrives },
        { label: "Tips", icon: "💡", text: summary.tips },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          href="/professors"
          className="text-sm text-white/40 hover:text-white transition mb-6 inline-block"
        >
          ← Back to Professors
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[#F5A800] text-sm font-medium mb-1">{professor.department}</p>
            <h1 className="text-4xl font-black">{professor.name}</h1>
            <p className="text-white/40 mt-1 text-sm">
              Diablo Valley College
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-[#F5A800]">
                  {avgRating.toFixed(1)}
                </div>
                <div className="text-xs text-white/50">Overall</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-400">
                  {avgDifficulty.toFixed(1)}
                </div>
                <div className="text-xs text-white/50">Difficulty</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-400">
                  {wouldTakeAgainPct}%
                </div>
                <div className="text-xs text-white/50">Again</div>
              </div>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {summary ? (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#F5A800] animate-pulse" />
              <h2 className="text-lg font-bold">
                AI Summary
                <span className="text-white/40 font-normal text-sm ml-2">
                  based on {summary.review_count} review{summary.review_count !== 1 ? "s" : ""}
                </span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#F5A800]/20 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{card.icon}</span>
                    <span className="text-sm font-semibold text-[#F5A800]">
                      {card.label}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="mb-10 bg-white/3 border border-white/10 rounded-2xl p-5 text-white/40 text-sm">
            AI summary is being generated...
          </div>
        ) : null}

        {/* Reviews */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {reviews.length > 0 ? `${reviews.length} Student Review${reviews.length !== 1 ? "s" : ""}` : "No Reviews Yet"}
          </h2>
          <Link
            href={`/review?professor_id=${professor.id}`}
            className="text-sm text-[#F5A800] hover:underline"
          >
            + Write a review
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/40 mb-4">Be the first to review {professor.name}</p>
            <Link
              href={`/review?professor_id=${professor.id}`}
              className="bg-[#F5A800] text-black font-semibold px-6 py-2 rounded-full text-sm hover:bg-yellow-400 transition"
            >
              Write a Review
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
