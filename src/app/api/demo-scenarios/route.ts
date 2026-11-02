import { NextResponse } from "next/server";
import { DEMO_SCENARIOS } from "@/data/demo-scenarios";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEMO_SCENARIOS,
    meta: {
      total: DEMO_SCENARIOS.length,
      categories: [
        "fake_bank_support",
        "relative_impersonation",
        "ponzi_investment",
        "phishing_url",
        "fake_ecommerce",
        "benign_financial",
      ],
    },
  });
}
