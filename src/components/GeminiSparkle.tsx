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
      style={{ width: size, height: size }}
    >
      {/* Four-color glow effect */}
      {glow && (
        <>
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'conic-gradient(from 0deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
              filter: 'blur(8px)',
              opacity: 0.6,
              transform: 'scale(1.5)',
            }}
          />
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(66,133,244,0.4) 0%, rgba(234,67,53,0.3) 25%, rgba(251,188,5,0.3) 50%, rgba(52,168,83,0.4) 75%, transparent 100%)',
              filter: 'blur(4px)',
              transform: 'scale(1.2)',
            }}
          />
        </>
      )}
      
      {/* Star */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-full h-full animate-spin relative z-10" 
        style={{ animationDuration: '3s' }}
      >
        <defs>
          <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="33%" stopColor="#EA4335" />
            <stop offset="66%" stopColor="#FBBC05" />
            <stop offset="100%" stopColor="#34A853" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
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
