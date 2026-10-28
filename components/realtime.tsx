"use client"

import { useCallback, useState } from "react"
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client"
import { drizzleParsers } from "@neon/realtime-drizzle/client"
// No "use client" in this package's build: import it from client modules only
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react"

// Wrap each live feature in one of these. Creating the client doesn't connect; it opens one WebSocket
// on the first subscribe, in the browser. The url comes from the server so no NEXT_PUBLIC_ copy is needed.
export function RealtimeRoot({ url, children }: { url: string; children: React.ReactNode }) {
  const [client] = useState(() => createRealtimeClient({ url, parsers: { ...drizzleParsers } }))
  return <RealtimeProvider client={client}>{children}</RealtimeProvider>
}

// A full page load resets this
let signedOut = false

// Rows of a server-sealed live query: the server's rows first, then every committed change.
// Sealed queries expire after ~60s; the hook renews by POSTing `body` to `renewUrl`, which must seal the
// exact same query. A 401 there means the session changed, so leave with a full load.
export function useLive<Row>(sealedQuery: SealedLiveQuery<Row>, initialData: Row[], renewUrl: string, body: Record<string, string>) {
  // Keep the first sealed query: server re-renders send a new object for the same query, which would resubscribe
  const [query] = useState(sealedQuery)
  const payload = JSON.stringify(body)
  const refreshQuery = useCallback(async () => {
    if (signedOut) throw new Error("Signed out")
    const res = await fetch(renewUrl, { method: "POST", cache: "no-store", body: payload })
    if (res.status === 401) {
      signedOut = true
      window.location.reload()
      throw new Error("Signed out")
    }
    if (!res.ok) throw new Error(`Couldn't renew the live query (${res.status})`)
    return (await res.json()) as SealedLiveQuery<Row>
  }, [renewUrl, payload])

  const { data, status } = useLiveQuery(query, { initialData, refreshQuery })
  return { rows: data ?? initialData, status }
}
