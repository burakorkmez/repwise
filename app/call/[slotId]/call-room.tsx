"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  VideoPreview,
  useCall,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk"
import { getStreamToken } from "@/app/actions/stream"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import "./stream-video.css"

type Props = { user: { id: string; name: string; image?: string }; callId: string; homeHref: string; chatHref: string }

export function CallRoom({ user, callId, ...links }: Props) {
  const [session, setSession] = useState<{ client: StreamVideoClient; call: Call }>()

  useEffect(() => {
    const tokenProvider = () => getStreamToken()
    const client = new StreamVideoClient({ apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!, user, tokenProvider })
    // The server already created this call with both people as members; `session` calls admit members only
    const call = client.call("session", callId)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Stream's documented client lifecycle: create in the effect, disconnect in cleanup
    setSession({ client, call })
    return () => {
      call.leave().catch(() => {}) // also releases the preview camera; throws if already left
      client.disconnectUser().catch(console.error)
      setSession(undefined)
    }
  }, [user, callId])

  if (!session) return <Skeleton className="h-full rounded-3xl" />

  return (
    <StreamVideo client={session.client}>
      <StreamCall call={session.call}>
        <StreamTheme className="repwise-call">
          <Room {...links} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  )
}

function Room({ homeHref, chatHref }: Omit<Props, "user" | "callId">) {
  const call = useCall()!
  const { useCallCallingState } = useCallStateHooks()
  const state = useCallCallingState()
  const router = useRouter()
  const [error, setError] = useState<string>()

  if (state === CallingState.JOINED || state === CallingState.RECONNECTING) {
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="min-h-0 flex-1">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <CallControls onLeave={() => router.push(homeHref)} />
          <Link href={chatHref} aria-label="Open chat" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
            <MessageCircle className="size-5" />
          </Link>
        </div>
      </div>
    )
  }

  // Lobby: camera and mic stay off (the call type's default) until the user turns them on here
  const join = () => {
    setError(undefined)
    call.join().catch((e: Error) => setError(e.message || "Couldn't join the call. Try again."))
  }
  return (
    <div className="grid h-full place-items-center p-5">
      <div className="w-full max-w-xl text-center">
        <VideoPreview />
        <div className="mt-4 flex justify-center gap-2">
          <ToggleAudioPreviewButton />
          <ToggleVideoPreviewButton />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Check your camera and mic, then join when you&apos;re ready.</p>
        <Button size="lg" className="mt-4" onClick={join} disabled={state === CallingState.JOINING}>
          {state === CallingState.JOINING ? "Joining…" : "Join session"}
        </Button>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
