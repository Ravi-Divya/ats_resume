"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { resumeTemplates } from "@/lib/templates"
import { getUser } from "@/lib/auth"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Check, LayoutTemplate, PenLine, ArrowLeft } from "lucide-react"

const categories = ["all", "professional", "modern", "technical", "creative", "simple"] as const

export default function TemplatesPage() {
  const router = useRouter()
  const [category, setCategory] = useState<(typeof categories)[number]>("all")
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!getUser()) {
      router.replace("/")
    } else {
      setChecked(true)
    }
  }, [router])

  const filtered =
    category === "all"
      ? resumeTemplates
      : resumeTemplates.filter((t) => t.category === category)

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
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(140,98,214,0.10),transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-5">
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Templates</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                ATS-Optimized Resume Templates
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Six layouts inspired by the most popular LaTeX templates on Overleaf — reimagined
                to parse cleanly through every ATS system.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-14">
          <div className="max-w-7xl mx-auto px-4">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors capitalize cursor-pointer ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:border-primary hover:bg-primary/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((template) => (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="group"
                >
                  <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col h-full">
                    {/* Preview */}
                    <div className="h-48 bg-muted relative overflow-hidden">
                      <img
                        src={`/templates/${template.id}.svg`}
                        alt={`${template.name} preview`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-foreground shadow">
                        {template.inspiredBy}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-foreground mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {template.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/50 text-accent-foreground"
                          >
                            <Check className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        <PenLine className="w-4 h-4" />
                        Use this template
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
