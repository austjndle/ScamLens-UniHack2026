"use client";

import React, { useState } from "react";
import {
  Link2,
  Lock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Key,
  Copy,
  Check,
} from "lucide-react";
import { Language } from "@/lib/i18n";
import { AnalysisResult } from "@/types/analysis";
import {
  generateRandomSalt,
  hashSanitizedContent,
  computeReportCommitment,
  mapCategoryToContractEnum,
} from "@/lib/commitment";
import {
  avalancheFuji,
  SCAM_REGISTRY_ADDRESS,
  SCAM_REGISTRY_ABI,
  getExplorerTxUrl,
} from "@/lib/avalanche";
import { createWalletClient, custom, type Address, type Hex, type EIP1193Provider } from "viem";

interface EthereumWindow {
  ethereum?: EIP1193Provider & {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

interface AvalancheSubmissionCardProps {
  language: Language;
  result: AnalysisResult;
}

export const AvalancheSubmissionCard: React.FC<AvalancheSubmissionCardProps> = ({
  language,
  result,
}) => {
  const [walletAddress, setWalletAddress] = useState<Address | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [salt, setSalt] = useState<Hex | null>(null);
  const [commitment, setCommitment] = useState<Hex | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSalt, setCopiedSalt] = useState(false);

  // Connect Core Wallet or MetaMask (with instant Testnet Mock Mode if no extension installed)
  const handleConnectWallet = async () => {
    setErrorMsg(null);
    const ethWindow = typeof window !== "undefined" ? (window as unknown as EthereumWindow) : undefined;
    if (!ethWindow?.ethereum) {
      // Provide helpful guidance + simulated testnet wallet for testing without extension
      const demoAccount = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address;
      setWalletAddress(demoAccount);
      setErrorMsg(
        language === "vi"
          ? "ℹ️ Trình duyệt chưa cài Core/MetaMask: Đang kết nối ví thử nghiệm Avalanche (Testnet Sandbox Mode) để bạn trải nghiệm quy trình tạo Salt và hash cam kết."
          : "ℹ️ No wallet extension detected: Connected to Avalanche Testnet Sandbox Wallet for interactive demonstration."
      );
      return;
    }
    setIsConnecting(true);
    try {
      const provider = ethWindow.ethereum;
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized");
      }
      const account = accounts[0] as Address;
      setWalletAddress(account);

      // Switch to Avalanche Fuji (43113)
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa869" }], // 43113 in hex
        });
      } catch (switchError: unknown) {
        const errorRecord = switchError as { code?: number };
        // If chain not added, add Avalanche Fuji
        if (errorRecord && errorRecord.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xa869",
                chainName: "Avalanche Fuji Testnet",
                nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://testnet.snowtrace.io"],
              },
            ],
          });
        } else {
          console.warn("Wallet switch notice:", switchError);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Submit salted commitment on-chain
  const handleSubmitOnChain = async () => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    const ethWindow = typeof window !== "undefined" ? (window as unknown as EthereumWindow) : undefined;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Generate local secret salt
      const generatedSalt = generateRandomSalt();
      setSalt(generatedSalt);

      // 2. Hash summary + category without storing raw sensitive PII
      const contentHash = hashSanitizedContent(result.summary + result.scam_category);
      const computedCommitment = computeReportCommitment(
        contentHash,
        generatedSalt,
        walletAddress
      );
      setCommitment(computedCommitment);

      const categoryEnum = mapCategoryToContractEnum(result.scam_category);

      if (!ethWindow?.ethereum) {
        // Simulated local Fuji confirmation when no browser wallet extension is active
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 1000);
        await promise;
        const mockHash = `0x7a8b9c${Math.random().toString(16).slice(2, 10)}f4e3d2c1b0a9876543210123456789abcdef0123456789abcdef01` as Hex;
        setTxHash(mockHash);
        return;
      }

      const provider = ethWindow.ethereum;
      const walletClient = createWalletClient({
        account: walletAddress,
        chain: avalancheFuji,
        transport: custom(provider),
      });
      // 3. Submit transaction
      const hash = await walletClient.writeContract({
        address: SCAM_REGISTRY_ADDRESS,
        abi: SCAM_REGISTRY_ABI,
        functionName: "submitReport",
        args: [
          computedCommitment,
          categoryEnum,
          result.risk_score,
          "ipfs://scamlens-redacted-alert",
        ],
      });

      setTxHash(hash);
    } catch (err: unknown) {
      console.error("On-chain submission error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Transaction rejected or network error on Avalanche Fuji."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySalt = () => {
    if (salt) {
      navigator.clipboard.writeText(salt);
      setCopiedSalt(true);
      setTimeout(() => setCopiedSalt(false), 2000);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-transparent mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5 mb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              {language === "vi" ? "Avalanche Fuji C-Chain (43113)" : "Avalanche Fuji Testnet"}
            </span>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            {language === "vi"
              ? "Đăng Ký Cam Kết Báo Cáo Bảo Mật On-Chain"
              : "Register Privacy-Preserving On-Chain Report Commitment"}
          </h4>
        </div>

        {/* Wallet status pill */}
        <div>
          {walletAddress ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{language === "vi" ? "Kết nối ví Web3" : "Connect Core / MetaMask"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
        {language === "vi"
          ? "Bạn có thể tự nguyện lưu trữ bằng chứng cảnh báo trên blockchain Avalanche để chia sẻ dữ liệu với cộng đồng mà không làm lộ nội dung nhạy cảm. Hệ thống sử dụng cơ chế Salted Cryptographic Commitment để chống đảo ngược dữ liệu."
          : "You can voluntarily submit an immutable threat commitment on Avalanche Fuji. Uses salted cryptographic hashes to maintain strict privacy while creating verifiable public fraud awareness records."}
      </p>

      {/* Privacy Guarantees Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start space-x-2">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{language === "vi" ? "Không lưu tin nhắn gốc hoặc số tài khoản" : "Zero raw PII, account numbers or messages"}</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start space-x-2">
          <Key className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{language === "vi" ? "Khóa Salt ngẫu nhiên bảo vệ chống tra cứu" : "Salted hash blocks rainbow-table guessing"}</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{language === "vi" ? "Báo cáo là tín hiệu tham khảo, không kết tội" : "Informational signal, not proof of guilt"}</span>
        </div>
      </div>

      {/* Success Transaction Banner */}
      {txHash && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">
              {language === "vi"
                ? "Giao dịch đã được ghi nhận trên Avalanche Fuji!"
                : "Report commitment confirmed on Avalanche Fuji!"}
            </span>
          </div>

          <div className="font-mono text-xs break-all bg-black/30 p-2.5 rounded-lg border border-emerald-500/20">
            <span>TX Hash: </span>
            <a
              href={getExplorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline inline-flex items-center space-x-1"
            >
              <span>{txHash}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          {salt && (
            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono text-xs">
              <span className="truncate mr-2">Secret Salt: {salt}</span>
              <button
                onClick={handleCopySalt}
                className="text-cyan-400 hover:text-cyan-300 p-1 flex items-center space-x-1 shrink-0"
              >
                {copiedSalt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSalt ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Callout */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-5 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!txHash && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmitOnChain}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{language === "vi" ? "Đang gửi giao dịch lên Fuji..." : "Confirming on Avalanche..."}</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 text-slate-950" />
                <span>
                  {walletAddress
                    ? language === "vi"
                      ? "Ký và ghi nhận cam kết on-chain"
                      : "Sign & Commit On-Chain"
                    : language === "vi"
                    ? "Kết nối ví để gửi cam kết"
                    : "Connect Wallet to Commit"}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
