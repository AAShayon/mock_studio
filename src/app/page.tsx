'use client'

import { Smartphone, Github, Shield, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { PlatformSelector } from '@/components/mockup/PlatformSelector'
import { TemplateSelector } from '@/components/mockup/TemplateSelector'
import { CanvasPreview } from '@/components/mockup/CanvasPreview'
import { UploadPanel } from '@/components/mockup/UploadPanel'
import { ControlPanel } from '@/components/mockup/ControlPanel'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-foreground to-foreground/70 text-background shadow-md">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-base font-bold tracking-tight sm:text-lg">
                Mockup Studio
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Device Frame Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground md:flex">
              <Shield className="h-3 w-3 text-emerald-500" />
              100% in-browser
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <main className="mx-auto w-full max-w-[1800px] flex-1 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_340px] lg:gap-5">
          {/* Left panel: Platform + Template */}
          <aside className="order-2 flex flex-col gap-4 lg:order-1 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto lg:pr-1 lg:[scrollbar-width:thin]">
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">1 · Platform</h2>
              <PlatformSelector />
            </section>
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">2 · Template</h2>
              <TemplateSelector />
            </section>
          </aside>

          {/* Center: Canvas stage */}
          <section className="order-1 lg:order-2">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border bg-card shadow-sm [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:20px_20px] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] lg:min-h-[calc(100vh-160px)]">
              <CanvasPreview />
            </div>
          </section>

          {/* Right panel: Upload + Controls */}
          <aside className="order-3 flex flex-col gap-4 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto lg:pr-1 lg:[scrollbar-width:thin]">
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">3 · Images</h2>
              <UploadPanel />
            </section>
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">4 · Style & Export</h2>
              <ControlPanel />
            </section>
          </aside>
        </div>
      </main>

      {/* Footer (sticky to bottom via mt-auto) */}
      <footer className="mt-auto border-t bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>
              Runs entirely in your browser — your images never leave your device.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Built with Next.js · Canvas API</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">© {new Date().getFullYear()} Mockup Studio</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
