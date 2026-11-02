import { z } from "zod";

export const RiskLevelEnum = z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const IndicatorTypeEnum = z.enum([
  "urgency",
  "authority_impersonation",
  "financial_pressure",
  "sensitive_data_request",
  "unrealistic_returns",
  "suspicious_link",
  "qr_tampering",
  "emotional_manipulation",
  "unknown_payment_rail",
  "lookalike_domain",
  "other",
]);
export type IndicatorType = z.infer<typeof IndicatorTypeEnum>;

export const IndicatorSchema = z.object({
  type: IndicatorTypeEnum,
  description: z.string().min(1).max(500),
  evidence: z.string().max(300).optional().default(""),
  severity: z.enum(["info", "warning", "critical"]).default("warning"),
});
export type Indicator = z.infer<typeof IndicatorSchema>;

export const AnalysisResultSchema = z.object({
  risk_level: RiskLevelEnum,
  risk_score: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(500),
  detailed_explanation: z.string().min(1).max(2000),
  indicators: z.array(IndicatorSchema),
  scam_category: z.enum([
    "fake_bank_support",
    "fraudulent_transfer",
    "ponzi_investment",
    "relative_impersonation",
    "suspicious_qr",
    "phishing_url",
    "fake_ecommerce",
    "urgent_debt_threat",
    "benign_financial",
    "unclassified",
  ]),
  recommended_actions: z.array(z.string().min(1).max(300)).min(1),
  suggested_verification_steps: z.array(z.string().min(1).max(300)),
  limitations: z.array(z.string().min(1).max(300)),
  is_demo: z.boolean().default(false),
  analyzed_at: z.string().datetime().default(() => new Date().toISOString()),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const AnalyzeTextRequestSchema = z.object({
  type: z.literal("text"),
  content: z.string().min(3).max(5000),
  language: z.enum(["vi", "en"]).default("vi"),
});

export const AnalyzeUrlRequestSchema = z.object({
  type: z.literal("url"),
  url: z.string().url().max(2048),
  language: z.enum(["vi", "en"]).default("vi"),
});

export const AnalyzeImageRequestSchema = z.object({
  type: z.literal("image"),
  image_base64: z.string().min(100).max(10 * 1024 * 1024), // Max ~7.5MB raw (10MB base64)
  mime_type: z.enum(["image/png", "image/jpeg", "image/webp"]),
  language: z.enum(["vi", "en"]).default("vi"),
});

export const AnalyzeRequestSchema = z.discriminatedUnion("type", [
  AnalyzeTextRequestSchema,
  AnalyzeUrlRequestSchema,
  AnalyzeImageRequestSchema,
]);
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const AssistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(3000),
});
export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;

export const AssistantRequestSchema = z.object({
  messages: z.array(AssistantMessageSchema).min(1).max(20),
  language: z.enum(["vi", "en"]).default("vi"),
});
export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const DemoScenarioSchema = z.object({
  id: z.string(),
  title: z.object({ vi: z.string(), en: z.string() }),
  category: z.string(),
  type: z.enum(["text", "url", "image"]),
  input_preview: z.string(),
  full_input: z.string(),
  expected_risk: RiskLevelEnum,
  analysis: AnalysisResultSchema,
});
export type DemoScenario = z.infer<typeof DemoScenarioSchema>;
