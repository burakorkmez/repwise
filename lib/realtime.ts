import { createRealtime } from "@neon/realtime/server"
import { drizzleAdapter } from "@neon/realtime-drizzle"
import { and, asc, desc, eq, gt, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { profiles, programs, purchases, slots } from "@/lib/db/schema"

// Created on first use: `next build` imports modules without the runtime secrets
let realtime: ReturnType<typeof create> | undefined
function create() {
  return createRealtime({
    secret: process.env.NEON_REALTIME_SECRET!,
    db: new URL(process.env.DATABASE_URL!).pathname.slice(1),
    adapter: drizzleAdapter(),
    debugMode: process.env.NODE_ENV === "development",
  })
}
const getRealtime = () => (realtime ??= create())

// The trainer dashboard's live sales feed: the 10 newest sales, each carrying running totals over all sales.
// Live rows come back keyed by result column name, so every camelCase key is aliased to itself.
const salesQuery = (trainerId: string) =>
  db
    .select({
      id: purchases.id,
      kind: purchases.kind,
      amountCents: sql<number>`${purchases.amountCents}`.as("amountCents"),
      createdAt: sql<Date>`${purchases.createdAt}`.mapWith(purchases.createdAt).as("createdAt"),
      clientName: sql<string>`${profiles.name}`.as("clientName"),
      clientAvatarUrl: sql<string | null>`${profiles.avatarUrl}`.as("clientAvatarUrl"),
      programTitle: sql<string | null>`${programs.title}`.as("programTitle"),
      // Window aggregates run before LIMIT, so they cover every sale
      totalCents: sql<number>`(sum(${purchases.amountCents}) over ())::int`.as("totalCents"),
      salesCount: sql<number>`(count(*) over ())::int`.as("salesCount"),
    })
    .from(purchases)
    .innerJoin(profiles, eq(profiles.userId, purchases.clientId))
    .leftJoin(programs, eq(programs.id, purchases.programId))
    .where(eq(purchases.trainerId, trainerId))
    .orderBy(desc(purchases.createdAt), desc(purchases.id))
    .limit(10)

export type SaleRow = Awaited<ReturnType<typeof salesQuery>>[number]

// Read and seal the same query: the subscription's first result replaces these rows, so nothing falls in the gap
export async function loadSales(trainerId: string) {
  const query = salesQuery(trainerId)
  const [rows, sealedQuery] = await Promise.all([query, getRealtime().seal({ query })])
  return { rows, sealedQuery }
}

export const sealSales = (trainerId: string) => getRealtime().seal({ query: salesQuery(trainerId) })

// A trainer's upcoming slots, for the booking grid on their public profile (public data: anyone may subscribe).
// Live queries can't call now(), so "upcoming" is anchored to the page-load time, which renewals send back.
const slotsQuery = (trainerId: string, since: Date) =>
  db
    .select({
      id: slots.id,
      status: slots.status,
      startsAt: sql<Date>`${slots.startsAt}`.mapWith(slots.startsAt).as("startsAt"),
      heldUntil: sql<Date | null>`${slots.heldUntil}`.mapWith(slots.heldUntil).as("heldUntil"),
    })
    .from(slots)
    .where(and(eq(slots.trainerId, trainerId), gt(slots.startsAt, since)))
    .orderBy(asc(slots.startsAt))
    .limit(60)

export type SlotRow = Awaited<ReturnType<typeof slotsQuery>>[number]

export async function loadSlots(trainerId: string) {
  const since = new Date()
  const query = slotsQuery(trainerId, since)
  const [rows, sealedQuery] = await Promise.all([query, getRealtime().seal({ query })])
  return { rows, sealedQuery, since: since.toISOString() }
}

export const sealSlots = (trainerId: string, since: Date) => getRealtime().seal({ query: slotsQuery(trainerId, since) })
