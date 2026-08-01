import { FileText } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/icon.svg"
              alt="ResumeATS logo"
              className="w-8 h-8 rounded-lg shadow-md shadow-primary/30"
            />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Resume<span className="text-primary">ATS</span>
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 All rights reserved. Developed by Ravi Divya
          </p>
        </div>
      </div>
    </footer>
  )
}
