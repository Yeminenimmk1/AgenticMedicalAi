import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn('px-6 py-5 border-b border-slate-100', className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h3>
}

export function CardContent({ children, className }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}
