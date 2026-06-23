import type { DeviceFrame, Platform } from './types'

// Device frames defined in a "design space" of pixels.
// The screen coordinates tell the renderer exactly where the uploaded
// image should be drawn (clipped) inside the device bezel.
export const DEVICE_FRAMES: Record<Platform, DeviceFrame> = {
  ios: {
    id: 'ios',
    label: 'iPhone',
    // iPhone 15 Pro-style proportions
    frameW: 440,
    frameH: 912,
    // Screen sits inside a thin bezel
    screenX: 18,
    screenY: 18,
    screenW: 404,
    screenH: 876,
    frameRadius: 64,
    screenRadius: 50,
    // Titanium body gradient
    bodyTop: '#3a3a3c',
    bodyBottom: '#1c1c1e',
    bodyEdge: '#0a0a0a',
    edgeHighlight: '#545456',
    notch: { kind: 'island', width: 124, height: 36, topOffset: 30 },
  },
  android: {
    id: 'android',
    label: 'Android',
    // Pixel / Galaxy-style proportions
    frameW: 432,
    frameH: 912,
    screenX: 14,
    screenY: 14,
    screenW: 404,
    screenH: 884,
    frameRadius: 58,
    screenRadius: 46,
    bodyTop: '#2b2b2e',
    bodyBottom: '#121214',
    bodyEdge: '#08080a',
    edgeHighlight: '#48484b',
    notch: { kind: 'punchhole', radius: 9, topOffset: 26 },
  },
}

export function getDeviceFrame(platform: Platform): DeviceFrame {
  return DEVICE_FRAMES[platform]
}
