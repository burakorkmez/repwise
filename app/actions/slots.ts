"use server"

import { and, between, eq } from "drizzle-orm"
import { refresh } from "next/cache"
import type { ActionResult } from "@/components/action-form"
import { requireTrainer } from "@/lib/auth"
import { db } from "@/lib/db"
import { slots } from "@/lib/db/schema"
import { slotIsOpen } from "@/lib/queries"
import { isUuid } from "@/lib/utils"

const HOUR = 3600e3

// startsAt arrives as an ISO string the browser built from the trainer's local time
export async function addSlot(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const trainer = await requireTrainer()
  const startsAt = new Date(String(formData.get("startsAt")))
  if (Number.isNaN(startsAt.getTime())) return { error: "Pick a date and time" }
  if (startsAt.getTime() <= Date.now()) return { error: "Pick a time in the future" }

  // Sessions are 60 minutes, so slots less than an hour apart would overlap
  const [clash] = await db
    .select({ id: slots.id })
    .from(slots)
    .where(and(eq(slots.trainerId, trainer.userId), between(slots.startsAt, new Date(startsAt.getTime() - HOUR + 1), new Date(startsAt.getTime() + HOUR - 1))))
    .limit(1)
  if (clash) return { error: "That overlaps another slot" }

  await db.insert(slots).values({ trainerId: trainer.userId, startsAt })
  refresh()
}

// Only open slots (including lapsed holds) can go; booked ones are paid for
export async function deleteSlot(slotId: string): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(slotId)) return { error: "Slot not found" }
  const deleted = await db
    .delete(slots)
    .where(and(eq(slots.id, slotId), eq(slots.trainerId, trainer.userId), slotIsOpen))
    .returning({ id: slots.id })
  if (!deleted.length) return { error: "Someone is booking this slot, so it can't be deleted" }
  refresh()
}
