// ponytail: hardcoded UI data mirroring the PLAN.md data model; replaced by Drizzle queries from Phase 1.

export type Trainer = {
  id: string
  name: string
  headline: string
  bio: string
  specialties: string[]
  sessionPriceCents: number
  avatarUrl: string
  rating: number
  reviewCount: number
}

export type Client = { id: string; name: string; avatarUrl?: string }

export type Lesson = { id: string; title: string; position: number }

export type Program = {
  id: string
  trainerId: string
  title: string
  description: string
  coverUrl: string
  priceCents: number
  published: boolean
  lessons: Lesson[]
  sales: number
}

export type Slot = {
  id: string
  trainerId: string
  startsAt: string
  status: "open" | "held" | "booked"
  clientId?: string
}

export type Review = {
  id: string
  trainerId: string
  clientId: string
  rating: number
  comment: string
  createdAt: string
}

export type Purchase = {
  id: string
  clientId: string
  trainerId: string
  kind: "program" | "session"
  programId?: string
  slotId?: string
  amountCents: number
  createdAt: string
}

export type Message = {
  id: string
  userId: string
  text: string
  at: string
  reactions?: { emoji: string; count: number }[]
  replies?: Message[]
}

export type Channel = { id: string; withId: string; messages: Message[] }

export const trainers: Trainer[] = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    headline: "Strength & conditioning coach",
    bio: "Former collegiate weightlifter with 10 years of coaching. I help busy people get genuinely strong with simple barbell programs, sound technique, and progress you can measure every week.",
    specialties: ["strength", "fat-loss"],
    sessionPriceCents: 9000,
    avatarUrl: "/images/trainers/maya-chen.jpg",
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: "marcus-reed",
    name: "Marcus Reed",
    headline: "HIIT & fat-loss specialist",
    bio: "High energy, no fluff. My sessions are short, brutal, and built to fit into a lunch break. Expect intervals, conditioning, and a coach who will not let you quit on the last round.",
    specialties: ["hiit", "fat-loss"],
    sessionPriceCents: 7500,
    avatarUrl: "/images/trainers/marcus-reed.jpg",
    rating: 4.8,
    reviewCount: 96,
  },
  {
    id: "sofia-alvarez",
    name: "Sofia Alvarez",
    headline: "Yoga & mobility coach",
    bio: "I teach mobility that actually transfers to your lifts and your life. Breath-led flows, joint prep, and recovery work for lifters, runners, and desk-bound humans.",
    specialties: ["yoga", "mobility"],
    sessionPriceCents: 6500,
    avatarUrl: "/images/trainers/sofia-alvarez.jpg",
    rating: 5,
    reviewCount: 74,
  },
  {
    id: "jake-thompson",
    name: "Jake Thompson",
    headline: "Boxing coach & ex-pro fighter",
    bio: "Twelve years in the ring, now coaching beginners and amateurs. Footwork, combinations, and fight-ready conditioning — you will leave every session sweating and smiling.",
    specialties: ["boxing", "hiit"],
    sessionPriceCents: 8500,
    avatarUrl: "/images/trainers/jake-thompson.jpg",
    rating: 4.9,
    reviewCount: 61,
  },
  {
    id: "aisha-khan",
    name: "Aisha Khan",
    headline: "Running coach · 5K to marathon",
    bio: "Certified running coach and three-time marathoner. I build plans around your schedule, keep you injury-free, and get you to your first (or fastest) race.",
    specialties: ["running", "mobility"],
    sessionPriceCents: 7000,
    avatarUrl: "/images/trainers/aisha-khan.jpg",
    rating: 4.8,
    reviewCount: 52,
  },
  {
    id: "leo-novak",
    name: "Leo Novak",
    headline: "Calisthenics & bodyweight coach",
    bio: "No gym, no problem. I coach pull-ups, handstands, and muscle-ups from zero, using nothing but your bodyweight and smart progressions.",
    specialties: ["calisthenics", "strength"],
    sessionPriceCents: 6000,
    avatarUrl: "/images/trainers/leo-novak.jpg",
    rating: 4.7,
    reviewCount: 43,
  },
]

export const clients: Client[] = [
  { id: "alex-morgan", name: "Alex Morgan" },
  { id: "jordan-lee", name: "Jordan Lee" },
  { id: "priya-patel", name: "Priya Patel" },
  { id: "sam-carter", name: "Sam Carter" },
  { id: "emma-wilson", name: "Emma Wilson" },
  { id: "noah-kim", name: "Noah Kim" },
  { id: "olivia-brooks", name: "Olivia Brooks" },
  { id: "daniel-ruiz", name: "Daniel Ruiz" },
]

// The signed-in users the UI pretends to be
export const me = clients[0]
export const meTrainer = trainers[0]

const lessons = (programId: string, titles: string[]): Lesson[] =>
  titles.map((title, i) => ({ id: `${programId}-${i + 1}`, title, position: i + 1 }))

export const programs: Program[] = [
  {
    id: "strength-foundations",
    trainerId: "maya-chen",
    title: "Strength Foundations",
    description:
      "An 8-week barbell program that teaches the big lifts from scratch and builds real, measurable strength with three sessions a week.",
    coverUrl: "/images/programs/strength-foundations.jpg",
    priceCents: 4900,
    published: true,
    sales: 312,
    lessons: lessons("strength-foundations", [
      "Welcome & how this program works",
      "Squat mechanics",
      "The hinge: deadlift basics",
      "Bench press setup",
      "Overhead press",
      "Rows & pull-ups",
      "Progressive overload explained",
      "Deload week & testing your maxes",
    ]),
  },
  {
    id: "upper-body-sculpt",
    trainerId: "maya-chen",
    title: "Upper Body Sculpt",
    description:
      "Six weeks of dumbbell-focused upper body work for stronger shoulders, a wider back, and better posture.",
    coverUrl: "/images/programs/upper-body-sculpt.jpg",
    priceCents: 3900,
    published: false,
    sales: 0,
    lessons: lessons("upper-body-sculpt", [
      "Intro & equipment",
      "Shoulder press progressions",
      "Building a wider back",
    ]),
  },
  {
    id: "hiit-shred-30",
    trainerId: "marcus-reed",
    title: "HIIT Shred 30",
    description:
      "Thirty-minute interval sessions that torch calories and build conditioning. Minimal equipment, maximum effort.",
    coverUrl: "/images/programs/hiit-shred-30.jpg",
    priceCents: 2900,
    published: true,
    sales: 487,
    lessons: lessons("hiit-shred-30", [
      "Start here: the HIIT rules",
      "Battle rope blitz",
      "Kettlebell conditioning",
      "Tabata ladder",
      "The 30-minute burner",
      "Finisher week",
    ]),
  },
  {
    id: "mobility-reset",
    trainerId: "sofia-alvarez",
    title: "Mobility Reset",
    description:
      "Fifteen-minute daily routines to unlock tight hips, shoulders, and spine. Perfect for lifters and desk workers.",
    coverUrl: "/images/programs/mobility-reset.jpg",
    priceCents: 3500,
    published: true,
    sales: 264,
    lessons: lessons("mobility-reset", [
      "Breathing & assessment",
      "Hip openers",
      "Thoracic spine flow",
      "Shoulder health",
      "Full-body recovery flow",
    ]),
  },
  {
    id: "morning-flow",
    trainerId: "sofia-alvarez",
    title: "Morning Flow Yoga",
    description:
      "Gentle, energizing yoga flows to start your day with focus. Twenty minutes, no experience needed.",
    coverUrl: "/images/programs/morning-flow.jpg",
    priceCents: 2500,
    published: true,
    sales: 198,
    lessons: lessons("morning-flow", [
      "Sun salutation basics",
      "Standing balance flow",
      "Warrior sequence",
      "Twist & release",
      "Seven-day challenge",
    ]),
  },
  {
    id: "boxing-fundamentals",
    trainerId: "jake-thompson",
    title: "Boxing Fundamentals",
    description:
      "Stance, footwork, and your first combinations. A complete beginner course with bag work and conditioning.",
    coverUrl: "/images/programs/boxing-fundamentals.jpg",
    priceCents: 4500,
    published: true,
    sales: 173,
    lessons: lessons("boxing-fundamentals", [
      "Stance & guard",
      "Footwork drills",
      "Jab, cross, hook",
      "Heavy bag combinations",
      "Defense & slips",
      "Fight conditioning",
    ]),
  },
  {
    id: "couch-to-10k",
    trainerId: "aisha-khan",
    title: "Couch to 10K",
    description:
      "A ten-week plan that takes you from zero to a confident 10K, with run-walk intervals and strength work to stay injury-free.",
    coverUrl: "/images/programs/couch-to-10k.jpg",
    priceCents: 2900,
    published: true,
    sales: 341,
    lessons: lessons("couch-to-10k", [
      "Your first run-walk",
      "Easy pace, explained",
      "Strength for runners",
      "Building to 5K",
      "Tempo & intervals",
      "Race week",
    ]),
  },
  {
    id: "bodyweight-at-home",
    trainerId: "leo-novak",
    title: "Bodyweight at Home",
    description:
      "Build muscle with zero equipment. Progressive push-up, squat, and core work you can do in your living room.",
    coverUrl: "/images/programs/bodyweight-at-home.jpg",
    priceCents: 2500,
    published: true,
    sales: 229,
    lessons: lessons("bodyweight-at-home", [
      "Push-up progressions",
      "Pistol squat path",
      "Core that actually works",
      "Your first pull-up",
      "The full-body circuit",
      "Testing week",
    ]),
  },
]

// Five weekdays of open slots per trainer; times are UTC
const hours: Record<string, number[]> = {
  "maya-chen": [7, 15],
  "marcus-reed": [6, 12, 17],
  "sofia-alvarez": [5, 14],
  "jake-thompson": [10, 16],
  "aisha-khan": [5, 16],
  "leo-novak": [9, 18],
}

const taken: Partial<Record<string, Pick<Slot, "status" | "clientId">>> = {
  "maya-chen-1": { status: "booked", clientId: "alex-morgan" },
  "maya-chen-4": { status: "booked", clientId: "jordan-lee" },
  "maya-chen-5": { status: "held", clientId: "priya-patel" },
  "maya-chen-8": { status: "booked", clientId: "sam-carter" },
  "sofia-alvarez-3": { status: "booked", clientId: "alex-morgan" },
  "marcus-reed-2": { status: "booked", clientId: "noah-kim" },
}

export const slots: Slot[] = trainers.flatMap((t) =>
  [2, 3, 4, 5, 6]
    .flatMap((d) => hours[t.id].map((h) => `2026-11-0${d}T${String(h).padStart(2, "0")}:00:00Z`))
    .map((startsAt, i) => {
      const id = `${t.id}-${i + 1}`
      return { id, trainerId: t.id, startsAt, status: "open" as const, ...taken[id] }
    }),
)

export const reviews: Review[] = [
  { id: "r1", trainerId: "maya-chen", clientId: "jordan-lee", rating: 5, comment: "Added 40 lb to my squat in eight weeks. Maya's cues just click.", createdAt: "2026-10-20T10:00:00Z" },
  { id: "r2", trainerId: "maya-chen", clientId: "emma-wilson", rating: 5, comment: "The 1:1 call fixed my deadlift form in ten minutes. Worth every cent.", createdAt: "2026-10-12T10:00:00Z" },
  { id: "r3", trainerId: "maya-chen", clientId: "noah-kim", rating: 4, comment: "Great structure and clear videos. Wish there were more accessory options.", createdAt: "2026-09-30T10:00:00Z" },
  { id: "r4", trainerId: "marcus-reed", clientId: "olivia-brooks", rating: 5, comment: "Lost 9 lb and actually enjoy cardio now. Marcus is a machine.", createdAt: "2026-10-18T10:00:00Z" },
  { id: "r5", trainerId: "marcus-reed", clientId: "sam-carter", rating: 5, comment: "Thirty minutes, completely wrecked, in the best way.", createdAt: "2026-10-02T10:00:00Z" },
  { id: "r6", trainerId: "sofia-alvarez", clientId: "alex-morgan", rating: 5, comment: "My hips haven't felt this good in years. The daily flows are addictive.", createdAt: "2026-10-22T10:00:00Z" },
  { id: "r7", trainerId: "sofia-alvarez", clientId: "priya-patel", rating: 5, comment: "Calm, precise, and so encouraging. Perfect recovery for lifting days.", createdAt: "2026-10-05T10:00:00Z" },
  { id: "r8", trainerId: "jake-thompson", clientId: "daniel-ruiz", rating: 5, comment: "Went from zero to sparring-ready. Jake explains everything.", createdAt: "2026-10-15T10:00:00Z" },
  { id: "r9", trainerId: "jake-thompson", clientId: "jordan-lee", rating: 5, comment: "Best workout of my week, every week.", createdAt: "2026-09-28T10:00:00Z" },
  { id: "r10", trainerId: "aisha-khan", clientId: "emma-wilson", rating: 5, comment: "Ran my first 10K without stopping. Couldn't run a mile in August!", createdAt: "2026-10-19T10:00:00Z" },
  { id: "r11", trainerId: "aisha-khan", clientId: "noah-kim", rating: 4, comment: "Smart plan that fit around my shifts.", createdAt: "2026-10-01T10:00:00Z" },
  { id: "r12", trainerId: "leo-novak", clientId: "sam-carter", rating: 5, comment: "Got my first strict pull-up at 34. Leo's progressions work.", createdAt: "2026-10-16T10:00:00Z" },
  { id: "r13", trainerId: "leo-novak", clientId: "olivia-brooks", rating: 4, comment: "Great home program, I just needed a doorway bar.", createdAt: "2026-09-25T10:00:00Z" },
]

export const purchases: Purchase[] = [
  { id: "pu1", clientId: "alex-morgan", trainerId: "maya-chen", kind: "session", slotId: "maya-chen-1", amountCents: 9000, createdAt: "2026-10-28T09:12:00Z" },
  { id: "pu2", clientId: "jordan-lee", trainerId: "maya-chen", kind: "program", programId: "strength-foundations", amountCents: 4900, createdAt: "2026-10-28T07:40:00Z" },
  { id: "pu3", clientId: "priya-patel", trainerId: "maya-chen", kind: "program", programId: "strength-foundations", amountCents: 4900, createdAt: "2026-10-27T18:05:00Z" },
  { id: "pu4", clientId: "jordan-lee", trainerId: "maya-chen", kind: "session", slotId: "maya-chen-4", amountCents: 9000, createdAt: "2026-10-27T11:30:00Z" },
  { id: "pu5", clientId: "sam-carter", trainerId: "maya-chen", kind: "session", slotId: "maya-chen-8", amountCents: 9000, createdAt: "2026-10-26T16:45:00Z" },
  { id: "pu6", clientId: "alex-morgan", trainerId: "maya-chen", kind: "program", programId: "strength-foundations", amountCents: 4900, createdAt: "2026-10-25T08:20:00Z" },
  { id: "pu7", clientId: "emma-wilson", trainerId: "maya-chen", kind: "program", programId: "strength-foundations", amountCents: 4900, createdAt: "2026-10-24T13:10:00Z" },
  { id: "pu8", clientId: "noah-kim", trainerId: "maya-chen", kind: "program", programId: "strength-foundations", amountCents: 4900, createdAt: "2026-10-22T19:55:00Z" },
  { id: "pu9", clientId: "alex-morgan", trainerId: "sofia-alvarez", kind: "session", slotId: "sofia-alvarez-3", amountCents: 6500, createdAt: "2026-10-26T10:00:00Z" },
  { id: "pu10", clientId: "alex-morgan", trainerId: "sofia-alvarez", kind: "program", programId: "mobility-reset", amountCents: 3500, createdAt: "2026-10-20T10:00:00Z" },
]

// Trainer dashboard chart: gross earnings per week (Maya)
export const weeklyEarnings = [
  { label: "Sep 6", cents: 41200 },
  { label: "Sep 13", cents: 52800 },
  { label: "Sep 20", cents: 47600 },
  { label: "Sep 27", cents: 63900 },
  { label: "Oct 4", cents: 58400 },
  { label: "Oct 11", cents: 71300 },
  { label: "Oct 18", cents: 69800 },
  { label: "Oct 25", cents: 84600 },
]

// Alex's inbox
export const channels: Channel[] = [
  {
    id: "maya-chen",
    withId: "maya-chen",
    messages: [
      { id: "m1", userId: "maya-chen", text: "Hey Alex! Saw you booked Monday's session 💪 Anything specific you want to focus on?", at: "2026-10-27T15:02:00Z" },
      { id: "m2", userId: "alex-morgan", text: "Mostly squat depth — I lose tightness at the bottom.", at: "2026-10-27T15:10:00Z", reactions: [{ emoji: "👍", count: 1 }] },
      {
        id: "m3",
        userId: "maya-chen",
        text: "Perfect. Bring flat shoes and we'll film a few sets together on the call.",
        at: "2026-10-27T15:14:00Z",
        reactions: [{ emoji: "🔥", count: 2 }],
        replies: [
          { id: "m3a", userId: "alex-morgan", text: "Will do! Should I warm up before we start?", at: "2026-10-27T15:20:00Z" },
          { id: "m3b", userId: "maya-chen", text: "Yes — run through the hip openers from Sofia's Mobility Reset, lesson 2. Ten minutes is plenty.", at: "2026-10-27T15:24:00Z", reactions: [{ emoji: "🙏", count: 1 }] },
          { id: "m3c", userId: "alex-morgan", text: "Perfect, see you Monday.", at: "2026-10-27T15:25:00Z" },
        ],
      },
      { id: "m4", userId: "alex-morgan", text: "Also loving Strength Foundations so far. Lesson 2 was 🔥", at: "2026-10-28T08:01:00Z", reactions: [{ emoji: "❤️", count: 1 }] },
      { id: "m5", userId: "maya-chen", text: "Love to hear it! Next week we add volume — eat your carbs 😄", at: "2026-10-28T08:15:00Z" },
    ],
  },
  {
    id: "sofia-alvarez",
    withId: "sofia-alvarez",
    messages: [
      { id: "s1", userId: "alex-morgan", text: "Hi Sofia! Is Mobility Reset okay to do on lifting days?", at: "2026-10-25T18:00:00Z" },
      { id: "s2", userId: "sofia-alvarez", text: "Absolutely — do it after your session as a cool-down. See you Tuesday!", at: "2026-10-25T18:30:00Z", reactions: [{ emoji: "🙌", count: 1 }] },
    ],
  },
  {
    id: "marcus-reed",
    withId: "marcus-reed",
    messages: [
      { id: "k1", userId: "alex-morgan", text: "Is HIIT Shred 30 too much alongside a strength program?", at: "2026-10-21T12:00:00Z" },
      { id: "k2", userId: "marcus-reed", text: "Not at all. Do two sessions a week on your off days and you're golden.", at: "2026-10-21T12:45:00Z" },
    ],
  },
]

export const getTrainer = (id: string) => trainers.find((t) => t.id === id)
export const getProgram = (id: string) => programs.find((p) => p.id === id)
export const getSlot = (id: string) => slots.find((s) => s.id === id)
export const person = (id: string) =>
  trainers.find((t) => t.id === id) ?? clients.find((c) => c.id === id)
