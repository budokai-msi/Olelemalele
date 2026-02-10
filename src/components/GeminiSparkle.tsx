'use client'

interface GeminiSparkleProps {
  size?: number
  className?: string
  glow?: boolean
}

export default function GeminiSparkle({
  size = 32,
  className = '',
  glow = true
}: GeminiSparkleProps) {
  return (
    <div
      className={`inline-block relative ${className}`}
      style={{ '--sparkle-size': `${size}px`, width: 'var(--sparkle-size)', height: 'var(--sparkle-size)' } as React.CSSProperties}
    >
      {/* Four-color glow effect */}
      {glow && (
        <>
          <div className="absolute inset-0 rounded-full animate-pulse gemini-sparkle-glow-conic" />
          <div className="absolute inset-0 rounded-full gemini-sparkle-glow-radial" />
        </>
      )}

      {/* Star */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full animate-spin relative z-10 gemini-sparkle-star"
      >
        <defs>
          <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="33%" stopColor="#EA4335" />
            <stop offset="66%" stopColor="#FBBC05" />
            <stop offset="100%" stopColor="#34A853" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M12 2L14 10H22L15 14L17 22L12 17L7 22L9 14L2 10H10L12 2Z"
          fill="url(#geminiGradient)"
          filter="url(#glow)"
        />
      </svg>
    </div>
  )
}
