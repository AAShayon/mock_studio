---
Task ID: 1
Agent: main (Z.ai Code)
Task: Build a Device Mockup Generator web app per the user's 5-phase plan (platform/template selection, image upload, canvas merging with device frames, preview & download). Adapted to the required Next.js 16 + TypeScript + shadcn/ui stack.

Work Log:
- Designed a client-side mockup engine in `src/lib/mockup/`:
  - `types.ts` — Platform, FitMode, ExportFormat, BackgroundStyle, DeviceFrame, MockupSlot, MockupTemplate, UploadedImage types.
  - `frames.ts` — iPhone (Dynamic Island) & Android (punch-hole) device frames with explicit screen coordinates (screenX/Y/W/H, radii, body gradients, notch definitions).
  - `templates.ts` — 4 layout templates (Single Screenshot, 2-Image Collage, 3-Image Cascade, Grid of 6) computed via layout helpers (single/row/cascade/grid). Templates rebuild for the selected platform so every slot uses the right device.
  - `renderer.ts` — Canvas rendering engine: rounded-rect helpers (incl. subpath version for even-odd holes), background (solid/gradient at any angle), image fit modes (cover/contain/stretch), device frame drawing (drop shadow + titanium-gradient bezel with a screen hole via even-odd fill, sheen, inner/outer strokes), notch/island/punch-hole, placeholder, and high-res PNG/JPEG export via an offscreen canvas.
- Built state management with Zustand (`src/store/mockup-store.ts`): platform, templateId, images[], background, fitMode, exportFormat. `useCurrentTemplate` selects primitives + useMemo (avoids the useSyncExternalStore infinite-loop trap of returning fresh objects from a Zustand selector).
- Built a ref-free image-loading hook (`src/hooks/use-loaded-images.ts`) using `useSyncExternalStore` over a module-level image cache (React 19 strict rules forbid reading refs during render; the external-store pattern is the compliant solution).
- Built the 3-panel UI (`src/app/page.tsx`) with sticky header, sticky footer (mt-auto), responsive grid (3-col desktop / stacked mobile via CSS order), and a dotted "stage" background behind the canvas.
- Components in `src/components/mockup/`: PlatformSelector, TemplateSelector (mini SVG previews), CanvasPreview (renders to a full-res canvas, CSS-scaled), UploadPanel (drag-drop + per-slot upload + batch auto-fill), ControlPanel (solid/gradient background + presets + color pickers + angle slider, fit modes, export format, download button with sonner toast).
- Added ThemeProvider + ThemeToggle (next-themes) and Sonner toaster to `src/app/layout.tsx`; updated metadata.

Stage Summary:
- Two non-trivial bugs found & fixed during Agent-Browser verification:
  1. `useCurrentTemplate` returned a fresh object from the Zustand selector → useSyncExternalStore infinite loop ("Maximum update depth exceeded"). Fixed by selecting primitives + useMemo.
  2. Device frame body was drawn as a solid rounded rect that covered the screen image, AND the drop-shadow pass filled the whole body. Fixed by (a) drawing the bezel with an even-odd screen hole and (b) reordering so screen content (image) is drawn AFTER the frame, so the shadow fill no longer hides it.
- Verified with Agent Browser + VLM (z-ai vision) across all 4 templates, both platforms, all 3 fit modes, background presets, and PNG/JPEG export: images render correctly inside the device screens, no console/runtime errors, mobile layout stacks cleanly, sticky footer works.
- Lint passes with 0 errors/warnings.
