import { getUser } from "@/lib/auth"
import { sealSales } from "@/lib/realtime"

const noStore = { "Cache-Control": "private, no-store" }

// Renews the dashboard's sealed sales query (they expire after ~60s). A Route Handler, not a server action,
// because actions run one at a time. The page sends the user it was loaded for; anyone else counts as signed out.
export async function POST(request: Request) {
  const { userId } = await request.json().catch(() => ({}))
  const user = await getUser()
  if (!user || user.id !== userId || user.profile?.role !== "trainer") {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401, headers: noStore })
  }
  return Response.json(await sealSales(user.id), { headers: noStore })
}
