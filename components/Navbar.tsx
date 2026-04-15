"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm transition ${
        pathname === href || pathname.startsWith(href + "/")
          ? "text-white font-medium"
          : "text-white/60 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
      <Link href="/" className="text-2xl font-black tracking-tight">
        Rate My <span className="text-[#F5A800]">DVC</span>
      </Link>
      <div className="flex items-center gap-5">
        {navLink("/professors", "Browse Professors")}
        <Link
          href="/chat"
          className={`text-sm transition flex items-center gap-1.5 ${
            pathname === "/chat"
              ? "text-[#F5A800] font-medium"
              : "text-white/60 hover:text-[#F5A800]"
          }`}
        >
          <span className="text-base">✦</span> AI Advisor
        </Link>
        <Link
          href="/review"
          className="text-sm bg-[#F5A800] text-black font-semibold px-4 py-2 rounded-full hover:bg-yellow-400 transition"
        >
          Leave a Review
        </Link>
      </div>
    </nav>
  );
}
