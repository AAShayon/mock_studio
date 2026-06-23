import type {
  BackgroundStyle,
  CanvasOrientation,
  DesignStyleId,
  DeviceFrame,
  FitMode,
  MockupTemplate,
  SlotText,
} from './types'
import { DESIGN_STYLES } from './types'

function addRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  addRoundedRect(ctx, x, y, w, h, r)
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bg: BackgroundStyle) {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color
    ctx.fillRect(0, 0, w, h)
    return
  }
  const angle = (bg.angle * Math.PI) / 180
  const cx = w / 2; const cy = h / 2
  const len = Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h
  const dx = (Math.cos(angle) * len) / 2
  const dy = (Math.sin(angle) * len) / 2
  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
  grad.addColorStop(0, bg.from)
  grad.addColorStop(1, bg.to)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

function drawImageFit(ctx: CanvasRenderingContext2D, img: CanvasImageSource, sw: number, sh: number, boxX: number, boxY: number, boxW: number, boxH: number, mode: FitMode) {
  if (mode === 'stretch') { ctx.drawImage(img, boxX, boxY, boxW, boxH); return }
  const imgRatio = sw / sh
  const boxRatio = boxW / boxH
  let drawW: number, drawH: number
  if (mode === 'cover') {
    if (imgRatio > boxRatio) { drawH = boxH; drawW = boxH * imgRatio }
    else { drawW = boxW; drawH = boxW / imgRatio }
  } else {
    if (imgRatio > boxRatio) { drawW = boxW; drawH = boxW / imgRatio }
    else { drawH = boxH; drawW = boxH * imgRatio }
  }
  ctx.drawImage(img, boxX + (boxW - drawW) / 2, boxY + (boxH - drawH) / 2, drawW, drawH)
}

function drawDeviceFrame(ctx: CanvasRenderingContext2D, frame: DeviceFrame, scale: number, shadow: boolean, designStyleId: DesignStyleId) {
  const W = frame.frameW * scale
  const H = frame.frameH * scale
  const r = frame.frameRadius * scale
  const sx = frame.screenX * scale; const sy = frame.screenY * scale
  const sw = frame.screenW * scale; const sh = frame.screenH * scale
  const sr = frame.screenRadius * scale
  const ds = DESIGN_STYLES.find(d => d.id === designStyleId) ?? DESIGN_STYLES[0]

  ctx.save()
  if (shadow) {
    ctx.save()
    roundedRectPath(ctx, 0, 0, W, H, r)
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 60 * scale
    ctx.shadowOffsetY = 30 * scale
    ctx.fillStyle = ds.bodyEdge
    ctx.fill()
    ctx.restore()
  }

  ctx.beginPath()
  addRoundedRect(ctx, 0, 0, W, H, r)
  addRoundedRect(ctx, sx, sy, sw, sh, sr)
  const bodyGrad = ctx.createLinearGradient(0, 0, 0, H)
  bodyGrad.addColorStop(0, ds.bodyTop)
  bodyGrad.addColorStop(1, ds.bodyBottom)
  ctx.fillStyle = bodyGrad
  ctx.fill('evenodd')

  ctx.save()
  ctx.beginPath()
  addRoundedRect(ctx, 0, 0, W, H, r)
  addRoundedRect(ctx, sx, sy, sw, sh, sr)
  ctx.clip('evenodd')
  const sheenGrad = ctx.createLinearGradient(0, 0, 0, H * 0.25)
  sheenGrad.addColorStop(0, 'rgba(255,255,255,0.10)')
  sheenGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheenGrad
  ctx.fillRect(0, 0, W, H * 0.25)
  ctx.restore()

  roundedRectPath(ctx, sx, sy, sw, sh, sr)
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'
  ctx.lineWidth = Math.max(1, 2 * scale)
  ctx.stroke()

  roundedRectPath(ctx, 0.5, 0.5, W - 1, H - 1, r)
  ctx.strokeStyle = ds.bodyEdge
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function drawDeviceNotch(ctx: CanvasRenderingContext2D, frame: DeviceFrame, scale: number) {
  const cx = (frame.frameW * scale) / 2
  if (frame.notch.kind === 'island') {
    const w = frame.notch.width * scale; const h = frame.notch.height * scale
    const y = frame.notch.topOffset * scale; const x = cx - w / 2
    ctx.save()
    roundedRectPath(ctx, x, y, w, h, h / 2)
    ctx.fillStyle = '#000'; ctx.fill()
    ctx.beginPath(); ctx.arc(x + w * 0.82, y + h / 2, h * 0.16, 0, Math.PI * 2)
    ctx.fillStyle = '#0c0c10'; ctx.fill()
    ctx.beginPath(); ctx.arc(x + w * 0.82, y + h / 2, h * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1a2a'; ctx.fill()
    ctx.restore()
  } else if (frame.notch.kind === 'punchhole') {
    const r = frame.notch.radius * scale; const y = frame.notch.topOffset * scale
    ctx.save()
    ctx.beginPath(); ctx.arc(cx, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#000'; ctx.fill()
    ctx.beginPath(); ctx.arc(cx, y, r * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a1a'; ctx.fill()
    ctx.restore()
  }
}

function drawSlotText(ctx: CanvasRenderingContext2D, text: SlotText, slotX: number, slotY: number, slotW: number, slotH: number, canvasW: number, canvasH: number) {
  if (!text.title && !text.subtitle) return
  ctx.save()

  let baseX: number, baseY: number
  const lineH = text.fontSize * 1.3

  if (text.position === 'top') {
    baseX = slotX
    baseY = slotY - 20 - (text.subtitle ? lineH * 2 : lineH)
  } else if (text.position === 'overlay') {
    baseX = slotX + 16
    baseY = slotY + slotH - 50 - (text.subtitle ? lineH * 2 : lineH)
  } else {
    baseX = slotX
    baseY = slotY + slotH + 30
  }

  if (text.align === 'center') baseX = slotX + slotW / 2
  else if (text.align === 'right') baseX = slotX + slotW

  ctx.textAlign = text.align === 'center' ? 'center' : text.align === 'right' ? 'right' : 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = text.color

  if (text.position === 'overlay') {
    const padding = 12
    const tw = ctx.measureText(text.title || '').width + padding * 2
    const th = lineH * (text.subtitle ? 2 : 1) + padding
    const bx = slotX + (slotW - tw) / 2
    const by = slotY + slotH - th - 16
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    roundedRectPath(ctx, bx, by, tw, th, 12)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    baseX = slotX + slotW / 2
    baseY = by + padding
  }

  ctx.font = `700 ${text.fontSize}px "Poppins", sans-serif`
  if (text.title) ctx.fillText(text.title, baseX, baseY)
  if (text.subtitle) {
    ctx.font = `${text.fontSize * 0.75}px "Poppins", sans-serif`
    ctx.globalAlpha = 0.8
    ctx.fillText(text.subtitle, baseX, baseY + lineH)
  }
  ctx.restore()
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, index: number) {
  ctx.save()
  ctx.fillStyle = '#16161a'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 2
  const step = 40
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath()
    ctx.moveTo(x + i, y)
    ctx.lineTo(x + i + h, y + h)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.font = `bold ${Math.min(w, h) * 0.22}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(index), x + w / 2, y + h / 2)
  ctx.restore()
}

export interface RenderOptions {
  template: MockupTemplate
  images: (HTMLImageElement | null)[]
  background: BackgroundStyle
  fitMode: FitMode
  designStyleId: DesignStyleId
  slotTexts: Record<number, SlotText>
}

export function renderMockup(ctx: CanvasRenderingContext2D, opts: RenderOptions) {
  const { template, images, background, fitMode, designStyleId, slotTexts } = opts
  const { canvasW, canvasH } = template

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvasW, canvasH)
  drawBackground(ctx, canvasW, canvasH, background)

  for (const slot of template.slots) {
    const frame = getFrame(slot.platform)
    ctx.save()
    ctx.translate(slot.x, slot.y)

    const sx = frame.screenX * slot.scale; const sy = frame.screenY * slot.scale
    const sw = frame.screenW * slot.scale; const sh = frame.screenH * slot.scale
    const sr = frame.screenRadius * slot.scale

    drawDeviceFrame(ctx, frame, slot.scale, !!slot.shadow, designStyleId)

    ctx.save()
    roundedRectPath(ctx, sx, sy, sw, sh, sr)
    ctx.clip()
    ctx.fillStyle = '#0b0b0d'
    ctx.fillRect(sx, sy, sw, sh)

    const img = images[slot.imageIndex] ?? null
    if (img) {
      drawImageFit(ctx, img, img.naturalWidth || img.width, img.naturalHeight || img.height, sx, sy, sw, sh, fitMode)
    } else {
      drawPlaceholder(ctx, sx, sy, sw, sh, slot.imageIndex + 1)
    }
    ctx.restore()

    drawDeviceNotch(ctx, frame, slot.scale)
    ctx.restore()

    const st = slotTexts[slot.imageIndex]
    if (st) {
      drawSlotText(ctx, st, slot.x, slot.y, sw, sh, canvasW, canvasH)
    }
  }
}

import { getDeviceFrame } from './frames'
function getFrame(platform: Parameters<typeof getDeviceFrame>[0]) { return getDeviceFrame(platform) }

export function exportCanvas(
  template: MockupTemplate,
  images: (HTMLImageElement | null)[],
  background: BackgroundStyle,
  fitMode: FitMode,
  format: 'png' | 'jpeg',
  designStyleId: DesignStyleId,
  slotTexts: Record<number, SlotText>,
  quality = 0.95,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = template.canvasW
  canvas.height = template.canvasH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context')
  renderMockup(ctx, { template, images, background, fitMode, designStyleId, slotTexts })
  const type = format === 'png' ? 'image/png' : 'image/jpeg'
  return canvas.toDataURL(type, quality)
}
