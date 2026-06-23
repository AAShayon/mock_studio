import type {
  BackgroundStyle,
  DeviceFrame,
  FitMode,
  MockupTemplate,
} from './types'

// ---- Low-level canvas helpers ----

// Add a rounded-rect subpath to the CURRENT path (does not call beginPath).
function addRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// Begin a fresh path with a single rounded rect.
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  addRoundedRect(ctx, x, y, w, h, r)
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: BackgroundStyle,
) {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color
    ctx.fillRect(0, 0, w, h)
    return
  }
  // gradient
  const angle = (bg.angle * Math.PI) / 180
  const cx = w / 2
  const cy = h / 2
  const len = Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h
  const dx = (Math.cos(angle) * len) / 2
  const dy = (Math.sin(angle) * len) / 2
  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
  grad.addColorStop(0, bg.from)
  grad.addColorStop(1, bg.to)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

// Draw an image into a box using the given fit mode (cover crops, contain letterboxes, stretch distorts)
function drawImageFit(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sw: number,
  sh: number,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  mode: FitMode,
) {
  if (mode === 'stretch') {
    ctx.drawImage(img, boxX, boxY, boxW, boxH)
    return
  }
  const imgRatio = sw / sh
  const boxRatio = boxW / boxH
  let drawW: number
  let drawH: number
  if (mode === 'cover') {
    if (imgRatio > boxRatio) {
      drawH = boxH
      drawW = boxH * imgRatio
    } else {
      drawW = boxW
      drawH = boxW / imgRatio
    }
  } else {
    // contain
    if (imgRatio > boxRatio) {
      drawW = boxW
      drawH = boxW / imgRatio
    } else {
      drawH = boxH
      drawW = boxH * imgRatio
    }
  }
  const dx = boxX + (boxW - drawW) / 2
  const dy = boxY + (boxH - drawH) / 2
  ctx.drawImage(img, dx, dy, drawW, drawH)
}

// ---- Device frame drawing ----

function drawDeviceFrame(
  ctx: CanvasRenderingContext2D,
  frame: DeviceFrame,
  scale: number,
  shadow: boolean,
) {
  const W = frame.frameW * scale
  const H = frame.frameH * scale
  const r = frame.frameRadius * scale
  // Screen hole geometry
  const sx = frame.screenX * scale
  const sy = frame.screenY * scale
  const sw = frame.screenW * scale
  const sh = frame.screenH * scale
  const sr = frame.screenRadius * scale

  ctx.save()

  // Drop shadow under the body (full body outline)
  if (shadow) {
    ctx.save()
    roundedRectPath(ctx, 0, 0, W, H, r)
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 60 * scale
    ctx.shadowOffsetY = 30 * scale
    ctx.fillStyle = frame.bodyEdge
    ctx.fill()
    ctx.restore()
  }

  // Body bezel with a screen hole punched out (even-odd fill).
  // The screen content (image) was already drawn underneath and shows
  // through the hole.
  ctx.beginPath()
  addRoundedRect(ctx, 0, 0, W, H, r)
  addRoundedRect(ctx, sx, sy, sw, sh, sr)
  const bodyGrad = ctx.createLinearGradient(0, 0, 0, H)
  bodyGrad.addColorStop(0, frame.bodyTop)
  bodyGrad.addColorStop(1, frame.bodyBottom)
  ctx.fillStyle = bodyGrad
  ctx.fill('evenodd')

  // Inner edge highlight (subtle top sheen) clipped to the bezel only
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

  // Thin inner border around the screen for definition
  roundedRectPath(ctx, sx, sy, sw, sh, sr)
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'
  ctx.lineWidth = Math.max(1, 2 * scale)
  ctx.stroke()

  // Thin outer stroke for definition
  roundedRectPath(ctx, 0.5, 0.5, W - 1, H - 1, r)
  ctx.strokeStyle = frame.bodyEdge
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

function drawDeviceNotch(
  ctx: CanvasRenderingContext2D,
  frame: DeviceFrame,
  scale: number,
) {
  const cx = (frame.frameW * scale) / 2
  if (frame.notch.kind === 'island') {
    const w = frame.notch.width * scale
    const h = frame.notch.height * scale
    const y = frame.notch.topOffset * scale
    const x = cx - w / 2
    ctx.save()
    // Subtle shadow under island
    roundedRectPath(ctx, x, y, w, h, h / 2)
    ctx.fillStyle = '#000'
    ctx.fill()
    // Tiny camera dot
    ctx.beginPath()
    ctx.arc(x + w * 0.82, y + h / 2, h * 0.16, 0, Math.PI * 2)
    ctx.fillStyle = '#0c0c10'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + w * 0.82, y + h / 2, h * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1a2a'
    ctx.fill()
    ctx.restore()
  } else if (frame.notch.kind === 'punchhole') {
    const r = frame.notch.radius * scale
    const y = frame.notch.topOffset * scale
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, y, r * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a1a'
    ctx.fill()
    ctx.restore()
  }
}

// Draw the screen recess border (dark inner border between screen and body)
function drawScreenRecess(
  ctx: CanvasRenderingContext2D,
  frame: DeviceFrame,
  scale: number,
) {
  const sx = frame.screenX * scale
  const sy = frame.screenY * scale
  const sw = frame.screenW * scale
  const sh = frame.screenH * scale
  const sr = frame.screenRadius * scale

  ctx.save()
  roundedRectPath(ctx, sx - 2, sy - 2, sw + 4, sh + 4, sr + 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()
}

// ---- Main render ----

export interface RenderOptions {
  template: MockupTemplate
  images: (HTMLImageElement | null)[] // indexed by slot.imageIndex
  background: BackgroundStyle
  fitMode: FitMode
}

export function renderMockup(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
) {
  const { template, images, background, fitMode } = opts
  const { canvasW, canvasH } = template

  // Reset
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvasW, canvasH)

  // Background
  drawBackground(ctx, canvasW, canvasH, background)

  // Render each slot back-to-front
  for (const slot of template.slots) {
    const frame = getFrame(slot.platform)
    ctx.save()
    ctx.translate(slot.x, slot.y)

    const sx = frame.screenX * slot.scale
    const sy = frame.screenY * slot.scale
    const sw = frame.screenW * slot.scale
    const sh = frame.screenH * slot.scale
    const sr = frame.screenRadius * slot.scale

    // 1. Device frame (drop shadow + bezel body with screen hole).
    //    The shadow pass fills the full body to cast a drop shadow, so the
    //    screen content must be drawn AFTER this to stay visible.
    drawDeviceFrame(ctx, frame, slot.scale, !!slot.shadow)

    // 2. Screen content (clipped to the rounded screen area)
    ctx.save()
    roundedRectPath(ctx, sx, sy, sw, sh, sr)
    ctx.clip()

    // Screen background (shows behind image or when no image)
    ctx.fillStyle = '#0b0b0d'
    ctx.fillRect(sx, sy, sw, sh)

    const img = images[slot.imageIndex] ?? null
    if (img) {
      drawImageFit(
        ctx,
        img,
        img.naturalWidth || img.width,
        img.naturalHeight || img.height,
        sx,
        sy,
        sw,
        sh,
        fitMode,
      )
    } else {
      // Placeholder pattern: subtle diagonal lines + icon hint
      drawPlaceholder(ctx, sx, sy, sw, sh, slot.imageIndex + 1)
    }
    ctx.restore()

    // 3. Notch / camera on top of the screen content
    drawDeviceNotch(ctx, frame, slot.scale)

    ctx.restore()
  }
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  index: number,
) {
  ctx.save()
  // diagonal stripes
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
  // index label
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.font = `bold ${Math.min(w, h) * 0.22}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(index), x + w / 2, y + h / 2)
  ctx.restore()
}

// Local import to avoid circular dependency at module-eval time
import { getDeviceFrame } from './frames'

function getFrame(platform: Parameters<typeof getDeviceFrame>[0]) {
  return getDeviceFrame(platform)
}

// Export an offscreen render to a data URL
export function exportCanvas(
  template: MockupTemplate,
  images: (HTMLImageElement | null)[],
  background: BackgroundStyle,
  fitMode: FitMode,
  format: 'png' | 'jpeg',
  quality = 0.95,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = template.canvasW
  canvas.height = template.canvasH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context')
  renderMockup(ctx, { template, images, background, fitMode })
  const type = format === 'png' ? 'image/png' : 'image/jpeg'
  return canvas.toDataURL(type, quality)
}
