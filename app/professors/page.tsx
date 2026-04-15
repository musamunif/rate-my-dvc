"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ProfessorWithStats } from "@/lib/types";

const DEPARTMENTS = [
  "All Departments",
  "Business",
  "Computer Science",
  "English",
  "History",
  "Mathematics",
  "Natural Sciences",
  "Philosophy",
  "Political Science",
  "Psychology",
  "Sociology",
  "Other",
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= Math.round(rating) ? "text-[#F5A800]" : "text-white/20"}
        >
          ★
        </span>
      ))}
      <span className="text-white/60 text-sm ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProfessorCard({ prof }: { prof: ProfessorWithStats }) {
  return (
    <Link href={`/professors/${prof.id}`}>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#F5A800]/40 hover:bg-white/8 transition group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white group-hover:text-[#F5A800] transition">
              {prof.name}
            </h3>
            <p className="text-sm text-white/50 mt-0.5">{prof.department}</p>
          </div>
          <span className="text-xs bg-[#003DA5]/30 text-blue-300 border border-blue-800/50 rounded-full px-2 py-1">
            {prof.review_count} {prof.review_count === 1 ? "review" : "reviews"}
          </span>
        </div>

        {prof.review_count > 0 ? (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Rating</span>
              <StarDisplay rating={prof.avg_rating} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Difficulty</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#003DA5] rounded-full"
                    style={{ width: `${(prof.avg_difficulty / 5) * 100}%` }}
                  />
                </div>
                <span className="text-white/60">{prof.avg_difficulty.toFixed(1)}/5</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Would take again</span>
              <span
                className={
                  prof.would_take_again_pct >= 70
                    ? "text-green-400"
                    : prof.would_take_again_pct >= 40
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {prof.would_take_again_pct}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-white/30 text-sm mt-4">No reviews yet — be the first!</p>
        )}
      </div>
    </Link>
  );
}

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<ProfessorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [sort, setSort] = useState<"name" | "rating" | "reviews">("rating");

  useEffect(() => {
    fetch("/api/professors")
      .then((r) => r.json())
      .then((data) => {
        setProfessors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = professors
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.department.toLowerCase().includes(search.toLowerCase());
      const matchDept =
        department === "All Departments" || p.department === department;
      return matchSearch && matchDept;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.avg_rating - a.avg_rating;
      if (sort === "reviews") return b.review_count - a.review_count;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black mb-2">Browse Professors</h1>
        <p className="text-white/50 mb-8">
          {professors.length} professors at Diablo Valley College
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F5A800]/50"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d} className="bg-[#0a0a0f]">
                {d}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F5A800]/50"
          >
            <option value="rating" className="bg-[#0a0a0f]">Sort: Top Rated</option>
            <option value="reviews" className="bg-[#0a0a0f]">Sort: Most Reviewed</option>
            <option value="name" className="bg-[#0a0a0f]">Sort: A–Z</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-24 text-white/40">Loading professors...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/40">
            No professors found.{" "}
            <Link href="/review" className="text-[#F5A800] hover:underline">
              Add one via a review.
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProfessorCard key={p.id} prof={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
