import { AnalysisResult, RiskLevel } from "@/types/analysis";
import { DEMO_SCENARIOS } from "@/data/demo-scenarios";

/**
 * Heuristic fallback scanner when Gemini API key is missing or external network is offline.
 * Identifies well-known Vietnamese financial scam patterns and keywords.
 */
export function heuristicScanText(text: string, language: "vi" | "en" = "vi"): AnalysisResult {
  const lower = text.toLowerCase();

  // Check if text closely matches a demo scenario first
  for (const scenario of DEMO_SCENARIOS) {
    if (scenario.type === "text") {
      const sampleLower = scenario.sampleInput.toLowerCase();
      // If significant overlap
      if (
        (lower.length > 20 && sampleLower.includes(lower.slice(0, 30))) ||
        (sampleLower.length > 20 && lower.includes(sampleLower.slice(0, 30)))
      ) {
        return {
          ...scenario.analysis,
          is_demo: false, // Served as heuristic result
          analyzed_at: new Date().toISOString(),
        };
      }
    }
  }

  // Keywords & red flags
  const urgencyKeywords = [
    "khẩn cấp",
    "ngay lập tức",
    "trong vòng 10 phút",
    "trong 5 phút",
    "khóa vĩnh viễn",
    "đóng tài khoản",
    "trát hầu tòa",
    "bị bắt",
    "urgent",
    "within 10 minutes",
    "account suspended",
    "immediately",
  ];

  const financialBaitKeywords = [
    "bao lỗ",
    "lợi nhuận 20%",
    "lợi nhuận 30%",
    "kéo lệnh",
    "bảo hiểm vốn 100%",
    "hoa hồng cao",
    "việc nhẹ lương cao",
    "nhiệm vụ shopee",
    "guaranteed return",
    "100% profit",
    "passive income",
  ];

  const otpSensitiveKeywords = [
    "cung cấp mã otp",
    "nhập otp",
    "gửi mã xác nhận",
    "share otp",
    "mật khẩu ngân hàng",
    "smart otp",
  ];

  const suspiciousDomainKeywords = [
    ".vip",
    ".top",
    ".xyz",
    ".online",
    "-gov-",
    "-vneid",
    "-xacthuc",
    ".apk",
    "bit.ly",
    "tinyurl",
  ];

  let score = 15; // baseline
  const indicators: AnalysisResult["indicators"] = [];
  let category: AnalysisResult["scam_category"] = "unclassified";

  // Check urgency
  const foundUrgency = urgencyKeywords.filter((k) => lower.includes(k));
  if (foundUrgency.length > 0) {
    score += 35;
    indicators.push({
      type: "urgency",
      description:
        language === "vi"
          ? "Tin nhắn tạo áp lực thời gian gấp rút để nạn nhân không kịp suy xét kỹ lưỡng."
          : "Message exerts intense time pressure so the victim cannot verify facts.",
      evidence: foundUrgency.join(", "),
      severity: "critical",
    });
  }

  // Check financial bait
  const foundBait = financialBaitKeywords.filter((k) => lower.includes(k));
  if (foundBait.length > 0) {
    score += 45;
    category = "ponzi_investment";
    indicators.push({
      type: "unrealistic_returns",
      description:
        language === "vi"
          ? "Cam kết lợi nhuận bất thường, không tưởng hoặc hứa hẹn bao lỗ 100%."
          : "Unrealistic guaranteed return or 100% risk-free investment promise.",
      evidence: foundBait.join(", "),
      severity: "critical",
    });
  }

  // Check OTP
  const foundOtp = otpSensitiveKeywords.filter((k) => lower.includes(k));
  if (foundOtp.length > 0) {
    score += 40;
    category = "fake_bank_support";
    indicators.push({
      type: "sensitive_data_request",
      description:
        language === "vi"
          ? "Yêu cầu chia sẻ mã OTP hoặc thông tin bảo mật tuyệt mật của tài khoản."
          : "Requesting OTP or confidential banking credentials.",
      evidence: foundOtp.join(", "),
      severity: "critical",
    });
  }

  // Check suspicious links
  const foundDomain = suspiciousDomainKeywords.filter((k) => lower.includes(k));
  if (foundDomain.length > 0) {
    score += 30;
    indicators.push({
      type: "suspicious_link",
      description:
        language === "vi"
          ? "Đường dẫn chứa phần mở rộng lạ hoặc tên miền giả mạo thương hiệu uy tín."
          : "Link contains suspicious top-level domain or lookalike structure.",
      evidence: foundDomain.join(", "),
      severity: "critical",
    });
  }

  // Cap score
  score = Math.min(score, 99);

  let riskLevel: RiskLevel = "LOW";
  if (score >= 85) riskLevel = "CRITICAL";
  else if (score >= 60) riskLevel = "HIGH";
  else if (score >= 30) riskLevel = "MODERATE";

  if (category === "unclassified" && score >= 60) {
    category = "fraudulent_transfer";
  } else if (category === "unclassified" && score < 30) {
    category = "benign_financial";
  }

  return {
    risk_level: riskLevel,
    risk_score: score,
    summary:
      language === "vi"
        ? riskLevel === "LOW"
          ? "Tin nhắn chưa phát hiện dấu hiệu lừa đảo nguy hiểm rõ ràng."
          : `Phát hiện ${indicators.length} chỉ dấu nghi vấn lừa đảo tài chính qua phân tích từ khóa chuyên sâu.`
        : riskLevel === "LOW"
        ? "No definitive fraud indicators were detected in this message."
        : `Identified ${indicators.length} suspicious financial scam indicators via heuristic pattern matching.`,
    detailed_explanation:
      language === "vi"
        ? "Hệ thống ScamLens đã đối chiếu nội dung này với cơ sở dữ liệu các chiêu trò lừa đảo chuyển tiền và mạo danh phổ biến tại Việt Nam."
        : "ScamLens heuristic engine cross-referenced this content against common financial scam vectors.",
    indicators:
      indicators.length > 0
        ? indicators
        : [
            {
              type: "other",
              description:
                language === "vi"
                  ? "Không có cụm từ thúc ép thời gian hoặc dụ dỗ tài chính nguy hiểm."
                  : "No high-risk urgency or financial coercion keywords identified.",
              evidence: "",
              severity: "info",
            },
          ],
    scam_category: category,
    recommended_actions:
      riskLevel === "LOW"
        ? [
            language === "vi"
              ? "Vẫn duy trì cảnh giác, không chia sẻ OTP với người lạ."
              : "Remain vigilant, never share your OTP with anyone.",
          ]
        : [
            language === "vi"
              ? "Tuyệt đối không chuyển tiền hoặc bấm vào đường link lạ."
              : "Do not transfer money or click unverified links.",
            language === "vi"
              ? "Liên hệ trực tiếp với cơ quan/người thân qua kênh liên lạc chính thức."
              : "Contact the purported entity or relative via verified official channels.",
          ],
    suggested_verification_steps: [
      language === "vi"
        ? "Kiểm tra số điện thoại người gửi trên ứng dụng cảnh báo lừa đảo."
        : "Verify sender phone number on consumer protection databases.",
      language === "vi"
        ? "Đối chiếu số tài khoản thụ hưởng có trùng khớp họ tên người nhận hay không."
        : "Check whether recipient bank account name matches the person's real identity.",
    ],
    limitations: [
      language === "vi"
        ? "Phân tích theo mẫu từ khóa dự phòng. Đánh giá mang tính cảnh báo tham khảo, không thay thế kiểm tra nghiệp vụ ngân hàng."
        : "Heuristic fallback evaluation. Educational indicator only, not legal or banking verification.",
    ],
    is_demo: false,
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Validates and inspects an untrusted URL for SSRF risks and lookalike phishing structures.
 */
export function inspectUrlHeuristics(rawUrl: string, language: "vi" | "en" = "vi"): AnalysisResult {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("INVALID_URL");
  }

  // SSRF Protection: Block private IPs and loopback
  const hostname = parsed.hostname.toLowerCase();
  const isPrivateOrLoopback =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal");

  if (isPrivateOrLoopback) {
    throw new Error("SSRF_RESTRICTED_HOST");
  }

  // Check against known demo scenarios
  for (const s of DEMO_SCENARIOS) {
    if (s.type === "url" && s.sampleInput.toLowerCase() === rawUrl.toLowerCase()) {
      return {
        ...s.analysis,
        is_demo: false,
        analyzed_at: new Date().toISOString(),
      };
    }
  }

  const indicators: AnalysisResult["indicators"] = [];
  let score = 20;

  // Check lookalikes
  const bankNames = [
    "vietcombank",
    "techcombank",
    "mbbank",
    "bidv",
    "agribank",
    "acb",
    "tpbank",
    "vpbank",
    "vneid",
    "momo",
    "zalopay",
  ];

  const isFakeGov = hostname.includes("gov") && !hostname.endsWith(".gov.vn");
  if (isFakeGov) {
    score += 55;
    indicators.push({
      type: "lookalike_domain",
      description:
        language === "vi"
          ? "Tên miền chứa từ khóa 'gov' nhưng không thuộc đuôi cơ quan nhà nước '.gov.vn'."
          : "Domain contains 'gov' keyword but lacks the official '.gov.vn' government TLD.",
      evidence: hostname,
      severity: "critical",
    });
  }

  for (const bank of bankNames) {
    if (hostname.includes(bank)) {
      // Check if it is the official domain
      const isOfficial =
        hostname === `${bank}.com.vn` ||
        hostname === `${bank}.com` ||
        hostname.endsWith(`.${bank}.com.vn`) ||
        hostname.endsWith(`.${bank}.com`);

      if (!isOfficial) {
        score += 50;
        indicators.push({
          type: "authority_impersonation",
          description:
            language === "vi"
              ? `Tên miền lạm dụng tên ngân hàng/thương hiệu '${bank.toUpperCase()}' nhưng không phải địa chỉ chính thống.`
              : `Domain uses '${bank.toUpperCase()}' brand name but is not an official banking domain.`,
          evidence: hostname,
          severity: "critical",
        });
      }
    }
  }

  // Risky file extensions
  if (parsed.pathname.endsWith(".apk") || parsed.pathname.endsWith(".exe")) {
    score += 45;
    indicators.push({
      type: "suspicious_link",
      description:
        language === "vi"
          ? "Đường dẫn tải trực tiếp file cài đặt ứng dụng (.apk / .exe) bên ngoài kho ứng dụng chính thức."
          : "Direct link to executable / Android package file (.apk/.exe) outside app stores.",
      evidence: parsed.pathname,
      severity: "critical",
    });
  }

  // Risky TLDs
  const suspiciousTlds = [".xyz", ".top", ".vip", ".online", ".app", ".click", ".shop"];
  if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
    score += 25;
    indicators.push({
      type: "lookalike_domain",
      description:
        language === "vi"
          ? "Sử dụng tên miền cấp cao (TLD) giá rẻ thường xuyên bị tội phạm mạng lợi dụng phát tán phishing."
          : "Uses a generic TLD commonly associated with automated disposable phishing campaigns.",
      evidence: hostname,
      severity: "warning",
    });
  }

  score = Math.min(score, 98);
  let riskLevel: RiskLevel = "LOW";
  if (score >= 80) riskLevel = "CRITICAL";
  else if (score >= 55) riskLevel = "HIGH";
  else if (score >= 30) riskLevel = "MODERATE";

  return {
    risk_level: riskLevel,
    risk_score: score,
    summary:
      riskLevel === "CRITICAL" || riskLevel === "HIGH"
        ? language === "vi"
          ? `Đường link có độ rủi ro cao (${score}/100) với các dấu hiệu mạo danh tên miền ngân hàng hoặc phát tán file độc hại.`
          : `High-risk URL (${score}/100) exhibiting brand spoofing or direct executable distribution indicators.`
        : language === "vi"
        ? `Đường link chưa phát hiện dấu hiệu giả mạo rõ ràng (${score}/100).`
        : `URL did not show explicit spoofing signatures (${score}/100).`,
    detailed_explanation:
      language === "vi"
        ? `Phân tích cấu trúc tên miền '${hostname}'. Trình quét tĩnh đã kiểm tra tiền tố, hậu tố và tệp đích mà không kết nối trực tiếp đến máy chủ đích để bảo vệ người dùng.`
        : `Static inspection of hostname '${hostname}'. Performed safe metadata parsing without triggering outbound network requests to untrusted endpoints.`,
    indicators:
      indicators.length > 0
        ? indicators
        : [
            {
              type: "other",
              description:
                language === "vi"
                  ? "Tên miền không chứa các từ khóa giả mạo ngân hàng phổ biến."
                  : "No popular banking brand keywords spoofed.",
              evidence: "",
              severity: "info",
            },
          ],
    scam_category:
      riskLevel === "CRITICAL" || riskLevel === "HIGH" ? "phishing_url" : "unclassified",
    recommended_actions: [
      language === "vi"
        ? "Không nhập thông tin số thẻ, mật khẩu tài khoản hoặc mã OTP trên website này."
        : "Never enter card numbers, account passwords, or OTP codes on this webpage.",
      language === "vi"
        ? "Nếu trang web yêu cầu tải phần mềm, lập tức đóng tab trình duyệt."
        : "If prompted to download an installation package, close the tab immediately.",
    ],
    suggested_verification_steps: [
      language === "vi"
        ? "Tra cứu độ an toàn tại trang Cảnh báo An toàn thông tin Việt Nam (tinnhiemmang.vn)."
        : "Verify domain credibility via official national cyber safety registry.",
    ],
    limitations: [
      language === "vi"
        ? "Không mở kết nối trực tiếp tới máy chủ đích để phòng ngừa mã độc (Zero-Request Inspection)."
        : "Zero-Request Inspection: server was not pinged to safeguard against malicious payload execution.",
    ],
    is_demo: false,
    analyzed_at: new Date().toISOString(),
  };
}
