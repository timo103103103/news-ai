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

// ✅ 你的新 Supabase Logo（主來源）
const DEFAULT_LOGO =
  'https://zgiwqbpalykrztvvekcg.supabase.co/storage/v1/object/public/Nex/NexVeris%20AI-bg.png'

// ✅ 後備顯示用（第二層失敗才用）
const FALLBACK_LOGO = '/brand/nexveris-gold.png'

export default function Logo({
  className = '',
  showText = true,
  stacked = false,
  size = 64,
  tagline = false,
  imageSrc,
}: LogoProps) {
  const [imgError, setImgError] = useState(false)
  const [fallbackError, setFallbackError] = useState(false)

  // ✅ 最終顯示來源邏輯（你可仍用 <Logo imageSrc="..." /> 覆蓋）
  const src = imageSrc || DEFAULT_LOGO

  return (
    <div
      className={`flex items-center ${
        stacked ? 'flex-col gap-2' : 'gap-3'
      } ${className}`}
      aria-label={BRAND_NAME}
    >
      {!imgError ? (
        <img
          src={src}
          alt={`${BRAND_NAME} logo`}
          width={size}
          height={size}
          className="shrink-0 object-contain"
          onError={() => setImgError(true)}
        />
      ) : !fallbackError ? (
        <img
          src={FALLBACK_LOGO}
          alt={`${BRAND_NAME} fallback logo`}
          width={size}
          height={size}
          className="shrink-0 object-contain"
          onError={() => setFallbackError(true)}
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="shrink-0 flex items-center justify-center text-slate-900 font-extrabold bg-slate-200 rounded"
        >
          {BRAND_NAME[0]}
        </div>
      )}

      {showText && (
        <div className={`leading-tight ${stacked ? 'text-center' : ''}`}>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">
            {BRAND_NAME}
          </div>

          {tagline && (
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-slate-300" />
              <span className="text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase">
                Intelligence
              </span>
              <span className="h-px w-6 bg-slate-300" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
