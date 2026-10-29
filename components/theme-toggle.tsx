"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const toggle = () => {
  const root = document.documentElement
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"
  localStorage.setItem("theme", root.dataset.theme)
  // Keep the browser UI (mobile address bar) in step with the theme
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!.content =
    root.dataset.theme === "dark" ? "#0a0a0a" : "#ffffff"
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
