'use client'

import { useMockupStore } from '@/store/mockup-store'
import { buildTemplates } from '@/lib/mockup/templates'
import { cn } from '@/lib/utils'

// Mini phone rect used in the template thumbnails
function PhoneRect({
  x,
  y,
  w,
  h,
}: {
  x: number
  y: number
  w: number
  h: number
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={w * 0.18}
      className="fill-current"
    />
  )
}

// Mini SVG layout preview for a template
function TemplateThumb({ id }: { id: string }) {
  if (id === 'single') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12">
        <PhoneRect x={24} y={10} w={16} h={44} />
      </svg>
    )
  }
  if (id === 'duo') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12">
        <PhoneRect x={8} y={14} w={16} h={36} />
        <PhoneRect x={40} y={14} w={16} h={36} />
      </svg>
    )
  }
  if (id === 'cascade') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12">
        <PhoneRect x={6} y={6} w={16} h={36} />
        <PhoneRect x={18} y={14} w={16} h={36} />
        <PhoneRect x={30} y={22} w={16} h={36} />
      </svg>
    )
  }
  // grid6
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <PhoneRect x={10} y={8} w={12} h={20} />
      <PhoneRect x={26} y={8} w={12} h={20} />
      <PhoneRect x={42} y={8} w={12} h={20} />
      <PhoneRect x={10} y={34} w={12} h={20} />
      <PhoneRect x={26} y={34} w={12} h={20} />
      <PhoneRect x={42} y={34} w={12} h={20} />
    </svg>
  )
}

export function TemplateSelector() {
  const platform = useMockupStore((s) => s.platform)
  const templateId = useMockupStore((s) => s.templateId)
  const setTemplateId = useMockupStore((s) => s.setTemplateId)

  const templates = buildTemplates(platform)

  return (
    <div className="grid grid-cols-2 gap-2">
      {templates.map((t) => {
        const active = templateId === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplateId(t.id)}
            className={cn(
              'group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
              active
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40',
            )}
          >
            <span
              className={cn(
                'transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            >
              <TemplateThumb id={t.id} />
            </span>
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-xs font-semibold leading-tight">
                {t.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t.imageCount} {t.imageCount === 1 ? 'image' : 'images'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
