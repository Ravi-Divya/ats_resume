'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, LayoutTemplate, Gauge, Home } from 'lucide-react'
import { getUser, signOut as authSignOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/analyzer', label: 'Analyzer', icon: Gauge },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
]

export function AppHeader() {
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleSignOut = () => {
    authSignOut()
    router.replace('/')
  }

  return (
    <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="/icon.svg"
            alt="ResumeATS logo"
            className="w-9 h-9 rounded-xl shadow-md shadow-primary/30"
          />
          <span className="text-lg font-bold text-foreground tracking-tight">
            Resume<span className="text-primary">ATS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === href
                  ? 'text-foreground bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
              {user?.fullName || user?.email || 'Account'}
            </span>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1.5">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex border-t border-border/40">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
              pathname === href ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
