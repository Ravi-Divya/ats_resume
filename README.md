# ResumeATS — ATS Resume Analyzer & Builder

A production-ready SaaS web app that uses **Groq's fast LLM API** to analyze resumes for **Applicant Tracking System (ATS)** compatibility and helps job seekers build ATS-optimized resumes from 6 professionally designed templates.

> **75% of resumes are rejected by ATS software before a human reads them.** ResumeATS tells you exactly why yours gets filtered out — and gives you the tools to fix it.

---

Live Link:https://atsresume-ravidivya.onrender.com

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🖼️ **Upload PDF *or* Image** | Drag-and-drop a PDF (parsed in-browser) or a photo/screenshot of your resume — Groq's vision model extracts the text for you |
| 🤖 **AI-Powered ATS Analysis** | Your resume is scored by Groq's `llama-3.3-70b-versatile` model — recruiter-level feedback in seconds |
| 🎯 **Weighted 0–100 Score** | The AI scores 5 categories: Contact Info (15%), Education (15%), Work Experience (30%), Skills & Keywords (25%), Formatting (15%) |
| 🔑 **Keyword Detection** | The AI highlights which keywords your resume matches and which ones recruiters expect |
| 💡 **Prioritized Suggestions** | High/medium/low priority fixes: add metrics, action verbs, missing sections, and keywords |
| 📋 **6 Overleaf-Inspired Templates** | Classic Professional (Jake's Resume), Modern Minimal (Deedy), Tech Developer, Data Scientist (AltaCV), Creative Edge (Candy), Simple Clean — gallery shows realistic SVG previews of each layout |
| ✏️ **Full Resume Editor** | Personal info, experience, education, skills, certifications, and projects tabs with a live A4 preview — drag the divider to resize editor vs. preview (mobile gets a floating preview toggle) |
| 📥 **Download as PDF** | Print-ready A4 PDF export via the browser print pipeline |
| 🔐 **Instant Sign-In** | Zero-friction auth stored in your browser — no email servers, no failed fetches |
| 🧠 **Smart Fallback** | If the Groq API is unavailable, a built-in heuristic analyzer still produces a useful score |
| 🎨 **Branded UI** | Custom "ATS" favicon and logo (navbar, footer, login, editor), soft colored shadows (no hard black borders), simple footer with developer credit |

---

## 🧭 App Flow (5 pages)

```
1. /                      →  Login page (sign in / create account)
2. /home                  →  Dashboard: "Resume Analyzer" + "Explore Templates" options + workflow
3. /analyzer              →  Upload PDF or image → AI ATS score, keywords & suggestions
4. /templates             →  Explore 6 Overleaf-inspired templates (filterable)
5. /templates/[templateId]→  Build your resume with live preview → download as PDF
```

- All pages except `/` require a session (redirected to login if not signed in)
- `GET /` redirects to `/home` when you're already signed in
- `/analyzer` and `/templates` show a "Back to Dashboard" link in the top-left corner
- The footer is a single clean line: *© 2026 All rights reserved. Developed by Ravi Divya*

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **Language:** TypeScript 5.7 (strict mode, type-checked at build)
- **Styling:** Tailwind CSS v4, shadcn-style UI components
- **AI Backend:** Groq API (`llama-3.3-70b-versatile`) — server-side route, key never exposed
- **PDF Parsing:** `pdfjs-dist` (client-side)
- **Auth & Saves:** Browser `localStorage` (no backend required)
- **Toasts:** `sonner` · **Icons:** `lucide-react`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+**
- **npm 10+**
- A API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then paste in your Groq key:

```env
GROQ_API_KEY=your-groq-api-key
```

> ⚠️ `GROQ_API_KEY` is **server-side only**. It is never sent to the browser. Without a valid key, the app still works — the built-in heuristic analyzer takes over automatically.

### 3. Run the dev server

```bash
npm run dev
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack, hot reload) |
| `npm run build` | Production build with full TypeScript type checking |
| `npm run start` | Serve the production build |

---

## 🤖 How the AI Analysis Works

1. **PDF upload** — text is extracted in your browser with `pdfjs-dist`; **image upload** — the image is sent to Groq's vision model (`llama-3.2-11b-vision-preview`) which returns the resume text
2. The text is sent to the server route `POST /api/analyze`
3. The server calls Groq with a strict, expert-tuned system prompt (senior ATS specialist persona) that returns a **validated JSON** report:
   - Overall 0–100 score (enforced to match the weighted category average)
   - 5 category scores with feedback and per-category details
   - Status tags, present/missing keywords, and 3–8 prioritized suggestions
4. The response is schema-validated server-side before being returned
5. If Groq is down, unreachable, or the key is missing, the client falls back to the offline heuristic analyzer and labels the result accordingly

**Input limits:** 50 – 60,000 characters per analysis (images up to ~10 MB). The endpoint enforces a 28s timeout and returns `503`/`502` gracefully when unavailable.

---

## 🗂️ Accounts & Saved Resumes

To keep deployment dead-simple and free, accounts and saved resumes live in your browser's `localStorage`:

- **Sign-up / sign-in** — instant, offline, never fails to fetch. Passwords are SHA-256 hashed before storage
- **Saved resumes** — stored under the `ats_saved_resumes` key
- **Session** — persists until you sign out or clear browser data

> For a production SaaS with cross-device sync and email auth, swap `lib/auth.ts` for a real auth provider (Supabase, Clerk, NextAuth) — the pages already call a simple `signIn`/`signUp`/`getUser` interface.

---

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata, toaster)
│   ├── page.tsx                  # Page 1: Login / sign-up
│   ├── globals.css               # Tailwind v4 theme + print styles
│   ├── api/
│   │   └── analyze/route.ts      # Groq AI analysis endpoint (text + image OCR)
│   ├── home/page.tsx             # Page 2: Dashboard (Start Free CTA, analyzer + templates cards, workflow)
│   ├── analyzer/page.tsx         # Page 3: Upload PDF/image → AI analysis
│   └── templates/
│       ├── page.tsx              # Page 4: Template gallery (filterable, SVG previews)
│       └── [templateId]/page.tsx # Page 5: Resume editor (draggable split preview + PDF download)
├── components/
│   ├── ui/                       # Minimal shadcn-style kit (button, input, sonner)
│   ├── app-header.tsx            # Shared dashboard header + mobile nav (ATS logo)
│   ├── app-footer.tsx            # Shared footer (brand + copyright credit)
│   ├── resume-upload.tsx         # Drag & drop PDF / image → extraction
│   ├── score-display.tsx         # Animated score ring + category breakdown
│   ├── suggestions-list.tsx      # Prioritized improvement suggestions
│   ├── keywords-display.tsx      # Found vs. missing keywords
│   └── template-renderer.tsx     # A4 resume renderer with 6 Overleaf-style templates
├── lib/
│   ├── auth.ts                   # localStorage auth (sign in / sign up / session)
│   ├── resume-analyzer.ts        # Offline heuristic ATS scoring (fallback)
│   ├── templates.ts              # 6 Overleaf-inspired template definitions
│   └── utils.ts                  # cn() class merge helper
├── public/                       # Favicon set (icon.svg, 32px PNGs, apple-icon) + template preview SVGs
├── next.config.mjs               # Security headers, Turbopack root, dev indicators disabled
├── render.yaml                   # Render Blueprint (auto-deploy)
├── .env.example                  # Env var template
└── package.json
```

---

## 🔒 Security & Privacy

- **`GROQ_API_KEY` stays on the server** — it only exists inside `app/api/analyze/route.ts` and is never bundled client-side
- The analysis endpoint validates input size (50–60k chars), enforces a timeout, and never logs resume contents
- PDF parsing happens **in the browser** — only extracted plain text is sent to the AI
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are applied globally in `next.config.mjs`, and `X-Powered-By` is disabled
- Passwords are SHA-256 hashed before being stored in `localStorage` (never plaintext)
- TypeScript runs in strict mode with **build-time type checking** (no `ignoreBuildErrors`)
- `npm audit` reports **0 vulnerabilities** (verified)

---


