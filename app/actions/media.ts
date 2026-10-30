"use server"

import { eq } from "drizzle-orm"
import { canWatchLesson, isDerivedUrl } from "@/lib/access"
import { getUser, requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { lessons } from "@/lib/db/schema"
import { fileUrl, signUrl, uploadAuth } from "@/lib/imagekit"
import { getProgram, ownsProgram } from "@/lib/queries"
import { isUuid } from "@/lib/utils"

// ponytail: ImageKit's v1 upload signature doesn't pin folder or overwrite, so a signed-in user could replace any
// file whose path they know. Upgrade to Upload API v2 (a server-made JWT that fixes folder + useUniqueFileName) if that matters.
export async function getUploadAuth() {
  await requireUser()
  return uploadAuth()
}

// The video player's signerFn. The lesson decides which file may be signed; `url` is the exact resource the player
// is about to load (the video's HLS manifest, poster, seek thumbnails, subtitles, chapters) and must derive from that
// lesson's own file. null when the viewer may not watch it.
export async function signLessonUrl(lessonId: string, url: string) {
  if (!isUuid(lessonId) || typeof url !== "string") return null
  const [row] = await db.select({ programId: lessons.programId }).from(lessons).where(eq(lessons.id, lessonId))
  const [program, viewer] = await Promise.all([row ? getProgram(row.programId) : null, getUser()])
  const lesson = program?.lessons.find((l) => l.id === lessonId)
  if (!program || !lesson?.videoPath) return null

  const isOwner = viewer?.id === program.trainerId
  // Drafts are visible to their trainer only
  if (!program.published && !isOwner) return null
  const hasPurchase = viewer ? await ownsProgram(viewer.id, program.id) : false
  // Lessons come ordered by position, so the first is the free preview
  if (!canWatchLesson({ isPreview: program.lessons[0].id === lessonId, isOwner, hasPurchase })) return null
  if (!isDerivedUrl(url, fileUrl(lesson.videoPath))) return null

  return signUrl(url, 60 * 60)
}
