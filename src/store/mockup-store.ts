'use client'

import { create } from 'zustand'
import { useMemo } from 'react'
import type {
  BackgroundStyle,
  CanvasOrientation,
  DesignStyleId,
  ExportFormat,
  FitMode,
  Platform,
  SlotText,
  UploadedImage,
} from '@/lib/mockup/types'
import { buildTemplates, buildDynamicTemplate } from '@/lib/mockup/templates'

interface MockupState {
  platform: Platform
  templateId: string
  images: UploadedImage[]
  frameCount: number
  designStyleId: DesignStyleId
  slotTexts: Record<number, SlotText>
  canvasOrientation: CanvasOrientation
  canvasWidth: number
  canvasHeight: number
  background: BackgroundStyle
  fitMode: FitMode
  exportFormat: ExportFormat

  setPlatform: (p: Platform) => void
  setTemplateId: (id: string) => void
  setImageAt: (index: number, img: UploadedImage) => void
  removeImageAt: (index: number) => void
  clearImages: () => void
  setBackground: (bg: BackgroundStyle) => void
  setFitMode: (m: FitMode) => void
  setExportFormat: (f: ExportFormat) => void
  setFrameCount: (n: number) => void
  addFrame: () => void
  removeFrame: () => void
  setDesignStyleId: (id: DesignStyleId) => void
  setSlotText: (index: number, text: SlotText) => void
  removeSlotText: (index: number) => void
  setCanvasOrientation: (o: CanvasOrientation) => void
  setCanvasSize: (w: number, h: number) => void
}

export const useMockupStore = create<MockupState>((set) => ({
  platform: 'ios',
  templateId: 'single',
  images: [],
  frameCount: 1,
  designStyleId: 'titanium',
  slotTexts: {},
  canvasOrientation: 'portrait',
  canvasWidth: 2400,
  canvasHeight: 1800,
  background: { type: 'gradient', from: '#1e1b4b', to: '#0f172a', angle: 135 },
  fitMode: 'cover',
  exportFormat: 'png',

  setPlatform: (p) => set({ platform: p }),

  setTemplateId: (id) =>
    set((state) => {
      const templates = buildTemplates(state.platform)
      const t = templates.find((t) => t.id === id) ?? templates[0]
      const next = [...state.images]
      if (t.imageCount < next.length) {
        for (let i = t.imageCount; i < next.length; i++) {
          const existing = next[i]
          if (existing?.src.startsWith('blob:')) {
            try { URL.revokeObjectURL(existing.src) } catch {}
          }
        }
      }
      next.length = t.imageCount
      return { templateId: id, frameCount: t.imageCount, images: next }
    }),

  setFrameCount: (n) =>
    set((state) => {
      const clamped = Math.max(1, Math.min(50, Math.round(n)))
      const next = [...state.images]
      if (clamped < next.length) {
        for (let i = clamped; i < next.length; i++) {
          const existing = next[i]
          if (existing?.src.startsWith('blob:')) {
            try { URL.revokeObjectURL(existing.src) } catch {}
          }
        }
      }
      next.length = clamped
      return { frameCount: clamped, images: next }
    }),

  addFrame: () =>
    set((state) => {
      const n = Math.min(50, state.frameCount + 1)
      const next = [...state.images]
      next.length = n
      return { frameCount: n, images: next }
    }),

  removeFrame: () =>
    set((state) => {
      const n = Math.max(1, state.frameCount - 1)
      const next = [...state.images]
      if (n < next.length) {
        for (let i = n; i < next.length; i++) {
          const existing = next[i]
          if (existing?.src.startsWith('blob:')) {
            try { URL.revokeObjectURL(existing.src) } catch {}
          }
        }
      }
      next.length = n
      return { frameCount: n, images: next }
    }),

  setImageAt: (index, img) =>
    set((state) => {
      const next = [...state.images]
      next[index] = img
      return { images: next }
    }),

  removeImageAt: (index) =>
    set((state) => {
      const next = [...state.images]
      const existing = next[index]
      if (existing?.src.startsWith('blob:')) {
        try { URL.revokeObjectURL(existing.src) } catch {}
      }
      next[index] = undefined as unknown as UploadedImage
      return { images: next }
    }),

  clearImages: () =>
    set((state) => {
      for (const img of state.images) {
        if (img?.src.startsWith('blob:')) {
          try { URL.revokeObjectURL(img.src) } catch {}
        }
      }
      return { images: [] }
    }),

  setBackground: (bg) => set({ background: bg }),
  setFitMode: (m) => set({ fitMode: m }),
  setExportFormat: (f) => set({ exportFormat: f }),
  setDesignStyleId: (id) => set({ designStyleId: id }),
  setSlotText: (index, text) =>
    set((state) => ({
      slotTexts: { ...state.slotTexts, [index]: text },
    })),
  removeSlotText: (index) =>
    set((state) => {
      const next = { ...state.slotTexts }
      delete next[index]
      return { slotTexts: next }
    }),
  setCanvasOrientation: (o) => set({ canvasOrientation: o }),
  setCanvasSize: (w, h) => set({ canvasWidth: w, canvasHeight: h }),
}))

export function useCurrentTemplate() {
  const platform = useMockupStore((s) => s.platform)
  const templateId = useMockupStore((s) => s.templateId)
  const frameCount = useMockupStore((s) => s.frameCount)
  const orientation = useMockupStore((s) => s.canvasOrientation)
  const canvasWidth = useMockupStore((s) => s.canvasWidth)
  const canvasHeight = useMockupStore((s) => s.canvasHeight)
  return useMemo(() => {
    const templates = buildTemplates(platform, orientation)
    const preset = templates.find((t) => t.id === templateId) ?? templates[0]
    if (frameCount === preset.imageCount) return preset
    return buildDynamicTemplate(platform, frameCount, orientation, canvasWidth, canvasHeight)
  }, [platform, templateId, frameCount, orientation, canvasWidth, canvasHeight])
}
