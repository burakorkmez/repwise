"use client"

import Link from "next/link"
import { createContext, use, useState, useSyncExternalStore } from "react"
import { Menu } from "lucide-react"
import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  WithComponents,
  useCreateChatClient,
} from "stream-chat-react"
import { getStreamToken } from "@/app/actions/stream"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import "./stream-chat.css"

type ChatUser = { id: string; name: string; image?: string }

// Follow the site's light/dark toggle (it flips <html data-theme>) so Stream picks the matching base theme
const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}
const useSiteTheme = () =>
  useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme ?? "dark", () => "dark")

// Below md the channel list and the conversation share the screen; this flips between them
const ListOpen = createContext<[boolean, (open: boolean) => void]>([false, () => {}])

function ListToggle() {
  const [, setOpen] = use(ListOpen)
  return (
    <button onClick={() => setOpen(true)} aria-label="All conversations" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
      <Menu />
    </button>
  )
}

const NoConversations = () => (
  <div className="p-6 text-center">
    <p className="font-semibold">No conversations yet</p>
    <p className="mt-1 text-sm text-muted-foreground">Message a trainer from their profile to start one.</p>
    <Link href="/trainers" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
      Browse trainers
    </Link>
  </div>
)

export function ChatInbox({ user, channelId }: { user: ChatUser; channelId?: string }) {
  const client = useCreateChatClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    tokenOrProvider: getStreamToken,
    userData: user,
  })
  const theme = useSiteTheme()
  const list = useState(!channelId)

  if (!client) return <Skeleton className="m-6 h-[calc(100dvh-7rem)] rounded-2xl" />

  return (
    <ListOpen value={list}>
      <WithComponents overrides={{ HeaderStartContent: ListToggle }}>
        <Chat client={client} theme={`str-chat__theme-${theme}`}>
          <div className="repwise-chat" data-list-open={list[0]}>
            {/* Tapping a conversation on mobile switches to it (also when it's already the active one) */}
            <div
              className="repwise-chat__list"
              onClick={(e) => (e.target as Element).closest(".str-chat__channel-list-item") && list[1](false)}
            >
              <ChannelList
                filters={{ type: "messaging", members: { $in: [user.id] } }}
                sort={{ last_message_at: -1 }}
                options={{ presence: true, state: true }}
                customActiveChannel={channelId}
                EmptyStateIndicator={NoConversations}
              />
            </div>
            <Channel EmptyPlaceholder={<div className="grid h-full place-items-center"><NoConversations /></div>}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageComposer />
              </Window>
              <Thread />
            </Channel>
          </div>
        </Chat>
      </WithComponents>
    </ListOpen>
  )
}
