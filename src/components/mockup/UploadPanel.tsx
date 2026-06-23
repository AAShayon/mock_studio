'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, Plus, ImageOff } from 'lucide-react'
import { useMockupStore, useCurrentTemplate } from '@/store/mockup-store'
import type { UploadedImage } from '@/lib/mockup/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Read a File into an UploadedImage (with dimensions)
function readImageFile(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        src: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export function UploadPanel() {
  const template = useCurrentTemplate()
  const images = useMockupStore((s) => s.images)
  const setImageAt = useMockupStore((s) => s.setImageAt)
  const removeImageAt = useMockupStore((s) => s.removeImageAt)
  const clearImages = useMockupStore((s) => s.clearImages)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverAll, setDragOverAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slots = Array.from({ length: template.imageCount }, (_, i) => i)

  const handleFiles = useCallback(
    async (files: FileList | File[], startIndex?: number) => {
      setError(null)
      const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (arr.length === 0) {
        setError('Please drop image files only.')
        return
      }
      let idx =
        startIndex ??
        slots.findIndex((i) => !images[i])
      if (idx === -1) idx = 0
      for (const file of arr) {
        try {
          const img = await readImageFile(file)
          setImageAt(idx, img)
          idx++
          if (idx >= template.imageCount) break
        } catch {
          setError(`Could not load "${file.name}".`)
        }
      }
    },
    [images, setImageAt, slots, template.imageCount],
  )

  const onSlotDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragIndex(null)
    handleFiles(e.dataTransfer.files, index)
  }

  const filledCount = slots.filter((i) => images[i]).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Images</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {filledCount}/{template.imageCount}
          </span>
        </div>
        {filledCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={clearImages}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Batch upload dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOverAll(true)
        }}
        onDragLeave={() => setDragOverAll(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOverAll(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-4 text-center transition-colors',
          dragOverAll
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-accent/40',
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs font-medium">
          Drop images or <span className="text-primary">browse</span>
        </p>
        <p className="text-[10px] text-muted-foreground">
          Fills empty slots automatically · PNG/JPG/WebP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          data-testid="batch-file-input"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {/* Per-slot grid */}
      <div
        className={cn(
          'grid gap-2',
          template.imageCount <= 2
            ? 'grid-cols-2'
            : template.imageCount <= 4
              ? 'grid-cols-2'
              : 'grid-cols-3',
        )}
      >
        {slots.map((index) => {
          const img = images[index]
          return (
            <div
              key={index}
              onDragOver={(e) => {
                e.preventDefault()
                setDragIndex(index)
              }}
              onDragLeave={() => setDragIndex(null)}
              onDrop={(e) => onSlotDrop(e, index)}
              className={cn(
                'group relative aspect-[9/16] overflow-hidden rounded-lg border bg-muted/40 transition-colors',
                dragIndex === index
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border',
                img ? 'cursor-pointer' : 'cursor-pointer',
              )}
              onClick={() => {
                // open file picker for this slot
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const t = e.target as HTMLInputElement
                  if (t.files?.[0]) handleFiles([t.files[0]], index)
                }
                input.click()
              }}
            >
              {img ? (
                <>
                  <img
                    src={img.src}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/40 via-transparent to-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImageAt(index)
                      }}
                      className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="truncate rounded bg-background/80 px-1 py-0.5 text-[9px] text-foreground">
                      {img.name}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground/60">
                  {filledCount === 0 && index === 0 ? (
                    <Plus className="h-5 w-5" />
                  ) : (
                    <ImageOff className="h-4 w-4" />
                  )}
                  <span className="text-[10px] font-medium">
                    Slot {index + 1}
                  </span>
                </div>
              )}
              <span className="pointer-events-none absolute left-1 top-1 rounded bg-background/80 px-1 py-0.5 text-[9px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {index + 1}
              </span>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
