'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  BarChart3,
  Bot,
  Gauge,
  LayoutTemplate,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { getUser } from '@/lib/auth'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { ResumeUpload } from '@/components/resume-upload'
import { ScoreDisplay } from '@/components/score-display'
import { SuggestionsList } from '@/components/suggestions-list'
import { KeywordsDisplay } from '@/components/keywords-display'
import { analyzeResume, type AnalysisResult } from '@/lib/resume-analyzer'
import { Button } from '@/components/ui/button'

type AnalysisPayload = { text?: string; image?: { data: string; mime: string } }

export default function AnalyzerPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [analysisSource, setAnalysisSource] = useState<'ai' | 'offline' | null>(null)

  useEffect(() => {
    if (!getUser()) {
      router.replace('/')
    } else {
      setChecked(true)
    }
  }, [router])

  const runAnalysis = useCallback(async (payload: AnalysisPayload) => {
    setIsAnalyzing(true)
    setResult(null)
    setAnalysisSource(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = (await res.json()) as AnalysisResult
        setResult(data)
        setAnalysisSource('ai')
      } else {
        const err = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(err?.error || 'AI unavailable')
      }
    } catch (err) {
      if (payload.text) {
        // Graceful fallback to the offline heuristic analyzer.
        await new Promise((resolve) => setTimeout(resolve, 800))
        setResult(analyzeResume(payload.text))
        setAnalysisSource('offline')
      } else {
        toast.error(
          err instanceof Error && err.message !== 'AI unavailable'
            ? err.message
            : 'AI analysis is unavailable right now. Please try uploading a PDF instead.',
        )
      }
    } finally {
      setIsAnalyzing(false)
      document
        .getElementById('results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleTextExtracted = useCallback(
    (text: string) => runAnalysis({ text }),
    [runAnalysis],
  )

  const handleImageSelected = useCallback(
    (base64: string, mime: string) => runAnalysis({ image: { data: base64, mime } }),
    [runAnalysis],
  )

  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(165,63,36,0.10),transparent_60%)]" />
          <div className="max-w-6xl mx-auto px-4 pt-6 pb-8 md:pt-8 md:pb-10">
            <div className="flex justify-start mb-4">
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-5">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Resume Analyzer</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight text-balance">
                How ATS-friendly is your resume?
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Upload a <strong className="text-foreground">PDF or a photo</strong> of your resume.
                Our AI scores it across 5 categories and tells you exactly what to fix.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <ResumeUpload
              onTextExtracted={handleTextExtracted}
              onImageSelected={handleImageSelected}
              isAnalyzing={isAnalyzing}
            />

            {/* Loading State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
                <p className="text-muted-foreground font-medium">
                  AI is analyzing your resume...
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Scoring contact info, education, experience, skills &amp; formatting
                </p>
              </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
              <div
                id="results"
                className="space-y-6 animate-in fade-in duration-500 mt-10 scroll-mt-24"
              >
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                      analysisSource === 'ai'
                        ? 'bg-accent/10 border-accent/30 text-accent'
                        : 'bg-muted border-border/50 text-muted-foreground'
                    }`}
                  >
                    {analysisSource === 'ai' ? (
                      <>
                        <Bot className="w-3.5 h-3.5" />
                        AI-Powered Analysis
                      </>
                    ) : (
                      <>
                        <Gauge className="w-3.5 h-3.5" />
                        Offline Heuristic Analysis
                      </>
                    )}
                  </span>
                </div>

                <ScoreDisplay
                  score={result.score}
                  scoreLabel={result.scoreLabel}
                  scoreSummary={result.scoreSummary}
                  categories={result.categories}
                  tags={result.tags}
                />

                {/* CTA */}
                <div className="p-6 bg-primary/10 border-2 border-primary/30 rounded-2xl text-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {result.score >= 70
                      ? 'Great start — now make it unstoppable.'
                      : 'Ready to fix these issues?'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Rebuild your resume with an ATS-optimized, Overleaf-inspired template.
                  </p>
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/30"
                  >
                    <Link href="/templates">
                      <LayoutTemplate className="w-4 h-4 mr-2" />
                      Explore Templates
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {/* Keywords Section */}
                <div className="p-6 bg-card border-2 border-border rounded-2xl">
                  <KeywordsDisplay
                    presentKeywords={result.presentKeywords}
                    missingKeywords={result.missingKeywords}
                  />
                </div>

                {/* Suggestions Section */}
                {result.suggestions.length > 0 && (
                  <div className="p-6 bg-card border-2 border-border rounded-2xl">
                    <SuggestionsList suggestions={result.suggestions} />
                  </div>
                )}

                {/* Tips */}
                <div className="p-6 bg-accent/10 border-2 border-accent/30 rounded-2xl">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Quick Tips for Better ATS Scores
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      'Use standard section headings',
                      'Include relevant keywords from job descriptions',
                      'Add quantifiable achievements (%, $, numbers)',
                      'Use a clean, single-column layout',
                      'Start bullet points with action verbs',
                      'Spell out acronyms at least once',
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !isAnalyzing && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Your AI analysis will appear here — try it, it&apos;s free.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
