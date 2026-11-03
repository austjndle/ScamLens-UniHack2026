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
  SCAM_REGISTRY_CONFIGURED,
  getExplorerTxUrl,
  getPublicFujiClient,
} from "@/lib/avalanche";
import { createWalletClient, custom, isAddress, type Address, type Hex, type EIP1193Provider } from "viem";
type InjectedProvider = EIP1193Provider & {
  isMetaMask?: boolean;
  providers?: InjectedProvider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

interface EthereumWindow {
  ethereum?: InjectedProvider;
}

function getInjectedProvider(): InjectedProvider | undefined {
  const ethereumWindow = window as unknown as EthereumWindow;
  const ethereum = ethereumWindow.ethereum;
  return ethereum?.providers?.find((provider) => provider.isMetaMask) ?? ethereum;
}

async function switchToFuji(provider: InjectedProvider): Promise<void> {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa869" }],
    });
  } catch (switchError: unknown) {
    if ((switchError as { code?: number }).code !== 4902) {
      throw switchError;
    }

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
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa869" }],
    });
  }

  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId !== "0xa869") {
    throw new Error("Wallet is not connected to Avalanche Fuji Testnet.");
  }
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
  const [isSandboxTx, setIsSandboxTx] = useState(false);
  const [salt, setSalt] = useState<Hex | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSalt, setCopiedSalt] = useState(false);

  const handleConnectWallet = async () => {
    setErrorMsg(null);
    const provider = typeof window === "undefined" ? undefined : getInjectedProvider();
    if (!provider) {
      const demoAccount = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address;
      setWalletAddress(demoAccount);
      setErrorMsg(
        language === "vi"
          ? "ℹ️ Không tìm thấy Core/MetaMask. Đang dùng Sandbox Mode để xem quy trình demo."
          : "ℹ️ No Core/MetaMask provider found. Sandbox Mode is enabled for this demo."
      );
      return;
    }

    setIsConnecting(true);
    try {
      const result = await provider.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(result) || typeof result[0] !== "string" || !isAddress(result[0])) {
        throw new Error("No authorized wallet account.");
      }

      await switchToFuji(provider);

      const activeAccounts = await provider.request({ method: "eth_accounts" });
      if (!Array.isArray(activeAccounts) || typeof activeAccounts[0] !== "string" || !isAddress(activeAccounts[0])) {
        throw new Error("No authorized wallet account after switching networks.");
      }

      setWalletAddress(activeAccounts[0]);
    } catch {
      setErrorMsg(
        language === "vi"
          ? "Không thể kết nối tài khoản MetaMask trên Avalanche Fuji. Hãy cấp quyền cho website và chọn đúng mạng Fuji."
          : "MetaMask could not authorize this site on Avalanche Fuji. Allow the site and select Fuji Testnet."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Submit salted commitment on-chain
  const handleSubmitOnChain = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const generatedSalt = generateRandomSalt();
      setSalt(generatedSalt);

      const provider = typeof window === "undefined" ? undefined : getInjectedProvider();
      if (!provider) {
        const demoAccount = walletAddress ?? ("0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address);
        const contentHash = hashSanitizedContent(result.summary + result.scam_category);
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 1000);
        await promise;
        const mockHash = `0x7a8b9c${Math.random().toString(16).slice(2, 10)}f4e3d2c1b0a9876543210123456789abcdef0123456789abcdef01` as Hex;
        setIsSandboxTx(true);
        setTxHash(mockHash);
        return;
      }
      const requestedAccounts = await provider.request({ method: "eth_requestAccounts" });
      if (
        !Array.isArray(requestedAccounts) ||
        typeof requestedAccounts[0] !== "string" ||
        !isAddress(requestedAccounts[0])
      ) {
        throw new Error("No authorized wallet account.");
      }
      await switchToFuji(provider);

      const authorizedAccounts = await provider.request({ method: "eth_accounts" });
      if (
        !Array.isArray(authorizedAccounts) ||
        typeof authorizedAccounts[0] !== "string" ||
        !isAddress(authorizedAccounts[0])
      ) {
        throw new Error("No authorized wallet account after switching networks.");
      }

      const activeAccount = authorizedAccounts[0];
      setWalletAddress(activeAccount);
      const contentHash = hashSanitizedContent(result.summary + result.scam_category);
      const computedCommitment = computeReportCommitment(contentHash, generatedSalt, activeAccount);

      if (!SCAM_REGISTRY_CONFIGURED) {
        throw new Error("The ScamReportRegistry address is not configured for production.");
      }

      const bytecode = await getPublicFujiClient().getBytecode({ address: SCAM_REGISTRY_ADDRESS });
      if (!bytecode || bytecode === "0x") {
        throw new Error("The ScamReportRegistry contract is not deployed on Avalanche Fuji.");
      }

      const walletClient = createWalletClient({
        account: activeAccount,
        chain: avalancheFuji,
        transport: custom(provider),
      });
      const hash = await walletClient.writeContract({
        address: SCAM_REGISTRY_ADDRESS,
        abi: SCAM_REGISTRY_ABI,
        functionName: "submitReport",
        args: [
          computedCommitment,
          mapCategoryToContractEnum(result.scam_category),
          result.risk_score,
          "ipfs://scamlens-redacted-alert",
        ],
      });

      setIsSandboxTx(false);
      setTxHash(hash);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("user rejected") || message.includes("rejected")) {
        setErrorMsg(
          language === "vi"
            ? "Bạn đã từ chối ký giao dịch trên MetaMask."
            : "Transaction signature was rejected in MetaMask."
        );
      } else if (message.includes("not been authorized") || message.includes("authorized")) {
        setErrorMsg(
          language === "vi"
            ? "MetaMask chưa cấp quyền cho tài khoản này. Hãy bấm Kết nối ví lại và cho phép website truy cập tài khoản."
            : "MetaMask has not authorized this account. Reconnect the wallet and allow this website to access it."
        );
      } else if (message.includes("insufficient funds") || message.includes("gas")) {
        setErrorMsg(
          language === "vi"
            ? "Ví chưa có đủ AVAX Fuji để trả phí gas."
            : "The wallet does not have enough Fuji AVAX for gas."
        );
      } else if (message.includes("not deployed")) {
        setErrorMsg(
          language === "vi"
            ? "Hợp đồng ScamReportRegistry chưa được deploy trên Avalanche Fuji. Cần deploy contract trước khi ghi nhận báo cáo."
            : "ScamReportRegistry is not deployed on Avalanche Fuji yet."
        );
      } else {
        setErrorMsg(
          language === "vi"
            ? "Không thể gửi giao dịch lên Avalanche Fuji. Hãy kiểm tra mạng và thử lại."
            : "Could not submit the transaction to Avalanche Fuji. Check the network and try again."
        );
      }
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
            <span className="font-bold flex items-center space-x-2">
              <span>
               {language === "vi"
                 ? "Giao dịch đã được ghi nhận trên Avalanche Fuji!"
                 : "Report commitment confirmed on Avalanche Fuji!"}
              </span>
              {isSandboxTx && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide">
                  {language === "vi" ? "Chế độ Thử Nghiệm Sandbox" : "Sandbox Simulation"}
                </span>
              )}
             </span>
           </div>
 
           <div className="font-mono text-xs break-all bg-black/30 p-2.5 rounded-lg border border-emerald-500/20">
             <span>TX Hash: </span>
            {isSandboxTx ? (
              <span className="text-cyan-300/80 inline-flex items-center space-x-1 cursor-default">
                <span>{txHash}</span>
                <span className="ml-1 text-[11px] text-amber-300/90 font-sans italic">
                  {language === "vi"
                    ? "(Mô phỏng cục bộ - chưa cài Core/MetaMask nên chưa broadcast lên explorer)"
                    : "(Local preview - install Core/MetaMask to broadcast to Snowtrace)"}
                </span>
              </span>
            ) : (
             <a
               href={getExplorerTxUrl(txHash)}
               target="_blank"
               rel="noopener noreferrer"
               className="text-cyan-300 hover:underline inline-flex items-center space-x-1"
             >
               <span>{txHash}</span>
               <ExternalLink className="w-3.5 h-3.5 ml-1" />
             </a>
            )}
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
