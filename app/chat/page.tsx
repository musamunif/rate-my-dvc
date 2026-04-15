"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Who is the easiest Math professor at DVC?",
  "What is John Corbally like as a professor?",
  "Which professor should I take for HIST-122?",
  "Who are the best Computer Science professors?",
  "Which English professors are the most lenient graders?",
  "Who teaches PHYS-124 and how hard is it?",
];

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming: boolean }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#003DA5]/40 border border-[#003DA5]/60 flex items-center justify-center text-sm shrink-0 mt-0.5">
          ✦
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#F5A800] text-black font-medium rounded-tr-sm"
            : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
        }`}
      >
        {msg.content ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : isStreaming ? (
          <span className="inline-flex items-center gap-1 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: assistantContent }]);
      }
    } catch {
      setMessages([
        ...history,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }

    setStreaming(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen bg-[#0a0a0f] text-white font-sans flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 overflow-hidden">
        {!hasMessages ? (
          /* Welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-[#003DA5]/20 border border-[#003DA5]/40 flex items-center justify-center mb-5 text-2xl text-[#F5A800]">
              ✦
            </div>
            <h1 className="text-3xl font-black mb-2">DVC AI Advisor</h1>
            <p className="text-white/50 mb-1 text-sm">Powered by Claude · Trained on DVC reviews</p>
            <p className="text-white/40 mb-10 text-sm max-w-sm">
              Ask me anything — I know every professor at DVC, what they teach, and what students think of them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={streaming}
                  className="text-left text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-[#F5A800]/40 hover:bg-white/[0.08] transition text-white/70 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="flex-1 overflow-y-auto py-6 space-y-4 scroll-smooth">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                msg={msg}
                isStreaming={streaming && i === messages.length - 1}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input bar */}
        <div className="py-4 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a professor, course, or department…"
              disabled={streaming}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5A800]/40 disabled:opacity-50 transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="bg-[#003DA5] hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-2xl transition text-sm shrink-0"
            >
              {streaming ? "…" : "Send"}
            </button>
          </form>
          <p className="text-white/20 text-xs text-center mt-2">
            AI advisor — always verify with your professor directly
          </p>
        </div>
      </div>
    </div>
  );
}
