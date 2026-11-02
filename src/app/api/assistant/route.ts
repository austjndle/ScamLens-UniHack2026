import { NextRequest, NextResponse } from "next/server";
import { AssistantRequestSchema } from "@/types/analysis";
import { checkRateLimit } from "@/lib/rate-limiter";
import { getGenAIClient, isGeminiConfigured } from "@/lib/gemini";

export const runtime = "nodejs";

const ASSISTANT_SYSTEM_INSTRUCTION = `
You are ScamLens AI Safety Advisor, a calm, trustworthy, and expert cybersecurity consultant specializing in Vietnamese banking fraud, scam prevention, and consumer financial security.

CRITICAL SAFETY & ETHICAL RULES:
1. NEVER ask the user for their passwords, PIN codes, OTPs, full credit card numbers, or banking credentials.
2. If the user shares an OTP, password, or bank card info, IMMEDIATELY instruct them to stop sharing it and contact their bank to change credentials.
3. NEVER declare a specific named individual or business conclusively guilty of a crime without legal adjudication. Frame your advice in terms of "red flags", "high-risk patterns", and "defensive steps".
4. When someone asks about a friend or relative asking for money: always recommend independent verification (call phone number directly, ask personal verification question, refuse immediate wire transfers).
5. When someone asks about an investment opportunity promising high daily returns: explain Ponzi mechanics, lack of state license (SSC/NHNN), and capital preservation rules.
6. Keep answers concise, actionable, and formatted in clear bullet points where appropriate.
7. Support both Vietnamese and English naturally.
`;

const FALLBACK_RESPONSES_VI = [
  {
    keywords: ["otp", "mã otp", "nhân viên ngân hàng hỏi otp"],
    reply: `⚠️ **CẢNH BÁO TỐI KHẨN CẤP: TUYỆT ĐỐI KHÔNG CUNG CẤP MÃ OTP CHO BẤT KỲ AI!**

Ngân hàng và các cơ quan chức năng **KHÔNG BAO GIỜ** yêu cầu khách hàng cung cấp mã OTP, mật khẩu hay mã bảo mật thẻ dưới bất kỳ hình thức nào:
1. **Dừng giao dịch ngay lập tức:** Bất kỳ ai tự xưng là nhân viên ngân hàng, công an, hay tổng đài viên yêu cầu OTP chắc chắn là lừa đảo 100%.
2. **Khóa thẻ khẩn cấp:** Đăng nhập ứng dụng ngân hàng chính thức trên điện thoại và bấm "Khóa thẻ / Khóa dịch vụ trực tuyến".
3. **Gọi tổng đài chính thức:** Gọi số hotline in trên mặt sau thẻ ATM của bạn để thông báo nghi vấn lộ thông tin.`,
  },
  {
    keywords: ["bạn bè nhờ chuyển tiền", "người thân mượn tiền", "gãy chân", "tai nạn"],
    reply: `🛑 **CẨN THẬN: CHIÊU TRÒ HACK NICK HOẶC MẠO DANH NGƯỜI THÂN ĐANG RẤT PHỔ BIẾN!**

Trước khi thực hiện bất kỳ lệnh chuyển khoản nào, hãy làm theo quy tắc 3 bước:
1. **Gọi điện thoại thông thường:** Gọi trực tiếp vào số điện thoại viễn thông (SIM) quen thuộc của người đó, không gọi qua Zalo/Messenger của nick đang nhắn.
2. **Hỏi câu hỏi kiểm tra bí mật:** Hỏi một chi tiết riêng tư mà chỉ bạn và người đó biết (ví dụ: hôm qua vừa gặp nhau ở đâu, tên thầy cô giáo cũ).
3. **Kiểm tra tên chủ tài khoản thụ hưởng:** Nếu tên chủ tài khoản ngân hàng không phải là tên người thân của bạn (mà là tên người lạ với lý do "mượn tài khoản"), khả năng lừa đảo lên tới 99%.`,
  },
  {
    keywords: ["đầu tư", "lợi nhuận", "kéo lệnh", "bao lỗ", "vip"],
    reply: `📊 **CẢNH BÁO MÔ HÌNH LỪA ĐẢO ĐẦU TƯ TÀI CHÍNH (PONZI):**

Tại thị trường tài chính hợp pháp, **không có bất kỳ kênh đầu tư nào có thể cam kết lợi nhuận 20-30%/ngày hoặc bảo hiểm vốn 100%**:
- Các hội nhóm Telegram/Zalo 'kéo lệnh' thường tự tạo biểu đồ ảo và sàn giao dịch giả.
- Thời gian đầu họ có thể cho bạn rút vài trăm nghìn tiền lãi để tạo lòng tin, nhưng khi bạn nạp số tiền lớn, sàn sẽ khóa tài khoản với lý do 'thuế', 'phí xác thực', 'lỗi hệ thống'.
- Khuyến nghị: Dừng nạp tiền ngay lập tức và tuyệt đối không vay mượn để gỡ vốn.`,
  },
];

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimitResult = checkRateLimit(`assistant:${ip}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many messages sent. Please slow down.",
          details: { retryAfterSeconds: Math.ceil(rateLimitResult.resetInMs / 1000) },
        },
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Malformed JSON payload" } },
      { status: 400 }
    );
  }

  const parseResult = AssistantRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid assistant chat parameters",
          details: parseResult.error.errors,
        },
      },
      { status: 400 }
    );
  }

  const { messages, language } = parseResult.data;
  const lastMessage = messages[messages.length - 1];

  // If Gemini is configured, use official SDK
  if (isGeminiConfigured()) {
    try {
      const client = getGenAIClient();
      if (!client) throw new Error("Client initialization failed");

      const conversationHistory = messages.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
      const response = await client.models.generateContent({
        model: modelName,
        contents: conversationHistory,
        config: {
          systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
          temperature: 0.3,
        },
      });

      const replyText = response.text || "";
      return NextResponse.json({
        success: true,
        data: {
          reply: replyText,
          is_demo: false,
          model: modelName,
        },
      });
    } catch (err) {
      console.warn("Gemini chat assistant failed, falling back to heuristic answers:", err);
    }
  }

  // Heuristic rule-based fallback response
  const lowerQuery = lastMessage.content.toLowerCase();
  for (const item of FALLBACK_RESPONSES_VI) {
    if (item.keywords.some((k) => lowerQuery.includes(k))) {
      return NextResponse.json({
        success: true,
        data: {
          reply: item.reply,
          is_demo: true,
          model: "heuristics_expert_rulebase",
        },
      });
    }
  }

  const genericFallback =
    language === "vi"
      ? `Chào bạn, tôi là Trợ lý An toàn Tài chính ScamLens. Để bảo vệ quyền lợi và tài sản của bạn, xin hãy luôn ghi nhớ:
1. **Không bao giờ chia sẻ mã OTP hoặc mật khẩu đăng nhập** với bất kỳ ai, kể cả người tự xưng là nhân viên ngân hàng hoặc cơ quan công an.
2. **Không chuyển tiền khi chưa xác minh trực tiếp** qua cuộc gọi viễn thông có nghe giọng nói rõ ràng của người thân/đối tác.
3. **Cẩn trọng trước các đường link lạ** yêu cầu cập nhật thông tin tài khoản hoặc tải tệp .apk ngoài kho ứng dụng chính thức.

Bạn có thể gửi tin nhắn hoặc chụp ảnh màn hình tình huống cụ thể lên thẻ "Phân tích lừa đảo" để tôi kiểm tra chi tiết rủi ro nhé!`
      : `Hello, I am your ScamLens Financial Safety Advisor. To protect your funds:
1. **Never share OTP codes or banking passwords** with anyone claiming to be bank staff or police.
2. **Always verify unexpected money requests** via an independent phone call with your contact.
3. **Avoid clicking unverified links** demanding account verification or third-party APK downloads.

You can paste the specific message into the Scam Analyzer tab for a comprehensive risk inspection.`;

  return NextResponse.json({
    success: true,
    data: {
      reply: genericFallback,
      is_demo: true,
      model: "heuristics_expert_rulebase",
    },
  });
}
