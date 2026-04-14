"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfessorWithStats } from "@/lib/types";

const ADMIN_PASSWORD = "dvc-admin-2024";

const DEPARTMENTS = [
  "Mathematics",
  "English",
  "Computer Science",
  "Computer Network Technology",
  "Computer Information Systems",
  "Psychology",
  "Political Science",
  "History",
  "Sociology",
  "Anthropology",
  "Economics",
  "Biological Sciences",
  "Microbiology",
  "Physiology",
  "Chemistry",
  "Physics",
  "Astronomy",
  "Geology",
  "Geography",
  "Oceanography",
  "Philosophy",
  "Humanities",
  "Communication Studies",
  "Journalism",
  "Drama",
  "Art",
  "Film & Digital Media",
  "Music",
  "Dance",
  "Kinesiology",
  "Business Administration",
  "Engineering",
  "Architecture",
  "Administration of Justice",
  "Culinary Arts",
  "Early Childhood Education",
  "Public Health",
  "Nutrition",
  "Dental Hygiene",
  "Dental Assisting",
  "World Languages",
  "Ethnic Studies",
  "Library",
  "Other",
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const [professors, setProfessors] = useState<ProfessorWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [customDept, setCustomDept] = useState("");
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authed) {
      setLoading(true);
      fetch("/api/professors")
        .then((r) => r.json())
        .then((data) => {
          setProfessors(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password.");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const dept = department === "Other" ? customDept.trim() : department;
    if (!name.trim() || !dept) {
      setError("Both name and department are required.");
      return;
    }

    setAdding(true);
    const res = await fetch("/api/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), department: dept }),
    });

    if (res.ok) {
      const prof = await res.json();
      setProfessors((prev) =>
        [...prev, { ...prof, avg_rating: 0, avg_difficulty: 0, would_take_again_pct: 0, review_count: 0 }]
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setSuccess(`${prof.name} added successfully.`);
      setName("");
      setDepartment("");
      setCustomDept("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add professor.");
    }
    setAdding(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-2xl font-black tracking-tight block mb-8 text-center">
            Rate My <span className="text-[#F5A800]">DVC</span>
          </Link>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="text-xl font-black mb-1">Admin Login</h1>
            <p className="text-white/40 text-sm mb-6">For authorized personnel only.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
                autoFocus
              />
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
              <button
                type="submit"
                className="w-full bg-[#003DA5] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
              >
                Login
              </button>
            </form>
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
          <span className="text-sm font-normal text-white/40 ml-2">Admin</span>
        </Link>
        <button
          onClick={() => setAuthed(false)}
          className="text-sm text-white/40 hover:text-white transition"
        >
          Log out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
        {/* Add Professor Form */}
        <div>
          <h2 className="text-xl font-black mb-6">Add a Professor</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F5A800]/50"
              >
                <option value="" className="bg-[#0a0a0f]">Select department...</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-[#0a0a0f]">{d}</option>
                ))}
              </select>
            </div>
            {department === "Other" && (
              <input
                type="text"
                placeholder="Enter department name"
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/50"
              />
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-[#F5A800] text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Professor"}
            </button>
          </form>
        </div>

        {/* Professor List */}
        <div>
          <h2 className="text-xl font-black mb-6">
            All Professors
            <span className="text-white/40 font-normal text-sm ml-2">
              ({professors.length})
            </span>
          </h2>
          {loading ? (
            <p className="text-white/40 text-sm">Loading...</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {professors.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-white/40">{p.department}</p>
                  </div>
                  <Link
                    href={`/professors/${p.id}`}
                    className="text-xs text-[#F5A800] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
