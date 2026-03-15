import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        {icon || (
          <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-foreground mb-3">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-base text-muted-foreground mb-8 max-w-sm leading-relaxed">
        {description}
      </p>
      
      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl active:scale-95 transition-transform shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
