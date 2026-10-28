// Seeds demo data from lib/mock-data. Every trainer and client becomes a real Neon Auth user
// (<firstname>@example.com / demo1234), so you can log in as any of them.
// Re-runnable: deletes the seed users' profiles (cascading to their rows) and inserts fresh ones.
import { randomUUID } from "node:crypto"
import { inArray, sql } from "drizzle-orm"
import { db } from "../lib/db"
import { lessons, profiles, programs, purchases, reviews, slots } from "../lib/db/schema"
import * as mock from "../lib/mock-data"

const PASSWORD = "demo1234"
const emailFor = (slug: string) => `${slug.split("-")[0]}@example.com`

async function authUserId(name: string, email: string) {
  const { rows } = await db.execute<{ id: string }>(sql`select id from neon_auth."user" where email = ${email}`)
  if (rows[0]) return rows[0].id

  // Auth rate-limits sign-ups, so back off and retry on 429
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({ name, email, password: PASSWORD }),
    })
    if (res.ok) return ((await res.json()) as { user: { id: string } }).user.id
    if (res.status !== 429 || attempt === 10) throw new Error(`Sign-up failed for ${email}: ${res.status} ${await res.text()}`)
    const wait = Number(res.headers.get("retry-after")) || 10
    console.log(`Rate limited, retrying ${email} in ${wait}s`)
    await new Promise((r) => setTimeout(r, wait * 1000))
  }
}

async function main() {
  const ids: Record<string, string> = {}
  for (const p of [...mock.trainers, ...mock.clients]) ids[p.id] = await authUserId(p.name, emailFor(p.id))

  await db.delete(profiles).where(inArray(profiles.userId, Object.values(ids)))

  await db.insert(profiles).values([
    ...mock.trainers.map((t) => ({
      userId: ids[t.id],
      role: "trainer" as const,
      name: t.name,
      avatarUrl: t.avatarUrl,
      headline: t.headline,
      bio: t.bio,
      specialties: t.specialties,
      sessionPriceCents: t.sessionPriceCents,
    })),
    ...mock.clients.map((c) => ({ userId: ids[c.id], role: "client" as const, name: c.name, avatarUrl: c.avatarUrl })),
  ])

  const programIds = Object.fromEntries(mock.programs.map((p) => [p.id, randomUUID()]))
  await db.insert(programs).values(
    mock.programs.map((p) => ({
      id: programIds[p.id],
      trainerId: ids[p.trainerId],
      title: p.title,
      description: p.description,
      coverUrl: p.coverUrl,
      priceCents: p.priceCents,
      published: p.published,
    })),
  )
  await db.insert(lessons).values(
    mock.programs.flatMap((p) => p.lessons.map((l) => ({ programId: programIds[p.id], title: l.title, position: l.position }))),
  )

  // Shift the mock week forward in whole weeks so slots stay in the future and keep their weekdays
  const week = 7 * 864e5
  const first = Math.min(...mock.slots.map((s) => Date.parse(s.startsAt)))
  const shift = Math.max(0, Math.ceil((Date.now() + 864e5 - first) / week)) * week
  const slotIds = Object.fromEntries(mock.slots.map((s) => [s.id, randomUUID()]))
  await db.insert(slots).values(
    mock.slots.map((s) => ({
      id: slotIds[s.id],
      trainerId: ids[s.trainerId],
      startsAt: new Date(Date.parse(s.startsAt) + shift),
      status: s.status,
      clientId: s.clientId && ids[s.clientId],
      heldUntil: s.status === "held" ? new Date(Date.now() + 30 * 60e3) : null,
    })),
  )

  await db.insert(purchases).values(
    mock.purchases.map((p) => ({
      clientId: ids[p.clientId],
      trainerId: ids[p.trainerId],
      kind: p.kind,
      programId: p.programId && programIds[p.programId],
      slotId: p.slotId && slotIds[p.slotId],
      amountCents: p.amountCents,
      stripeSessionId: `seed_${p.id}`,
      createdAt: new Date(p.createdAt),
    })),
  )

  await db.insert(reviews).values(
    mock.reviews.map((r) => ({
      trainerId: ids[r.trainerId],
      clientId: ids[r.clientId],
      rating: r.rating,
      comment: r.comment,
      createdAt: new Date(r.createdAt),
    })),
  )

  console.log(
    `Seeded ${mock.trainers.length} trainers, ${mock.clients.length} clients, ${mock.programs.length} programs, ` +
      `${mock.slots.length} slots, ${mock.purchases.length} purchases, ${mock.reviews.length} reviews.`,
  )
  console.log(`Log in as a trainer: ${emailFor(mock.trainers[0].id)} / ${PASSWORD}`)
  console.log(`Log in as a client:  ${emailFor(mock.clients[0].id)} / ${PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$client.end())
