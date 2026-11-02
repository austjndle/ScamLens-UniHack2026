import test from "node:test";
import assert from "node:assert/strict";

import { GET as getDemoScenarios } from "../src/app/api/demo-scenarios/route.ts";
import { POST as postAnalyze } from "../src/app/api/analyze/route.ts";
import { POST as postAssistant } from "../src/app/api/assistant/route.ts";

test("API: GET /api/demo-scenarios returns 6 validated scenarios", async () => {
  const response = await getDemoScenarios();
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.success, true);
  assert.equal(json.data.length, 6);
  assert.ok(json.data.some((s) => s.id === "fake_bank_sms"));
  assert.ok(json.data.some((s) => s.id === "benign_legitimate_bank_otp"));
});

test("API: POST /api/analyze handles text evaluation without API key via heuristics", async () => {
  const req = new Request("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "text",
      content:
        "[Vietcombank] Thong bao: Tai khoan cua Quy khach bi khoa. Vui long vao link https://vietcombank-xacthuc247.com trong vong 10 phut.",
      language: "vi",
    }),
  });

  const response = await postAnalyze(req);
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.success, true);
  assert.ok(json.data.risk_score >= 80);
  assert.ok(json.data.risk_level === "CRITICAL" || json.data.risk_level === "HIGH");
  assert.ok(json.data.indicators.length >= 1);
});

test("API: POST /api/analyze rejects SSRF attempt with 403", async () => {
  const req = new Request("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "url",
      url: "http://127.0.0.1:8000/internal-api",
      language: "en",
    }),
  });

  const response = await postAnalyze(req);
  assert.equal(response.status, 403);

  const json = await response.json();
  assert.equal(json.success, false);
  assert.equal(json.error.code, "SSRF_FORBIDDEN");
});

test("API: POST /api/assistant provides safe fraud defense guidance", async () => {
  const req = new Request("http://localhost:3000/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Có người xưng nhân viên ngân hàng bảo tôi đọc mã OTP để nhận tiền thưởng?",
        },
      ],
      language: "vi",
    }),
  });

  const response = await postAssistant(req);
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.success, true);
  assert.ok(json.data.reply.includes("KHÔNG") || json.data.reply.includes("lừa đảo"));
});
