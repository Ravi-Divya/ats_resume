import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const VISION_MODEL = 'llama-3.2-11b-vision-preview'

const VISION_PROMPT = `You are a precise OCR engine for resumes. Extract ALL text from this resume image verbatim and in reading order, preserving section headings, bullet points, and line breaks. Do not summarize, do not add commentary. Output only the extracted text.`

const SYSTEM_PROMPT = `You are a senior ATS (Applicant Tracking System) resume expert and hiring manager with 15+ years of experience reviewing resumes for Fortune 500 companies.

Analyze the provided resume text for ATS compatibility and job-market effectiveness. Be strict, realistic, and specific. Score like a real recruiter would: excellent resumes with strong keywords, quantified achievements, and clean structure score 85-95; average resumes score 50-65; weak resumes score below 45.

Respond ONLY with valid JSON matching this exact schema (no markdown, no code fences):
{
  "score": number (integer 0-100),
  "scoreLabel": "Excellent" | "Good" | "Average" | "Below Average" | "Needs Work",
  "scoreSummary": string (2-3 sentences),
  "categories": [
    { "name": "Contact & header info", "score": number 0-100, "maxScore": 100, "feedback": string, "details": string[] },
    { "name": "Education", "score": number 0-100, "maxScore": 100, "feedback": string, "details": string[] },
    { "name": "Work experience", "score": number 0-100, "maxScore": 100, "feedback": string, "details": string[] },
    { "name": "Skills & keywords", "score": number 0-100, "maxScore": 100, "feedback": string, "details": string[] },
    { "name": "Formatting & structure", "score": number 0-100, "maxScore": 100, "feedback": string, "details": string[] }
  ],
  "tags": [{ "label": string, "type": "success" | "warning" | "error" }],
  "presentKeywords": string[],
  "missingKeywords": string[] (up to 20, most valuable first),
  "suggestions": [{ "type": "skill" | "keyword" | "format" | "section", "priority": "high" | "medium" | "low", "title": string, "description": string }]
}

Rules:
- score must equal the weighted average of categories: contact 15%, education 15%, experience 30%, skills 25%, formatting 15%.
- Categories MUST use the exact names above, in that order, all 5 present.
- Tags: 2-5 tags covering sections present, keyword density, metrics, formatting, and overall quality.
- Suggestions: 3-8 concrete, actionable suggestions, ordered by priority (high first).`;

interface CategoryScore {
  name: string
  score: number
  maxScore: number
  feedback: string
  details: string[]
}

interface AnalysisResult {
  score: number
  scoreLabel: string
  scoreSummary: string
  categories: CategoryScore[]
  tags: { label: string; type: 'success' | 'warning' | 'error' }[]
  missingKeywords: string[]
  presentKeywords: string[]
  suggestions: {
    type: 'skill' | 'keyword' | 'format' | 'section'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
  }[]
}

const EXPECTED_CATEGORIES = [
  'Contact & header info',
  'Education',
  'Work experience',
  'Skills & keywords',
  'Formatting & structure',
]

function normalizeResult(raw: unknown): AnalysisResult | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const score = Math.round(Number(r.score))
  if (!Number.isFinite(score) || score < 0 || score > 100) return null

  const categories = Array.isArray(r.categories)
    ? (r.categories as CategoryScore[]).filter(
        (c) => c && typeof c.score === 'number' && typeof c.feedback === 'string',
      )
    : []
  if (categories.length !== 5) return null
  const names = EXPECTED_CATEGORIES.join('|')
  for (const c of categories) {
    if (!new RegExp(`^${names}$`, 'i').test(c.name)) return null
  }

  const toStrArray = (v: unknown, limit: number): string[] =>
    Array.isArray(v)
      ? v.filter((s): s is string => typeof s === 'string').slice(0, limit)
      : []

  return {
    score,
    scoreLabel: typeof r.scoreLabel === 'string' ? r.scoreLabel : 'Good',
    scoreSummary: typeof r.scoreSummary === 'string' ? r.scoreSummary : '',
    categories: categories.map((c) => ({
      ...c,
      score: Math.max(0, Math.min(100, Math.round(c.score))),
      maxScore: 100,
      details: toStrArray(c.details, 12),
    })),
    tags: Array.isArray(r.tags)
      ? (r.tags as { label: string; type: string }[])
          .filter((t) => t && typeof t.label === 'string')
          .slice(0, 6)
          .map((t) => ({
            label: t.label,
            type: (['success', 'warning', 'error'].includes(t.type) ? t.type : 'warning') as
              | 'success'
              | 'warning'
              | 'error',
          }))
      : [],
    presentKeywords: toStrArray(r.presentKeywords, 30),
    missingKeywords: toStrArray(r.missingKeywords, 20),
    suggestions: Array.isArray(r.suggestions)
      ? (r.suggestions as {
          type: string
          priority: string
          title: string
          description: string
        }[])
          .filter((s) => s && typeof s.title === 'string')
          .slice(0, 8)
          .map((s) => ({
            type: (['skill', 'keyword', 'format', 'section'].includes(s.type) ? s.type : 'format') as
              | 'skill'
              | 'keyword'
              | 'format'
              | 'section',
            priority: (['high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium') as
              | 'high'
              | 'medium'
              | 'low',
            title: s.title,
            description: typeof s.description === 'string' ? s.description : '',
          }))
      : [],
  }
}

export async function POST(request: NextRequest) {
  let body: { text?: string; image?: { data?: string; mime?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.startsWith('placeholder')) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not configured on the server' },
      { status: 503 },
    )
  }

  // Resolve resume text from either a PDF-extracted string or an image (via vision OCR).
  let text: string | null = null

  if (typeof body.text === 'string' && body.text.trim()) {
    text = body.text.trim()
  } else if (body.image && typeof body.image.data === 'string' && typeof body.image.mime === 'string') {
    const { data, mime } = body.image
    const allowedMimes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedMimes.includes(mime)) {
      return NextResponse.json(
        { error: 'Unsupported image type. Use PNG, JPG, or WEBP' },
        { status: 400 },
      )
    }
    if (data.length > 14_000_000) {
      return NextResponse.json({ error: 'Image is too large (max ~10 MB)' }, { status: 413 })
    }

    try {
      const visionResponse = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: VISION_MODEL,
          temperature: 0,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: VISION_PROMPT },
                { type: 'image_url', image_url: { url: `data:${mime};base64,${data}` } },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(28_000),
      })

      if (!visionResponse.ok) {
        console.error('Groq vision error:', visionResponse.status)
        return NextResponse.json(
          { error: `Image text extraction failed (${visionResponse.status})` },
          { status: 502 },
        )
      }

      const visionData = await visionResponse.json()
      const extracted: string | undefined = visionData?.choices?.[0]?.message?.content
      if (!extracted || extracted.trim().length < 50) {
        return NextResponse.json(
          { error: 'Could not extract readable text from the image. Try a clearer photo or upload a PDF.' },
          { status: 422 },
        )
      }
      text = extracted.trim()
    } catch (err) {
      console.error('Vision extraction failed:', err)
      return NextResponse.json(
        { error: 'Image analysis service unavailable' },
        { status: 502 },
      )
    }
  }

  if (!text) {
    return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
  }
  if (text.length < 50) {
    return NextResponse.json(
      { error: 'Resume text is too short to analyze (min 50 characters)' },
      { status: 400 },
    )
  }
  if (text.length > 60_000) {
    return NextResponse.json(
      { error: 'Resume text is too large (max 60,000 characters)' },
      { status: 413 },
    )
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      }),
      signal: AbortSignal.timeout(28_000),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error('Groq API error:', response.status, detail.slice(0, 300))
      return NextResponse.json(
        { error: `Groq API error (${response.status})` },
        { status: 502 },
      )
    }

    const data = await response.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Empty response from Groq' }, { status: 502 })
    }

    const cleaned = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as unknown
    const result = normalizeResult(parsed)
    if (!result) {
      return NextResponse.json({ error: 'Invalid analysis output' }, { status: 502 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analysis failed:', err)
    return NextResponse.json({ error: 'Analysis service unavailable' }, { status: 502 })
  }
}
