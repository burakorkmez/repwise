"use client"

import { useState } from "react"
import type { SealedLiveQuery } from "@neon/realtime/client"
import { CalendarX } from "lucide-react"
import { bookSlot } from "@/app/actions/checkout"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { EmptyState } from "@/components/empty-state"
import { ByLocalDay, LocalTime } from "@/components/local-time"
import { RealtimeRoot, useLive } from "@/components/realtime"
import type { SlotRow } from "@/lib/realtime"
import { cn } from "@/lib/utils"

type Props = {
  url: string
  trainerId: string
  firstName: string
  isSelf: boolean
  since: string
  sealedQuery: SealedLiveQuery<SlotRow>
  initialData: SlotRow[]
}

// The booking grid on a trainer's profile. Live for every viewer: when anyone books, holds, adds, or
// deletes a slot, every open profile page updates without a reload.
export function LiveSlots({ url, ...props }: Props) {
  return (
    <RealtimeRoot url={url}>
      <Grid {...props} />
    </RealtimeRoot>
  )
}

function Grid({ trainerId, firstName, isSelf, since, sealedQuery, initialData }: Omit<Props, "url">) {
  const { rows } = useLive(sealedQuery, initialData, "/api/live/slots", { trainerId, since })
  // Shown above the grid, not under the button: when someone else wins the slot, the live update swaps the
  // button for a "taken" label, which would unmount a message rendered inside it
  const [error, setError] = useState<string>()
  const book = (slotId: string) => async () => {
    setError(undefined)
    const result = await bookSlot(slotId) // redirects to /library on success
    setError(result?.error)
    return undefined
  }

  if (!rows.length) {
    return <EmptyState icon={CalendarX} title="No open times right now" description={`${firstName} hasn't posted any upcoming slots. Send a message to ask about availability.`} />
  }

  // Display only (bookSlot re-checks atomically): a hold that lapsed before the page loaded counts as open
  const isOpen = (s: SlotRow) => s.status === "open" || (s.status === "held" && !!s.heldUntil && s.heldUntil < new Date(since))

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <ByLocalDay
        variant="grid"
        items={rows.map((s) => {
          const time = <LocalTime date={s.startsAt} format={{ hour: "numeric", minute: "2-digit" }} />
          const open = isOpen(s)
          return {
            id: s.id,
            at: s.startsAt,
            node:
              open && !isSelf ? (
                <ActionForm action={book(s.id)}>
                  <SubmitButton variant="outline" size="lg" className="w-full justify-center hover:border-primary hover:bg-primary hover:text-primary-foreground">
                    {time}
                  </SubmitButton>
                </ActionForm>
              ) : (
                <span className={cn("flex h-9 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground", !open && "line-through")}>
                  {time}
                </span>
              ),
          }
        })}
      />
    </>
  )
}
