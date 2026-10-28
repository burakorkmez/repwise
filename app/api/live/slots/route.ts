import { sealSlots } from "@/lib/realtime"
import { isUuid } from "@/lib/utils"

const noStore = { "Cache-Control": "private, no-store" }

// Renews the sealed slot query behind a trainer's public booking grid. Open slots are public, so no session
// is needed, but both parameters are checked before they're sealed into a query.
export async function POST(request: Request) {
  const { trainerId, since } = await request.json().catch(() => ({}))
  const sinceDate = new Date(since)
  const fresh = Date.now() - sinceDate.getTime() < 864e5 // the anchor is a page-load time, not an arbitrary past date
  if (typeof trainerId !== "string" || !isUuid(trainerId) || Number.isNaN(sinceDate.getTime()) || !fresh) {
    return Response.json({ error: "BAD_REQUEST" }, { status: 400, headers: noStore })
  }
  return Response.json(await sealSlots(trainerId, sinceDate), { headers: noStore })
}
