import type { Metadata } from "next"
import Link from "next/link"
import { Fragment, Suspense } from "react"
import { MessageSquareReply, Paperclip, Search, Send, SmilePlus, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { channels, me, person, type Message } from "@/lib/mock-data"
import { cn, formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Messages" }

// ponytail: static mock of the inbox; Phase 8 swaps this for stream-chat-react components themed with our tokens
export default function MessagesPage({ searchParams }: PageProps<"/messages">) {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-[calc(100dvh-7rem)] rounded-2xl" />}>
      <Inbox searchParams={searchParams} />
    </Suspense>
  )
}

const time = (iso: string) => formatDate(iso, { hour: "numeric", minute: "2-digit" })
const day = (iso: string) => formatDate(iso, { weekday: "long", month: "short", day: "numeric" })

async function Inbox({ searchParams }: Pick<PageProps<"/messages">, "searchParams">) {
  const { c } = await searchParams
  const withId = typeof c === "string" && person(c) ? c : channels[0].withId
  const other = person(withId)!
  const messages = channels.find((ch) => ch.withId === withId)?.messages ?? []
  const thread = messages.find((m) => m.replies?.length)
  const inbox = channels.some((ch) => ch.withId === withId) ? channels : [{ id: withId, withId, messages: [] }, ...channels]

  return (
    <div className="grid h-[calc(100dvh-4rem)] md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_360px]">
      {/* Channel list */}
      <aside className="hidden min-h-0 flex-col border-r md:flex">
        <div className="border-b p-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <label className="mt-3 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4" />
            <input placeholder="Search conversations" className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
          </label>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {inbox.map((ch) => {
            const p = person(ch.withId)!
            const last = ch.messages.at(-1)
            return (
              <li key={ch.id}>
                <Link
                  href={`/messages?c=${ch.withId}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted",
                    ch.withId === withId && "bg-accent hover:bg-accent",
                  )}
                >
                  <span className="relative">
                    <UserAvatar name={p.name} src={p.avatarUrl} className="size-11" />
                    {ch.withId === "maya-chen" && <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-primary" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{p.name}</span>
                      {last && <span className="shrink-0 text-xs text-muted-foreground">{formatDate(last.at, { month: "short", day: "numeric" })}</span>}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {last ? `${last.userId === me.id ? "You: " : ""}${last.text}` : "New conversation"}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Conversation */}
      <section className="flex min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b px-5 py-3">
          <UserAvatar name={other.name} src={other.avatarUrl} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{other.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" /> Online
            </p>
          </div>
          {"headline" in other && (
            <Link href={`/trainers/${other.id}`} className={buttonVariants({ variant: "outline" })}>
              View profile
            </Link>
          )}
        </header>

        {/* Mobile channel switcher */}
        <div className="flex gap-3 overflow-x-auto border-b px-5 py-3 md:hidden">
          {inbox.map((ch) => {
            const p = person(ch.withId)!
            return (
              <Link key={ch.id} href={`/messages?c=${ch.withId}`} className={cn("rounded-full", ch.withId === withId && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
                <UserAvatar name={p.name} src={p.avatarUrl} className="size-10" />
              </Link>
            )
          })}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 lg:p-8">
          {messages.length ? (
            messages.map((m, i) => (
              <Fragment key={m.id}>
                {day(m.at) !== day(messages[i - 1]?.at ?? "1970-01-01") && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> {day(m.at)} <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <Bubble message={m} />
              </Fragment>
            ))
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <UserAvatar name={other.name} src={other.avatarUrl} className="mx-auto size-20" />
                <p className="mt-4 text-lg font-semibold">Say hi to {other.name.split(" ")[0]} 👋</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Ask about programs, availability, or anything training-related.
                </p>
              </div>
            </div>
          )}
        </div>

        <Composer placeholder={`Message ${other.name.split(" ")[0]}…`} />
      </section>

      {/* Thread */}
      <aside className="hidden min-h-0 flex-col border-l xl:flex">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <p className="font-semibold">Thread</p>
          <Button variant="ghost" size="icon" aria-label="Close thread">
            <X />
          </Button>
        </header>
        {thread ? (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <Bubble message={{ ...thread, replies: undefined }} />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {thread.replies!.length} replies <span className="h-px flex-1 bg-border" />
              </div>
              {thread.replies!.map((r) => (
                <Bubble key={r.id} message={r} />
              ))}
            </div>
            <Composer placeholder="Reply in thread…" />
          </>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">Replies to a message open here.</p>
        )}
      </aside>
    </div>
  )
}

function Bubble({ message: m }: { message: Message }) {
  const mine = m.userId === me.id
  const author = person(m.userId)!
  return (
    <div className={cn("flex gap-3", mine && "flex-row-reverse")}>
      <UserAvatar name={author.name} src={author.avatarUrl} className="mt-5 size-8" />
      <div className={cn("flex max-w-[78%] flex-col", mine && "items-end")}>
        <p className="mb-1 text-xs text-muted-foreground">
          {mine ? "You" : author.name} · {time(m.at)}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            mine ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted",
          )}
        >
          {m.text}
        </div>
        {(m.reactions || m.replies) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {m.reactions?.map((r) => (
              <span key={r.emoji} className="rounded-full border bg-card px-2 py-0.5 text-xs">
                {r.emoji} {r.count}
              </span>
            ))}
            {m.replies && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <MessageSquareReply className="size-3.5" /> {m.replies.length} replies
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Composer({ placeholder }: { placeholder: string }) {
  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-1 rounded-2xl border bg-card px-2 py-1.5">
        <Button variant="ghost" size="icon" aria-label="Attach file">
          <Paperclip />
        </Button>
        <input placeholder={placeholder} className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground" />
        <Button variant="ghost" size="icon" aria-label="Add emoji">
          <SmilePlus />
        </Button>
        <Button size="icon" aria-label="Send">
          <Send />
        </Button>
      </div>
    </div>
  )
}
