import type { CanvasOrientation, MockupTemplate, Platform } from './types'
import { getDeviceFrame } from './frames'

function singleLayout(platform: Platform, canvasW: number, canvasH: number, targetHeight: number) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  return { scale, x: (canvasW - w) / 2, y: (canvasH - h) / 2, w, h }
}

function rowLayout(platform: Platform, canvasW: number, canvasH: number, count: number, targetHeight: number, gap: number) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  const totalW = w * count + gap * (count - 1)
  const startX = (canvasW - totalW) / 2
  const y = (canvasH - h) / 2
  return Array.from({ length: count }, (_, i) => ({ x: startX + i * (w + gap), y, scale, w, h }))
}

function gridLayout(platform: Platform, canvasW: number, canvasH: number, cols: number, rows: number, targetHeight: number, gapX: number, gapY: number) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  const totalW = w * cols + gapX * (cols - 1)
  const totalH = h * rows + gapY * (rows - 1)
  const startX = (canvasW - totalW) / 2
  const startY = (canvasH - totalH) / 2
  return Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return { x: startX + col * (w + gapX), y: startY + row * (h + gapY), scale, w, h }
  })
}

function cascadeLayout(platform: Platform, canvasW: number, canvasH: number, count: number, targetHeight: number, offsetX: number, offsetY: number) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  const totalW = w + offsetX * (count - 1)
  const totalH = h + offsetY * (count - 1)
  const startX = (canvasW - totalW) / 2
  const startY = (canvasH - totalH) / 2
  return Array.from({ length: count }, (_, i) => ({ x: startX + i * offsetX, y: startY + i * offsetY, scale, w, h }))
}

function orient(canvasW: number, canvasH: number, orientation: CanvasOrientation): [number, number] {
  if (orientation === 'landscape' && canvasH > canvasW) return [canvasH, canvasW]
  if (orientation === 'portrait' && canvasW > canvasH) return [canvasH, canvasW]
  return [canvasW, canvasH]
}

export function buildTemplates(platform: Platform, orientation: CanvasOrientation = 'portrait'): MockupTemplate[] {
  const [singleW, singleH] = orient(1200, 1600, orientation)
  const single = singleLayout(platform, singleW, singleH, 1320)
  const singleTpl: MockupTemplate = {
    id: 'single', name: 'Single Screenshot', description: 'One device, centered.',
    imageCount: 1, canvasW: singleW, canvasH: singleH, defaultPlatform: platform,
    slots: [{ imageIndex: 0, platform, x: single.x, y: single.y, scale: single.scale, shadow: true }],
  }

  const [duoW, duoH] = orient(2000, 1500, orientation)
  const two = rowLayout(platform, duoW, duoH, 2, 1240, 90)
  const twoTpl: MockupTemplate = {
    id: 'duo', name: '2-Image Collage', description: 'Two devices side by side.',
    imageCount: 2, canvasW: duoW, canvasH: duoH, defaultPlatform: platform,
    slots: two.map((p, i) => ({ imageIndex: i, platform, x: p.x, y: p.y, scale: p.scale, shadow: true })),
  }

  const [casW, casH] = orient(1800, 1600, orientation)
  const three = cascadeLayout(platform, casW, casH, 3, 1180, 210, 130)
  const threeTpl: MockupTemplate = {
    id: 'cascade', name: '3-Image Cascade', description: 'Three devices cascading.',
    imageCount: 3, canvasW: casW, canvasH: casH, defaultPlatform: platform,
    slots: three.map((p, i) => ({ imageIndex: i, platform, x: p.x, y: p.y, scale: p.scale, shadow: true })),
  }

  const [gridW, gridH] = orient(2200, 1900, orientation)
  const six = gridLayout(platform, gridW, gridH, 3, 2, 820, 60, 80)
  const sixTpl: MockupTemplate = {
    id: 'grid6', name: 'Grid of 6', description: 'Six devices in a 3×2 grid.',
    imageCount: 6, canvasW: gridW, canvasH: gridH, defaultPlatform: platform,
    slots: six.map((p, i) => ({ imageIndex: i, platform, x: p.x, y: p.y, scale: p.scale, shadow: true })),
  }

  return [singleTpl, twoTpl, threeTpl, sixTpl]
}

/**
 * Find the optimal (cols, scale) to fit `count` frames into a given canvas size.
 */
function bestFit(
  frameW: number, frameH: number,
  canvasW: number, canvasH: number,
  count: number,
  gap: number, pad: number,
): { cols: number; rows: number; scale: number } {
  let bestCols = 1
  let bestScale = 0
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols)
    const availW = (canvasW - 2 * pad - gap * (cols - 1)) / cols
    const availH = (canvasH - 2 * pad - gap * (rows - 1)) / rows
    if (availW <= 0 || availH <= 0) continue
    const scale = Math.min(availW / frameW, availH / frameH)
    if (scale > bestScale) {
      bestScale = scale
      bestCols = cols
    }
  }
  if (bestScale === 0) bestScale = 0.1
  return { cols: bestCols, rows: Math.ceil(count / bestCols), scale: bestScale }
}

export function buildDynamicTemplate(
  platform: Platform,
  count: number,
  orientation: CanvasOrientation = 'portrait',
  canvasW = 2400,
  canvasH = 1800,
): MockupTemplate {
  const f = getDeviceFrame(platform)
  let [w, h] = orient(canvasW, canvasH, orientation)
  if (w < 400) w = 400
  if (h < 400) h = 400

  const gap = 40
  const pad = 50
  const { cols, rows, scale } = bestFit(f.frameW, f.frameH, w, h, count, gap, pad)
  const dw = f.frameW * scale
  const dh = f.frameH * scale

  // Center the grid within the canvas
  const gridW = dw * cols + gap * (cols - 1)
  const gridH = dh * rows + gap * (rows - 1)
  const startX = (w - gridW) / 2
  const startY = (h - gridH) / 2

  const slots = Array.from({ length: count }, (_, i) => ({
    imageIndex: i,
    platform,
    x: Math.round(startX + (i % cols) * (dw + gap)),
    y: Math.round(startY + Math.floor(i / cols) * (dh + gap)),
    scale,
    shadow: true,
  }))

  return {
    id: 'custom', name: `${count} Frames`, description: `${count} devices`,
    imageCount: count, canvasW: Math.round(w), canvasH: Math.round(h),
    defaultPlatform: platform, slots,
  }
}
