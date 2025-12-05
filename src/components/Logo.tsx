import React, { useState } from 'react'
import { BRAND_NAME } from '../brand'

interface LogoProps {
  className?: string
  showText?: boolean
  stacked?: boolean
  size?: number
  tagline?: boolean
  imageSrc?: string
}

export default function Logo({ className = '', showText = true, stacked = false, size = 64, tagline = false, imageSrc }: LogoProps) {
  const [imgError, setImgError] = useState(false)
  const src = imageSrc || '/brand/nexveris-ai-logo.png'
  return (
    <div className={`flex items-center ${stacked ? 'flex-col gap-2' : 'gap-3'} ${className}`} aria-label={BRAND_NAME}>
      {!imgError ? (
        <img src={src} alt={`${BRAND_NAME} logo`} width={size} height={size} className="shrink-0 object-contain" onError={() => setImgError(true)} />
      ) : (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="va-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7d08a" />
            <stop offset="100%" stopColor="#cfa24e" />
          </linearGradient>
          <linearGradient id="va-blueL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f3b64" />
            <stop offset="100%" stopColor="#2f7fb0" />
          </linearGradient>
          <linearGradient id="va-blueR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f3b64" />
            <stop offset="100%" stopColor="#2f7fb0" />
          </linearGradient>
        </defs>
        <g>
          <polygon points="58,66 40,44 22,60 40,80" fill="url(#va-blueL)" />
          <polygon points="62,66 80,44 98,60 80,80" fill="url(#va-blueR)" />
          <ellipse cx="60" cy="46" rx="26" ry="16" fill="#0f1f3a" opacity="0.35" />
          <circle cx="60" cy="46" r="9" fill="#ffffff" />
          <circle cx="60" cy="46" r="4" fill="#1c6ab3" />
          <path d="M52 88h16l12-40H40z" fill="url(#va-gold)" />
          <path d="M60 22c4 6 4 10 0 12-4-2 0-6 0-12z" fill="url(#va-gold)" />
        </g>
      </svg>
      )}
      {showText && (
        <div className={`leading-tight ${stacked ? 'text-center' : ''}`}>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">
            {BRAND_NAME}
          </div>
          {tagline && (
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-slate-300" />
              <span className="text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase">Intelligence</span>
              <span className="h-px w-6 bg-slate-300" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
