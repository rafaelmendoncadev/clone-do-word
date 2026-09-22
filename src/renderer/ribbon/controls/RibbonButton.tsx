import type { ReactNode } from 'react'
import { cn } from '@shared/lib/format'

interface RibbonButtonProps {
  icon: ReactNode
  label?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  size?: 'sm' | 'lg'
  title?: string
}

export function RibbonButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  size = 'sm',
  title
}: RibbonButtonProps) {
  return (
    <button
      title={title || label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center rounded transition-colors',
        size === 'lg' ? 'h-14 w-16 gap-0.5' : 'h-8 w-8',
        active && 'bg-blue-100 text-office-blue',
        !active && 'hover:bg-neutral-100',
        disabled && 'opacity-40'
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      {label && size === 'lg' && (
        <span className="max-w-full truncate px-0.5 text-[10px] leading-tight">{label}</span>
      )}
    </button>
  )
}
