"use client"

import { createContext, use } from "react"
import type { SealedLiveQuery } from "@neon/realtime/client"
import { LocalTime } from "@/components/local-time"
import { RealtimeRoot, useLive } from "@/components/realtime"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import type { SaleRow } from "@/lib/realtime"
import { cn, money } from "@/lib/utils"

const LiveSalesContext = createContext<{ rows: readonly SaleRow[]; status: string }>({ rows: [], status: "connecting" })

type Props = { url: string; sealedQuery: SealedLiveQuery<SaleRow>; initialData: SaleRow[]; userId: string; children: React.ReactNode }

// One subscription for the whole overview; the stat cards and the feed read it from context
export function LiveSales({ url, ...props }: Props) {
  return (
    <RealtimeRoot url={url}>
      <Subscription {...props} />
    </RealtimeRoot>
  )
}

function Subscription({ sealedQuery, initialData, userId, children }: Omit<Props, "url">) {
  // The page sends the user it was loaded for; the route answers 401 for anyone else
  const live = useLive(sealedQuery, initialData, "/api/live/sales", { userId })
  return <LiveSalesContext value={live}>{children}</LiveSalesContext>
}

export function LiveTotal() {
  return money(use(LiveSalesContext).rows[0]?.totalCents ?? 0)
}

export function LiveSalesCount() {
  return (use(LiveSalesContext).rows[0]?.salesCount ?? 0).toLocaleString("en-US")
}

export function LiveStatus() {
  const live = use(LiveSalesContext).status === "live"
  return (
    <Badge variant="secondary" className="gap-1.5">
      <span className="relative flex size-2">
        {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />}
        <span className={cn("relative inline-flex size-2 rounded-full", live ? "bg-primary" : "bg-muted-foreground")} />
      </span>
      {live ? "Live" : "Connecting…"}
    </Badge>
  )
}

export function LiveFeed() {
  const { rows } = use(LiveSalesContext)
  if (!rows.length) return <p className="px-6 py-10 text-center text-sm text-muted-foreground">Sales show up here the moment they happen.</p>

  return (
    <ul className="flex-1 divide-y">
      {rows.map((p, i) => (
        // A new sale lands on top and animates in; the key keeps older rows still
        <li key={p.id} className={cn("flex items-center gap-3 px-6 py-3.5", i === 0 && "animate-in bg-accent/40 duration-700 fade-in slide-in-from-top-2")}>
          <UserAvatar name={p.clientName} src={p.clientAvatarUrl} className="size-9" />
          <div className="min-w-0 flex-1 text-sm">
            <p>
              <span className="font-semibold">{p.clientName}</span>{" "}
              <span className="text-muted-foreground">{p.kind === "program" ? `bought ${p.programTitle}` : "booked a 1:1 session"}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              <LocalTime date={p.createdAt} format={{ month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }} />
            </p>
          </div>
          <span className="text-sm font-semibold text-primary">+{money(p.amountCents)}</span>
        </li>
      ))}
    </ul>
  )
}
