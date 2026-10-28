import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, DollarSign, Film, Plus, Star, Video } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { getProgram, meTrainer, person, programs, purchases, slots, weeklyEarnings } from "@/lib/mock-data"
import { cn, formatDate, money } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardPage() {
  const myPrograms = programs.filter((p) => p.trainerId === meTrainer.id)
  const sales = purchases.filter((p) => p.trainerId === meTrainer.id)
  const upcoming = slots.filter((s) => s.trainerId === meTrainer.id && s.status === "booked")
  const total = weeklyEarnings.reduce((sum, w) => sum + w.cents, 0)
  const max = Math.max(...weeklyEarnings.map((w) => w.cents))

  const stats = [
    { label: "Earnings · 8 weeks", value: money(total), note: "+21% vs previous", icon: DollarSign },
    { label: "Program sales", value: myPrograms.reduce((n, p) => n + p.sales, 0).toLocaleString("en-US"), note: "+34 this week", icon: Film },
    { label: "Upcoming sessions", value: upcoming.length, note: `Next: ${formatDate(upcoming[0].startsAt, { weekday: "short", hour: "numeric", minute: "2-digit" })}`, icon: CalendarDays },
    { label: "Average rating", value: meTrainer.rating.toFixed(1), note: `${meTrainer.reviewCount} reviews`, icon: Star },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={`Good morning, ${meTrainer.name.split(" ")[0]}`} description="Here's how your coaching business is doing.">
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
        {/* Earnings chart: plain CSS bars */}
        <section className="flex flex-col rounded-2xl border bg-card p-6 xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Earnings</h2>
              <p className="text-sm text-muted-foreground">Gross revenue per week</p>
            </div>
            <p className="font-heading text-2xl font-bold">{money(total)}</p>
          </div>
          <div className="mt-8 flex min-h-60 flex-1 gap-2 sm:gap-4">
            {weeklyEarnings.map((w, i) => (
              <div key={w.label} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium opacity-0 transition group-hover:opacity-100">{money(w.cents)}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition group-hover:bg-primary",
                      i === weeklyEarnings.length - 1 ? "bg-primary" : "bg-primary/25",
                    )}
                    style={{ height: `${(w.cents / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{w.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Live feed (Neon Realtime in Phase 11) */}
        <section className="flex flex-col rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Live sales</h2>
            <Badge variant="secondary" className="gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Live
            </Badge>
          </div>
          <ul className="flex-1 divide-y">
            {sales.slice(0, 6).map((p, i) => {
              const client = person(p.clientId)!
              return (
                <li key={p.id} className={cn("flex items-center gap-3 px-6 py-3.5", i === 0 && "bg-accent/40 animate-in fade-in slide-in-from-top-2 duration-700")}>
                  <UserAvatar name={client.name} className="size-9" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p>
                      <span className="font-semibold">{client.name}</span>{" "}
                      <span className="text-muted-foreground">{p.kind === "program" ? `bought ${getProgram(p.programId!)!.title}` : "booked a 1:1 session"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">+{money(p.amountCents)}</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Upcoming sessions</h2>
            <Link href="/dashboard/slots" className="text-sm text-primary hover:underline">Manage slots</Link>
          </div>
          <ul className="divide-y">
            {upcoming.map((s) => {
              const client = person(s.clientId!)!
              return (
                <li key={s.id} className="flex items-center gap-3 px-6 py-3.5">
                  <UserAvatar name={client.name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.startsAt, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <Link href={`/call/${s.id}`} className={buttonVariants({ variant: "outline" })}>
                    <Video /> Join call
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Your programs</h2>
            <Link href="/dashboard/programs" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y">
            {myPrograms.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/programs/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-muted/50">
                  <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image src={p.coverUrl} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.title}</span>
                    <span className="text-xs text-muted-foreground">{p.lessons.length} lessons · {p.sales} sales</span>
                  </span>
                  <Badge variant={p.published ? "secondary" : "outline"}>{p.published ? "Published" : "Draft"}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
