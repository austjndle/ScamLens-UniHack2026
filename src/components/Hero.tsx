"use client";

import React from "react";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/i18n";

interface HeroProps {
  language: Language;
  onStartAnalyzing: () => void;
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ language, onStartAnalyzing, onOpenDemo }) => {
  const t = TRANSLATIONS[language];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Shimmer Announcement Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold mb-8 backdrop-blur-md animate-shimmer relative overflow-hidden shadow-sm shadow-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Large Headline with Gradient Masking */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          <span>{t.hero.titleStart} </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 drop-shadow-sm">
            {t.hero.titleGradient}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-[var(--text-secondary)] font-normal leading-relaxed mb-10">
          {t.hero.subtitle}
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartAnalyzing}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <span>{t.hero.ctaAnalyze}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={onOpenDemo}
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm tracking-wide text-[var(--text-primary)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-white/5 hover:border-cyan-500/40 transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.hero.ctaLiveDemo}</span>
          </button>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl shadow-xl">
          <div className="p-4 flex flex-col items-center border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)]">
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                6+
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] text-center">
              {t.hero.statsScamsPrevented}
            </span>
          </div>

          <div className="p-4 flex flex-col items-center border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)]">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                &lt; 2.8s
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] text-center">
              {t.hero.statsDetectionLatency}
            </span>
          </div>

          <div className="p-4 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              <Lock className="w-5 h-5 text-teal-400" />
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                100%
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] text-center">
              {language === "vi" ? "Bảo mật riêng tư không lưu trữ" : "Zero Persistent Message Storage"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
