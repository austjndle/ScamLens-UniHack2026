"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShieldAlert, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/i18n";
import { AssistantMessage } from "@/types/analysis";

interface AssistantChatProps {
  language: Language;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      content:
        language === "vi"
          ? "Xin chào! Tôi là Trợ lý An toàn Tài chính ScamLens. Bạn đang gặp phải cuộc gọi, tin nhắn hay lời mời đầu tư đáng ngờ nào? Hãy chia sẻ với tôi để cùng phân tích các dấu hiệu lừa đảo nhé!"
          : "Hello! I am your ScamLens Financial Safety Advisor. Are you dealing with a suspicious call, message, or investment offer? Tell me what happened, and we will analyze the red flags together!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setError(null);
    setInput("");

    const newMessages: AssistantMessage[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Assistant request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }]);
    } catch (err: unknown) {
      console.error(err);
      setError(
        language === "vi"
          ? "Không thể kết nối đến Trợ lý AI. Vui lòng thử lại sau giây lát."
          : "Unable to reach the AI Advisor. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    t.assistant.sampleQ1,
    t.assistant.sampleQ2,
    t.assistant.sampleQ3,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold mb-3">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini 3.8 Flash Powered</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t.assistant.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto mt-1">
          {t.assistant.subtitle}
        </p>
      </div>

      {/* Main Chat Box */}
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[580px] shadow-2xl border border-[var(--border-subtle)]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-[var(--text-primary)] rounded-tr-none"
                    : "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none whitespace-pre-line"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 text-xs text-[var(--text-muted)]">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {language === "vi" ? "Trợ lý đang suy nghĩ..." : "Advisor is thinking..."}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="text-xs text-[var(--text-secondary)] hover:text-cyan-400 bg-black/20 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 px-2.5 py-1 rounded-md transition-all text-left"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.inputPlaceholder}
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
            {t.assistant.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
