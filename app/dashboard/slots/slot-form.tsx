"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { addSlot } from "@/app/actions/slots"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// The trainer picks a time in their own zone; the hidden field sends it as an absolute instant
export function SlotForm({ children }: { children: React.ReactNode }) {
  const [local, setLocal] = useState("")
  return (
    <ActionForm action={addSlot}>
      <div className="mt-4 grid gap-2">
        <Label htmlFor="startsAt">Date & time</Label>
        <Input id="startsAt" type="datetime-local" required step={900} value={local} onChange={(e) => setLocal(e.target.value)} className="h-10" />
        <input type="hidden" name="startsAt" value={local && new Date(local).toISOString()} />
      </div>
      {children}
      <SubmitButton size="xl" className="mt-6 w-full">
        <Plus /> Add slot
      </SubmitButton>
    </ActionForm>
  )
}
