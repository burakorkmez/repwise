// All reads. Pages call these from async Server Components inside <Suspense> (no caching in v1).
import { and, arrayContains, asc, desc, eq, gt, inArray, isNotNull, sql, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { db } from "@/lib/db"
import { lessons, profiles, programs, purchases, reviews, slots } from "@/lib/db/schema"
import { isUuid } from "@/lib/utils"

// ---- Trainers

const trainerFields = {
  id: profiles.userId,
  name: profiles.name,
  avatarUrl: profiles.avatarUrl,
  headline: profiles.headline,
  bio: profiles.bio,
  specialties: profiles.specialties,
  sessionPriceCents: profiles.sessionPriceCents,
  rating: sql<number>`(select coalesce(avg(${reviews.rating}), 0)::float from ${reviews} where ${reviews.trainerId} = ${profiles.userId})`,
  reviewCount: sql<number>`(select count(*)::int from ${reviews} where ${reviews.trainerId} = ${profiles.userId})`,
}

export type TrainerSummary = Awaited<ReturnType<typeof listTrainers>>[number]

// Featured = most reviewed; the directory uses the same order
export function listTrainers({ specialty, limit = 60 }: { specialty?: string; limit?: number } = {}) {
  return db
    .select(trainerFields)
    .from(profiles)
    .where(and(eq(profiles.role, "trainer"), specialty ? arrayContains(profiles.specialties, [specialty]) : undefined))
    .orderBy(desc(trainerFields.reviewCount), desc(trainerFields.rating), asc(profiles.name))
    .limit(limit)
}

export async function getTrainer(id: string) {
  if (!isUuid(id)) return null
  const [trainer] = await db
    .select(trainerFields)
    .from(profiles)
    .where(and(eq(profiles.userId, id), eq(profiles.role, "trainer")))
  return trainer ?? null
}

// ---- Programs

const programFields = {
  id: programs.id,
  trainerId: programs.trainerId,
  title: programs.title,
  description: programs.description,
  coverUrl: programs.coverUrl,
  priceCents: programs.priceCents,
  published: programs.published,
  trainerName: profiles.name,
  trainerAvatarUrl: profiles.avatarUrl,
  lessonCount: sql<number>`(select count(*)::int from ${lessons} where ${lessons.programId} = ${programs.id})`,
  sales: sql<number>`(select count(*)::int from ${purchases} where ${purchases.programId} = ${programs.id})`,
  revenueCents: sql<number>`(select coalesce(sum(${purchases.amountCents}), 0)::int from ${purchases} where ${purchases.programId} = ${programs.id})`,
}

export type ProgramSummary = Awaited<ReturnType<typeof listPrograms>>[number]

export function listPrograms(where: SQL | undefined, limit = 60) {
  return db
    .select(programFields)
    .from(programs)
    .innerJoin(profiles, eq(profiles.userId, programs.trainerId))
    .where(where)
    .orderBy(desc(programs.createdAt))
    .limit(limit)
}

export const publishedPrograms = (limit?: number) => listPrograms(eq(programs.published, true), limit)
export const trainerPrograms = (trainerId: string, includeDrafts = false) =>
  listPrograms(and(eq(programs.trainerId, trainerId), includeDrafts ? undefined : eq(programs.published, true)))
export const ownedPrograms = (clientId: string) =>
  listPrograms(
    inArray(
      programs.id,
      db.select({ id: purchases.programId }).from(purchases).where(and(eq(purchases.clientId, clientId), eq(purchases.kind, "program"))),
    ),
  )

export async function getProgram(id: string) {
  if (!isUuid(id)) return null
  const [program] = await listPrograms(eq(programs.id, id), 1)
  if (!program) return null
  const lessonList = await db.select().from(lessons).where(eq(lessons.programId, id)).orderBy(asc(lessons.position))
  return { ...program, lessons: lessonList }
}

// ---- Purchases (access checks)

export async function ownsProgram(clientId: string, programId: string) {
  const [row] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.clientId, clientId), eq(purchases.programId, programId)))
    .limit(1)
  return !!row
}

export async function hasPurchasedFrom(clientId: string, trainerId: string) {
  const [row] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.clientId, clientId), eq(purchases.trainerId, trainerId)))
    .limit(1)
  return !!row
}

// ---- Slots

// A hold that outlived its checkout counts as open again
export const slotIsOpen = sql<boolean>`(${slots.status} = 'open' or (${slots.status} = 'held' and ${slots.heldUntil} < now()))`

// Sessions stay listed until an hour after they start, so "Join call" works during the session
const notOver = gt(slots.startsAt, sql`now() - interval '1 hour'`)

export const clientSessions = (clientId: string) =>
  db
    .select({ id: slots.id, startsAt: slots.startsAt, trainerId: slots.trainerId, trainerName: profiles.name, trainerAvatarUrl: profiles.avatarUrl })
    .from(slots)
    .innerJoin(profiles, eq(profiles.userId, slots.trainerId))
    .where(and(eq(slots.clientId, clientId), eq(slots.status, "booked"), notOver))
    .orderBy(asc(slots.startsAt))

// Every slot the trainer still cares about, with whoever holds or booked it
export const trainerSlots = (trainerId: string) =>
  db
    .select({
      id: slots.id,
      startsAt: slots.startsAt,
      status: sql<"open" | "held" | "booked">`case when ${slotIsOpen} then 'open' else ${slots.status}::text end`,
      clientName: profiles.name,
      clientAvatarUrl: profiles.avatarUrl,
    })
    .from(slots)
    .leftJoin(profiles, eq(profiles.userId, slots.clientId))
    .where(and(eq(slots.trainerId, trainerId), notOver))
    .orderBy(asc(slots.startsAt))

export async function getCallSlot(slotId: string) {
  if (!isUuid(slotId)) return null
  const trainer = alias(profiles, "trainer")
  const client = alias(profiles, "client")
  const [slot] = await db
    .select({
      id: slots.id,
      startsAt: slots.startsAt,
      status: slots.status,
      trainerId: slots.trainerId,
      clientId: slots.clientId,
      trainerName: trainer.name,
      trainerAvatarUrl: trainer.avatarUrl,
      clientName: client.name,
      clientAvatarUrl: client.avatarUrl,
    })
    .from(slots)
    .innerJoin(trainer, eq(trainer.userId, slots.trainerId))
    .leftJoin(client, eq(client.userId, slots.clientId))
    .where(eq(slots.id, slotId))
  return slot ?? null
}

// ---- Reviews

export const trainerReviews = (trainerId: string) =>
  db
    .select({ id: reviews.id, clientId: reviews.clientId, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt, clientName: profiles.name, clientAvatarUrl: profiles.avatarUrl })
    .from(reviews)
    .innerJoin(profiles, eq(profiles.userId, reviews.clientId))
    .where(eq(reviews.trainerId, trainerId))
    .orderBy(desc(reviews.createdAt))

export function featuredReviews() {
  const trainer = alias(profiles, "trainer")
  return db
    .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, clientName: profiles.name, clientAvatarUrl: profiles.avatarUrl, trainerName: trainer.name })
    .from(reviews)
    .innerJoin(profiles, eq(profiles.userId, reviews.clientId))
    .innerJoin(trainer, eq(trainer.userId, reviews.trainerId))
    .where(and(eq(reviews.rating, 5), isNotNull(reviews.comment)))
    .orderBy(desc(reviews.createdAt))
    .limit(3)
}

// ---- Trainer dashboard

export const trainerSessions = (trainerId: string) =>
  db
    .select({ id: slots.id, startsAt: slots.startsAt, clientName: profiles.name, clientAvatarUrl: profiles.avatarUrl })
    .from(slots)
    .innerJoin(profiles, eq(profiles.userId, slots.clientId))
    .where(and(eq(slots.trainerId, trainerId), eq(slots.status, "booked"), notOver))
    .orderBy(asc(slots.startsAt))

// Gross earnings for the last 8 weeks (Monday-start, UTC), zero-filled
export async function weeklyEarnings(trainerId: string) {
  const week = sql<string>`to_char(date_trunc('week', ${purchases.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`
  const rows = await db
    .select({ week, cents: sql<number>`sum(${purchases.amountCents})::int` })
    .from(purchases)
    .where(and(eq(purchases.trainerId, trainerId), gt(purchases.createdAt, sql`now() - interval '8 weeks'`)))
    .groupBy(week)
  const totals = new Map(rows.map((r) => [r.week, r.cents]))

  const monday = new Date()
  monday.setUTCHours(0, 0, 0, 0)
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))
  return Array.from({ length: 8 }, (_, i) => {
    const start = new Date(monday.getTime() - (7 - i) * 7 * 864e5)
    const key = start.toISOString().slice(0, 10)
    return { key, start, cents: totals.get(key) ?? 0 }
  })
}

export const trainerClients = (trainerId: string) =>
  db
    .select({
      id: purchases.clientId,
      name: profiles.name,
      avatarUrl: profiles.avatarUrl,
      programTitles: sql<string[]>`coalesce(array_agg(distinct ${programs.title}) filter (where ${programs.title} is not null), '{}')`,
      sessions: sql<number>`(count(*) filter (where ${purchases.kind} = 'session'))::int`,
      totalCents: sql<number>`sum(${purchases.amountCents})::int`,
      lastPurchaseAt: sql<Date>`max(${purchases.createdAt})`.mapWith(purchases.createdAt),
    })
    .from(purchases)
    .innerJoin(profiles, eq(profiles.userId, purchases.clientId))
    .leftJoin(programs, eq(programs.id, purchases.programId))
    .where(eq(purchases.trainerId, trainerId))
    .groupBy(purchases.clientId, profiles.name, profiles.avatarUrl)
    .orderBy(desc(sql`max(${purchases.createdAt})`))
