'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const VARIANTS: Record<string, React.CSSProperties> = {
  primary: {
    background: 'rgba(255, 107, 74, 0.88)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 107, 74, 0.45)',
    color: 'white',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.09)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    color: 'rgba(255,255,255,0.85)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'rgba(255,255,255,0.5)',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.75)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: 'white',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', style, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed select-none'
    const transition = 'transition-all duration-200 cubic-bezier(0.4,0,0.2,1)'

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    }

    const hoverClass = {
      primary:   'hover:opacity-100 active:scale-[0.97]',
      secondary: 'hover:bg-white/14 active:scale-[0.97]',
      ghost:     'hover:bg-white/8 hover:text-white/80',
      danger:    'hover:opacity-100 active:scale-[0.97]',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${transition} ${sizes[size]} ${hoverClass[variant]} ${className}`}
        style={{ ...VARIANTS[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
