import { AnalysisResult } from "@/types/analysis";

export interface DemoScenarioItem {
  id: string;
  type: "text" | "url" | "image";
  categoryKey: string;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  sampleInput: string;
  analysis: AnalysisResult;
}

export const DEMO_SCENARIOS: DemoScenarioItem[] = [
  {
    id: "fake_bank_sms",
    type: "text",
    categoryKey: "fake_bank_support",
    title: {
      vi: "SMS mạo danh ngân hàng Vietcombank",
      en: "Impersonated Bank SMS (Vietcombank Phishing)",
    },
    description: {
      vi: "Tin nhắn SMS Brandname giả mạo báo khóa tài khoản, ép đăng nhập link độc hại trong 10 phút.",
      en: "Spoofed SMS reporting locked bank account, demanding login via malicious link within 10 minutes.",
    },
    sampleInput:
      "[Vietcombank] Thong bao: Tai khoan cua Quy khach bi khoa do nghi van giao dich bat thuong. Vui long truy cap https://vietcombank-xacthuc247.com/verify de xac minh danh tinh trong vong 10 phut, neu khong tai khoan se bi dong vinh vien.",
    analysis: {
      risk_level: "CRITICAL",
      risk_score: 95,
      summary:
        "Tin nhắn lừa đảo mạo danh Vietcombank đe dọa khóa tài khoản nhằm chiếm đoạt tài khoản Internet Banking qua tên miền giả mạo.",
      detailed_explanation:
        "Kẻ gian sử dụng kỹ thuật tạo cảm giác khẩn cấp tột độ ('trong vòng 10 phút', 'đóng vĩnh viễn') kết hợp tên miền giả mạo 'vietcombank-xacthuc247.com'. Các ngân hàng chính thống tại Việt Nam KHÔNG BAO GIỜ gửi đường link yêu cầu khách hàng đăng nhập tài khoản qua SMS.",
      indicators: [
        {
          type: "urgency",
          description: "Ép buộc thời gian cấp bách (10 phút) để người nhận hoảng loạn không kịp xác thực.",
          evidence: "trong vong 10 phut, neu khong tai khoan se bi dong vinh vien",
          severity: "critical",
        },
        {
          type: "lookalike_domain",
          description: "Tên miền giả mạo cấu trúc phức tạp 'vietcombank-xacthuc247.com' thay vì vietcombank.com.vn chính thức.",
          evidence: "https://vietcombank-xacthuc247.com/verify",
          severity: "critical",
        },
        {
          type: "authority_impersonation",
          description: "Mạo danh thông báo chính thức từ Ngân hàng TMCP Ngoại thương Việt Nam.",
          evidence: "[Vietcombank] Thong bao",
          severity: "critical",
        },
      ],
      scam_category: "fake_bank_support",
      recommended_actions: [
        "TUYỆT ĐỐI KHÔNG bấm vào đường link trong tin nhắn.",
        "Không nhập tên đăng nhập, mật khẩu VCB Digibank hay mã OTP vào trang web này.",
        "Mở ứng dụng ngân hàng chính thức kiểm tra số dư và tình trạng thẻ.",
        "Gọi trực tiếp tổng đài chính thức Vietcombank (1900 54 54 13) để tra cứu.",
      ],
      suggested_verification_steps: [
        "Kiểm tra đuôi tên miền trên thanh địa chỉ trình duyệt (.com.vn đối với Vietcombank).",
        "Tra cứu trên Cổng Không Gian Mạng Quốc Gia (tinnhiemmang.vn).",
      ],
      limitations: [
        "Phân tích dựa trên nội dung tin nhắn cung cấp, chưa kiểm tra lưu lượng mạng thực tế của thiết bị.",
      ],
      is_demo: true,
      analyzed_at: "2026-11-02T10:00:00.000Z",
    },
  },
  {
    id: "urgent_relative_emergency",
    type: "text",
    categoryKey: "relative_impersonation",
    title: {
      vi: "Người thân mạo danh nhờ chuyển tiền viện phí gấp",
      en: "Family Impersonation (Emergency Hospital Transfer)",
    },
    description: {
      vi: "Tài khoản Zalo/Facebook mạo danh người thân báo gặp tai nạn, nhờ chuyển khoản tài khoản lạ.",
      en: "Compromised account pretending to be a close relative claiming medical emergency.",
    },
    sampleInput:
      "Mẹ ơi, con đang đi xe bị va quẹt gãy chân đang ở bệnh viện Chợ Rẫy. Bác sĩ yêu cầu đóng tạm ứng viện phí 15 triệu gấp mới chịu mổ. Con chuyển khoản điện thoại con bị hỏng thẻ sim rồi. Mẹ chuyển gấp vào stk của bác sĩ này giúp con: 1029384756 - MB Bank - NGUYEN VAN A. Nhanh giúp con nhé con đau quá!",
    analysis: {
      risk_level: "HIGH",
      risk_score: 88,
      summary:
        "Kịch bản thao túng tâm lý khẩn cấp mạo danh người thân đang gặp nạn để chuyển tiền vào tài khoản trung gian.",
      detailed_explanation:
        "Thủ đoạn điển hình của tội phạm lừa đảo công nghệ cao: hack tài khoản hoặc lập nick mạo danh, tạo tình huống y tế khẩn cấp, đưa ra lý do không thể nghe điện thoại và yêu cầu chuyển tiền ngay vào một số tài khoản mang tên người lạ (được giải thích là 'bác sĩ/công an').",
      indicators: [
        {
          type: "emotional_manipulation",
          description: "Khai thác triệt để nỗi lo sợ của cha mẹ đối với con cái ('gãy chân', 'đau quá').",
          evidence: "gãy chân đang ở bệnh viện... con đau quá",
          severity: "critical",
        },
        {
          type: "unknown_payment_rail",
          description: "Tài khoản thụ hưởng hoàn toàn xa lạ, không liên quan đến tên người thân.",
          evidence: "1029384756 - MB Bank - NGUYEN VAN A",
          severity: "warning",
        },
        {
          type: "urgency",
          description: "Ngăn cản nạn nhân gọi điện thoại trực tiếp bằng lý do 'hỏng sim'.",
          evidence: "điện thoại con bị hỏng thẻ sim rồi",
          severity: "critical",
        },
      ],
      scam_category: "relative_impersonation",
      recommended_actions: [
        "KHÔNG chuyển tiền ngay lập tức dù tình huống được mô tả cấp bách.",
        "Gọi điện thoại thông thường hoặc gọi video trực tiếp vào số điện thoại thường dùng của con.",
        "Liên hệ với bạn bè, người đi cùng hoặc người thân khác để kiểm chứng thông tin.",
        "Xác minh danh tính bằng cách hỏi một câu hỏi chỉ hai người trong gia đình biết.",
      ],
      suggested_verification_steps: [
        "Gọi hotline Bệnh viện Chợ Rẫy (028 3855 4137) hỏi tiếp nhận bệnh nhân theo tên.",
        "Yêu cầu gọi video call thấy mặt và giọng nói trực tiếp.",
      ],
      limitations: [
        "Không thể xác nhận mối quan hệ thực tế nếu không có kiểm chứng âm thanh/hình ảnh.",
      ],
      is_demo: true,
      analyzed_at: "2026-11-02T10:00:00.000Z",
    },
  },
  {
    id: "telegram_crypto_ponzi",
    type: "text",
    categoryKey: "ponzi_investment",
    title: {
      vi: "Rủ rê đầu tư Forex/Crypto lợi nhuận 30%/ngày",
      en: "High-Yield Investment Fraud (30% Daily Return)",
    },
    description: {
      vi: "Mời gọi tham gia sàn đầu tư tài chính quốc tế cam kết bao lỗ, sinh lời phi lý.",
      en: "Invitation to an unregulated crypto/forex trading pool promising guaranteed risk-free profits.",
    },
    sampleInput:
      "Chào anh/chị, em thuộc ban chuyên gia sàn giao dịch tài chính V-Trade AI. Hiện bên em đang có gói đầu tư VIP vốn chỉ 2 triệu, chuyên gia kéo lệnh tự động lợi nhuận từ 20-30%/ngày, cam kết bảo hiểm vốn 100%. Tiền rút về tài khoản ngân hàng sau 30 phút. Bấm vào link đăng ký nhận ngay 500k trải nghiệm: https://vtrade-global-invest.vip/register",
    analysis: {
      risk_level: "CRITICAL",
      risk_score: 96,
      summary:
        "Dấu hiệu rõ ràng của mô hình Ponzi lừa đảo đầu tư tài chính trực tuyến với cam kết lãi suất phi thực tế.",
      detailed_explanation:
        "Lợi nhuận 20-30%/ngày là điều hoàn toàn bất khả thi trong bất kỳ thị trường tài chính hợp pháp nào trên thế giới. Kẻ gian thường cho rút tiền nhỏ trong vài ngày đầu để dụ dỗ nạn nhân nạp số tiền lớn hơn, sau đó khóa tài khoản với lý do 'lỗi hệ thống', 'chưa đóng phí thuế'.",
      indicators: [
        {
          type: "unrealistic_returns",
          description: "Lợi nhuận cam kết 20-30%/ngày là dấu hiệu chắc chắn của mô hình lừa đảo tài chính.",
          evidence: "lợi nhuận từ 20-30%/ngày, cam kết bảo hiểm vốn 100%",
          severity: "critical",
        },
        {
          type: "suspicious_link",
          description: "Tên miền đuôi lạ .vip chưa được đăng ký với Bộ Công Thương hay UBCKNN Việt Nam.",
          evidence: "https://vtrade-global-invest.vip/register",
          severity: "critical",
        },
        {
          type: "financial_pressure",
          description: "Chiêu trò tặng tiền ảo để lôi kéo người dùng mở tài khoản và nạp tiền thật.",
          evidence: "nhận ngay 500k trải nghiệm",
          severity: "warning",
        },
      ],
      scam_category: "ponzi_investment",
      recommended_actions: [
        "Tuyệt đối không nạp bất kỳ khoản tiền nào vào sàn giao dịch này.",
        "Chặn tin nhắn và báo cáo tài khoản spam lừa đảo trên ứng dụng.",
        "Cảnh báo người thân, bạn bè về các hội nhóm kêu gọi đầu tư kéo lệnh.",
      ],
      suggested_verification_steps: [
        "Tra cứu giấy phép hoạt động tại cổng thông tin Ủy ban Chứng khoán Nhà nước (ssc.gov.vn).",
        "Kiểm tra cảnh báo sàn lừa đảo tại trang canhrao.khonggianmang.vn.",
      ],
      limitations: [
        "Đánh giá phân tích dựa trên lời mời gọi, không phân tích mã nguồn sàn giao dịch.",
      ],
      is_demo: true,
      analyzed_at: "2026-11-02T10:00:00.000Z",
    },
  },
  {
    id: "fake_vneid_url",
    type: "url",
    categoryKey: "phishing_url",
    title: {
      vi: "Đường link giả mạo cổng dịch vụ công VNeID",
      en: "Phishing Link (Fake Government Portal VNeID)",
    },
    description: {
      vi: "Link dụ tải app VNeID chứa mã độc cài đặt file APK ngoài Google Play/App Store.",
      en: "Malicious link directing users to download a fake VNeID APK malware outside app stores.",
    },
    sampleInput: "https://dichvucong-gov-vneid.app/cap-nhat-dinh-danh.apk",
    analysis: {
      risk_level: "CRITICAL",
      risk_score: 98,
      summary:
        "Tên miền lừa đảo mạo danh Cổng Dịch vụ công Quốc gia và VNeID để phân phối phần mềm độc hại (APK) đánh cắp mã OTP ngân hàng.",
      detailed_explanation:
        "Đường dẫn chứa đuôi tải tệp thực thi .apk trên điện thoại Android từ một tên miền không phải gov.vn. Mã độc này khi được cài đặt sẽ yêu cầu quyền trợ năng (Accessibility Service) nhằm theo dõi màn hình, tự động đọc mã OTP và chiếm quyền điều khiển tài khoản ngân hàng từ xa.",
      indicators: [
        {
          type: "lookalike_domain",
          description: "Sử dụng từ khóa 'gov' trong subdomain nhưng domain chính lại là .app thay vì tên miền đuôi .gov.vn của cơ quan nhà nước.",
          evidence: "dichvucong-gov-vneid.app",
          severity: "critical",
        },
        {
          type: "suspicious_link",
          description: "Trực tiếp phát tán file cài đặt .apk bên ngoài kho ứng dụng chính thức CH Play / App Store.",
          evidence: "cap-nhat-dinh-danh.apk",
          severity: "critical",
        },
        {
          type: "authority_impersonation",
          description: "Mạo danh định danh điện tử VNeID và Bộ Công An.",
          evidence: "dichvucong-gov-vneid",
          severity: "critical",
        },
      ],
      scam_category: "phishing_url",
      recommended_actions: [
        "KHÔNG tải xuống hoặc mở file .apk này dưới bất kỳ hình thức nào.",
        "Nếu đã lỡ bấm cài đặt, lập tức BẬT CHẾ ĐỘ MÁY BAY, ngắt wifi, sau đó khôi phục cài đặt gốc của điện thoại.",
        "Liên hệ ngay ngân hàng trên thiết bị khác để khóa tạm thời thẻ và dịch vụ ngân hàng điện tử.",
      ],
      suggested_verification_steps: [
        "Chỉ cài ứng dụng VNeID từ kho Google Play hoặc Apple App Store chính chủ của Trung tâm Dữ liệu quốc gia về dân cư.",
        "Tên miền chính phủ Việt Nam bắt buộc kết thúc bằng '.gov.vn'.",
      ],
      limitations: [
        "Phân tích cấu trúc tĩnh và danh tiếng URL, không kích hoạt tải tệp để đảm bảo an toàn.",
      ],
      is_demo: true,
      analyzed_at: "2026-11-02T10:00:00.000Z",
    },
  },
  {
    id: "fake_shipping_cod",
    type: "text",
    categoryKey: "fake_ecommerce",
    title: {
      vi: "Lừa đảo đơn hàng giao trúng thưởng bắt trả phí ship",
      en: "Fake Delivery & Lucky Draw Shipping Fee Scam",
    },
    description: {
      vi: "Shipper gọi điện báo có bưu phẩm tri ân trúng thưởng 50 triệu nhưng cần trả phí giao 350k.",
      en: "Caller claiming customer won high-value prize, requiring prepaid shipping or tax deposit.",
    },
    sampleInput:
      "[Giao Hàng Tiết Kiệm] Xin chào quý khách, đơn hàng quà tri ân khách hàng thân thiết năm 2026 của bạn bao gồm 1 Smart Tivi 55 inch và 1 phiếu mua hàng 5 triệu đang được giao. Quý khách vui lòng thanh toán cước vận chuyển bảo hiểm bưu kiện là 380.000đ khi nhận hàng. Hoặc chuyển khoản trước nhận thêm mã cào 500k qua link: https://ghtk-traoqua.online",
    analysis: {
      risk_level: "HIGH",
      risk_score: 79,
      summary:
        "Hình thức lừa đảo trúng quà tri ân mạo danh đơn vị vận chuyển để thu phí COD cho gói hàng rác hoặc lừa tiền cọc.",
      detailed_explanation:
        "Kẻ lừa đảo thu thập thông tin mua sắm của nạn nhân rồi gửi các gói hàng vô giá trị (hoặc hàng giả) với phí COD cao, đồng thời đính kèm liên kết giả mạo thương hiệu chuyển phát nhanh nhằm chiếm đoạt tài khoản.",
      indicators: [
        {
          type: "authority_impersonation",
          description: "Mạo danh công ty Giao Hàng Tiết Kiệm (GHTK) thông báo chương trình tặng quà.",
          evidence: "[Giao Hàng Tiết Kiệm] ... quà tri ân",
          severity: "warning",
        },
        {
          type: "financial_pressure",
          description: "Dụ dỗ nạn nhân thanh toán khoản tiền nhỏ (380k) để đổi lấy phần thưởng giá trị cao.",
          evidence: "Smart Tivi 55 inch ... thanh toán cước vận chuyển 380.000đ",
          severity: "critical",
        },
        {
          type: "suspicious_link",
          description: "Trang web tên miền lạ đuôi .online không thuộc hệ thống ghtk.vn.",
          evidence: "https://ghtk-traoqua.online",
          severity: "critical",
        },
      ],
      scam_category: "fake_ecommerce",
      recommended_actions: [
        "Từ chối nhận hàng và không chuyển bất kỳ khoản cọc hay phí ship nào.",
        "Kiểm tra lại trên ứng dụng mua hàng xem mình có thực sự đặt đơn này hay không.",
        "Yêu cầu được đồng kiểm, mở xem hàng trước mặt shipper (nếu đã nhận bưu phẩm).",
      ],
      suggested_verification_steps: [
        "Tra cứu mã vận đơn trực tiếp trên app GHTK hoặc website chính thức ghtk.vn.",
      ],
      limitations: [
        "Phân tích dựa trên nội dung tin nhắn, chưa đối chiếu số điện thoại người gửi với danh sách đen.",
      ],
      is_demo: true,
      analyzed_at: "2026-11-02T10:00:00.000Z",
    },
  },
  {
    id: "benign_legitimate_bank_otp",
    type: "text",
    categoryKey: "benign_financial",
    title: {
      vi: "OTP chuyển khoản hợp lệ từ Techcombank (An toàn)",
      en: "Legitimate Bank OTP (Benign Baseline)",
    },
    description: {
      vi: "Tin nhắn OTP chuẩn khi người dùng chủ động khởi tạo giao dịch chuyển khoản trên app ngân hàng.",
      en: "Authentic one-time password issued during legitimate user-initiated bank transaction.",
    },
    sampleInput:
      "[Techcombank] Ma OTP cua quy khach la 839201 de xac nhan giao dich chuyen khoan 2,500,000 VND den NGUYEN VAN B vao luc 14:32 ngay 02/11/2026. Ma co hieu luc trong 60 giay. KHONG chia se ma nay cho bat ky ai ke ca nhan vien ngan hang.",
    analysis: {
      risk_level: "LOW",
      risk_score: 12,
      summary:
        "Tin nhắn xác thực giao dịch hợp lệ thông thường từ ngân hàng. Không phát hiện yếu tố lừa đảo trong nội dung tin nhắn.",
      detailed_explanation:
        "Tin nhắn chứa đầy đủ cảnh báo bảo mật chuẩn mực: 'KHONG chia se ma nay cho bat ky ai ke ca nhan vien ngan hang', không chứa đường link liên kết ngoài, thông tin giao dịch cụ thể rõ ràng (số tiền, người nhận, thời gian).",
      indicators: [
        {
          type: "sensitive_data_request",
          description: "Mã OTP hợp lệ phục vụ xác thực người dùng chủ động thực hiện.",
          evidence: "Ma OTP cua quy khach la 839201",
          severity: "info",
        },
      ],
      scam_category: "benign_financial",
      recommended_actions: [
        "Nếu BẠN là người đang thực hiện giao dịch: Nhập mã OTP vào ứng dụng ngân hàng chính thức.",
        "Nếu BẠN KHÔNG hề thực hiện giao dịch này: Đang có người cố gắng xâm nhập tài khoản của bạn, hãy liên hệ ngân hàng khóa thẻ gấp.",
        "Không bao giờ cung cấp mã này cho bất cứ ai gọi điện hoặc nhắn tin hỏi xin.",
      ],
      suggested_verification_steps: [
        "Đối chiếu số tiền 2,500,000 VND và người nhận NGUYEN VAN B có đúng với giao dịch bạn vừa thao tác hay không.",
      ],
      limitations: [
        "Cảnh báo: Nếu bạn không chủ động thực hiện giao dịch, tài khoản của bạn có thể đang bị lộ mật khẩu.",
      ],
      is_demo: true,
      analyzed_at: "2026-11-02T10:00:00.000Z",
    },
  },
];
