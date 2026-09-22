import type { ReactNode } from 'react'
import { cn } from '@shared/lib/format'

interface RibbonGroupProps {
  label: string
  children: ReactNode
  className?: string
}

export function RibbonGroup({ label, children, className }: RibbonGroupProps) {
  return (
    <div className={cn('flex flex-col items-center border-r border-neutral-200 px-2', className)}>
      <div className="flex flex-1 items-center gap-1">{children}</div>
      <div className="text-[10px] text-neutral-400">{label}</div>
    </div>
  )
}
