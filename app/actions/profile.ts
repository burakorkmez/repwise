"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import type { ActionResult } from "@/components/action-form"
import { isFileIn } from "@/lib/access"
import { homeFor, requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { specialties } from "@/lib/specialties"

const trainerFields = z.object({
  headline: z.string().trim().min(3, "Add a headline").max(80, "Keep the headline under 80 characters"),
  bio: z.string().trim().min(20, "Write a bio of at least 20 characters").max(1000),
  specialties: z.array(z.enum(specialties.map((s) => s.slug))).min(1, "Pick at least one specialty"),
  price: z.coerce.number().int().min(10, "Session price must be at least $10").max(1000, "Session price must be $1,000 or less"),
})

// The ImageKit path of an onboarding upload (hidden input); without one we keep the Google photo
const avatarPath = z
  .string()
  .refine((path) => isFileIn("/avatars", path), "Upload your photo again")
  .optional()

export async function createProfile(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  if (user.profile) redirect(homeFor(user.profile.role))

  const role = z.enum(["client", "trainer"]).catch("client").parse(formData.get("role"))
  const avatar = avatarPath.safeParse(formData.get("avatar") || undefined)
  if (!avatar.success) return { error: avatar.error.issues[0].message }
  let trainer = {}
  if (role === "trainer") {
    const parsed = trainerFields.safeParse({
      headline: formData.get("headline"),
      bio: formData.get("bio"),
      specialties: formData.getAll("specialties"),
      price: formData.get("price"),
    })
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const { price, ...rest } = parsed.data
    trainer = { ...rest, sessionPriceCents: price * 100 }
  }

  await db
    .insert(profiles)
    .values({ userId: user.id, role, name: user.name || user.email, avatarUrl: avatar.data ?? user.image, ...trainer })
    .onConflictDoNothing()
  // New clients start by browsing coaches
  redirect(role === "trainer" ? "/dashboard" : "/trainers")
}
