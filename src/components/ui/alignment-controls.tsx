import React from 'react'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TextAlignment = 'left' | 'center' | 'right'

interface AlignmentControlsProps {
  alignment: TextAlignment
  onAlignmentChange: (alignment: TextAlignment) => void
  className?: string
}

export const AlignmentControls = ({ alignment, onAlignmentChange, className }: AlignmentControlsProps) => {
  const alignments: { value: TextAlignment; icon: React.ComponentType<any>; label: string }[] = [
    { value: 'left', icon: AlignLeft, label: 'Esquerda' },
    { value: 'center', icon: AlignCenter, label: 'Centro' },
    { value: 'right', icon: AlignRight, label: 'Direita' }
  ]

  return (
    <div className={cn('flex gap-1 border rounded-lg p-1', className)}>
      {alignments.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={alignment === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onAlignmentChange(value)}
          className="h-8 w-8 p-0"
          title={`Alinhar à ${label.toLowerCase()}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}

export const getAlignmentClass = (alignment: TextAlignment): string => {
  switch (alignment) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
}