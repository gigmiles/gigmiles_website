import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

        const variants = {
            primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
            outline: 'border border-slate-200 hover:bg-slate-100',
            ghost: 'hover:bg-slate-100 text-slate-700',
        }

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-10 py-2 px-4',
            lg: 'h-11 px-8 text-lg',
        }

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'
