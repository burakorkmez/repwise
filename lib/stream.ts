import { StreamClient } from "@stream-io/node-sdk"
import { eq } from "drizzle-orm"
import { canMessage } from "@/lib/access"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { avatarUrl, isUuid } from "@/lib/utils"

// Server-only: holds the API secret. One client for chat and video.
export const stream = new StreamClient(process.env.NEXT_PUBLIC_STREAM_API_KEY!, process.env.STREAM_API_SECRET!)

type Person = { userId: string; name: string; avatarUrl: string | null }
// Stream needs an absolute image URL; the browser clients (messages, call) send the same one
const toStreamUser = (p: Person) => ({ id: p.userId, name: p.name, image: avatarUrl(p.avatarUrl) })

export async function streamToken(me: Person) {
  await stream.upsertUsers([toStreamUser(me)])
  return stream.generateUserToken({ user_id: me.userId, validity_in_seconds: 60 * 60 })
}

// The 1:1 channel between two people (Stream dedupes by member set). null when they may not DM.
export async function openDm(me: Person & { role: "client" | "trainer" }, otherId: string) {
  if (!isUuid(otherId)) return null
  const [other] = await db.select().from(profiles).where(eq(profiles.userId, otherId))
  if (!other || !canMessage({ isSelf: other.userId === me.userId, roles: [me.role, other.role] })) return null
  await stream.upsertUsers([toStreamUser(me), toStreamUser(other)])
  const res = await stream.chat.channel("messaging").getOrCreate({
    data: { created_by_id: me.userId, members: [{ user_id: me.userId }, { user_id: other.userId }] },
  })
  return res.channel?.id ?? null
}

// One call per booked slot. The `session` call type only lets members read or join, so the two
// people added here are the only ones who can get in, whatever the client sends.
export async function ensureSessionCall(slotId: string, trainer: Person, client: Person) {
  await stream.upsertUsers([toStreamUser(trainer), toStreamUser(client)])
  await stream.video.call("session", slotId).getOrCreate({
    data: { created_by_id: trainer.userId, members: [{ user_id: trainer.userId }, { user_id: client.userId }] },
  })
}
