import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { LocalTime } from "@/components/local-time"
import { requireUser } from "@/lib/auth"
import { getCallSlot } from "@/lib/queries"
import { ensureSessionCall } from "@/lib/stream"
import { avatarUrl } from "@/lib/utils"
import { CallRoom } from "./call-room"

export const metadata: Metadata = { title: "Session" }

export default function CallPage({ params }: PageProps<"/call/[slotId]">) {
  return (
    <Suspense fallback={<div data-theme="dark" className="h-dvh bg-background p-5"><Skeleton className="h-full rounded-3xl" /></div>}>
      <Session params={params} />
    </Suspense>
  )
}

async function Session({ params }: Pick<PageProps<"/call/[slotId]">, "params">) {
  const [slot, me] = await Promise.all([getCallSlot((await params).slotId), requireUser()])
  // Only the two people in a booked session get in; everyone else sees a 404
  if (!slot || slot.status !== "booked" || (me.id !== slot.clientId && me.id !== slot.trainerId)) notFound()

  const trainer = { id: slot.trainerId, name: slot.trainerName, avatarUrl: slot.trainerAvatarUrl }
  const client = { id: slot.clientId!, name: slot.clientName!, avatarUrl: slot.clientAvatarUrl }
  const asClient = me.id === slot.clientId
  const self = asClient ? client : trainer

  await ensureSessionCall(slot.id, { userId: trainer.id, ...trainer }, { userId: client.id, ...client })

  return (
    <div data-theme="dark" className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center gap-4 px-5 py-4">
        <Logo />
        <span className="hidden h-6 w-px bg-border sm:block" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold">
            1:1 session · {trainer.name} & {client.name}
          </p>
          <p className="text-xs text-muted-foreground">
            <LocalTime date={slot.startsAt} format={{ weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }} /> · 60 min
          </p>
        </div>
      </header>

      <main className="mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-3xl border bg-card sm:mx-5 sm:mb-5">
        <CallRoom
          user={{ id: me.id, name: self.name, image: avatarUrl(self.avatarUrl) }}
          callId={slot.id}
          homeHref={asClient ? "/library" : "/dashboard"}
          chatHref={`/messages?c=${asClient ? trainer.id : client.id}`}
        />
      </main>
    </div>
  )
}
