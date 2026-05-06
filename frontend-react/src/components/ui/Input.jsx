import { cn } from '../../lib/utils'

export function Input({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          'transition-colors duration-150 bg-white text-sm',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          'transition-colors duration-150 bg-white text-sm resize-none',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
