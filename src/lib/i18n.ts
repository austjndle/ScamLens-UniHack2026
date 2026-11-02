export type Language = "vi" | "en";

export interface Translations {
  nav: {
    analyzer: string;
    assistant: string;
    guide: string;
    disclaimer: string;
    demoButton: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleGradient: string;
    subtitle: string;
    ctaAnalyze: string;
    ctaLiveDemo: string;
    statsScamsPrevented: string;
    statsDetectionLatency: string;
    statsAccuracyBench: string;
  };
  analyzer: {
    title: string;
    subtitle: string;
    tabText: string;
    tabImage: string;
    tabUrl: string;
    textPlaceholder: string;
    urlPlaceholder: string;
    imageDropzone: string;
    imageHint: string;
    btnAnalyze: string;
    btnAnalyzing: string;
    preloadedExamples: string;
  };
  dashboard: {
    riskTitle: string;
    riskScore: string;
    summaryTitle: string;
    indicatorsTitle: string;
    explanationTitle: string;
    recommendedActionsTitle: string;
    verificationStepsTitle: string;
    limitationsTitle: string;
    newAnalysisBtn: string;
    demoBadge: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    sendBtn: string;
    disclaimer: string;
    sampleQ1: string;
    sampleQ2: string;
    sampleQ3: string;
  };
  guide: {
    title: string;
    subtitle: string;
    rule1Title: string;
    rule1Desc: string;
    rule2Title: string;
    rule2Desc: string;
    rule3Title: string;
    rule3Desc: string;
    rule4Title: string;
    rule4Desc: string;
  };
  disclaimer: {
    title: string;
    subtitle: string;
    notice: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  vi: {
    nav: {
      analyzer: "Phân tích rủi ro",
      assistant: "Trợ lý an toàn",
      guide: "Cẩm nang lừa đảo",
      disclaimer: "Tuyên bố miễn trừ",
      demoButton: "Kịch bản mẫu",
    },
    hero: {
      badge: "UNIHACK HCMC 2026 — TRỢ THỦ PHÒNG CHỐNG LỪA ĐẢO TÀI CHÍNH",
      titleStart: "Suy nghĩ kỹ trước khi",
      titleGradient: "chuyển tiền.",
      subtitle:
        "Phân tích tin nhắn SMS mạo danh ngân hàng, liên kết giả mạo và hóa đơn chuyển tiền bất thường bằng trí tuệ nhân tạo Gemini 3.8 Flash trong 3 giây.",
      ctaAnalyze: "Quét tin nhắn ngay",
      ctaLiveDemo: "Xem 6 kịch bản thực tế",
      statsScamsPrevented: "Kịch bản lừa đảo phân tích",
      statsDetectionLatency: "Tốc độ xử lý trung bình",
      statsAccuracyBench: "Độ chính xác nhận diện đỏ",
    },
    analyzer: {
      title: "Trình Quét & Đánh Giá Rủi Ro Lừa Đảo",
      subtitle:
        "Dán nội dung tin nhắn, đường link hoặc tải ảnh chụp màn hình Zalo/Messenger/SMS để kiểm tra dấu hiệu gian lận.",
      tabText: "Tin nhắn văn bản",
      tabImage: "Ảnh chụp màn hình",
      tabUrl: "Đường link (URL)",
      textPlaceholder:
        "Ví dụ: [Vietcombank] Tài khoản của quý khách bị khóa... hoặc dán tin nhắn người quen vay tiền gấp tại đây...",
      urlPlaceholder: "https://dichvucong-gov-vneid.app hoặc tên miền cần kiểm tra an toàn...",
      imageDropzone: "Kéo thả ảnh chụp màn hình hoặc bấm để chọn tệp",
      imageHint: "Hỗ trợ PNG, JPEG, WebP (Tối đa 7MB). Dữ liệu được xóa ngay sau khi quét.",
      btnAnalyze: "Phân tích rủi ro ngay",
      btnAnalyzing: "Đang kiểm tra an toàn...",
      preloadedExamples: "Chọn nhanh kịch bản lừa đảo thực tế tại Việt Nam:",
    },
    dashboard: {
      riskTitle: "Mức độ rủi ro phát hiện",
      riskScore: "Điểm cảnh báo (Heuristic)",
      summaryTitle: "Tóm tắt đánh giá",
      indicatorsTitle: "Dấu hiệu vi phạm nhận diện được",
      explanationTitle: "Giải thích chi tiết từ ScamLens AI",
      recommendedActionsTitle: "Hành động phòng vệ khuyến nghị",
      verificationStepsTitle: "Các bước xác minh danh tính độc lập",
      limitationsTitle: "Giới hạn & lưu ý an toàn",
      newAnalysisBtn: "Kiểm tra nội dung khác",
      demoBadge: "Dữ liệu kịch bản mô phỏng",
    },
    assistant: {
      title: "Trợ Lý An Toàn Tài Chính",
      subtitle:
        "Hỏi đáp các tình huống đáng ngờ khi nhận cuộc gọi, tin nhắn hỏi vay tiền hoặc yêu cầu chia sẻ mã OTP.",
      inputPlaceholder: "Nhập câu hỏi của bạn (ví dụ: Có người tự xưng công an bảo tôi mở tài khoản)...",
      sendBtn: "Gửi câu hỏi",
      disclaimer: "Trợ lý không bao giờ hỏi mật khẩu, mã OTP và không thay thế cơ quan chức năng.",
      sampleQ1: "Có người xưng nhân viên ngân hàng bảo tôi đọc mã OTP để nhận tiền thưởng?",
      sampleQ2: "Bạn thân nhắn tin qua Zalo nhờ chuyển tiền vào tài khoản người lạ vì gãy chân?",
      sampleQ3: "Nhóm đầu tư Telegram cam kết lợi nhuận 30%/ngày có phải lừa đảo không?",
    },
    guide: {
      title: "Cẩm Nang Nhận Diện Lừa Đảo 2026",
      subtitle: "Tổng hợp các phương thức lừa đảo tài chính công nghệ cao tinh vi nhất tại Việt Nam.",
      rule1Title: "1. Nguyên tắc Bất Khả Xâm Phạm: Mã OTP",
      rule1Desc:
        "Ngân hàng, công an, tòa án tuyệt đối KHÔNG BAO GIỜ yêu cầu bạn cung cấp mã OTP, mã PIN hay mật khẩu ứng dụng. Bất kỳ ai yêu cầu OTP đều là kẻ lừa đảo.",
      rule2Title: "2. Quy tắc Cuộc Gọi Video Xác Minh",
      rule2Desc:
        "Khi người thân nhắn tin nhờ chuyển tiền gấp (tai nạn, viện phí), hãy gọi điện thoại viễn thông trực tiếp hoặc gọi video thấy mặt trước khi chuyển 1 đồng.",
      rule3Title: "3. Nhận diện Tên Miền Giả Mạo",
      rule3Desc:
        "Cổng thông tin cơ quan nhà nước Việt Nam luôn có đuôi .gov.vn. Các đường link đuôi .xyz, .vip, .online, .app mạo danh VNeID hay ngân hàng đều là bẫy độc hại.",
      rule4Title: "4. Cảnh giác Ảo tưởng Lợi Nhuận Cao",
      rule4Desc:
        "Không có tổ chức tài chính hợp pháp nào bao lỗ 100% hay sinh lời 20-30%/ngày. Đó là chiêu bài kinh điển của các sàn Ponzi đa cấp quốc tế.",
    },
    disclaimer: {
      title: "Tuyên Bố Miễn Trừ Trách Nhiệm & Quyền Riêng Tư",
      subtitle: "ScamLens là công cụ hỗ trợ giáo dục nhận thức an toàn tài chính.",
      notice:
        "ScamLens không phải là cơ quan thẩm quyền, tổ chức tín dụng hay đơn vị bảo hiểm giao dịch. Điểm số rủi ro là chỉ số cảnh báo gợi ý (heuristic indicator) dựa trên mô hình ngôn ngữ lớn và tập luật an toàn mạng. Chúng tôi KHÔNG lưu trữ vĩnh viễn tin nhắn hay số tài khoản người dùng gửi lên.",
    },
  },
  en: {
    nav: {
      analyzer: "Risk Analyzer",
      assistant: "Safety Assistant",
      guide: "Scam Guide",
      disclaimer: "Disclaimer",
      demoButton: "Demo Scenarios",
    },
    hero: {
      badge: "UNIHACK HCMC 2026 — AI FINANCIAL FRAUD SHIELD",
      titleStart: "Think before you",
      titleGradient: "transfer.",
      subtitle:
        "Inspect spoofed bank SMS, phishing links, and fake transfer receipts in 3 seconds using Google Gemini 3.8 Flash intelligence.",
      ctaAnalyze: "Scan Suspicious Message",
      ctaLiveDemo: "Explore 6 Scenarios",
      statsScamsPrevented: "Scam Scenarios Indexed",
      statsDetectionLatency: "Average Analysis Speed",
      statsAccuracyBench: "Red Flag Benchmark",
    },
    analyzer: {
      title: "Scam Risk Scanner & Evaluator",
      subtitle:
        "Paste suspicious text, submit a link, or upload a Zalo/Messenger/SMS screenshot to detect fraud indicators.",
      tabText: "Text Message",
      tabImage: "Screenshot Upload",
      tabUrl: "Web Link (URL)",
      textPlaceholder:
        "Example: [Bank] Your account has been locked due to suspicious activity. Verify here within 10 minutes...",
      urlPlaceholder: "https://suspicious-bank-login.xyz or URL to inspect...",
      imageDropzone: "Drag & drop a screenshot or click to browse",
      imageHint: "Supports PNG, JPEG, WebP (Max 7MB). Data discarded immediately after processing.",
      btnAnalyze: "Analyze Risk Now",
      btnAnalyzing: "Evaluating safety...",
      preloadedExamples: "Or choose a pre-loaded Vietnamese scam scenario:",
    },
    dashboard: {
      riskTitle: "Detected Risk Level",
      riskScore: "Heuristic Risk Score",
      summaryTitle: "Assessment Summary",
      indicatorsTitle: "Identified Fraud Indicators",
      explanationTitle: "ScamLens AI Reasoning",
      recommendedActionsTitle: "Recommended Protective Precautions",
      verificationStepsTitle: "Independent Identity Verification",
      limitationsTitle: "Limitations & Safety Notice",
      newAnalysisBtn: "Inspect Another Item",
      demoBadge: "Demo Scenario Data",
    },
    assistant: {
      title: "Financial Safety Advisor",
      subtitle:
        "Ask questions when encountering suspicious phone calls, loan requests, or OTP verification demands.",
      inputPlaceholder: "Type your question (e.g., Someone claiming to be police told me to transfer money)...",
      sendBtn: "Send Question",
      disclaimer: "Advisor never asks for passwords, OTPs, and is not a substitute for law enforcement.",
      sampleQ1: "Someone claiming to be bank staff asked for my OTP to claim a reward?",
      sampleQ2: "A close friend messaged me asking for money transfer due to an emergency?",
      sampleQ3: "Is a Telegram investment channel promising 30% daily returns legitimate?",
    },
    guide: {
      title: "2026 Financial Fraud Awareness Guide",
      subtitle: "Comprehensive defense guide against modern high-tech financial scams in Vietnam.",
      rule1Title: "1. The Inviolable Rule: OTP Codes",
      rule1Desc:
        "Banks and authorities NEVER request OTPs, PINs, or credentials. Anyone asking for your OTP is a fraudster without exception.",
      rule2Title: "2. The Direct Voice Verification Rule",
      rule2Desc:
        "When an acquaintance urgently requests emergency funds, call their telecom SIM phone directly before transferring a single dollar.",
      rule3Title: "3. Spotting Lookalike Domains",
      rule3Desc:
        "Official Vietnamese government portals always end in .gov.vn. Links ending in .xyz, .vip, or .online are phishing traps.",
      rule4Title: "4. Beware Guaranteed High Yields",
      rule4Desc:
        "No legitimate financial institution guarantees 20-30% daily returns or 100% loss-free investment pools. This is standard Ponzi fraud.",
    },
    disclaimer: {
      title: "Disclaimer & Privacy Policy",
      subtitle: "ScamLens is an educational risk assessment and consumer awareness tool.",
      notice:
        "ScamLens is not a financial institution, credit bureau, or transaction insurer. Risk scores are heuristic indicators generated via LLM analysis. We do not permanently store user-submitted messages.",
    },
  },
};
