'use client';

import { AlertCircle, Lightbulb, Sparkles, Layout } from 'lucide-react';
import type { Suggestion } from '@/lib/resume-analyzer';

interface SuggestionsListProps {
  suggestions: Suggestion[];
}

export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'skill':
        return <Sparkles className="w-5 h-5" />;
      case 'keyword':
        return <Lightbulb className="w-5 h-5" />;
      case 'format':
        return <Layout className="w-5 h-5" />;
      case 'section':
        return <AlertCircle className="w-5 h-5" />;
    }
  };
  
  const getPriorityStyles = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-primary/10 border-primary/30 text-primary';
      case 'medium':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'low':
        return 'bg-accent/10 border-accent/30 text-accent';
    }
  };
  
  const getPriorityLabel = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Nice to Have';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Suggestions to Improve</h3>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-4 bg-card border-2 border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getPriorityStyles(suggestion.priority)}`}>
                {getIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityStyles(suggestion.priority)}`}>
                    {getPriorityLabel(suggestion.priority)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
