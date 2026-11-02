import test from "node:test";
import assert from "node:assert/strict";

import {
  AnalysisResultSchema,
  AnalyzeRequestSchema,
  AssistantRequestSchema,
} from "../src/types/analysis.ts";

import { heuristicScanText, inspectUrlHeuristics } from "../src/lib/heuristics.ts";
import { checkRateLimit } from "../src/lib/rate-limiter.ts";
import { DEMO_SCENARIOS } from "../src/data/demo-scenarios.ts";

test("AnalysisResultSchema validates all 6 preset demo scenarios strictly", () => {
  assert.equal(DEMO_SCENARIOS.length, 6, "Expected 6 demo scenarios");

  for (const scenario of DEMO_SCENARIOS) {
    const parsed = AnalysisResultSchema.safeParse(scenario.analysis);
    assert.equal(
      parsed.success,
      true,
      `Scenario ${scenario.id} failed schema validation: ${JSON.stringify(
        parsed.error?.errors
      )}`
    );
    assert.ok(scenario.analysis.risk_score >= 0 && scenario.analysis.risk_score <= 100);
    assert.ok(scenario.analysis.recommended_actions.length >= 1);
  }
});

test("AnalyzeRequestSchema rejects invalid input shapes", () => {
  // Too short text
  const shortText = AnalyzeRequestSchema.safeParse({ type: "text", content: "ab" });
  assert.equal(shortText.success, false, "Should reject text shorter than 3 chars");

  // Invalid URL
  const badUrl = AnalyzeRequestSchema.safeParse({ type: "url", url: "not-a-valid-url" });
  assert.equal(badUrl.success, false, "Should reject invalid URL format");

  // Unsupported image MIME
  const badMime = AnalyzeRequestSchema.safeParse({
    type: "image",
    image_base64: "a".repeat(200),
    mime_type: "image/gif",
  });
  assert.equal(badMime.success, false, "Should reject GIF images");

  // Valid text
  const validText = AnalyzeRequestSchema.safeParse({
    type: "text",
    content: "Bạn đã bị khóa tài khoản ngân hàng. Bấm vào đây để mở khóa.",
  });
  assert.equal(validText.success, true);
});

test("SSRF Protection: inspectUrlHeuristics blocks loopback and private IP hosts", () => {
  const privateUrls = [
    "http://127.0.0.1:8080/admin",
    "http://localhost:3000",
    "https://192.168.1.1/setup",
    "http://10.0.0.1/status",
    "http://internal-service.local/api",
  ];

  for (const url of privateUrls) {
    assert.throws(
      () => inspectUrlHeuristics(url),
      /SSRF_RESTRICTED_HOST/,
      `Failed to block private host: ${url}`
    );
  }
});

test("Heuristic Scanner correctly flags high-risk phishing URL (.apk and lookalike)", () => {
  const phishingUrl = "https://dichvucong-gov-vneid.app/cap-nhat-dinh-danh.apk";
  const result = inspectUrlHeuristics(phishingUrl, "vi");

  assert.equal(result.risk_level, "CRITICAL");
  assert.ok(result.risk_score >= 85, `Expected score >= 85, got ${result.risk_score}`);
  assert.equal(result.scam_category, "phishing_url");
  assert.ok(result.indicators.some((i) => i.type === "lookalike_domain"));
});

test("Heuristic Scanner distinguishes benign banking OTP from fake bank urgent SMS", () => {
  // Benign message
  const benignSms =
    "[Techcombank] Ma OTP cua quy khach la 839201 de xac nhan giao dich chuyen khoan 2,500,000 VND den NGUYEN VAN B. KHONG chia se ma nay cho bat ky ai.";
  const benignResult = heuristicScanText(benignSms, "vi");
  assert.equal(benignResult.risk_level, "LOW");
  assert.ok(benignResult.risk_score <= 25, `Benign score was ${benignResult.risk_score}`);

  // Scam message with urgency and phishing link
  const scamSms =
    "[Vietcombank] Thong bao: Tai khoan cua Quy khach bi khoa do nghi van giao dich bat thuong. Vui long truy cap https://vietcombank-xacthuc247.com/verify trong vong 10 phut, neu khong tai khoan se bi dong vinh vien.";
  const scamResult = heuristicScanText(scamSms, "vi");
  assert.ok(
    scamResult.risk_level === "CRITICAL" || scamResult.risk_level === "HIGH",
    `Scam was rated ${scamResult.risk_level}`
  );
  assert.ok(scamResult.risk_score >= 80, `Scam score was ${scamResult.risk_score}`);
});

test("Rate limiter enforces token bucket limits and returns retry after", () => {
  const testId = "test-client-unique-" + Date.now();
  const options = { limit: 3, windowMs: 1000 };

  // First 3 requests allowed
  assert.equal(checkRateLimit(testId, options).allowed, true);
  assert.equal(checkRateLimit(testId, options).allowed, true);
  assert.equal(checkRateLimit(testId, options).allowed, true);

  // 4th request blocked
  const blocked = checkRateLimit(testId, options);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.resetInMs > 0);
});

test("AssistantRequestSchema validates conversation history constraints", () => {
  // Empty messages array rejected
  const empty = AssistantRequestSchema.safeParse({ messages: [] });
  assert.equal(empty.success, false);

  // Valid conversation
  const valid = AssistantRequestSchema.safeParse({
    messages: [
      { role: "user", content: "Someone asked for my bank OTP code." },
      { role: "assistant", content: "Never share your OTP with anyone." },
    ],
    language: "en",
  });
  assert.equal(valid.success, true);
});
