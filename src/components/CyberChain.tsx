import React from 'react'

type CyberChainProps = {
  fullWidth?: boolean
  theme?: 'purple' | 'blue' | 'emerald' | 'indigo' | 'cyan'
  direction?: 'horizontal' | 'vertical'
  className?: string
}

const THEME_MAP: Record<
  NonNullable<CyberChainProps['theme']>,
  { from: string; to: string }
> = {
  purple: { from: 'from-fuchsia-500', to: 'to-purple-500' },
  blue: { from: 'from-sky-500', to: 'to-blue-600' },
  emerald: { from: 'from-emerald-500', to: 'to-green-600' },
  indigo: { from: 'from-indigo-500', to: 'to-violet-600' },
  cyan: { from: 'from-cyan-500', to: 'to-teal-600' }
}

/**
 * CyberChain
 * --------------------------------------------------
 * Purpose:
 * A subtle intelligence-flow divider.
 *
 * Design principles:
 * - No decorative dots
 * - No Web3 / landing-page noise
 * - Think tank / intelligence brief aesthetic
 * - Should never attract attention by itself
 */
export default function CyberChain({
  fullWidth = false,
  theme = 'purple',
  direction = 'horizontal',
  className = ''
}: CyberChainProps) {
  const t = THEME_MAP[theme]
  const isHorizontal = direction === 'horizontal'

  return (
    <div
      className={[
        'relative overflow-hidden pointer-events-none',
        fullWidth ? 'w-full' : 'w-auto',
        isHorizontal
          ? 'h-[6px]'
          : 'w-[6px] min-h-[120px]',
        className
      ].join(' ')}
      aria-hidden
    >
      {/* Soft gradient flow */}
      <div
        className={[
          'absolute inset-0',
          'opacity-40',
          isHorizontal ? 'bg-gradient-to-r' : 'bg-gradient-to-b',
          t.from,
          t.to
        ].join(' ')}
      />

      {/* Subtle fade mask to avoid harsh edges */}
      <div
        className={[
          'absolute inset-0',
          isHorizontal
            ? 'bg-gradient-to-r from-transparent via-black/10 to-transparent'
            : 'bg-gradient-to-b from-transparent via-black/10 to-transparent'
        ].join(' ')}
      />
    </div>
  )
}
