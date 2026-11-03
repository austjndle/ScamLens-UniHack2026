# 🛡️ ScamLens — Think Before You Transfer
> **Fintech AI-Powered Financial Fraud Awareness & Scam Risk Analysis**
> *Developed for UniHack HCMC 2026*

🌐 **Live Production App:** [https://scam-lens-uni-hack2026.vercel.app](https://scam-lens-uni-hack2026.vercel.app)
📦 **GitHub Repository:** [https://github.com/austjndle/ScamLens-UniHack2026](https://github.com/austjndle/ScamLens-UniHack2026)
🔺 **Avalanche Fuji Testnet:** Chain ID `43113` (SnowTrace Explorer)

---
## 📌 Executive Summary

**ScamLens** is an AI-powered financial safety companion designed to protect Vietnamese citizens, university students, and small merchants from escalating digital payment fraud and social engineering scams.

By combining Google's **Gemini 3.8 Flash** multimodal AI with domain-specific cybersecurity heuristics (Zero-Request URL inspection, brand impersonation detection, and manipulative urgency scoring), ScamLens evaluates suspicious SMS messages, phishing links, and bank transfer screenshots in under 3 seconds.

---

## 🚀 Key Features

1. **AI Scam Message Analyzer (Văn bản)**
   - Paste suspicious bank alert SMS, Zalo emergency borrow requests, or Telegram investment ads.
   - Detects manipulative urgency, authority impersonation, financial bait, and sensitive OTP requests.
   - Outputs a calibrated **Heuristic Risk Score (0-100)** and categorical risk level (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).

2. **Multimodal Screenshot Inspector (Ảnh chụp màn hình)**
   - Upload Zalo/Messenger chats, fake banking balance notices, or QR payment screenshots.
   - Ephemeral in-memory image processing; no user images or personal data are permanently stored on server disks.

3. **Safe Link & Domain Analysis (Đường link / URL)**
   - **Zero-Request Inspection:** Evaluates TLDs, lookalike banking domains, and spoofed government portals (`.app`, `.vip`, `.xyz`, fake `-gov-` or `-vneid` prefixes) without opening untrusted connections or downloading remote payloads.
   - Strict SSRF protection preventing loops against `localhost`, `127.0.0.1`, and private IP ranges.

4. **Conversational AI Safety Advisor (Trợ lý an toàn)**
   - Ask real-time questions about suspicious phone calls or financial demands.
   - System prompts strictly prohibit asking for OTPs, passwords, or personal banking credentials.

5. **Interactive Demo Mode with 6 Realistic Scenarios**
   - Fake Vietcombank SMS (`CRITICAL`)
   - Hospital Emergency Relative Impersonation (`HIGH`)
   - 30%/day Forex/Crypto Ponzi (`CRITICAL`)
   - Fake VNeID Governmental APK Phishing (`CRITICAL`)
   - Fake Delivery & Lucky Draw Shipping Fee COD (`HIGH`)
   - **Benign Baseline Scenario:** Legitimate Techcombank OTP (`LOW` - proves the engine does not falsely flag every financial communication as fraud).

6. **Bilingual & Responsive Fintech UI/UX**
   - Seamless Vietnamese (`VIE`) and English (`ENG`) language toggle.
   - Dark mode & Light mode with glassmorphic cards and accessible contrast ratios.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4 with custom fintech glassmorphism design tokens
- **AI Engine:** Official Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash`
- **Validation:** Zod 3 strict schemas for inputs, outputs, and assistant requests
- **Security:**
  - Token-bucket in-memory rate limiting (15 requests/min per IP)
  - SSRF guard against loopback and private subnet probes
  - Anti-clickjacking (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`)
  - Strict input size limits (max 5,000 chars text, max 7MB screenshots)

---

## ⚙️ Quickstart & Local Setup

### 1. Prerequisites
- Node.js 18+ or 20+ (Node v26.13 tested)
- npm 9+

### 2. Installation
```bash
cd ScamLens
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the `ScamLens/` directory:
```env
# Optional: Provide Google Gemini API Key for live AI generation.
# If omitted or offline, ScamLens seamlessly falls back to its built-in
# Vietnamese financial threat heuristic rules engine.
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

NEXT_PUBLIC_APP_NAME=ScamLens
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Tests
```bash
npm test
```
Runs 11 automated unit and integration tests covering:
- Schema validation for all 6 demo scenarios
- Input sanitization & boundary rejection
- SSRF prevention on loopback and private networks
- High-risk phishing detection
- Benign vs scam classification accuracy
- Rate limiter token bucket behavior
- API endpoints (`/api/demo-scenarios`, `/api/analyze`, `/api/assistant`)

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🌐 Deployment Instructions

### Vercel (Recommended)
1. Deploy `ScamReportRegistry` to Avalanche Fuji using a wallet funded with testnet AVAX:
   ```bash
   DEPLOYER_PRIVATE_KEY=... npx hardhat run scripts/deploy-fuji.cjs --network fuji
   ```
   Never commit or paste the private key into source control or a public chat.
2. Copy the printed contract address into Vercel Production Environment Variables:
   `NEXT_PUBLIC_SCAM_REGISTRY_ADDRESS=0x...`
3. Add `GEMINI_API_KEY` (and `GEMINI_MODEL=gemini-3.8-flash`).
4. Deploy with the `ScamLens` directory as the Vercel Root Directory.

If you do not want to export a wallet private key, use the local MetaMask deployment helper:
```bash
npm run build
node scripts/deploy-fuji-browser.mjs
```
Open `http://127.0.0.1:43113`, click the deploy button, and confirm the deployment in MetaMask. The helper never receives a seed phrase or private key.

### Docker / VPS
Build the standalone Next.js image using standard Node 20 LTS base:
```bash
docker build -t scamlens:latest .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" scamlens:latest
```

---

## ⚖️ Ethical & Educational Disclaimer

ScamLens is an educational risk assessment and consumer awareness prototype developed for hackathon presentation purposes. It is not a financial institution, credit rating agency, or definitive fraud investigator. Heuristic risk scores are informational indicators.
