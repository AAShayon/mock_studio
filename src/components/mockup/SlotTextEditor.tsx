'use client'

import { useMockupStore } from '@/store/mockup-store'
import { X, Type } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SlotTextEditorProps {
  slotIndex: number
  open: boolean
  onClose: () => void
}

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48]
const POSITIONS = ['top', 'bottom', 'overlay'] as const
const ALIGNS = ['left', 'center', 'right'] as const

export function SlotTextEditor({ slotIndex, open, onClose }: SlotTextEditorProps) {
  const slotTexts = useMockupStore((s) => s.slotTexts)
  const setSlotText = useMockupStore((s) => s.setSlotText)
  const removeSlotText = useMockupStore((s) => s.removeSlotText)

  const current = slotTexts[slotIndex]
  const [title, setTitle] = useState(current?.title ?? '')
  const [subtitle, setSubtitle] = useState(current?.subtitle ?? '')
  const [fontSize, setFontSize] = useState(current?.fontSize ?? 16)
  const [color, setColor] = useState(current?.color ?? '#ffffff')
  const [position, setPosition] = useState<'top' | 'bottom' | 'overlay'>(current?.position ?? 'bottom')
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(current?.align ?? 'center')

  if (!open) return null

  const handleApply = () => {
    if (!title && !subtitle) {
      removeSlotText(slotIndex)
    } else {
      setSlotText(slotIndex, { title, subtitle, fontSize, color, position, align })
    }
    onClose()
  }

  const handleClear = () => {
    setTitle('')
    setSubtitle('')
    removeSlotText(slotIndex)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-2xl dark:bg-neutral-900 dark:border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-neutral-500" />
            <h3 className="text-sm font-semibold">Text for Slot {slotIndex + 1}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-xs font-medium text-neutral-500">Title</Label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="mt-1 w-full rounded-lg border bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:bg-neutral-800 dark:border-neutral-600"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-500">Subtitle</Label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter subtitle..."
              className="mt-1 w-full rounded-lg border bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:bg-neutral-800 dark:border-neutral-600"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-500">Font Size</Label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:bg-neutral-800 dark:border-neutral-600"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-500">Color</Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-md border"
              />
              <span className="font-mono text-xs text-neutral-400">{color}</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-500">Position</Label>
            <div className="mt-1 flex gap-1 rounded-full border bg-neutral-100 p-0.5 dark:bg-neutral-800">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1 text-xs font-medium capitalize transition-all',
                    position === p
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-500">Alignment</Label>
            <div className="mt-1 flex gap-1 rounded-full border bg-neutral-100 p-0.5 dark:bg-neutral-800">
              {ALIGNS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlign(a)}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1 text-xs font-medium transition-all',
                    align === a
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={handleClear}
            className="rounded-full px-4 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Clear text
          </button>
          <button
            onClick={handleApply}
            className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
