import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
          variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
          variant === 'outline' && 'border border-slate-700 bg-slate-900 text-slate-50 hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
          variant === 'secondary' && 'bg-slate-800 text-slate-50 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
          variant === 'ghost' && 'text-slate-50 hover:bg-slate-800 dark:hover:bg-slate-800',
          variant === 'link' && 'text-blue-500 underline-offset-4 hover:underline dark:text-blue-400',
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-9 rounded-lg px-3 text-sm',
          size === 'lg' && 'h-11 rounded-lg px-8',
          size === 'icon' && 'h-10 w-10',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, type ButtonProps }
