import { sql } from "drizzle-orm"
import { boolean, check, integer, pgEnum, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core"

export const role = pgEnum("role", ["client", "trainer"])
export const slotStatus = pgEnum("slot_status", ["open", "held", "booked"])
export const purchaseKind = pgEnum("purchase_kind", ["program", "session"])

// userId is the Neon Auth user id (neon_auth.user.id); trainer fields stay null for clients
export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey(),
  role: role("role").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  headline: text("headline"),
  bio: text("bio"),
  specialties: text("specialties").array(),
  sessionPriceCents: integer("session_price_cents"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

const profileRef = () => profiles.userId

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id").notNull().references(profileRef, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url"),
  priceCents: integer("price_cents").notNull(),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Position 1 is the free preview
export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull().references(() => programs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull(),
    videoPath: text("video_path"),
  },
  (t) => [unique().on(t.programId, t.position)],
)

// The slot is also the booking
export const slots = pgTable("slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id").notNull().references(profileRef, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  status: slotStatus("status").notNull().default("open"),
  clientId: uuid("client_id").references(profileRef, { onDelete: "set null" }),
  heldUntil: timestamp("held_until", { withTimezone: true }),
})

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(profileRef, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id").notNull().references(profileRef, { onDelete: "cascade" }),
    kind: purchaseKind("kind").notNull(),
    programId: uuid("program_id").references(() => programs.id),
    slotId: uuid("slot_id").references(() => slots.id),
    amountCents: integer("amount_cents").notNull(),
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("one_purchase_per_program").on(t.clientId, t.programId).where(sql`${t.kind} = 'program'`)],
)

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: uuid("trainer_id").notNull().references(profileRef, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull().references(profileRef, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.trainerId, t.clientId), check("rating_1_to_5", sql`${t.rating} BETWEEN 1 AND 5`)],
)

export type Profile = typeof profiles.$inferSelect
