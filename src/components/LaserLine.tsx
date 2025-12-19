import React from 'react'

type LaserLineProps = {
  color?: string
  className?: string
}

export default function LaserLine({ color = '#8b5cf6', className = '' }: LaserLineProps) {
  return (
    <div className={['relative w-full h-[10px]', className].join(' ')}>
      <svg width="100%" height="10" viewBox="0 0 800 10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="laser" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="60%" stopColor={color} stopOpacity="0.35" />
            <stop offset="90%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
          </filter>
        </defs>
        <line x1="0" y1="5" x2="780" y2="5" stroke="url(#laser)" strokeWidth="2" filter="url(#softGlow)" />
        <circle cx="790" cy="5" r="3.5" fill={color} opacity="0.9" />
      </svg>
    </div>
  )
}

