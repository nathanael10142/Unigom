import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary',
      outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
      ghost: 'text-text-primary hover:bg-hover-bg focus:ring-primary',
      danger: 'bg-error hover:bg-red-600 text-white focus:ring-error',
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
