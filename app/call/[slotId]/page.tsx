import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { MessageCircle, Mic, MicOff, MonitorUp, PhoneOff, Video } from "lucide-react"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { LocalTime } from "@/components/local-time"
import { UserAvatar } from "@/components/user-avatar"
import { requireUser } from "@/lib/auth"
import { getCallSlot } from "@/lib/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Session" }

// ponytail: static call room; Phase 9 swaps the tiles and controls for @stream-io/video-react-sdk
export default function CallPage({ params }: PageProps<"/call/[slotId]">) {
  return (
    <Suspense fallback={<div data-theme="dark" className="min-h-dvh bg-background p-5"><Skeleton className="h-[90vh] rounded-3xl" /></div>}>
      <CallRoom params={params} />
    </Suspense>
  )
}

async function CallRoom({ params }: Pick<PageProps<"/call/[slotId]">, "params">) {
  const [slot, me] = await Promise.all([getCallSlot((await params).slotId), requireUser()])
  // Only the two people in a booked session get in; everyone else sees a 404
  if (!slot || slot.status !== "booked" || (me.id !== slot.clientId && me.id !== slot.trainerId)) notFound()

  const trainer = { id: slot.trainerId, name: slot.trainerName, avatarUrl: slot.trainerAvatarUrl }
  const client = { id: slot.clientId!, name: slot.clientName!, avatarUrl: slot.clientAvatarUrl }
  const asClient = me.id === slot.clientId
  const remote = asClient ? trainer : client
  const self = asClient ? client : trainer

  const control = "grid size-12 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"

  return (
    <div data-theme="dark" className="flex min-h-dvh flex-col bg-background text-foreground">
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
        <span className="ml-auto flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400">
          <span className="size-2 animate-pulse rounded-full bg-red-500" /> Live · 24:13
        </span>
      </header>

      <main className="relative mx-3 mb-3 min-h-[70vh] flex-1 overflow-hidden rounded-3xl border bg-card sm:mx-5 sm:mb-5">
        {remote.avatarUrl ? (
          <Image src={remote.avatarUrl} alt={remote.name} fill loading="eager" sizes="100vw" className="object-cover object-[50%_20%]" />
        ) : (
          <div className="grid h-full place-items-center">
            <UserAvatar name={remote.name} className="size-36 [&_[data-slot=avatar-fallback]]:text-5xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />

        <span className="absolute bottom-28 left-5 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-1.5 text-sm font-medium backdrop-blur sm:bottom-6">
          <Mic className="size-4 text-primary" /> {remote.name}
        </span>

        {/* Self view */}
        <div className="absolute top-5 right-5 aspect-3/4 w-28 overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl sm:aspect-video sm:w-60">
          {self.avatarUrl ? (
            <Image src={self.avatarUrl} alt="" fill sizes="240px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center">
              <UserAvatar name={self.name} className="size-14" />
            </div>
          )}
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs">
            <MicOff className="size-3 text-red-400" /> You
          </span>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-5 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
            <button aria-label="Unmute" className={cn(control, "bg-red-500/20 text-red-400 hover:bg-red-500/30")}>
              <MicOff className="size-5" />
            </button>
            <button aria-label="Turn camera off" className={control}>
              <Video className="size-5" />
            </button>
            <button aria-label="Share screen" className={cn(control, "hidden sm:grid")}>
              <MonitorUp className="size-5" />
            </button>
            <Link href={`/messages?c=${asClient ? trainer.id : client.id}`} aria-label="Open chat" className={control}>
              <MessageCircle className="size-5" />
            </Link>
            <Link
              href={asClient ? "/library" : "/dashboard"}
              className="ml-1 flex h-12 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <PhoneOff className="size-5" /> Leave
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
