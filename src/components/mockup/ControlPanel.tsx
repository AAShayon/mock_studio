'use client'

import { useMockupStore, useCurrentTemplate } from '@/store/mockup-store'
import type { BackgroundStyle, FitMode } from '@/lib/mockup/types'
import { exportCanvas } from '@/lib/mockup/renderer'
import { useImageElements } from '@/hooks/use-loaded-images'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Download, Sparkles } from 'lucide-react'
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
      {/* Background */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Background
          </Label>
          <div className="flex overflow-hidden rounded-md border">
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
                'px-2 py-1 text-[10px] font-medium transition-colors',
                !isGradient
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent',
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
                'px-2 py-1 text-[10px] font-medium transition-colors',
                isGradient
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent',
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
        <div className="grid grid-cols-3 gap-1.5">
          {FIT_MODES.map((m) => {
            const active = fitMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setFitMode(m.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-colors',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent/40',
                )}
              >
                <span className="text-xs font-semibold">{m.label}</span>
                <span className="text-[9px] text-muted-foreground">
                  {m.hint}
                </span>
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
        <div className="flex overflow-hidden rounded-lg border">
          {(['png', 'jpeg'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setExportFormat(f)}
              className={cn(
                'flex-1 py-2 text-xs font-medium transition-colors',
                exportFormat === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {f.toUpperCase()}
              {f === 'png' && (
                <span className="ml-1 text-[9px] opacity-70">transparent-capable</span>
              )}
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
