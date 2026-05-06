import { cn } from '../../lib/utils'

export function Button({ children, className, variant = 'primary', size = 'md', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm',
    secondary: 'bg-blue-800 text-white hover:bg-blue-900 focus:ring-blue-600 shadow-sm',
    outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
