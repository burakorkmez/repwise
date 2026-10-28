"use server"

import { sql } from "drizzle-orm"
import { refresh } from "next/cache"
import { z } from "zod"
import type { ActionResult } from "@/components/action-form"
import { canReview } from "@/lib/access"
import { requireProfile } from "@/lib/auth"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { hasPurchasedFrom } from "@/lib/queries"
import { isUuid } from "@/lib/utils"

const reviewInput = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000, "Keep the review under 1,000 characters"),
})

// One review per client per trainer: a second submission edits the first
export async function submitReview(trainerId: string, _state: ActionResult, formData: FormData): Promise<ActionResult> {
  const me = await requireProfile()
  if (!isUuid(trainerId)) return { error: "Trainer not found" }
  const parsed = reviewInput.safeParse({ rating: formData.get("rating"), comment: formData.get("comment") ?? "" })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const hasPurchase = await hasPurchasedFrom(me.userId, trainerId)
  if (!canReview({ isSelf: me.userId === trainerId, hasPurchase })) {
    return { error: "Only clients who trained with this coach can review them" }
  }

  const values = { rating: parsed.data.rating, comment: parsed.data.comment || null }
  await db
    .insert(reviews)
    .values({ trainerId, clientId: me.userId, ...values })
    .onConflictDoUpdate({ target: [reviews.trainerId, reviews.clientId], set: { ...values, createdAt: sql`now()` } })
  refresh()
}
