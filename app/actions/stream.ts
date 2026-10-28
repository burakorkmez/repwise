"use server"

import { requireProfile } from "@/lib/auth"
import { streamToken } from "@/lib/stream"

// Token provider for both Stream clients: always for the signed-in user, never a user id from the browser
export async function getStreamToken() {
  return streamToken(await requireProfile())
}
