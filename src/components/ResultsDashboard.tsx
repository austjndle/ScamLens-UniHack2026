"use client";

import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/i18n";
import { AnalysisResult, RiskLevel } from "@/types/analysis";
import { AvalancheSubmissionCard } from "@/components/AvalancheSubmissionCard";

interface ResultsDashboardProps {
  language: Language;
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  language,
  result,
  onReset,
}) => {
  const t = TRANSLATIONS[language];

  // Severity styling helper
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return {
          bg: "bg-rose-500/15",
          border: "border-rose-500/40",
          text: "text-rose-400",
          badge: "bg-rose-500 text-white",
          glow: "glow-rose",
          label: language === "vi" ? "NGUY HIỂM TỐI KHẨN" : "CRITICAL THREAT",
        };
      case "HIGH":
        return {
          bg: "bg-amber-500/15",
          border: "border-amber-500/40",
          text: "text-amber-400",
          badge: "bg-amber-500 text-slate-950 font-bold",
          glow: "glow-rose",
          label: language === "vi" ? "RỦI RO CAO" : "HIGH RISK",
        };
      case "MODERATE":
        return {
          bg: "bg-yellow-500/15",
          border: "border-yellow-500/40",
          text: "text-yellow-400",
          badge: "bg-yellow-500 text-slate-950 font-bold",
          glow: "",
          label: language === "vi" ? "CẢNH BÁO TRUNG BÌNH" : "MODERATE RISK",
        };
      case "LOW":
      default:
        return {
          bg: "bg-emerald-500/15",
          border: "border-emerald-500/40",
          text: "text-emerald-400",
          badge: "bg-emerald-500 text-slate-950 font-bold",
          glow: "glow-cyan",
          label: language === "vi" ? "AN TOÀN / ÍT RỦI RO" : "LOW RISK",
        };
    }
  };

  const riskConfig = getRiskColor(result.risk_level);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.dashboard.newAnalysisBtn}</span>
        </button>

        {result.is_demo && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.dashboard.demoBadge}</span>
          </span>
        )}
      </div>

      {/* Hero Score Card */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border ${riskConfig.border} ${riskConfig.bg} backdrop-blur-xl mb-8 relative overflow-hidden transition-all`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${riskConfig.badge}`}>
                {riskConfig.label}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(result.analyzed_at).toLocaleTimeString()}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-tight">
              {result.summary}
            </h3>

            <p className="text-xs text-[var(--text-muted)] flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {language === "vi"
                  ? "Điểm số là chỉ báo cảnh báo sớm (Heuristic Index), không phải xác suất toán học."
                  : "Risk score is an algorithmic heuristic index, not a legal guarantee."}
              </span>
            </p>
          </div>

          {/* Radial score badge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shrink-0 w-32 h-32">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--text-muted)]">
              {t.dashboard.riskScore}
            </span>
            <span className={`text-4xl font-black ${riskConfig.text} tracking-tight`}>
              {result.risk_score}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="space-y-6">
        {/* Identified Red Flag Indicators */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>{t.dashboard.indicatorsTitle} ({result.indicators.length})</span>
          </h4>

          <div className="space-y-3">
            {result.indicators.map((ind, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ind.severity === "critical"
                          ? "bg-rose-400"
                          : ind.severity === "warning"
                          ? "bg-amber-400"
                          : "bg-cyan-400"
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {ind.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {ind.description}
                  </p>
                  {ind.evidence && (
                    <p className="text-xs text-[var(--text-muted)] font-mono bg-black/20 p-1.5 rounded border border-white/5 inline-block">
                      &quot;{ind.evidence}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Detailed Explanation */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>{t.dashboard.explanationTitle}</span>
          </h4>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {result.detailed_explanation}
          </p>
        </div>

        {/* Recommended Actions */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{t.dashboard.recommendedActionsTitle}</span>
          </h4>
          <ul className="space-y-2.5">
            {result.recommended_actions.map((act, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-sm text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Independent Verification Steps */}
        {result.suggested_verification_steps?.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8">
            <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-cyan-400" />
              <span>{t.dashboard.verificationStepsTitle}</span>
            </h4>
            <ul className="space-y-2">
              {result.suggested_verification_steps.map((step, idx) => (
                <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start space-x-2">
                  <span className="font-bold text-cyan-400 text-xs mt-0.5">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Limitations Notice */}
        {result.limitations?.length > 0 && (
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 text-xs text-[var(--text-muted)] space-y-1">
            <span className="font-bold uppercase tracking-wider block text-[var(--text-secondary)]">
              {t.dashboard.limitationsTitle}:
            </span>
            {result.limitations.map((lim, idx) => (
              <p key={idx}>• {lim}</p>
            ))}
          </div>
        )}

        {/* Avalanche Blockchain Verification & Commitment Card */}
        <AvalancheSubmissionCard language={language} result={result} />
      </div>
    </div>
  );
};
