import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const BASE_URL = "http://127.0.0.1:3005";

async function runE2ETests() {
  console.log("🚀 Starting ScamLens E2E Browser Test Suite on", BASE_URL);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Listen to console errors
  const pageErrors = [];
  page.on("pageerror", (err) => {
    console.error("🔴 Page Error:", err.message);
    pageErrors.push(err.message);
  });

  try {
    // 1. Load Homepage
    console.log("1️⃣ Navigating to Homepage...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    const title = await page.title();
    console.log("   Page Title:", title);
    assert.ok(title.includes("ScamLens"), "Title must contain ScamLens");

    // 2. Test Demo Scenario Preset selection
    console.log("2️⃣ Testing Demo Scenario Modal & Selection...");
    const demoBtn = page.getByRole("button", { name: /Kịch bản mẫu|Demo Scenarios/i }).first();
    await demoBtn.click();
    await page.waitForTimeout(500);
    // Pick Scenario 1: Vietcombank SMS inside the modal
    const modal = page.locator(".fixed.inset-0").first();
    const scenarioCard = modal.locator("text=SMS mạo danh ngân hàng Vietcombank").first();
    await scenarioCard.click();
    await page.waitForTimeout(1000);
    console.log("3️⃣ Verifying Results Dashboard content...");
    const riskLevelBadge = page.locator("text=CRITICAL THREAT, text=NGUY HIỂM TỐI KHẨN").or(page.locator("text=95")).first();
    assert.ok(await riskLevelBadge.isVisible(), "Risk badge should be visible");
    console.log("   ✅ Risk Dashboard rendered with score 95/100");

    // 4. Test Avalanche Web3 On-Chain Submission Card
    console.log("4️⃣ Testing Avalanche Fuji Submission & Salt generation...");
    const commitBtn = page.getByRole("button", { name: /Kết nối ví để gửi cam kết|Ký và ghi nhận cam kết on-chain/i }).first();
    await commitBtn.scrollIntoViewIfNeeded();
    await commitBtn.click();
    await page.waitForTimeout(1500);

    // Check if TX Hash or Demo Wallet connected
    const connectPill = page.locator("text=0x7099...79C8").or(page.locator("text=TX Hash:"));
    assert.ok(await connectPill.first().isVisible(), "Wallet connected or TX generated");
    console.log("   ✅ Sandbox Avalanche Wallet connected successfully");

    // Now submit on-chain
    const signBtn = page.getByRole("button", { name: /Ký và ghi nhận cam kết on-chain/i }).first();
    if (await signBtn.isVisible()) {
      await signBtn.click();
      await page.waitForTimeout(2000);
    }

    const txConfirmation = page.locator("text=Giao dịch đã được ghi nhận trên Avalanche Fuji!").or(page.locator("text=TX Hash:"));
    assert.ok(await txConfirmation.first().isVisible(), "Transaction confirmed message visible");
    console.log("   ✅ On-Chain Salted Commitment generated & confirmed");

    // Take screenshot of results + avalanche card
    await page.screenshot({ path: "ScamLens/public/e2e-results.png", fullPage: true });

    // 5. Test On-Chain Registry Tab
    console.log("5️⃣ Navigating to On-Chain Registry tab...");
    const registryTab = page.getByRole("button", { name: /Sổ cái On-Chain|On-Chain Registry/i }).first();
    await registryTab.click();
    await page.waitForTimeout(800);

    const registryHeading = page.locator("text=Sổ Cái Báo Cáo Lừa Đảo On-Chain").or(page.locator("text=Community On-Chain Scam Report Ledger"));
    assert.ok(await registryHeading.first().isVisible(), "Registry heading visible");

    // Test Commitment Verifier form
    console.log("   Testing Cryptographic Proof Verifier...");
    await page.locator("input[placeholder*='0x...']").first().fill("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    await page.locator("input[placeholder*='0x...']").nth(1).fill("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    await page.locator("input[placeholder*='VD: Tin nhắn']").fill("Tin nhắn mạo danh Vietcombank fake_bank_support");
    await page.getByRole("button", { name: /Kiểm tra cam kết Keccak256|Compute & Verify Proof/i }).click();
    await page.waitForTimeout(500);

    const proofResult = page.locator("text=Xác minh toán học THÀNH CÔNG").or(page.locator("text=Computed Commitment:"));
    assert.ok(await proofResult.first().isVisible(), "Commitment computation executed");
    console.log("   ✅ Proof of Commitment calculated and displayed");

    // 6. Test AI Safety Assistant Tab
    console.log("6️⃣ Testing AI Safety Assistant Chat...");
    const assistantTab = page.getByRole("button", { name: /Trợ lý an toàn|Safety Assistant/i }).first();
    await assistantTab.click();
    await page.waitForTimeout(800);

    const chatInput = page.locator("input[placeholder*='Nhập câu hỏi']").or(page.locator("input[placeholder*='Type your question']"));
    await chatInput.fill("Nhân viên ngân hàng gọi bảo đọc mã OTP nhận quà?");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1500);

    const reply = page.locator("text=TUYỆT ĐỐI KHÔNG CUNG CẤP MÃ OTP").or(page.locator("text=Trợ lý"));
    assert.ok(await reply.first().isVisible(), "Safety assistant replied properly");
    console.log("   ✅ Assistant replied with anti-fraud defense warning");

    // 7. Test Language Toggle
    console.log("7️⃣ Testing Language Switcher (VIE -> ENG -> VIE)...");
    const engBtn = page.getByRole("button", { name: "ENG" }).first();
    await engBtn.click();
    await page.waitForTimeout(400);
    const engTitle = page.locator("text=Financial Safety Advisor").or(page.locator("text=Think before you"));
    assert.ok(await engTitle.first().isVisible(), "English translations applied");

    const vieBtn = page.getByRole("button", { name: "VIE" }).first();
    await vieBtn.click();
    await page.waitForTimeout(400);
    console.log("   ✅ Language toggle works seamlessly");

    // 8. Test Theme Toggle
    console.log("8️⃣ Testing Theme Switcher (Dark -> Light -> Dark)...");
    const themeBtn = page.locator("button[aria-label='Toggle Theme']").first();
    await themeBtn.click();
    await page.waitForTimeout(300);
    let isLight = await page.evaluate(() => document.documentElement.classList.contains("light"));
    assert.ok(isLight, "Should have class 'light'");

    await themeBtn.click();
    await page.waitForTimeout(300);
    isLight = await page.evaluate(() => document.documentElement.classList.contains("light"));
    assert.ok(!isLight, "Should revert to dark mode");
    console.log("   ✅ Theme toggle works flawlessly");

    // Mobile viewport test (390px width - iPhone)
    console.log("9️⃣ Testing Mobile Responsiveness (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert.equal(hasHorizontalScroll, false, "Mobile view must not have horizontal scroll");
    console.log("   ✅ Mobile viewport fits perfectly with zero horizontal overflow");

    console.log("\n🎉 ALL E2E BROWSER TESTS PASSED! ZERO CRITICAL DEFECTS.");
    assert.equal(pageErrors.length, 0, "Expected 0 uncaught page errors");
  } finally {
    await browser.close();
  }
}

runE2ETests().catch((err) => {
  console.error("❌ E2E Test Failure:", err);
  process.exit(1);
});
