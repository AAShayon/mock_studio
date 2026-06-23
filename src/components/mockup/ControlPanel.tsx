'use client'

import { useMockupStore, useCurrentTemplate } from '@/store/mockup-store'
import type { BackgroundStyle, CanvasOrientation, DesignStyleId, FitMode } from '@/lib/mockup/types'
import { DESIGN_STYLES } from '@/lib/mockup/types'
import { exportCanvas } from '@/lib/mockup/renderer'
import { useImageElements } from '@/hooks/use-loaded-images'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Download, Sparkles, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PRESETS: { name: string; bg: BackgroundStyle }[] = [
  { name: 'Midnight', bg: { type: 'gradient', from: '#1e1b4b', to: '#0f172a', angle: 135 } },
  { name: 'Sunset', bg: { type: 'gradient', from: '#f97316', to: '#db2777', angle: 135 } },
  { name: 'Forest', bg: { type: 'gradient', from: '#065f46', to: '#022c22', angle: 135 } },
  { name: 'Peach', bg: { type: 'gradient', from: '#fda4af', to: '#fb7185', angle: 135 } },
  { name: 'Slate', bg: { type: 'solid', color: '#0f172a' } },
  { name: 'Cream', bg: { type: 'solid', color: '#faf7f2' } },
  { name: 'Charcoal', bg: { type: 'solid', color: '#18181b' } },
  { name: 'Mint', bg: { type: 'gradient', from: '#a7f3d0', to: '#34d399', angle: 135 } },
]

const FIT_MODES: { id: FitMode; label: string; hint: string }[] = [
  { id: 'cover', label: 'Cover', hint: 'Fill & crop' },
  { id: 'contain', label: 'Contain', hint: 'Fit & letterbox' },
  { id: 'stretch', label: 'Stretch', hint: 'Distort to fill' },
]

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase text-muted-foreground">
          {value}
        </span>
        <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-md border shadow-sm">
          <span
            className="block h-full w-full"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  )
}

export function ControlPanel() {
  const template = useCurrentTemplate()
  const images = useMockupStore((s) => s.images)
  const background = useMockupStore((s) => s.background)
  const setBackground = useMockupStore((s) => s.setBackground)
  const fitMode = useMockupStore((s) => s.fitMode)
  const setFitMode = useMockupStore((s) => s.setFitMode)
  const exportFormat = useMockupStore((s) => s.exportFormat)
  const setExportFormat = useMockupStore((s) => s.setExportFormat)
  const designStyleId = useMockupStore((s) => s.designStyleId)
  const setDesignStyleId = useMockupStore((s) => s.setDesignStyleId)
  const canvasOrientation = useMockupStore((s) => s.canvasOrientation)
  const setCanvasOrientation = useMockupStore((s) => s.setCanvasOrientation)
  const slotTexts = useMockupStore((s) => s.slotTexts)
  const canvasWidth = useMockupStore((s) => s.canvasWidth)
  const canvasHeight = useMockupStore((s) => s.canvasHeight)
  const setCanvasSize = useMockupStore((s) => s.setCanvasSize)
  const showCanvasSize = template.id === 'custom'

  const slotCount = template.imageCount
  const padded: ({ id: string; src: string } | null)[] = Array.from(
    { length: slotCount },
    (_, i) => {
      const img = images[i]
      return img ? { id: img.id, src: img.src } : null
    },
  )
  const { elements: loadedByIndex } = useImageElements(padded)

  const isGradient = background.type === 'gradient'

  const handleDownload = () => {
    try {
      const dataUrl = exportCanvas(
        template,
        loadedByIndex,
        background,
        fitMode,
        exportFormat,
        designStyleId,
        slotTexts,
      )
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `mockup-${template.id}-${Date.now()}.${exportFormat === 'png' ? 'png' : 'jpg'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Mockup downloaded', {
        description: `${template.canvasW}×${template.canvasH} ${exportFormat.toUpperCase()}`,
      })
    } catch (e) {
      toast.error('Export failed', {
        description: e instanceof Error ? e.message : 'Unknown error',
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Design Style */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Frame Color
        </Label>
        <div className="grid grid-cols-5 gap-1.5">
          {DESIGN_STYLES.map((ds) => (
            <button
              key={ds.id}
              type="button"
              title={ds.name}
              onClick={() => setDesignStyleId(ds.id)}
              className={cn(
                'flex flex-col items-center gap-1',
              )}
            >
              <span
                className={cn(
                  'h-8 w-full rounded-md border shadow-sm transition-transform hover:scale-105',
                  designStyleId === ds.id && 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-neutral-900',
                )}
                style={{
                  background: `linear-gradient(180deg, ${ds.bodyTop}, ${ds.bodyBottom})`,
                }}
              />
              <span className="text-[9px] text-muted-foreground">{ds.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Orientation */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Canvas Orientation
        </Label>
        <div className="flex gap-1 rounded-full border bg-neutral-100 p-0.5 dark:bg-neutral-800">
          {(['portrait', 'landscape'] as CanvasOrientation[]).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setCanvasOrientation(o)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all',
                canvasOrientation === o
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              )}
            >
              <RotateCw className={cn('h-3 w-3', o === 'landscape' && 'rotate-90')} />
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Size */}
      {showCanvasSize && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Canvas Size
          </Label>
          <div className="flex flex-col gap-2 rounded-lg border bg-card/50 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Width</span>
              <span className="font-mono text-[10px] text-muted-foreground">{canvasWidth}px</span>
            </div>
            <Slider
              value={[canvasWidth]}
              min={600}
              max={4800}
              step={100}
              onValueChange={([v]) => setCanvasSize(v, canvasHeight)}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Height</span>
              <span className="font-mono text-[10px] text-muted-foreground">{canvasHeight}px</span>
            </div>
            <Slider
              value={[canvasHeight]}
              min={600}
              max={4800}
              step={100}
              onValueChange={([v]) => setCanvasSize(canvasWidth, v)}
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[800, 1200, 1800, 2400, 3600].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCanvasSize(s, s)}
                  className="rounded-full border px-2.5 py-1 text-[9px] font-medium text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {s}×{s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Background
          </Label>
          <div className="flex gap-1 rounded-full border bg-neutral-100 p-0.5 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() =>
                setBackground(
                  background.type === 'solid'
                    ? background
                    : {
                        type: 'solid',
                        color: background.from,
                      },
                )
              }
              className={cn(
                'rounded-full px-3 py-1 text-[10px] font-medium transition-all',
                !isGradient
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              )}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() =>
                setBackground(
                  background.type === 'gradient'
                    ? background
                    : {
                        type: 'gradient',
                        from: background.color,
                        to: '#000000',
                        angle: 135,
                      },
                )
              }
              className={cn(
                'rounded-full px-3 py-1 text-[10px] font-medium transition-all',
                isGradient
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              )}
            >
              Gradient
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              title={p.name}
              onClick={() => setBackground(p.bg)}
              className="group flex flex-col items-center gap-1"
            >
              <span
                className="h-9 w-full rounded-md border shadow-sm transition-transform group-hover:scale-105"
                style={
                  p.bg.type === 'solid'
                    ? { backgroundColor: p.bg.color }
                    : {
                        backgroundImage: `linear-gradient(${p.bg.angle}deg, ${p.bg.from}, ${p.bg.to})`,
                      }
                }
              />
              <span className="text-[9px] text-muted-foreground">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Custom color controls */}
        <div className="flex flex-col gap-2 rounded-lg border bg-card/50 p-2.5">
          {isGradient ? (
            <>
              <ColorField
                label="From"
                value={background.from}
                onChange={(v) =>
                  setBackground({ ...background, from: v })
                }
              />
              <ColorField
                label="To"
                value={background.to}
                onChange={(v) => setBackground({ ...background, to: v })}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Angle</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {background.angle}°
                </span>
              </div>
              <Slider
                value={[background.angle]}
                min={0}
                max={360}
                step={15}
                onValueChange={([v]) =>
                  setBackground({ ...background, angle: v })
                }
              />
            </>
          ) : (
            <ColorField
              label="Color"
              value={background.color}
              onChange={(v) => setBackground({ ...background, color: v })}
            />
          )}
        </div>
      </div>

      {/* Fit mode */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Image Fit
        </Label>
          <div className="flex gap-1 rounded-full border bg-neutral-100 p-0.5 dark:bg-neutral-800">
            {FIT_MODES.map((m) => {
              const active = fitMode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFitMode(m.id)}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    active
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
                  )}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
      </div>

      {/* Export format */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Export Format
        </Label>
          <div className="flex gap-1 rounded-full border bg-neutral-100 p-0.5 dark:bg-neutral-800">
            {(['png', 'jpeg'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setExportFormat(f)}
                className={cn(
                  'flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  exportFormat === f
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
      </div>

      {/* Download */}
      <Button
        size="lg"
        onClick={handleDownload}
        className="w-full gap-2 shadow-md"
      >
        <Download className="h-4 w-4" />
        Download {exportFormat.toUpperCase()}
      </Button>
      <p className="flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        {template.canvasW}×{template.canvasH}px · high resolution
      </p>
    </div>
  )
}
