"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

// Browser UI color per theme; mirrors --background in app/globals.css
export const THEME_COLORS = { light: "#f8fbf9", dark: "#0a0f0d" } as const

const syncThemeColor = (theme: keyof typeof THEME_COLORS) => {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement("meta")
    meta.name = "theme-color"
    document.head.appendChild(meta)
  }
  meta.content = THEME_COLORS[theme]
}

const toggle = () => {
  const root = document.documentElement
  const next = root.dataset.theme === "dark" ? "light" : "dark"
  root.dataset.theme = next
  localStorage.setItem("theme", next)
  syncThemeColor(next)
}

// Icon swaps via CSS so server and client markup always match
export function ThemeToggle() {
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}
