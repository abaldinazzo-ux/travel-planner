'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'

    const variants = {
      primary:   'bg-coral text-white hover:bg-coral/85 active:scale-[0.97]',
      secondary: 'bg-[#1A2E42] text-sand hover:bg-[#1e3550]',
      ghost:     'text-[#6B8FA8] hover:text-sand hover:bg-white/5',
      danger:    'bg-red-600/80 text-white hover:bg-red-600 active:scale-[0.97]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-sm',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
