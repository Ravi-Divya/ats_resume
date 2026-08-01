'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Gauge,
  LayoutTemplate,
  Upload,
  BarChart3,
  Download,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react'
import { getUser } from '@/lib/auth'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { Button } from '@/components/ui/button'

const options = [
  {
    href: '/analyzer',
    icon: Gauge,
    title: 'Resume Analyzer',
    description:
      'Upload your resume as a PDF or image and get a real AI-powered ATS score with prioritized suggestions from Groq.',
    cta: 'Analyze My Resume',
    accent: 'from-primary/15 to-accent/10 border-primary/25',
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    href: '/templates',
    icon: LayoutTemplate,
    title: 'Explore Templates',
    description:
      'Browse 6 Overleaf-inspired resume templates — Classic Professional, Deedy, AltaCV and more — and build yours.',
    cta: 'Explore Templates',
    accent: 'from-accent/15 to-primary/10 border-accent/25',
    iconBg: 'bg-accent/10 text-accent',
  },
]

const workflow = [
  {
    icon: Upload,
    title: '1. Analyze',
    description: 'Upload your current resume (PDF or image) and get an AI ATS score in seconds.',
  },
  {
    icon: LayoutTemplate,
    title: '2. Explore',
    description: 'Pick from 6 Overleaf-inspired templates designed to parse through every ATS.',
  },
  {
    icon: Download,
    title: '3. Export',
    description: 'Fill in your details with a live preview and download a print-ready PDF.',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null)

  useEffect(() => {
    const current = getUser()
    if (!current) {
      router.replace('/')
    } else {
      setUser(current)
      setChecked(true)
    }
  }, [router])

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
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(165,63,36,0.12),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(140,98,214,0.10),transparent_55%)]" />
          <div className="max-w-6xl mx-auto px-4 pt-8 pb-10 md:pt-10 md:pb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight text-balance">
              Beat the bots. <span className="text-primary">Get the interview.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              75% of resumes never reach a human. Find out exactly what&apos;s holding yours back —
              then rebuild it with an ATS-optimized template.
            </p>
          </div>
        </section>

        {/* Main options */}
        <section className="max-w-6xl mx-auto px-4 pb-14">
          <div className="text-center mb-10">
            <Button
              asChild
              size="lg"
              className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
            >
              <Link href="/analyzer">
                <FileText className="w-5 h-5 mr-2" />
                Start with a Free Analysis
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {options.map(({ href, icon: Icon, title, description, cta, accent, iconBg }) => (
              <Link
                key={href}
                href={href}
                className={`group bg-card border-2 rounded-2xl p-7 md:p-8 bg-gradient-to-br ${accent} hover:-translate-y-1 transition-all shadow-sm hover:shadow-lg flex flex-col`}
              >
                <div className={`w-13 h-13 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${iconBg}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{title}</h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                  {description}
                </p>
                <span className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-primary/30 group-hover:bg-primary/90 transition-colors">
                  {cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="bg-card border-y border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-4">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Workflow</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                From rejected to shortlisted in 3 steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {workflow.map(({ icon: Icon, title, description }, idx) => (
                <div key={title} className="relative bg-background border-2 border-border rounded-2xl p-6 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-4xl font-bold text-foreground/10 tracking-tight">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
