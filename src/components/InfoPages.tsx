"use client";

import React from "react";
import { KeyRound, PhoneCall, Globe2, TrendingUp, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/i18n";

interface GuideProps {
  language: Language;
}

export const ScamGuide: React.FC<GuideProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const rules = [
    {
      icon: KeyRound,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      title: t.guide.rule1Title,
      desc: t.guide.rule1Desc,
    },
    {
      icon: PhoneCall,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      title: t.guide.rule2Title,
      desc: t.guide.rule2Desc,
    },
    {
      icon: Globe2,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      title: t.guide.rule3Title,
      desc: t.guide.rule3Desc,
    },
    {
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: t.guide.rule4Title,
      desc: t.guide.rule4Desc,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
          {t.guide.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
          {t.guide.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${rule.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  {rule.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {rule.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === "vi" ? "Đã được kiểm chứng bởi chuyên gia an ninh mạng" : "Cybersecurity Verified Principle"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC<GuideProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-[var(--border-subtle)] space-y-6">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {t.disclaimer.title}
        </h2>

        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          {t.disclaimer.notice}
        </p>

        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-2">
          <p className="font-bold text-[var(--text-primary)]">
            {language === "vi" ? "Chính sách quyền riêng tư dữ liệu (Zero Data Persistence):" : "Data Privacy Commitment:"}
          </p>
          <p>
            {language === "vi"
              ? "• Không lưu trữ nội dung tin nhắn, số tài khoản hay họ tên người dùng trên cơ sở dữ liệu máy chủ."
              : "• We do not persistently store messages, account numbers, or user PII on backend databases."}
          </p>
          <p>
            {language === "vi"
              ? "• Hình ảnh tải lên được xử lý tạm thời trong bộ nhớ RAM và tự động xóa sau khi phân tích."
              : "• Uploaded screenshots are processed ephemerally in RAM and wiped post-inspection."}
          </p>
          <p>
            {language === "vi"
              ? "• Đường link URL chỉ được kiểm tra cấu trúc tên miền tĩnh, không tải file thực thi về thiết bị."
              : "• Submitted URLs are inspected statically without triggering malicious payload downloads."}
          </p>
        </div>
      </div>
    </div>
  );
};
