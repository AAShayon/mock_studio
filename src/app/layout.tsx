import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mockup Studio — Device Frame Generator",
  description: "Create beautiful app store screenshots. Drop your screenshots into iPhone & Android device frames, pick a layout, and export high-resolution mockups instantly.",
  keywords: ["mockup generator", "device frame", "iPhone mockup", "Android mockup", "app screenshots", "screenshot mockup"],
  authors: [{ name: "Mockup Studio" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Mockup Studio — Device Frame Generator",
    description: "Drop screenshots into device frames and export high-res mockups.",
    siteName: "Mockup Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mockup Studio",
    description: "Create app store screenshots with device frames.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
