import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BookPageEffectProps {
  children: ReactNode
  className?: string
}

export const BookPageEffect = ({ children, className }: BookPageEffectProps) => {
  return (
    <div className={cn("relative flex justify-center items-center", className)}>
      {/* Book shadow and base */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[95%] h-[95%] bg-gradient-to-b from-black/5 to-black/20 blur-xl rounded-lg" />
      </div>
      
      {/* Open book effect */}
      <div className="relative w-full max-w-6xl mx-auto perspective-1000">
        <div className="relative bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Book spine shadow */}
          <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/5 to-black/10 pointer-events-none z-10" />
          
          {/* Page content */}
          <div className="relative bg-gradient-to-br from-background via-background to-muted/5">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] bg-repeat" />
            
            {children}
          </div>
          
          {/* Page edges highlight */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}
