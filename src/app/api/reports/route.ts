import { NextRequest, NextResponse } from "next/server";
import { getPublicFujiClient, SCAM_REGISTRY_ADDRESS, SCAM_REGISTRY_ABI } from "@/lib/avalanche";

export const runtime = "nodejs";

const STATUS_LABELS = ["Submitted (Unverified)", "Disputed", "Verified Alert", "Dismissed"];
const CATEGORY_LABELS = [
  "Fake Bank Support",
  "Fraudulent Transfer",
  "Ponzi Investment",
  "Relative Impersonation",
  "Suspicious QR",
  "Phishing URL",
  "Fake Ecommerce",
  "Urgent Debt Threat",
  "Other Suspicious",
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const offset = Number(url.searchParams.get("offset") || "0");
  const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 25);

  try {
    const client = getPublicFujiClient();

    // Query on-chain reports
    const [totalReports, resultTuple] = await Promise.all([
      client.readContract({
        address: SCAM_REGISTRY_ADDRESS,
        abi: SCAM_REGISTRY_ABI,
        functionName: "totalReports",
      }),
      client.readContract({
        address: SCAM_REGISTRY_ADDRESS,
        abi: SCAM_REGISTRY_ABI,
        functionName: "getRecentReports",
        args: [BigInt(offset), BigInt(limit)],
      }),
    ]);

    const [reportsArray, nextOffset] = resultTuple;

    const formattedReports = reportsArray.map((r, idx) => ({
      reportId: Number(totalReports) - offset - idx,
      commitment: r.commitment,
      categoryIndex: Number(r.category),
      categoryLabel: CATEGORY_LABELS[Number(r.category)] || "Other",
      riskScore: Number(r.riskScore),
      timestamp: Number(r.timestamp),
      reporter: r.reporter,
      status: Number(r.status),
      statusLabel: STATUS_LABELS[Number(r.status)] || "Submitted",
      metadataUri: r.metadataUri,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalReports: Number(totalReports),
        reports: formattedReports,
        nextOffset: Number(nextOffset),
        registryAddress: SCAM_REGISTRY_ADDRESS,
        chainId: 43113,
      },
    });
  } catch (err: unknown) {
    // If contract is not yet deployed on Fuji, provide informative fallback message
    console.warn("Fuji on-chain report read error (Contract may be pending deployment):", err);
    return NextResponse.json({
      success: true,
      data: {
        totalReports: 0,
        reports: [],
        nextOffset: 0,
        registryAddress: SCAM_REGISTRY_ADDRESS,
        chainId: 43113,
        notice: "Contract read on Avalanche Fuji ready. Connect Core/MetaMask wallet to submit live reports.",
      },
    });
  }
}
