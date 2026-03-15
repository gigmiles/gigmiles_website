import React from 'react';

interface MobileInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'tel' | 'email';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

export function MobileInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  suffix,
  error,
  inputMode,
}: MobileInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-foreground/80 mb-2">
        {label}
      </label>
      
      <div className={`
        flex items-center gap-2
        bg-background rounded-xl
        border-2 transition-colors
        ${error ? 'border-destructive' : 'border-border focus-within:border-primary'}
        px-4
      `}>
        {prefix && (
          <span className="text-lg font-semibold text-muted-foreground">{prefix}</span>
        )}
        
        <input
          type={type}
          inputMode={inputMode || (type === 'number' ? 'decimal' : 'text')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            flex-1 py-4
            text-base font-medium text-foreground
            bg-transparent
            outline-none
            placeholder:text-muted-foreground
          "
          // Prevent zoom on iOS (MUST be 16px+)
          style={{ fontSize: '16px' }}
        />
        
        {suffix && (
          <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
