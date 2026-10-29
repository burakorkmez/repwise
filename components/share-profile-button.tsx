"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Copies e.g. "Train yoga with Sofia Alvarez on Repwise: <profile link>"
export function ShareProfileButton({ name, specialties }: { name: string; specialties: string[] }) {
  const [copied, setCopied] = useState(false)

  const share = () => {
    const specialty = specialties[0]?.toLowerCase()
    const pitch = specialty ? `Train ${specialty} with ${name}` : `Train with ${name}`
    navigator.clipboard.writeText(`${pitch} on Repwise: ${location.href}`)
    setCopied(true)
  }

  return (
    <Button variant="outline" size="xl" onClick={share}>
      {copied ? <Check /> : <Share2 />} {copied ? "Copied!" : "Share"}
    </Button>
  )
}
