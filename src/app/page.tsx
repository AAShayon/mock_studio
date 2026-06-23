'use client'

import { Smartphone, Shield, Sparkles, Monitor, Palette, Menu, X, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { PlatformSelector } from '@/components/mockup/PlatformSelector'
import { TemplateSelector } from '@/components/mockup/TemplateSelector'
import { CanvasPreview } from '@/components/mockup/CanvasPreview'
import { UploadPanel } from '@/components/mockup/UploadPanel'
import { ControlPanel } from '@/components/mockup/ControlPanel'
import { useState } from 'react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - dark theme like applaunchpad */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-neutral-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Mockup Studio
              </h1>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                Free
              </span>
            </div>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar nav sections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Dashboard sections">
          <div className="mb-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Configure
          </div>

          {/* Platform section */}
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Monitor className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Platform
              </span>
            </div>
            <PlatformSelector />
          </div>

          {/* Layout section */}
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Palette className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Layout
              </span>
            </div>
            <TemplateSelector />
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Quick info */}
          <div className="rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-white/50">
                100% in-browser
              </span>
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/30">v0.2.0</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-white px-4 dark:bg-neutral-900 sm:px-6">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="hidden items-center gap-2 rounded-full border bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 sm:flex">
              <Shield className="h-3 w-3 text-emerald-500" />
              Your images stay on your device
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 md:flex">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Canvas API
            </div>
          </div>
        </header>

        {/* Main content: 2-column grid (canvas + right panel) */}
        <main className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Canvas stage */}
            <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950 lg:min-h-[calc(100vh-56px)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.04),transparent_60%)]" />
              <CanvasPreview />
            </section>

            {/* Right panel: Upload + Controls */}
            <aside className="border-l bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col divide-y dark:divide-neutral-800">
                <section>
                  <div className="flex items-center gap-2 border-b bg-neutral-50/80 px-4 py-2.5 dark:bg-neutral-800/50">
                    <Smartphone className="h-3.5 w-3.5 text-neutral-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Images
                    </h2>
                    <span className="ml-auto rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-medium text-indigo-600 dark:text-indigo-400">
                      Drag & drop
                    </span>
                  </div>
                  <div className="p-4">
                    <UploadPanel />
                  </div>
                </section>
                <section>
                  <div className="flex items-center gap-2 border-b bg-neutral-50/80 px-4 py-2.5 dark:bg-neutral-800/50">
                    <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Style & Export
                    </h2>
                  </div>
                  <div className="p-4">
                    <ControlPanel />
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
