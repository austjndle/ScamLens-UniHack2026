"use client";

import React from "react";
import { ShieldAlert, Moon, Sun, Sparkles, BookOpen, MessageSquare, Compass } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/i18n";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  activeTab: "home" | "analyzer" | "assistant" | "registry" | "guide" | "disclaimer";
  onTabChange: (tab: "home" | "analyzer" | "assistant" | "registry" | "guide" | "disclaimer") => void;
  onDemoClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isDark,
  onThemeToggle,
  activeTab,
  onTabChange,
  onDemoClick,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange("home")}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[var(--bg-secondary)] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                ScamLens
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                AI + AVAX
              </span>
            </div>
            <p className="text-[9px] text-[var(--text-muted)] font-medium leading-none hidden sm:block">
              Think Before You Transfer
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          <button
            onClick={() => onTabChange("analyzer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "analyzer"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>{t.nav.analyzer}</span>
          </button>

          <button
            onClick={() => onTabChange("assistant")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "assistant"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>{t.nav.assistant}</span>
          </button>

          <button
            onClick={() => onTabChange("registry")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "registry"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{language === "vi" ? "Sổ cái On-Chain" : "On-Chain Registry"}</span>
          </button>

          <button
            onClick={() => onTabChange("guide")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t.nav.guide}</span>
          </button>

          <button
            onClick={() => onTabChange("disclaimer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === "disclaimer"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            <span>{t.nav.disclaimer}</span>
          </button>
        </nav>

        {/* Actions (Demo, Language, Theme) */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Demo Button - hidden on mobile header since it is prominent on Hero & modal */}
          <button
            onClick={onDemoClick}
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 hover:from-amber-500/30 hover:to-orange-500/30 transition-all cursor-pointer shadow-sm shadow-amber-500/10 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span>{t.nav.demoButton}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-0.5 shrink-0">
            <button
              onClick={() => onLanguageChange("vi")}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                language === "vi"
                  ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              VIE
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                language === "en"
                  ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              ENG
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onThemeToggle}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 space-x-1.5 scrollbar-none">
        <button
          onClick={() => onTabChange("analyzer")}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === "analyzer"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {t.nav.analyzer}
        </button>
        <button
          onClick={() => onTabChange("assistant")}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === "assistant"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {t.nav.assistant}
        </button>
        <button
          onClick={() => onTabChange("registry")}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === "registry"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {language === "vi" ? "Sổ cái On-Chain" : "On-Chain Registry"}
        </button>
        <button
          onClick={() => onTabChange("guide")}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === "guide"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {t.nav.guide}
        </button>
        <button
          onClick={() => onTabChange("disclaimer")}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === "disclaimer"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {t.nav.disclaimer}
        </button>
      </div>
    </header>
  );
};
