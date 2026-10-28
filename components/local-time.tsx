"use client"

import { useSyncExternalStore } from "react"
import { formatDate } from "@/lib/utils"

// Times render in the viewer's time zone, so they only fill in after hydration (the server can't know it)
const noop = () => () => {}
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false)

export function LocalTime({ date, format }: { date: Date; format: Intl.DateTimeFormatOptions }) {
  const isClient = useIsClient()
  return <time dateTime={new Date(date).toISOString()}>{isClient ? formatDate(date, format) : " "}</time>
}

type Item = { id: string; at: Date; node: React.ReactNode }

const dayFormat: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }

// Groups server-rendered rows by the viewer's local day: "grid" = booking cards, "list" = dashboard sections
export function ByLocalDay({ items, variant }: { items: Item[]; variant: "grid" | "list" }) {
  const isClient = useIsClient()
  if (!isClient) return <div className="h-40 animate-pulse rounded-2xl bg-muted" />

  const days = Object.entries(Object.groupBy(items, (i) => formatDate(i.at, dayFormat)))
  return (
    <div className={variant === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-5" : "space-y-4"}>
      {days.map(([day, dayItems]) =>
        variant === "grid" ? (
          <div key={day} className="rounded-2xl border bg-card p-4">
            <p className="text-sm font-semibold">{day}</p>
            <div className="mt-3 grid gap-2">{dayItems!.map((i) => <div key={i.id}>{i.node}</div>)}</div>
          </div>
        ) : (
          <section key={day} className="rounded-2xl border bg-card">
            <h2 className="border-b px-6 py-3 text-sm font-semibold">{day}</h2>
            <ul className="divide-y">{dayItems!.map((i) => <li key={i.id}>{i.node}</li>)}</ul>
          </section>
        ),
      )}
    </div>
  )
}
