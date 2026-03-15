import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="grid w-full items-center gap-1.5">
        {label && (
          <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "file:text-white placeholder:text-slate-500 selection:bg-primary/30 selection:text-white bg-white/[0.06] border-white/[0.12] text-white h-12 w-full min-w-0 rounded-xl border px-4 py-2 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-white/[0.18] hover:bg-white/[0.08]",
            "focus-visible:border-[#10B981]/50 focus-visible:ring-2 focus-visible:ring-[#10B981]/25 focus-visible:bg-white/[0.08]",
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            className
          )}
          style={{ fontSize: '16px', ...props.style }}
          {...props}
        />
        {error && (
          <p className="text-[0.8rem] font-medium text-destructive animate-fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
