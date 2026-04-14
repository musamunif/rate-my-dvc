import Link from "next/link";

const stats = [
  { label: "Professors Rated", value: "500+" },
  { label: "Student Reviews", value: "12K+" },
  { label: "Departments", value: "40+" },
];

const features = [
  {
    icon: "⭐",
    title: "Honest Ratings",
    description:
      "Read real reviews from DVC students about teaching quality, difficulty, and more.",
  },
  {
    icon: "🔍",
    title: "Find Your Professor",
    description:
      "Search by name or department to find exactly who you're looking for.",
  },
  {
    icon: "📝",
    title: "Leave a Review",
    description:
      "Help fellow Vikings make informed decisions by sharing your experience.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-2xl font-black tracking-tight">
          Rate My <span className="text-[#F5A800]">DVC</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/professors"
            className="text-sm text-white/60 hover:text-white transition"
          >
            Browse Professors
          </Link>
          <Link
            href="/review"
            className="text-sm bg-[#F5A800] text-black font-semibold px-4 py-2 rounded-full hover:bg-yellow-400 transition"
          >
            Leave a Review
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#003DA5]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/70 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F5A800] animate-pulse" />
            Diablo Valley College · Pleasant Hill, CA
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight mb-6">
            Find the right professor{" "}
            <span className="text-[#F5A800]">before</span> you enroll.
          </h1>

          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Real reviews from real DVC students. Search, compare, and make
            smarter course decisions every semester.
          </p>

          {/* Search bar */}
          <form
            action="/professors"
            method="get"
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 max-w-xl mx-auto backdrop-blur"
          >
            <svg
              className="w-5 h-5 text-white/40 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.65 10.65z"
              />
            </svg>
            <input
              name="q"
              type="text"
              placeholder="Search by professor name or department..."
              className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-[#003DA5] hover:bg-blue-700 transition text-white text-sm font-semibold px-5 py-2 rounded-xl"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-12 py-14 border-y border-white/10 px-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-black text-[#F5A800]">{s.value}</div>
            <div className="text-sm text-white/50 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid sm:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#F5A800]/40 transition"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-20">
        <h2 className="text-3xl font-black mb-4">
          Took a class at DVC recently?
        </h2>
        <p className="text-white/50 mb-8">
          Your review helps the next Viking make the right call.
        </p>
        <Link
          href="/review"
          className="inline-block bg-[#F5A800] text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-yellow-400 transition"
        >
          Rate a Professor
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-center py-8 text-white/30 text-sm">
        © {new Date().getFullYear()} Rate My DVC · Made for Vikings, by Vikings
      </footer>
    </div>
  );
}
