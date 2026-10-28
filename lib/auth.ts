import { createNeonAuth } from "@neondatabase/auth/next/server"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
})

// One session + profile read per request; null when signed out, profile null before onboarding
export const getUser = cache(async () => {
  // Stop prerendering here; otherwise the SDK catches the prerender's cookies() bailout and logs it as an error
  await connection()
  const { data } = await auth.getSession()
  if (!data?.user) return null
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, data.user.id))
  const { id, name, email, image } = data.user
  return { id, name, email, image, profile: profile ?? null }
})

export async function requireUser() {
  const user = await getUser()
  if (!user) redirect("/auth/sign-in")
  return user
}

export async function requireProfile() {
  const { profile } = await requireUser()
  if (!profile) redirect("/onboarding")
  return profile
}

export async function requireTrainer() {
  const profile = await requireProfile()
  if (profile.role !== "trainer") redirect("/library")
  return profile
}

// Where a returning user belongs
export const homeFor = (role: "client" | "trainer") => (role === "trainer" ? "/dashboard" : "/library")
