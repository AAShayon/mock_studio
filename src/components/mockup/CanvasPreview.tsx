'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMockupStore, useCurrentTemplate } from '@/store/mockup-store'
import { useImageElements } from '@/hooks/use-loaded-images'
import { renderMockup } from '@/lib/mockup/renderer'
import { Loader2, ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CanvasPreview() {
  const template = useCurrentTemplate()
  const images = useMockupStore((s) => s.images)
  const background = useMockupStore((s) => s.background)
  const fitMode = useMockupStore((s) => s.fitMode)
  const designStyleId = useMockupStore((s) => s.designStyleId)
  const slotTexts = useMockupStore((s) => s.slotTexts)
  const setImageAt = useMockupStore((s) => s.setImageAt)
  const setCanvasSize = useMockupStore((s) => s.setCanvasSize)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [resizing, setResizing] = useState<'e' | 's' | 'se' | null>(null)

  const showResize = template.id === 'custom'

  const slotCount = template.imageCount
  const padded: ({ id: string; src: string } | null)[] = Array.from(
    { length: slotCount },
    (_, i) => {
      const img = images[i]
      return img ? { id: img.id, src: img.src } : null
    },
  )
  const { elements, isLoading } = useImageElements(padded)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = template.canvasW
    canvas.height = template.canvasH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderMockup(ctx, {
      template,
      images: elements,
      background,
      fitMode,
      designStyleId,
      slotTexts,
    })
  }, [template, elements, background, fitMode, designStyleId, slotTexts])

  const startResize = useCallback(
    (edge: 'e' | 's' | 'se', e: React.MouseEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const cssScale = rect.width / canvas.width
      const startW = canvas.width
      const startH = canvas.height
      setResizing(edge)

      const onMove = (me: MouseEvent) => {
        const dx = (me.clientX - e.clientX) / cssScale
        const dy = (me.clientY - e.clientY) / cssScale
        let w = startW; let h = startH
        if (edge === 'e' || edge === 'se') w = Math.max(400, Math.min(6000, startW + dx))
        if (edge === 's' || edge === 'se') h = Math.max(400, Math.min(6000, startH + dy))
        setCanvasSize(Math.round(w / 50) * 50, Math.round(h / 50) * 50)
      }

      const onUp = () => {
        setResizing(null)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [setCanvasSize],
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
      const my = (e.clientY - rect.top) * (canvas.height / rect.height)
      for (const slot of template.slots) {
        const sx = slot.x; const sy = slot.y
        const frame = getFrame(slot.platform)
        const w = frame.frameW * slot.scale
        const h = frame.frameH * slot.scale
        if (mx >= sx && mx <= sx + w && my >= sy && my <= sy + h) {
          setImageAt(slot.imageIndex, undefined as unknown as undefined)
          return
        }
      }
    },
    [template, setImageAt],
  )

  const handleCanvasMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
      const my = (e.clientY - rect.top) * (canvas.height / rect.height)
      let found: number | null = null
      for (const slot of template.slots) {
        const frame = getFrame(slot.platform)
        const w = frame.frameW * slot.scale
        const h = frame.frameH * slot.scale
        if (mx >= slot.x && mx <= slot.x + w && my >= slot.y && my <= slot.y + h) {
          const img = images[slot.imageIndex]
          if (img) { found = slot.imageIndex; break }
        }
      }
      setHoveredSlot(found)
    },
    [template, images],
  )

  const handleCanvasLeave = useCallback(() => setHoveredSlot(null), [])

  const hasAnyImage = images.slice(0, slotCount).some(Boolean)

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="relative flex max-h-full max-w-full items-center justify-center">
        <div className="relative" style={{ lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            className={cn(
              'max-h-[calc(100vh-280px)] w-auto max-w-full rounded-xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10',
              resizing && 'pointer-events-none',
            )}
            style={{ display: 'block', minWidth: 200 }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={handleCanvasLeave}
          />

          {showResize && (
            <>
              <div
                className="absolute inset-y-0 right-0 z-20 w-6 cursor-col-resize flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => startResize('e', e)}
              >
                <div className="flex h-20 w-[5px] items-center justify-center rounded-full bg-indigo-500 shadow-md ring-1 ring-white/30">
                  <svg width="10" height="10" viewBox="0 0 8 8" className="text-white"><circle cx="4" cy="1" r="1.2" fill="currentColor"/><circle cx="4" cy="4" r="1.2" fill="currentColor"/><circle cx="4" cy="7" r="1.2" fill="currentColor"/></svg>
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 z-20 h-6 w-full cursor-row-resize flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => startResize('s', e)}
              >
                <div className="flex h-[5px] w-20 items-center justify-center rounded-full bg-indigo-500 shadow-md ring-1 ring-white/30">
                  <svg width="10" height="10" viewBox="0 0 8 8" className="rotate-90 text-white"><circle cx="4" cy="1" r="1.2" fill="currentColor"/><circle cx="4" cy="4" r="1.2" fill="currentColor"/><circle cx="4" cy="7" r="1.2" fill="currentColor"/></svg>
                </div>
              </div>
              <div
                className="absolute -bottom-2.5 -right-2.5 z-20 h-8 w-8 cursor-nwse-resize opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center"
                onMouseDown={(e) => startResize('se', e)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500 shadow-md ring-1 ring-white/30">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white"><path d="M1 11 L11 1 M1 7 L7 1 M5 11 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
            </>
          )}

          {hoveredSlot !== null && images[hoveredSlot] && (
            <div
              className="pointer-events-none absolute flex items-center gap-1.5 rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur"
              style={{
                top: getSlotScreenPos(canvasRef.current, template, hoveredSlot)?.top ?? 0,
                left: getSlotScreenPos(canvasRef.current, template, hoveredSlot)?.left ?? 0,
              }}
            >
              <Trash2 className="h-3 w-3" />
              Click to remove
            </div>
          )}
          {!hasAnyImage && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/80 backdrop-blur">
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="rounded-full bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
                Upload images to see your mockup
              </p>
            </div>
          )}
        </div>
        {isLoading && (
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Rendering…
          </div>
        )}
      </div>
    </div>
  )
}

function getSlotScreenPos(
  canvas: HTMLCanvasElement | null,
  template: { slots: { imageIndex: number; x: number; y: number; scale: number; platform: string; shadow?: boolean }[] },
  slotIndex: number,
) {
  if (!canvas) return null
  const slot = template.slots.find((s) => s.imageIndex === slotIndex)
  if (!slot) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = rect.width / canvas.width
  const scaleY = rect.height / canvas.height
  return {
    top: rect.top + slot.y * scaleY - 28,
    left: rect.left + slot.x * scaleX + 8,
  }
}

import { getDeviceFrame } from '@/lib/mockup/frames'
function getFrame(platform: Parameters<typeof getDeviceFrame>[0]) { return getDeviceFrame(platform) }
