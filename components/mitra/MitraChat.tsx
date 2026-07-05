"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { useTranslations } from "@/components/i18n/LanguageProvider";
import { Markdown } from "@/components/ui/Markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MitraSource {
  title: string;
  href: string;
  type: string;
}

const STARTERS = [
  "How do I declare probation for a new appointee?",
  "What documents are needed for GPF advance?",
  "Steps to process a CFMS pay bill?",
  "EL encashment rules on retirement?",
];

export function MitraChat({ fullPage = false }: { fullPage?: boolean }) {
  const t = useTranslations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<MitraSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mitra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.mitra.error);
        setLoading(false);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      setSources(data.sources ?? []);
    } catch {
      setError(t.mitra.error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const containerClass = fullPage
    ? "flex min-h-[calc(100dvh-12rem)] flex-col rounded-2xl border border-navy-100 bg-white shadow-lg dark:border-navy-700 dark:bg-navy-900"
    : "flex h-[min(520px,calc(100dvh-8rem))] flex-col rounded-t-2xl border border-navy-200 bg-white shadow-2xl dark:border-navy-600 dark:bg-navy-900";

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3 border-b border-navy-100 px-4 py-3 dark:border-navy-700">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-white shadow">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy-900 dark:text-white">{t.mitra.title}</p>
          <p className="truncate text-xs text-gray-500 dark:text-navy-300">{t.mitra.subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-navy-200">{t.mitra.welcome}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-xl border border-navy-100 bg-navy-50/80 px-3 py-2.5 text-left text-xs font-medium text-navy-800 transition hover:border-gold-400 hover:bg-gold-50 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-100 dark:hover:border-gold-500/50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-navy-800 text-white"
                    : "border border-navy-100 bg-gray-50 text-gray-800 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-100"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose-article prose-sm max-w-none dark:prose-invert">
                    <Markdown>{m.content}</Markdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.mitra.thinking}
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {sources.length > 0 && messages.length > 0 && (
        <div className="border-t border-navy-100 px-4 py-2 dark:border-navy-700">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            {t.mitra.sources}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources.slice(0, 5).map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-medium text-navy-800 hover:bg-gold-100 dark:bg-navy-700 dark:text-navy-100"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="px-4 py-2 text-xs text-error" role="alert">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-navy-100 p-3 dark:border-navy-700"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.mitra.placeholder}
          disabled={loading}
          maxLength={2000}
          className="input-field flex-1 rounded-xl text-sm"
          aria-label={t.mitra.placeholder}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary flex shrink-0 items-center gap-1 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{t.mitra.send}</span>
        </button>
      </form>

      <p className="border-t border-navy-50 px-4 py-2 text-[10px] leading-relaxed text-gray-500 dark:border-navy-800 dark:text-navy-400">
        {t.mitra.disclaimer}
      </p>
    </div>
  );
}

/** Floating Mitra button + slide-up panel for site-wide access */
export function MitraWidget() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="mitra-widget fixed bottom-[4.75rem] right-4 z-[61] lg:bottom-6">
        {open && (
          <div className="mb-3 w-[min(100vw-2rem,420px)] animate-in slide-in-from-bottom-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg"
                aria-label={t.mitra.close}
              >
                <X className="h-4 w-4" />
              </button>
              <MitraChat />
            </div>
          </div>
        )}

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl active:scale-95"
            aria-label={t.nav.askMitra}
          >
            <Sparkles className="h-5 w-5 transition group-hover:rotate-12" />
            <span className="hidden sm:inline">{t.nav.askMitra}</span>
          </button>
        )}
      </div>
    </>
  );
}
