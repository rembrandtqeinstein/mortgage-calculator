export default function DecorativeBorder() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Top-left corner */}
      <svg className="absolute top-0 left-0 w-24 h-24 text-accent opacity-30" viewBox="0 0 100 100" fill="none">
        <path d="M0 0 L40 0 L40 5 L5 5 L5 40 L0 40 Z" fill="currentColor" />
        <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
        {/* Sun rays */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const x1 = 20 + Math.cos(angle) * 8
          const y1 = 20 + Math.sin(angle) * 8
          const x2 = 20 + Math.cos(angle) * 12
          const y2 = 20 + Math.sin(angle) * 12
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
        })}
      </svg>

      {/* Top-right corner */}
      <svg className="absolute top-0 right-0 w-24 h-24 text-accent opacity-30" viewBox="0 0 100 100" fill="none">
        <path d="M100 0 L60 0 L60 5 L95 5 L95 40 L100 40 Z" fill="currentColor" />
        <circle cx="80" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="80" cy="20" r="2" fill="currentColor" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const x1 = 80 + Math.cos(angle) * 8
          const y1 = 20 + Math.sin(angle) * 8
          const x2 = 80 + Math.cos(angle) * 12
          const y2 = 20 + Math.sin(angle) * 12
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
        })}
      </svg>

      {/* Bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-24 h-24 text-accent opacity-30" viewBox="0 0 100 100" fill="none">
        <path d="M0 100 L40 100 L40 95 L5 95 L5 60 L0 60 Z" fill="currentColor" />
      </svg>

      {/* Bottom-right corner */}
      <svg className="absolute bottom-0 right-0 w-24 h-24 text-accent opacity-30" viewBox="0 0 100 100" fill="none">
        <path d="M100 100 L60 100 L60 95 L95 95 L95 60 L100 60 Z" fill="currentColor" />
      </svg>

      {/* Top diamond border */}
      <div className="absolute top-0 left-24 right-24 h-px flex items-center">
        <div className="w-full h-px bg-accent/20" />
      </div>

      {/* Bottom diamond border */}
      <div className="absolute bottom-0 left-24 right-24 h-px flex items-center">
        <div className="w-full h-px bg-accent/20" />
      </div>
    </div>
  )
}
