'use client';

import { useEffect, useState } from 'react';
import type { CategoryScore } from '@/lib/resume-analyzer';

interface ScoreDisplayProps {
  score: number;
  scoreLabel: string;
  scoreSummary: string;
  categories: CategoryScore[];
  tags: { label: string; type: 'success' | 'warning' | 'error' }[];
}

export function ScoreDisplay({ score, scoreLabel, scoreSummary, categories = [], tags = [] }: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [score]);
  
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success';
    if (s >= 55) return 'text-warning';
    return 'text-destructive';
  };
  
  const getScoreBg = () => {
    if (score >= 80) return 'bg-success/10 border-success';
    if (score >= 55) return 'bg-warning/10 border-warning';
    return 'bg-destructive/10 border-destructive';
  };
  
  const getBarColor = (s: number, max: number) => {
    const percent = (s / max) * 100;
    if (percent >= 80) return 'bg-success';
    if (percent >= 55) return 'bg-warning';
    return 'bg-orange-500';
  };
  
  const getTagStyle = (type: 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success': return 'bg-success/20 text-success border-success/40';
      case 'warning': return 'bg-warning/20 text-warning border-warning/40';
      case 'error': return 'bg-destructive/20 text-destructive border-destructive/40';
    }
  };
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getStrokeColor = () => {
    if (score >= 80) return 'stroke-success';
    if (score >= 55) return 'stroke-warning';
    return 'stroke-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className={`p-6 rounded-2xl border-2 ${getScoreBg()}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Score Circle */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="56"
                cy="56"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-out ${getStrokeColor()}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {animatedScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          
          {/* Score Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-foreground mb-1">
              ATS Score — {scoreLabel}
            </h2>
            <p className="text-sm text-muted-foreground mb-3 text-pretty">
              {scoreSummary}
            </p>
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTagStyle(tag.type)}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Score Breakdown */}
      <div className="p-6 bg-card border-2 border-border rounded-2xl">
        <h3 className="text-lg font-bold text-foreground mb-4">Score breakdown</h3>
        
        {categories.length > 0 && (
          <div className="space-y-5">
            {categories.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="font-bold text-foreground">{category.score}/{category.maxScore}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(category.score, category.maxScore)}`}
                    style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                  />
                </div>
                
                {/* Feedback */}
                <p className="text-xs text-muted-foreground">{category.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
