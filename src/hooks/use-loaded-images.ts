'use client'

import { useEffect, useSyncExternalStore } from 'react'

type ImageRef = { id: string; src: string } | null

// ---- Module-level shared image cache (acts as an external store) ----
// Reading module-level (non-ref) state during render is allowed when paired
// with useSyncExternalStore for subscription.
const imageCache = new Map<string, HTMLImageElement>()
const erroredCache = new Set<string>()
const requestedCache = new Set<string>()
const listeners = new Set<() => void>()
let cacheVersion = 0

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return cacheVersion
}

function getServerSnapshot() {
  return 0
}

function notifyListeners() {
  cacheVersion++
  listeners.forEach((l) => l())
}

// Loads an array of image references (aligned by index, nulls preserved)
// into HTMLImageElement[] (null where missing or still loading).
export function useImageElements(images: ImageRef[]): {
  elements: (HTMLImageElement | null)[]
  isLoading: boolean
} {
  // Subscribe to cache changes so we re-render when images finish loading
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Derive aligned elements from the shared cache during render
  const elements = images.map((im) =>
    im ? imageCache.get(im.id) ?? null : null,
  )
  // An image is "loading" if it's expected but not yet cached/errored
  const isLoading = images.some(
    (im) => !!im && !imageCache.has(im.id) && !erroredCache.has(im.id),
  )

  const key = images.map((i) => i?.id ?? '_').join(',')

  useEffect(() => {
    let cancelled = false
    const toLoad: { id: string; src: string }[] = []
    for (const im of images) {
      if (!im) continue
      if (imageCache.has(im.id)) continue
      if (requestedCache.has(im.id)) continue
      toLoad.push(im)
    }
    if (toLoad.length === 0) return

    for (const im of toLoad) {
      requestedCache.add(im.id)
      const el = new Image()
      el.onload = () => {
        if (cancelled) return
        imageCache.set(im.id, el)
        notifyListeners()
      }
      el.onerror = () => {
        if (cancelled) return
        erroredCache.add(im.id)
        notifyListeners()
      }
      el.src = im.src
    }

    return () => {
      cancelled = true
    }
  }, [key, images.length])

  return { elements, isLoading }
}

// Allow the store to be cleared when the user removes all images
export function clearImageCache() {
  imageCache.clear()
  erroredCache.clear()
  requestedCache.clear()
  notifyListeners()
}
