"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Filter,
  RefreshCw,
  Scale,
  KeyRound,
  ShieldCheck,
  Check,
  Copy,
} from "lucide-react";
import { Language } from "@/lib/i18n";
import {
  SCAM_REGISTRY_ADDRESS,
  getExplorerTxUrl,
  getExplorerAddressUrl,
} from "@/lib/avalanche";
import {
  hashSanitizedContent,
  computeReportCommitment,
} from "@/lib/commitment";
import type { Address, Hex } from "viem";

interface ReportItem {
  reportId: number;
  commitment: string;
  categoryIndex: number;
  categoryLabel: string;
  riskScore: number;
  timestamp: number;
  reporter: string;
  status: number;
  statusLabel: string;
  metadataUri: string;
}

interface CommunityRegistryProps {
  language: Language;
}

export const CommunityRegistry: React.FC<CommunityRegistryProps> = ({ language }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Zero-Knowledge Proof / Commitment Verifier state
  const [verifyReportId, setVerifyReportId] = useState("");
  const [verifyText, setVerifyText] = useState("");
  const [verifySalt, setVerifySalt] = useState("");
  const [verifyReporter, setVerifyReporter] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    computed: string;
    target: string;
    match: boolean;
  } | null>(null);

  // Fetch Reports from API
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports?limit=20");
      const json = await res.json();
      if (json.success && json.data) {
        setReports(json.data.reports || []);
        setTotalReports(json.data.totalReports || 0);
      }
    } catch (err) {
      console.warn("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Run local commitment calculation to prove message inclusion
  const handleVerifyCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyText || !verifySalt || !verifyReporter) return;

    try {
      const contentHash = hashSanitizedContent(verifyText);
      const computed = computeReportCommitment(
        contentHash,
        verifySalt as Hex,
        verifyReporter as Address
      );

      const targetReport = reports.find((r) => r.reportId === Number(verifyReportId));
      const targetCommitment = targetReport ? targetReport.commitment : computed;

      setVerifyResult({
        computed,
        target: targetCommitment,
        match: computed.toLowerCase() === targetCommitment.toLowerCase(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2: // Verified Alert
        return {
          bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          icon: ShieldCheck,
          label: language === "vi" ? "Đã Xác Minh" : "Verified Alert",
        };
      case 1: // Disputed
        return {
          bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          icon: Scale,
          label: language === "vi" ? "Đang Tranh Chấp" : "Disputed",
        };
      case 3: // Dismissed
        return {
          bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
          icon: AlertTriangle,
          label: language === "vi" ? "Bác Bỏ" : "Dismissed",
        };
      case 0: // Submitted (Unverified)
      default:
        return {
          bg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
          icon: Clock,
          label: language === "vi" ? "Chưa Xác Minh (Cộng đồng)" : "Unverified Report",
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>Avalanche Fuji Decentralized Threat Registry</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {language === "vi"
            ? "Sổ Cái Báo Cáo Lừa Đảo On-Chain"
            : "Community On-Chain Scam Report Ledger"}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          {language === "vi"
            ? "Mọi báo cáo đều được lưu trữ minh bạch dưới dạng Salted Cryptographic Commitment trên Avalanche C-Chain, bảo đảm tính toàn vẹn dữ liệu và tuyệt đối bảo vệ quyền riêng tư cá nhân."
            : "Immutable, privacy-preserving threat commitments anchored to Avalanche Fuji. Review unverified signals, dispute allegations, and verify commitments mathematically."}
        </p>

        {/* Contract Address Badge */}
        <div className="inline-flex items-center space-x-2 font-mono text-xs bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)]">
          <span>Contract: </span>
          <a
            href={getExplorerAddressUrl(SCAM_REGISTRY_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <span>
              {SCAM_REGISTRY_ADDRESS.slice(0, 10)}...{SCAM_REGISTRY_ADDRESS.slice(-8)}
            </span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs sm:text-sm text-amber-200 flex items-start space-x-3">
        <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="font-bold">
            {language === "vi" ? "Lưu ý quan trọng: " : "Legal Disclaimer: "}
          </strong>
          {language === "vi"
            ? "Dữ liệu on-chain là các báo cáo tín hiệu cảnh báo do cộng đồng tự nguyện gửi lên nhằm chia sẻ kinh nghiệm phòng chống tội phạm mạng. Báo cáo KHÔNG phải là phán quyết pháp lý hay chứng cứ xác thực tội phạm đối với bất kỳ cá nhân hay tổ chức nào."
            : "On-chain threat commitments reflect community-submitted signals intended for cybersecurity awareness. They DO NOT constitute legal proof of fraud or definitive criminal allegations."}
        </p>
      </div>

      {/* Interactive Mathematical Commitment Verifier */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <KeyRound className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {language === "vi"
              ? "Công Cụ Xác Minh Tính Toàn Vẹn Cam Kết (Proof of Commitment)"
              : "Cryptographic Commitment Verifier"}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
          {language === "vi"
            ? "Nếu bạn là người báo cáo hoặc người nắm giữ bằng chứng, nhập nội dung và mã Salt bí mật để kiểm chứng tính toán học trực tiếp trên trình duyệt mà không gửi văn bản lên mạng."
            : "Verify that a specific message or URL corresponds to an on-chain commitment using your local secret salt without disclosing the message to anyone."}
        </p>

        <form onSubmit={handleVerifyCommitment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {language === "vi" ? "Mã báo cáo ID (Tùy chọn)" : "Report ID (Optional)"}
              </label>
              <input
                type="number"
                value={verifyReportId}
                onChange={(e) => setVerifyReportId(e.target.value)}
                placeholder="VD: 1"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {language === "vi" ? "Địa chỉ ví người gửi (Reporter)" : "Reporter Wallet Address"}
              </label>
              <input
                type="text"
                value={verifyReporter}
                onChange={(e) => setVerifyReporter(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {language === "vi" ? "Mã Salt ngẫu nhiên bí mật" : "Secret 32-Byte Salt"}
              </label>
              <input
                type="text"
                value={verifySalt}
                onChange={(e) => setVerifySalt(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              {language === "vi" ? "Văn bản/Đoạn tóm tắt đã lưu" : "Sanitized Message Summary"}
            </label>
            <input
              type="text"
              value={verifyText}
              onChange={(e) => setVerifyText(e.target.value)}
              placeholder="VD: Tin nhắn mạo danh Vietcombank fake_bank_support"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === "vi" ? "Kiểm tra cam kết Keccak256" : "Compute & Verify Proof"}</span>
            </button>
          </div>
        </form>

        {verifyResult && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs space-y-2 ${
              verifyResult.match
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {verifyResult.match ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === "vi"
                      ? "Xác minh toán học THÀNH CÔNG: Cam kết trùng khớp hoàn toàn!"
                      : "Cryptographic Verification SUCCESS: Commitment Matches On-Chain!"}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    {language === "vi"
                      ? "Xác minh KHÔNG KHỚP: Dữ liệu văn bản hoặc Salt không chính xác."
                      : "Verification FAILED: Content or Salt mismatch."}
                  </span>
                </>
              )}
            </div>
            <p className="font-mono text-[11px] break-all">
              Computed Commitment: {verifyResult.computed}
            </p>
          </div>
        )}
      </div>

      {/* Community Reports Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {language === "vi" ? "Danh Sách Báo Cáo Đã Ghi Nhận" : "On-Chain Registry Feed"}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold font-mono">
              {totalReports} {language === "vi" ? "báo cáo" : "reports"}
            </span>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-cyan-400 transition-colors flex items-center space-x-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{language === "vi" ? "Làm mới" : "Refresh"}</span>
          </button>
        </div>

        {/* Reports Table / Card List */}
        {reports.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-cyan-400/50 mx-auto" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {language === "vi"
                ? "Chưa có báo cáo nào được ghi nhận trên Avalanche Fuji."
                : "No report commitments currently registered on Avalanche Fuji."}
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              {language === "vi"
                ? "Sau khi quét tin nhắn tại tab Phân Tích, bạn có thể là người đầu tiên kết nối ví và gửi cam kết bảo mật."
                : "Analyze a message in the Scam Analyzer tab and submit the first on-chain commitment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => {
              const statusBadge = getStatusBadge(report.status);
              const BadgeIcon = statusBadge.icon;

              return (
                <div
                  key={report.reportId}
                  className="glass-panel rounded-2xl p-5 border border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        #{report.reportId}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                        {report.categoryLabel}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border flex items-center space-x-1 font-semibold ${statusBadge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>

                    <div className="font-mono text-xs text-[var(--text-muted)] break-all">
                      <span>Commitment: </span>
                      <span className="text-[var(--text-secondary)]">{report.commitment}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5" />
                        <a
                          href={getExplorerAddressUrl(report.reporter)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 underline font-mono"
                        >
                          {report.reporter.slice(0, 6)}...{report.reporter.slice(-4)}
                        </a>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(report.timestamp * 1000).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Score & Explorer Link */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border-subtle)] shrink-0 gap-2">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                        AI Score
                      </span>
                      <span className="text-xl font-black text-rose-400">
                        {report.riskScore}/100
                      </span>
                    </div>

                    <a
                      href={getExplorerAddressUrl(SCAM_REGISTRY_ADDRESS)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 hover:underline"
                    >
                      <span>SnowTrace</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
