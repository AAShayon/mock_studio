// Core type definitions for the Device Mockup Generator

export type Platform = 'ios' | 'android'

export type FitMode = 'cover' | 'contain' | 'stretch'

export type ExportFormat = 'png' | 'jpeg'

export type CanvasOrientation = 'portrait' | 'landscape'

export type BackgroundStyle =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }

export type DesignStyleId = 'titanium' | 'midnight' | 'gold' | 'rosegold' | 'graphite'

export interface DesignStyle {
  id: DesignStyleId
  name: string
  bodyTop: string
  bodyBottom: string
  bodyEdge: string
  edgeHighlight: string
}

export const DESIGN_STYLES: DesignStyle[] = [
  { id: 'titanium', name: 'Titanium', bodyTop: '#3a3a3c', bodyBottom: '#1c1c1e', bodyEdge: '#0a0a0a', edgeHighlight: '#545456' },
  { id: 'midnight', name: 'Midnight', bodyTop: '#1a1a2e', bodyBottom: '#0f0f1a', bodyEdge: '#06060e', edgeHighlight: '#2a2a4e' },
  { id: 'gold', name: 'Gold', bodyTop: '#c9a96e', bodyBottom: '#8b6914', bodyEdge: '#5c4510', edgeHighlight: '#e8d5a3' },
  { id: 'rosegold', name: 'Rose Gold', bodyTop: '#e8b4b8', bodyBottom: '#c17a7e', bodyEdge: '#8e5559', edgeHighlight: '#f2d0d2' },
  { id: 'graphite', name: 'Graphite', bodyTop: '#4a4a4a', bodyBottom: '#2a2a2a', bodyEdge: '#1a1a1a', edgeHighlight: '#6a6a6a' },
]

export interface SlotText {
  title: string
  subtitle: string
  fontSize: number
  color: string
  position: 'top' | 'bottom' | 'overlay'
  align: 'left' | 'center' | 'right'
}

// A device frame definition (in design pixels)
export interface DeviceFrame {
  id: Platform
  label: string
  // Full frame dimensions (design space)
  frameW: number
  frameH: number
  // Screen area (where the user image is drawn) in design space
  screenX: number
  screenY: number
  screenW: number
  screenH: number
  // Corner radii
  frameRadius: number
  screenRadius: number
  // Body color (gradient stops)
  bodyTop: string
  bodyBottom: string
  bodyEdge: string
  // Notch / camera
  notch:
    | { kind: 'island'; width: number; height: number; topOffset: number }
    | { kind: 'punchhole'; radius: number; topOffset: number }
    | { kind: 'none' }
  // Side accent (titanium edge highlight)
  edgeHighlight: string
}

// A single slot placed on the output canvas
export interface MockupSlot {
  // Index of the source image this slot consumes (0-based)
  imageIndex: number
  // Device to render
  platform: Platform
  // Position of the device frame's top-left on the output canvas (in canvas px)
  x: number
  y: number
  // Scale factor applied to the design-space device
  scale: number
  // Optional rotation in degrees
  rotation?: number
  // Optional drop shadow
  shadow?: boolean
}

export interface MockupTemplate {
  id: string
  name: string
  description: string
  imageCount: number
  // Output canvas dimensions (in px)
  canvasW: number
  canvasH: number
  // Default platform for slots (can be overridden per slot)
  defaultPlatform: Platform
  slots: MockupSlot[]
}

// An uploaded image kept in memory
export interface UploadedImage {
  id: string
  name: string
  // Object URL or data URL
  src: string
  width: number
  height: number
}
