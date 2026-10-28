import type { Metadata } from "next"
import Link from "next/link"
import { Clock, DollarSign, Plus, Trash2, Video } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserAvatar } from "@/components/user-avatar"
import { meTrainer, person, slots } from "@/lib/mock-data"
import { formatDate, money } from "@/lib/utils"

export const metadata: Metadata = { title: "Slots & bookings" }

export default function SlotsPage() {
  const mine = slots.filter((s) => s.trainerId === meTrainer.id)
  const days = Object.entries(
    Object.groupBy(mine, (s) => formatDate(s.startsAt, { weekday: "long", month: "long", day: "numeric" })),
  )
  const count = (status: string) => mine.filter((s) => s.status === status).length

  return (
    <div className="space-y-6">
      <PageHeader title="Slots & bookings" description="Add times you're available. Clients pick a slot and pay — it shows up here as booked." />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Add a slot</h2>
            <div className="mt-4 grid gap-2">
              <Label htmlFor="startsAt">Date & time</Label>
              <Input id="startsAt" type="datetime-local" className="h-10" />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="size-4" /> Duration</dt>
                <dd className="font-medium">60 min</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><DollarSign className="size-4" /> Price</dt>
                <dd className="font-medium">{money(meTrainer.sessionPriceCents)}</dd>
              </div>
            </dl>
            <Button size="xl" className="mt-6 w-full">
              <Plus /> Add slot
            </Button>
          </section>

          <section className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Open", n: count("open") },
              { label: "Held", n: count("held") },
              { label: "Booked", n: count("booked") },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-4">
                <p className="font-heading text-2xl font-bold">{s.n}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-4">
          {days.map(([day, daySlots]) => (
            <section key={day} className="rounded-2xl border bg-card">
              <h2 className="border-b px-6 py-3 text-sm font-semibold">{day}</h2>
              <ul className="divide-y">
                {daySlots!.map((s) => {
                  const client = s.clientId ? person(s.clientId) : undefined
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-4 px-6 py-3">
                      <span className="w-20 font-heading font-semibold">{formatDate(s.startsAt, { hour: "numeric", minute: "2-digit" })}</span>
                      {s.status === "open" && <Badge variant="outline">Open</Badge>}
                      {s.status === "held" && <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">Held · checkout in progress</Badge>}
                      {s.status === "booked" && <Badge>Booked</Badge>}
                      {client && (
                        <span className="flex items-center gap-2 text-sm">
                          <UserAvatar name={client.name} className="size-6" /> {client.name}
                        </span>
                      )}
                      <span className="ml-auto">
                        {s.status === "open" && (
                          <Button variant="ghost" size="icon" aria-label="Delete slot">
                            <Trash2 />
                          </Button>
                        )}
                        {s.status === "booked" && (
                          <Link href={`/call/${s.id}`} className={buttonVariants({ variant: "outline" })}>
                            <Video /> Join call
                          </Link>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
