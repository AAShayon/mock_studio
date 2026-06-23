import type { MockupTemplate, Platform } from './types'
import { getDeviceFrame } from './frames'

// Helper: compute a centered single-device layout
function singleLayout(
  platform: Platform,
  canvasW: number,
  canvasH: number,
  targetHeight: number,
) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  return {
    scale,
    x: (canvasW - w) / 2,
    y: (canvasH - h) / 2,
    w,
    h,
  }
}

// Helper: compute a row of N devices
function rowLayout(
  platform: Platform,
  canvasW: number,
  canvasH: number,
  count: number,
  targetHeight: number,
  gap: number,
) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  const totalW = w * count + gap * (count - 1)
  const startX = (canvasW - totalW) / 2
  const y = (canvasH - h) / 2
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (w + gap),
    y,
    scale,
    w,
    h,
  }))
}

// Helper: grid layout
function gridLayout(
  platform: Platform,
  canvasW: number,
  canvasH: number,
  cols: number,
  rows: number,
  targetHeight: number,
  gapX: number,
  gapY: number,
) {
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
    return {
      x: startX + col * (w + gapX),
      y: startY + row * (h + gapY),
      scale,
      w,
      h,
    }
  })
}

// Helper: cascade (diagonal offset) layout
function cascadeLayout(
  platform: Platform,
  canvasW: number,
  canvasH: number,
  count: number,
  targetHeight: number,
  offsetX: number,
  offsetY: number,
) {
  const f = getDeviceFrame(platform)
  const scale = targetHeight / f.frameH
  const w = f.frameW * scale
  const h = f.frameH * scale
  const totalW = w + offsetX * (count - 1)
  const totalH = h + offsetY * (count - 1)
  const startX = (canvasW - totalW) / 2
  const startY = (canvasH - totalH) / 2
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * offsetX,
    y: startY + i * offsetY,
    scale,
    w,
    h,
  }))
}

// Build templates dynamically based on the selected platform so the
// device in each slot matches the user's platform choice.
export function buildTemplates(platform: Platform): MockupTemplate[] {
  // ---- Template 1: Single Screenshot ----
  const single = singleLayout(platform, 1200, 1600, 1320)
  const singleTpl: MockupTemplate = {
    id: 'single',
    name: 'Single Screenshot',
    description: 'One device, centered. Perfect for a hero shot.',
    imageCount: 1,
    canvasW: 1200,
    canvasH: 1600,
    defaultPlatform: platform,
    slots: [
      {
        imageIndex: 0,
        platform,
        x: single.x,
        y: single.y,
        scale: single.scale,
        shadow: true,
      },
    ],
  }

  // ---- Template 2: 2-Image Collage (side by side) ----
  const two = rowLayout(platform, 2000, 1500, 2, 1240, 90)
  const twoTpl: MockupTemplate = {
    id: 'duo',
    name: '2-Image Collage',
    description: 'Two devices side by side for feature comparison.',
    imageCount: 2,
    canvasW: 2000,
    canvasH: 1500,
    defaultPlatform: platform,
    slots: two.map((p, i) => ({
      imageIndex: i,
      platform,
      x: p.x,
      y: p.y,
      scale: p.scale,
      shadow: true,
    })),
  }

  // ---- Template 3: 3-Image Cascade ----
  const three = cascadeLayout(platform, 1800, 1600, 3, 1180, 210, 130)
  const threeTpl: MockupTemplate = {
    id: 'cascade',
    name: '3-Image Cascade',
    description: 'Three devices in a cascading diagonal flow.',
    imageCount: 3,
    canvasW: 1800,
    canvasH: 1600,
    defaultPlatform: platform,
    slots: three.map((p, i) => ({
      imageIndex: i,
      platform,
      x: p.x,
      y: p.y,
      scale: p.scale,
      shadow: true,
    })),
  }

  // ---- Template 4: Grid of 6 ----
  const six = gridLayout(platform, 2200, 1900, 3, 2, 820, 60, 80)
  const sixTpl: MockupTemplate = {
    id: 'grid6',
    name: 'Grid of 6',
    description: 'Six devices in a clean 3×2 grid for full galleries.',
    imageCount: 6,
    canvasW: 2200,
    canvasH: 1900,
    defaultPlatform: platform,
    slots: six.map((p, i) => ({
      imageIndex: i,
      platform,
      x: p.x,
      y: p.y,
      scale: p.scale,
      shadow: true,
    })),
  }

  return [singleTpl, twoTpl, threeTpl, sixTpl]
}
