'use client';

import { Check, Plus } from 'lucide-react';

interface KeywordsDisplayProps {
  presentKeywords: string[];
  missingKeywords: string[];
}

export function KeywordsDisplay({ presentKeywords, missingKeywords }: KeywordsDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Found Keywords */}
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
          <Check className="w-5 h-5 text-success" />
          Keywords Found ({presentKeywords.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {presentKeywords.length > 0 ? (
            presentKeywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1.5 text-sm font-medium bg-success/10 text-success border border-success/30 rounded-full"
              >
                {keyword}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No keywords detected yet</p>
          )}
        </div>
      </div>
      
      {/* Suggested Keywords */}
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
          <Plus className="w-5 h-5 text-primary" />
          Suggested Keywords to Add
        </h3>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.slice(0, 12).map((keyword) => (
            <span
              key={keyword}
              className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/30 rounded-full"
            >
              + {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
