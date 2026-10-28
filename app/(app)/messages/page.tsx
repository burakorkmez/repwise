import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { requireProfile } from "@/lib/auth"
import { openDm } from "@/lib/stream"
import { ChatInbox } from "./chat-inbox"

export const metadata: Metadata = { title: "Messages" }

export default function MessagesPage({ searchParams }: PageProps<"/messages">) {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-[calc(100dvh-7rem)] rounded-2xl" />}>
      <Inbox searchParams={searchParams} />
    </Suspense>
  )
}

// `?c=<userId>` (the Message buttons around the site) opens, creating if needed, the DM with that person
async function Inbox({ searchParams }: Pick<PageProps<"/messages">, "searchParams">) {
  const [me, { c }] = await Promise.all([requireProfile(), searchParams])
  const channelId = typeof c === "string" ? await openDm(me, c) : null
  return <ChatInbox user={{ id: me.userId, name: me.name, image: me.avatarUrl ?? undefined }} channelId={channelId ?? undefined} />
}
