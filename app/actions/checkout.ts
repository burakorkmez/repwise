"use server"

import { randomUUID } from "node:crypto"
import * as Sentry from "@sentry/nextjs"
import { and, eq, gt, ne, sql } from "drizzle-orm"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import type { ActionResult } from "@/components/action-form"
import { requireProfile } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles, programs, purchases, slots } from "@/lib/db/schema"
import { slotIsOpen } from "@/lib/queries"
import { isUuid } from "@/lib/utils"

// Records a paid purchase and books its slot. Idempotent: a repeat stripeSessionId (or a second copy of the
// same program) inserts nothing.
// ponytail: no payment step yet, so the actions below fulfill immediately with a dev_ id. With Stripe they
// create a Checkout session instead, and the webhook calls this with the real session id.
async function fulfill(purchase: typeof purchases.$inferInsert) {
  const inserted = await db.transaction(async (tx) => {
    const [row] = await tx.insert(purchases).values(purchase).onConflictDoNothing().returning({ id: purchases.id })
    if (row && purchase.slotId) {
      await tx
        .update(slots)
        .set({ status: "booked", heldUntil: null })
        .where(and(eq(slots.id, purchase.slotId), eq(slots.clientId, purchase.clientId)))
    }
    return Boolean(row)
  })
  // One wide event per checkout, so Sentry Logs can answer "what sold, for how much, to whom"
  Sentry.logger.info("Purchase fulfilled", {
    kind: purchase.kind,
    amountCents: purchase.amountCents,
    clientId: purchase.clientId,
    trainerId: purchase.trainerId,
    itemId: purchase.programId ?? purchase.slotId ?? "",
    duplicate: !inserted,
  })
}

export async function buyProgram(programId: string): Promise<ActionResult> {
  const me = await requireProfile()
  if (!isUuid(programId)) return { error: "Program not found" }

  const [program] = await db
    .select()
    .from(programs)
    .where(and(eq(programs.id, programId), eq(programs.published, true)))
  if (!program) return { error: "This program isn't available" }
  if (program.trainerId === me.userId) return { error: "You can't buy your own program" }

  await fulfill({
    kind: "program",
    clientId: me.userId,
    trainerId: program.trainerId,
    programId,
    amountCents: program.priceCents,
    stripeSessionId: `dev_${randomUUID()}`,
  })
  refresh()
}

export async function bookSlot(slotId: string): Promise<ActionResult> {
  const me = await requireProfile()
  if (!isUuid(slotId)) return { error: "Slot not found" }

  // One atomic UPDATE: when two people race for a slot, exactly one gets a row back
  const [slot] = await db
    .update(slots)
    .set({ status: "held", clientId: me.userId, heldUntil: sql`now() + interval '30 minutes'` })
    .where(and(eq(slots.id, slotId), ne(slots.trainerId, me.userId), gt(slots.startsAt, sql`now()`), slotIsOpen))
    .returning()
  if (!slot) {
    Sentry.logger.warn("Slot no longer bookable", { slotId, clientId: me.userId })
    return { error: "That slot just got taken. Pick another time." }
  }

  const [trainer] = await db
    .select({ priceCents: profiles.sessionPriceCents })
    .from(profiles)
    .where(eq(profiles.userId, slot.trainerId))
  await fulfill({
    kind: "session",
    clientId: me.userId,
    trainerId: slot.trainerId,
    slotId: slot.id,
    amountCents: trainer.priceCents ?? 0,
    stripeSessionId: `dev_${randomUUID()}`,
  })
  redirect("/library")
}
