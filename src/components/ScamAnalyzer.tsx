"use client";

import React, { useState, useRef } from "react";
import { MessageSquareText, Image as ImageIcon, Link2, Sparkles, Loader2, AlertCircle, Upload, Check } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/i18n";
import { AnalysisResult } from "@/types/analysis";
import { DEMO_SCENARIOS, DemoScenarioItem } from "@/data/demo-scenarios";

interface ScamAnalyzerProps {
  language: Language;
  onAnalysisComplete: (result: AnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
}

export const ScamAnalyzer: React.FC<ScamAnalyzerProps> = ({
  language,
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<"text" | "image" | "url">("text");

  // Form states
  const [textContent, setTextContent] = useState("");
  const [urlContent, setUrlContent] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset loader
  const handleSelectPreset = (scenario: DemoScenarioItem) => {
    setErrorMessage(null);
    if (scenario.type === "text") {
      setActiveTab("text");
      setTextContent(scenario.sampleInput);
    } else if (scenario.type === "url") {
      setActiveTab("url");
      setUrlContent(scenario.sampleInput);
    } else {
      setActiveTab("text");
      setTextContent(scenario.sampleInput);
    }
  };

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setErrorMessage(
        language === "vi"
          ? "Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh PNG, JPEG hoặc WebP."
          : "Unsupported format. Please select a PNG, JPEG, or WebP image."
      );
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      setErrorMessage(
        language === "vi"
          ? "Kích thước ảnh quá lớn (vượt quá 7MB). Vui lòng nén nhỏ hơn."
          : "File size exceeds 7MB limit. Please compress before uploading."
      );
      return;
    }

    setImageFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Strip metadata data:...;base64,
      const base64Part = result.split(",")[1];
      setSelectedImageBase64(base64Part);
      setSelectedImageMime(file.type as "image/png" | "image/jpeg" | "image/webp");
    };
    reader.readAsDataURL(file);
  };

  // Execute Analysis API Call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let payload: Record<string, unknown> = {};

    if (activeTab === "text") {
      if (textContent.trim().length < 5) {
        setErrorMessage(
          language === "vi"
            ? "Vui lòng nhập nội dung tin nhắn ít nhất 5 ký tự."
            : "Please enter at least 5 characters to analyze."
        );
        return;
      }
      payload = { type: "text", content: textContent.trim(), language };
    } else if (activeTab === "url") {
      if (!urlContent.trim().startsWith("http://") && !urlContent.trim().startsWith("https://")) {
        setErrorMessage(
          language === "vi"
            ? "Đường dẫn không hợp lệ. Vui lòng bắt đầu bằng http:// hoặc https://"
            : "Invalid link format. URL must start with http:// or https://"
        );
        return;
      }
      payload = { type: "url", url: urlContent.trim(), language };
    } else if (activeTab === "image") {
      if (!selectedImageBase64) {
        setErrorMessage(
          language === "vi"
            ? "Vui lòng tải lên ảnh chụp màn hình cần quét."
            : "Please upload a screenshot before analyzing."
        );
        return;
      }
      payload = {
        type: "image",
        image_base64: selectedImageBase64,
        mime_type: selectedImageMime,
        language,
      };
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Analysis request failed");
      }

      onAnalysisComplete(data.data as AnalysisResult);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Error connecting to analysis engine."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="analyzer-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">
          {t.analyzer.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
          {t.analyzer.subtitle}
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Input Format Selector Tabs */}
        <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--border-subtle)] mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span>{t.analyzer.tabText}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("image");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "image"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t.analyzer.tabImage}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("url");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "url"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>{t.analyzer.tabUrl}</span>
          </button>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TEXT TAB */}
          {activeTab === "text" && (
            <div>
              <label htmlFor="text-input" className="sr-only">
                {t.analyzer.tabText}
              </label>
              <textarea
                id="text-input"
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={t.analyzer.textPlaceholder}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all resize-y"
              />
              <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mt-1.5 px-1">
                <span>{language === "vi" ? "Bảo mật: Không chia sẻ mật khẩu thực tế" : "Privacy note: Never share live credentials"}</span>
                <span>{textContent.length} / 5000</span>
              </div>
            </div>
          )}

          {/* URL TAB */}
          {activeTab === "url" && (
            <div>
              <label htmlFor="url-input" className="sr-only">
                {t.analyzer.tabUrl}
              </label>
              <div className="relative">
                <input
                  id="url-input"
                  type="text"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  placeholder={t.analyzer.urlPlaceholder}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] pl-11 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                />
                <Link2 className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 px-1">
                {language === "vi"
                  ? "🛡️ Zero-Request Inspection: Hệ thống phân tích tĩnh cấu trúc tên miền, tuyệt đối không kích hoạt tải tệp để phòng tránh virus."
                  : "🛡️ Zero-Request Inspection: Inspects domain structure statically without downloading remote payloads to safeguard your device."}
              </p>
            </div>
          )}

          {/* IMAGE / SCREENSHOT TAB */}
          {activeTab === "image" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-file-input"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-subtle)] hover:border-cyan-500/50 bg-[var(--bg-secondary)]/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-cyan-500/5 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {imageFileName ? (
                      <span className="text-emerald-400 flex items-center justify-center space-x-1.5">
                        <Check className="w-4 h-4" />
                        <span>{imageFileName}</span>
                      </span>
                    ) : (
                      t.analyzer.imageDropzone
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t.analyzer.imageHint}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{t.analyzer.btnAnalyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{t.analyzer.btnAnalyze}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Pre-loaded Scenario Quick-Picker */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            {t.analyzer.preloadedExamples}
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelectPreset(scenario)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left flex items-center space-x-1.5 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{scenario.title[language]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
