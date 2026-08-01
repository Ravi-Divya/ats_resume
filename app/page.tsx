'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Gauge, LayoutTemplate, Download, Check } from 'lucide-react'
import { getUser, signIn, signUp } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'signin' | 'signup'

const highlights = [
  { icon: Gauge, text: 'AI-powered ATS score in seconds' },
  { icon: LayoutTemplate, text: '6 Overleaf-inspired templates' },
  { icon: Download, text: 'Download your resume as PDF' },
]

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (getUser()) {
      router.replace('/home')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, fullName)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.user) {
      toast.success(
        mode === 'signin'
          ? `Welcome back, ${result.user.fullName || result.user.email}!`
          : `Welcome to ResumeATS, ${result.user.fullName || result.user.email}!`,
      )
      router.replace('/home')
      router.refresh()
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(165,63,36,0.12),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(140,98,214,0.10),transparent_55%)]" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <LinkLogo />
          <p className="text-sm text-muted-foreground mt-3">
            Analyze, optimize, and build resumes that beat the bots.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
          {/* Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
                  mode === m
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Get started free'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === 'signin'
              ? 'Sign in to analyze your resume and access templates.'
              : 'Create your account — takes less than 30 seconds.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-2 border-border focus:border-primary"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-border focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-2 border-border focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        {/* Highlights */}
        <div className="mt-8 space-y-2.5">
          {highlights.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-success" />
              </span>
              <span className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-primary" />
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LinkLogo() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <img
        src="/icon.svg"
        alt="ResumeATS logo"
        className="w-12 h-12 rounded-xl shadow-md shadow-primary/30"
      />
      <span className="text-2xl font-bold text-foreground tracking-tight">
        Resume<span className="text-primary">ATS</span>
      </span>
    </div>
  )
}
