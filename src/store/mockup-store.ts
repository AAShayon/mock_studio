'use client'

import { create } from 'zustand'
import { useMemo } from 'react'
import type {
  BackgroundStyle,
  ExportFormat,
  FitMode,
  Platform,
  UploadedImage,
} from '@/lib/mockup/types'
import { buildTemplates } from '@/lib/mockup/templates'

interface MockupState {
  platform: Platform
  templateId: string
  images: UploadedImage[] // indexed by slot.imageIndex
  background: BackgroundStyle
  fitMode: FitMode
  exportFormat: ExportFormat
  // derived template access via selector

  setPlatform: (p: Platform) => void
  setTemplateId: (id: string) => void
  setImageAt: (index: number, img: UploadedImage) => void
  removeImageAt: (index: number) => void
  clearImages: () => void
  setBackground: (bg: BackgroundStyle) => void
  setFitMode: (m: FitMode) => void
  setExportFormat: (f: ExportFormat) => void
}

export const useMockupStore = create<MockupState>((set) => ({
  platform: 'ios',
  templateId: 'single',
  images: [],
  background: { type: 'gradient', from: '#1e1b4b', to: '#0f172a', angle: 135 },
  fitMode: 'cover',
  exportFormat: 'png',

  setPlatform: (p) =>
    set(() => {
      // When platform changes, keep template id but rebuild so slots use new device
      return { platform: p }
    }),

  setTemplateId: (id) => set({ templateId: id }),

  setImageAt: (index, img) =>
    set((state) => {
      const next = [...state.images]
      next[index] = img
      return { images: next }
    }),

  removeImageAt: (index) =>
    set((state) => {
      const next = [...state.images]
      // Revoke object URL to free memory
      const existing = next[index]
      if (existing?.src.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(existing.src)
        } catch {
          /* noop */
        }
      }
      next[index] = undefined as unknown as UploadedImage
      return { images: next }
    }),

  clearImages: () =>
    set((state) => {
      for (const img of state.images) {
        if (img?.src.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(img.src)
          } catch {
            /* noop */
          }
        }
      }
      return { images: [] }
    }),

  setBackground: (bg) => set({ background: bg }),
  setFitMode: (m) => set({ fitMode: m }),
  setExportFormat: (f) => set({ exportFormat: f }),
}))

// Selector helper: get the current template object.
// IMPORTANT: select primitive state and memoize the derived template,
// because returning a fresh object from a Zustand selector would make
// the underlying useSyncExternalStore loop forever.
export function useCurrentTemplate() {
  const platform = useMockupStore((s) => s.platform)
  const templateId = useMockupStore((s) => s.templateId)
  return useMemo(() => {
    const templates = buildTemplates(platform)
    return templates.find((t) => t.id === templateId) ?? templates[0]
  }, [platform, templateId])
}
