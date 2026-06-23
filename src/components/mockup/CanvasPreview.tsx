'use client'

import { useEffect, useRef } from 'react'
import { useMockupStore, useCurrentTemplate } from '@/store/mockup-store'
import { useImageElements } from '@/hooks/use-loaded-images'
import { renderMockup } from '@/lib/mockup/renderer'
import { Loader2, ImageIcon } from 'lucide-react'

export function CanvasPreview() {
  const template = useCurrentTemplate()
  const images = useMockupStore((s) => s.images)
  const background = useMockupStore((s) => s.background)
  const fitMode = useMockupStore((s) => s.fitMode)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pad the images array to cover all slots (null where empty)
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
    })
  }, [template, elements, background, fitMode])

  const hasAnyImage = images.slice(0, slotCount).some(Boolean)

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-6">
      <div className="relative flex max-h-full max-w-full items-center justify-center">
        <div className="relative" style={{ lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            className="max-h-[calc(100vh-280px)] w-auto max-w-full rounded-xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
            style={{ display: 'block' }}
          />
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
