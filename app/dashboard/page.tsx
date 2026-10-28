import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarDays, DollarSign, Film, Plus, Receipt, Star, Video } from "lucide-react"
import { ProgramCover } from "@/components/cards"
import { LiveFeed, LiveSales, LiveSalesCount, LiveStatus, LiveTotal } from "@/components/live-sales"
import { LocalTime } from "@/components/local-time"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { requireTrainer } from "@/lib/auth"
import { getTrainer, trainerPrograms, trainerSessions, weeklyEarnings } from "@/lib/queries"
import { loadSales } from "@/lib/realtime"
import { cn, formatDate, money } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview />
    </Suspense>
  )
}

async function Overview() {
  const me = await requireTrainer()
  const [sales, weeks, sessions, programs, trainer] = await Promise.all([
    loadSales(me.userId),
    weeklyEarnings(me.userId),
    trainerSessions(me.userId),
    trainerPrograms(me.userId, true),
    getTrainer(me.userId),
  ])
  const eightWeeks = weeks.reduce((sum, w) => sum + w.cents, 0)
  const max = Math.max(1, ...weeks.map((w) => w.cents))
  const next = sessions[0]

  const stats = [
    { label: "Total earnings", value: <LiveTotal />, note: "Gross, all time · updates live", icon: DollarSign },
    { label: "Sales", value: <LiveSalesCount />, note: "Programs and sessions", icon: Receipt },
    {
      label: "Upcoming sessions",
      value: sessions.length,
      note: next ? <>Next: <LocalTime date={next.startsAt} format={{ weekday: "short", hour: "numeric", minute: "2-digit" }} /></> : "None booked yet",
      icon: CalendarDays,
    },
    {
      label: "Average rating",
      value: trainer?.reviewCount ? trainer.rating.toFixed(1) : "—",
      note: `${trainer?.reviewCount ?? 0} ${trainer?.reviewCount === 1 ? "review" : "reviews"}`,
      icon: Star,
    },
  ]

  return (
    <LiveSales
      key={sales.sealedQuery.queryFingerprint}
      url={process.env.NEON_REALTIME_URL!}
      sealedQuery={sales.sealedQuery}
      initialData={sales.rows}
      userId={me.userId}
    >
      <div className="space-y-6">
        <PageHeader title={`Welcome back, ${me.name.split(" ")[0]}`} description="Here's how your coaching business is doing.">
          <Link href="/dashboard/slots" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <CalendarDays /> Add slots
          </Link>
          <Link href="/dashboard/programs/new" className={buttonVariants({ size: "lg" })}>
            <Plus /> New program
          </Link>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {label}
                <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-heading text-3xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Earnings chart: plain CSS bars, weeks in UTC */}
          <section className="flex flex-col rounded-2xl border bg-card p-6 xl:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">Earnings</h2>
                <p className="text-sm text-muted-foreground">Gross revenue per week, last 8 weeks</p>
              </div>
              <p className="font-heading text-2xl font-bold">{money(eightWeeks)}</p>
            </div>
            <div className="mt-8 flex min-h-60 flex-1 gap-2 sm:gap-4">
              {weeks.map((w, i) => (
                <div key={w.key} className="group flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium opacity-0 transition group-hover:opacity-100">{money(w.cents)}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "min-h-1 w-full rounded-t-lg transition group-hover:bg-primary",
                        i === weeks.length - 1 ? "bg-primary" : "bg-primary/25",
                      )}
                      style={{ height: `${(w.cents / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(w.start, { month: "short", day: "numeric", timeZone: "UTC" })}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Live feed: Neon Realtime pushes each new purchase */}
          <section className="flex flex-col rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">Live sales</h2>
              <LiveStatus />
            </div>
            <LiveFeed />
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">Upcoming sessions</h2>
              <Link href="/dashboard/slots" className="text-sm text-primary hover:underline">Manage slots</Link>
            </div>
            {sessions.length ? (
              <ul className="divide-y">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-6 py-3.5">
                    <UserAvatar name={s.clientName} src={s.clientAvatarUrl} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{s.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        <LocalTime date={s.startsAt} format={{ weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }} />
                      </p>
                    </div>
                    <Link href={`/call/${s.id}`} className={buttonVariants({ variant: "outline" })}>
                      <Video /> Join call
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No sessions booked yet. Post open slots so clients can book you.</p>
            )}
          </section>

          <section className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">Your programs</h2>
              <Link href="/dashboard/programs" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {programs.length ? (
              <ul className="divide-y">
                {programs.map((p) => (
                  <li key={p.id}>
                    <Link href={`/dashboard/programs/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-muted/50">
                      <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                        <ProgramCover program={p} sizes="80px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.title}</span>
                        <span className="text-xs text-muted-foreground">{p.lessonCount} lessons · {p.sales} sales</span>
                      </span>
                      <Badge variant={p.published ? "secondary" : "outline"}>{p.published ? "Published" : "Draft"}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
                <Film className="size-5" /> No programs yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </LiveSales>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}
