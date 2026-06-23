'use client'

import { Smartphone } from 'lucide-react'
import { useMockupStore } from '@/store/mockup-store'
import type { Platform } from '@/lib/mockup/types'
import { cn } from '@/lib/utils'

const PLATFORMS: { id: Platform; label: string; sub: string }[] = [
  { id: 'ios', label: 'iOS', sub: 'iPhone · Dynamic Island' },
  { id: 'android', label: 'Android', sub: 'Pixel · Punch-hole' },
]

export function PlatformSelector() {
  const platform = useMockupStore((s) => s.platform)
  const setPlatform = useMockupStore((s) => s.setPlatform)

  return (
    <div className="grid grid-cols-2 gap-2">
      {PLATFORMS.map((p) => {
        const active = platform === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id)}
            className={cn(
              'group flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
              active
                ? 'border-indigo-400 bg-indigo-500/20 shadow-sm'
                : 'border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-white/10',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    active
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20',
                )}
              >
                <Smartphone className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-white">{p.label}</span>
            </div>
            <span className="text-[11px] leading-tight text-white/50">
              {p.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
