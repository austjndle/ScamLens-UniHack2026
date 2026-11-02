import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/types/analysis";
import { checkRateLimit } from "@/lib/rate-limiter";
import { analyzeWithGemini, isGeminiConfigured } from "@/lib/gemini";
import { heuristicScanText, inspectUrlHeuristics } from "@/lib/heuristics";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. IP-based rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimitResult = checkRateLimit(`analyze:${ip}`, { limit: 15, windowMs: 60 * 1000 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many analysis requests. Please wait before submitting again.",
          details: { retryAfterSeconds: Math.ceil(rateLimitResult.resetInMs / 1000) },
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimitResult.resetInMs / 1000)),
        },
      }
    );
  }

  // 2. Validate input schema
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request payload must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const parseResult = AnalyzeRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid analysis request parameters.",
          details: parseResult.error.errors.map((e) => ({
            field: e.path.join("."),
            issue: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  // 3. Process analysis based on type
  try {
    // If URL type, first perform strict SSRF & domain checks
    if (data.type === "url") {
      try {
        // Safe heuristic static inspection
        const heuristicUrlResult = inspectUrlHeuristics(data.url, data.language);

        // If Gemini is active, enrich with Gemini's reasoning
        if (isGeminiConfigured()) {
          try {
            const geminiResult = await analyzeWithGemini(
              { type: "url", text: data.url },
              data.language
            );
            return NextResponse.json({
              success: true,
              data: geminiResult.result,
              meta: { source: "gemini-3.8-flash", is_fallback: false },
            });
          } catch (geminiErr) {
            console.warn("Gemini URL analysis failed, returning heuristic:", geminiErr);
            return NextResponse.json({
              success: true,
              data: heuristicUrlResult,
              meta: { source: "heuristics_fallback", is_fallback: true },
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: heuristicUrlResult,
          meta: { source: "heuristics_engine", is_fallback: true },
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "SSRF_RESTRICTED_HOST") {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "SSRF_FORBIDDEN",
                message: "Private, local, or loopback network addresses cannot be inspected.",
              },
            },
            { status: 403 }
          );
        }
        throw err;
      }
    }

    // Text analysis
    if (data.type === "text") {
      if (isGeminiConfigured()) {
        try {
          const geminiResult = await analyzeWithGemini(
            { type: "text", text: data.content },
            data.language
          );
          return NextResponse.json({
            success: true,
            data: geminiResult.result,
            meta: { source: "gemini-3.8-flash", is_fallback: false },
          });
        } catch (geminiErr) {
          console.warn("Gemini text analysis failed, falling back to heuristics:", geminiErr);
          const fallback = heuristicScanText(data.content, data.language);
          return NextResponse.json({
            success: true,
            data: fallback,
            meta: { source: "heuristics_fallback", is_fallback: true },
          });
        }
      }

      const fallback = heuristicScanText(data.content, data.language);
      return NextResponse.json({
        success: true,
        data: fallback,
        meta: { source: "heuristics_engine", is_fallback: true },
      });
    }

    // Image / Screenshot analysis
    if (data.type === "image") {
      if (!isGeminiConfigured()) {
        return NextResponse.json({
          success: true,
          data: {
            risk_level: "HIGH",
            risk_score: 85,
            summary:
              data.language === "vi"
                ? "Ảnh chụp màn hình chứa giao diện chuyển khoản ngân hàng có nhiều điểm bất thường nghi vấn giả mạo."
                : "Screenshot exhibits high-risk visual cues consistent with simulated bank transfer receipts.",
            detailed_explanation:
              data.language === "vi"
                ? "Hình ảnh này được quét thông qua chế độ phân tích hình ảnh mô phỏng. Khi kết nối API Gemini 3.8 Flash đầy đủ, hệ thống sẽ đọc toàn bộ ký tự OCR và bóc tách từng chi tiết hóa đơn."
                : "Sample vision analysis demonstration. With Gemini 3.8 Flash connected, multimodal OCR extracts sender/recipient metadata and detects image splicing.",
            indicators: [
              {
                type: "financial_pressure",
                description:
                  data.language === "vi"
                    ? "Ảnh chụp thông báo giao dịch có dấu hiệu chỉnh sửa font chữ số tiền."
                    : "Receipt text formatting shows discrepancies characteristic of fake bill generator apps.",
                severity: "warning",
              },
              {
                type: "authority_impersonation",
                description:
                  data.language === "vi"
                    ? "Sử dụng logo ngân hàng không đúng tỷ lệ nhận diện thương hiệu chuẩn."
                    : "Bank visual brand mark altered or mismatched.",
                severity: "warning",
              },
            ],
            scam_category: "fraudulent_transfer",
            recommended_actions: [
              data.language === "vi"
                ? "Kiểm tra biến động số dư thực tế trong ứng dụng ngân hàng của bạn, không tin vào ảnh chụp bill."
                : "Verify balance update in your official banking app; never rely on screenshots alone.",
              data.language === "vi"
                ? "Không giao hàng hoặc chuyển tiền hoàn lại khi chưa thấy tiền vào tài khoản."
                : "Do not release goods or refunds until funds are cleared in your bank account.",
            ],
            suggested_verification_steps: [
              data.language === "vi"
                ? "Tra soát mã giao dịch trực tiếp với tổng đài ngân hàng phát hành."
                : "Cross-check transaction reference number with the issuing bank.",
            ],
            limitations: [
              data.language === "vi"
                ? "Kết quả từ mô hình nhận dạng ảnh mẫu (Demo Mode - Gemini API chưa cấu hình khóa)."
                : "Image analysis preview mode (Gemini API key unconfigured).",
            ],
            is_demo: true,
            analyzed_at: new Date().toISOString(),
          },
          meta: { source: "vision_demo_preset", is_fallback: true },
        });
      }

      // Gemini Vision Call
      try {
        const geminiResult = await analyzeWithGemini(
          {
            type: "image",
            imageBase64: data.image_base64,
            mimeType: data.mime_type,
          },
          data.language
        );
        return NextResponse.json({
          success: true,
          data: geminiResult.result,
          meta: { source: "gemini-3.8-flash-vision", is_fallback: false },
        });
      } catch (geminiErr) {
        console.error("Gemini Vision Error:", geminiErr);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VISION_ANALYSIS_FAILED",
              message:
                "Unable to process image at this time. Please ensure the image is clear and under 7MB.",
            },
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: { code: "UNSUPPORTED_TYPE", message: "Unsupported analysis type." } },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Unhandled analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An internal server error occurred while analyzing the content.",
        },
      },
      { status: 500 }
    );
  }
}
