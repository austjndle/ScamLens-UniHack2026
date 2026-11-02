"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ScamAnalyzer } from "@/components/ScamAnalyzer";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { AssistantChat } from "@/components/AssistantChat";
import { CommunityRegistry } from "@/components/CommunityRegistry";
import { ScamGuide, DisclaimerPage } from "@/components/InfoPages";
import { Language, TRANSLATIONS } from "@/lib/i18n";
import { AnalysisResult } from "@/types/analysis";
import { DEMO_SCENARIOS, DemoScenarioItem } from "@/data/demo-scenarios";
import {
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("vi");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "home" | "analyzer" | "assistant" | "registry" | "guide" | "disclaimer"
  >("home");

  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  // Sync theme to root class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDark]);

  const t = TRANSLATIONS[language];

  const handleStartAnalyzing = () => {
    setActiveTab("analyzer");
    setTimeout(() => {
      document.getElementById("analyzer-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSelectDemoScenario = (scenario: DemoScenarioItem) => {
    setCurrentResult(scenario.analysis);
    setShowDemoModal(false);
    setActiveTab("analyzer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDemoClick={() => setShowDemoModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "home" && (
          <>
            <Hero
              language={language}
              onStartAnalyzing={handleStartAnalyzing}
              onOpenDemo={() => setShowDemoModal(true)}
            />

            {/* In-page Quick Analyzer */}
            <div className="py-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
              {currentResult ? (
                <ResultsDashboard
                  language={language}
                  result={currentResult}
                  onReset={() => setCurrentResult(null)}
                />
              ) : (
                <ScamAnalyzer
                  language={language}
                  onAnalysisComplete={(res) => setCurrentResult(res)}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
                />
              )}
            </div>

            {/* Bento Grid: Supported Scam Scenarios in Vietnam */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center mb-12">
                <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {language === "vi" ? "Bộ sưu tập kịch bản 2026" : "2026 Threat Vectors"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mt-3 mb-2">
                  {language === "vi"
                    ? "Nhận diện 6 Chiêu Trò Lừa Đảo Phổ Biến Nhất"
                    : "Detecting the 6 Most Critical Vietnamese Fraud Patterns"}
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
                  {language === "vi"
                    ? "Tích hợp sẵn bộ dữ liệu mẫu thực chiến để bạn thử nghiệm năng lực phân tích của ScamLens ngay tức thì."
                    : "Pre-indexed threat models demonstrating ScamLens AI reasoning on authentic scenarios."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEMO_SCENARIOS.map((scenario) => {
                  const isBenign = scenario.analysis.risk_level === "LOW";
                  return (
                    <div
                      key={scenario.id}
                      onClick={() => handleSelectDemoScenario(scenario)}
                      className={`glass-panel rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-lg group border ${
                        isBenign
                          ? "hover:border-emerald-500/40"
                          : "hover:border-cyan-500/40"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isBenign
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : scenario.analysis.risk_level === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {scenario.analysis.risk_level}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            {scenario.analysis.risk_score}/100
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">
                          {scenario.title[language]}
                        </h3>

                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                          {scenario.description[language]}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-cyan-400">
                        <span>{language === "vi" ? "Kiểm tra mẫu này" : "Inspect Scenario"}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === "analyzer" && (
          <div className="py-8">
            {currentResult ? (
              <ResultsDashboard
                language={language}
                result={currentResult}
                onReset={() => setCurrentResult(null)}
              />
            ) : (
              <ScamAnalyzer
                language={language}
                onAnalysisComplete={(res) => setCurrentResult(res)}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            )}
          </div>
        )}

        {activeTab === "assistant" && <AssistantChat language={language} />}
        {activeTab === "registry" && <CommunityRegistry language={language} />}
        {activeTab === "guide" && <ScamGuide language={language} />}
        {activeTab === "disclaimer" && <DisclaimerPage language={language} />}
      </main>

      {/* Demo Scenarios Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6 border border-cyan-500/30">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {language === "vi" ? "Chọn kịch bản kiểm thử mẫu" : "Select a Demo Scenario"}
                </h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {DEMO_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => handleSelectDemoScenario(scenario)}
                  className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-cyan-500/40 hover:bg-cyan-500/5 cursor-pointer transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-cyan-400">
                        [{scenario.type.toUpperCase()}]
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {scenario.title[language]}
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {scenario.description[language]}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                      scenario.analysis.risk_level === "LOW"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {scenario.analysis.risk_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-[var(--text-primary)]">ScamLens</span>
            <span>— UniHack HCMC 2026 Project (AI + Avalanche)</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("registry")}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {language === "vi" ? "Sổ cái On-Chain" : "On-Chain Registry"}
            </button>
            <button
              onClick={() => setActiveTab("disclaimer")}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {t.nav.disclaimer}
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {t.nav.guide}
            </button>
            <span>Google Gemini 3.8 Flash • Avalanche Fuji</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
