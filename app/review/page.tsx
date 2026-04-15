"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProfessorWithStats } from "@/lib/types";

const GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "P", "NP", "Prefer not to say"];

// ADMIN_FEATURE: Student add-professor is disabled. Re-enable by setting this to true.
const STUDENT_CAN_ADD_PROFESSOR = false;

function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition"
          >
            <span
              className={
                s <= (hover || value) ? "text-[#F5A800]" : "text-white/20"
              }
            >
              ★
            </span>
          </button>
        ))}
        {value > 0 && (
          <span className="text-white/50 text-sm ml-2">{value}/5</span>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("professor_id");

  const [professors, setProfessors] = useState<ProfessorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // ADMIN_FEATURE: Add new professor state — kept for when feature is re-enabled
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("");

  const [form, setForm] = useState({
    professor_id: preselectedId || "",
    rating: 0,
    difficulty: 0,
    course: "",
    grade: "",
    would_take_again: true,
    comment: "",
  });

  useEffect(() => {
    fetch("/api/professors")
      .then((r) => r.json())
      .then((data) => {
        setProfessors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ADMIN_FEATURE: Handler kept — re-enable by setting STUDENT_CAN_ADD_PROFESSOR = true
  const handleAddProfessor = async () => {
    if (!newName.trim() || !newDept.trim()) return;
    const res = await fetch("/api/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, department: newDept }),
    });
    if (res.ok) {
      const prof = await res.json();
      setProfessors((prev) => [...prev, { ...prof, avg_rating: 0, avg_difficulty: 0, would_take_again_pct: 0, review_count: 0 }]);
      setForm((f) => ({ ...f, professor_id: prof.id }));
      setAddingNew(false);
      setNewName("");
      setNewDept("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.professor_id) return setError("Please select a professor.");
    if (!form.rating) return setError("Please select a rating.");
    if (!form.difficulty) return setError("Please select a difficulty.");
    if (!form.course.trim()) return setError("Please enter the course name.");
    if (!form.comment.trim()) return setError("Please write a comment.");

    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-black mb-2">Review Submitted!</h2>
          <p className="text-white/50 mb-6">
            Your review is live and the AI summary is updating in the background.
            Thanks for helping fellow Vikings!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/professors/${form.professor_id}`)}
              className="bg-[#F5A800] text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-400 transition"
            >
              View Professor
            </button>
            <Link
              href="/professors"
              className="border border-white/20 text-white px-6 py-2 rounded-full hover:border-white/40 transition text-sm flex items-center"
            >
              Browse Professors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Rate My <span className="text-[#F5A800]">DVC</span>
        </Link>
        <Link
          href="/professors"
          className="text-sm text-white/60 hover:text-white transition"
        >
          Browse Professors
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black mb-2">Write a Review</h1>
        <p className="text-white/50 mb-8">
          Help fellow Vikings make informed decisions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professor Select */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Professor</label>

            {/* ADMIN_FEATURE: Add-professor form — shown only when STUDENT_CAN_ADD_PROFESSOR is true */}
            {STUDENT_CAN_ADD_PROFESSOR && addingNew ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Professor full name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
                />
                <input
                  type="text"
                  placeholder="Department (e.g. Mathematics)"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddProfessor}
                    className="bg-[#003DA5] text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                  >
                    Add Professor
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingNew(false)}
                    className="text-white/40 text-sm px-4 py-2 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={form.professor_id}
                  onChange={(e) => setForm((f) => ({ ...f, professor_id: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F5A800]/50"
                  disabled={loading}
                >
                  <option value="" className="bg-[#0a0a0f]">
                    {loading ? "Loading..." : "Select a professor..."}
                  </option>
                  {professors.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0a0a0f]">
                      {p.name} — {p.department}
                    </option>
                  ))}
                </select>
                {/* ADMIN_FEATURE: Button hidden — set STUDENT_CAN_ADD_PROFESSOR = true to re-enable */}
                {STUDENT_CAN_ADD_PROFESSOR && (
                  <button
                    type="button"
                    onClick={() => setAddingNew(true)}
                    className="text-sm text-[#F5A800] hover:underline"
                  >
                    + Professor not listed? Add them
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Course</label>
            {(() => {
              const selectedProf = professors.find((p) => p.id === form.professor_id);
              const courseSuggestions = selectedProf?.courses
                ? selectedProf.courses.split(",").map((c) => c.trim()).filter(Boolean)
                : [];
              return (
                <>
                  <input
                    type="text"
                    list="course-suggestions"
                    placeholder="e.g. MATH-122, ENGL-120"
                    value={form.course}
                    onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
                  />
                  {courseSuggestions.length > 0 && (
                    <datalist id="course-suggestions">
                      {courseSuggestions.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  )}
                </>
              );
            })()}
          </div>

          {/* Rating */}
          <StarInput
            label="Overall Rating"
            value={form.rating}
            onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
          />

          {/* Difficulty */}
          <StarInput
            label="Difficulty (1 = easy, 5 = very hard)"
            value={form.difficulty}
            onChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}
          />

          {/* Would take again */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Would you take this professor again?
            </label>
            <div className="flex gap-3">
              {[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, would_take_again: value }))}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition border ${
                    form.would_take_again === value
                      ? value
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : "bg-red-500/20 border-red-500 text-red-400"
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Grade Received <span className="text-white/30">(optional)</span>
            </label>
            <select
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F5A800]/50"
            >
              <option value="" className="bg-[#0a0a0f]">Select grade...</option>
              {GRADES.map((g) => (
                <option key={g} value={g} className="bg-[#0a0a0f]">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Your Review</label>
            <textarea
              placeholder="Share your experience — what was the class like? Any advice for future students?"
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#F5A800] text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
