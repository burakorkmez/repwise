import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, CalendarDays, MessageCircle, Video } from "lucide-react"
import { ProgramCard } from "@/components/cards"
import { EmptyState } from "@/components/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { getProgram, getTrainer, me, purchases, slots } from "@/lib/mock-data"
import { cn, formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "My library" }

export default function LibraryPage() {
  const myPrograms = purchases
    .filter((p) => p.clientId === me.id && p.programId)
    .map((p) => getProgram(p.programId!)!)
  const sessions = slots
    .filter((s) => s.clientId === me.id && s.status === "booked")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  return (
    <div className="shell py-14">
      <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">My library</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Welcome back, {me.name.split(" ")[0]}</h1>
      <p className="mt-3 text-muted-foreground">Your programs and upcoming sessions, all in one place.</p>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Upcoming sessions</h2>
        <div className="mt-5">
          {sessions.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sessions.map((s) => {
                const trainer = getTrainer(s.trainerId)!
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 sm:flex-nowrap">
                    <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-accent py-2 text-accent-foreground">
                      <span className="text-xs font-semibold uppercase">{formatDate(s.startsAt, { month: "short" })}</span>
                      <span className="font-heading text-2xl leading-none font-bold">{formatDate(s.startsAt, { day: "numeric" })}</span>
                    </div>
                    <UserAvatar name={trainer.name} src={trainer.avatarUrl} className="size-11" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Session with {trainer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(s.startsAt, { weekday: "long", hour: "numeric", minute: "2-digit" })} · 60 min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/messages?c=${trainer.id}`} aria-label={`Message ${trainer.name}`} className={buttonVariants({ variant: "outline", size: "icon-lg" })}>
                        <MessageCircle />
                      </Link>
                      <Link href={`/call/${s.id}`} className={cn(buttonVariants({ size: "lg" }), "px-4")}>
                        <Video /> Join call
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="No sessions booked" description="Book a 1:1 video session with a coach to get personal feedback.">
              <Link href="/trainers" className={buttonVariants()}>Find a trainer</Link>
            </EmptyState>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">My programs</h2>
        <div className="mt-5">
          {myPrograms.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {myPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No programs yet" description="Programs you buy show up here with lifetime access.">
              <Link href="/trainers" className={buttonVariants()}>Browse programs</Link>
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  )
}
