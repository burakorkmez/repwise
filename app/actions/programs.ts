"use server"

import { and, eq, inArray, sql } from "drizzle-orm"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import type { ActionResult } from "@/components/action-form"
import { isFileIn } from "@/lib/access"
import { requireTrainer } from "@/lib/auth"
import { db } from "@/lib/db"
import { lessons, programs, purchases } from "@/lib/db/schema"
import { isUuid } from "@/lib/utils"

const programInput = z
  .object({
    title: z.string().trim().min(3, "Give the program a title of at least 3 characters").max(80, "Keep the title under 80 characters"),
    description: z.string().trim().min(10, "Write a description of at least 10 characters").max(2000),
    price: z.coerce.number().min(1, "Price must be at least $1").max(1000, "Price must be $1,000 or less"),
  })
  .transform(({ price, ...rest }) => ({ ...rest, priceCents: Math.round(price * 100) }))

const parseProgram = (formData: FormData) =>
  programInput.safeParse({ title: formData.get("title"), description: formData.get("description"), price: formData.get("price") })

const lessonTitle = z.string().trim().min(2, "Give the lesson a title").max(120)

// A path the browser got back from ImageKit; it must sit in this program's own folder
const uploadedTo = (folder: string) => z.string().refine((path) => isFileIn(folder, path), "Upload the file again")

// Every write below scopes to the signed-in trainer's own programs
const ownProgram = (id: string, trainerId: string) => and(eq(programs.id, id), eq(programs.trainerId, trainerId))

export async function createProgram(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const trainer = await requireTrainer()
  const parsed = parseProgram(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const [program] = await db
    .insert(programs)
    .values({ trainerId: trainer.userId, ...parsed.data })
    .returning({ id: programs.id })
  redirect(`/dashboard/programs/${program.id}`)
}

export async function updateProgram(programId: string, _state: ActionResult, formData: FormData): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(programId)) return { error: "Program not found" }
  const parsed = parseProgram(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const published = formData.get("published") === "on"
  if (published) {
    const [lesson] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.programId, programId)).limit(1)
    if (!lesson) return { error: "Add at least one lesson before publishing" }
  }

  const updated = await db
    .update(programs)
    .set({ ...parsed.data, published })
    .where(ownProgram(programId, trainer.userId))
    .returning({ id: programs.id })
  if (!updated.length) return { error: "Program not found" }
  refresh()
}

// A program with buyers can only be unpublished
export async function deleteProgram(programId: string): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(programId)) return { error: "Program not found" }

  const [sold] = await db.select({ id: purchases.id }).from(purchases).where(eq(purchases.programId, programId)).limit(1)
  if (sold) return { error: "Clients own this program, so unpublish it instead" }

  await db.delete(programs).where(ownProgram(programId, trainer.userId))
  redirect("/dashboard/programs")
}

export async function setCover(programId: string, path: string): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(programId)) return { error: "Program not found" }
  const cover = uploadedTo(`/covers/${programId}`).safeParse(path)
  if (!cover.success) return { error: cover.error.issues[0].message }

  const updated = await db
    .update(programs)
    .set({ coverUrl: cover.data })
    .where(ownProgram(programId, trainer.userId))
    .returning({ id: programs.id })
  if (!updated.length) return { error: "Program not found" }
  refresh()
}

// Title only; the lesson row's upload button adds the video (setLessonVideo)
export async function addLesson(programId: string, _state: ActionResult, formData: FormData): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(programId)) return { error: "Program not found" }
  const title = lessonTitle.safeParse(formData.get("title"))
  if (!title.success) return { error: title.error.issues[0].message }

  const [owned] = await db.select({ id: programs.id }).from(programs).where(ownProgram(programId, trainer.userId))
  if (!owned) return { error: "Program not found" }

  await db.insert(lessons).values({
    programId,
    title: title.data,
    position: sql`(select coalesce(max(${lessons.position}), 0) + 1 from ${lessons} where ${lessons.programId} = ${programId})`,
  })
  refresh()
}

// The video is a private ImageKit file in /lessons/{programId}; only signLessonUrl hands out playable URLs
export async function setLessonVideo(lessonId: string, path: string): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(lessonId)) return { error: "Lesson not found" }
  const [lesson] = await db
    .select({ programId: lessons.programId })
    .from(lessons)
    .innerJoin(programs, eq(programs.id, lessons.programId))
    .where(and(eq(lessons.id, lessonId), eq(programs.trainerId, trainer.userId)))
  if (!lesson) return { error: "Lesson not found" }
  const video = uploadedTo(`/lessons/${lesson.programId}`).safeParse(path)
  if (!video.success) return { error: video.error.issues[0].message }

  await db.update(lessons).set({ videoPath: video.data }).where(eq(lessons.id, lessonId))
  refresh()
}

export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (!isUuid(lessonId)) return { error: "Lesson not found" }
  await db
    .delete(lessons)
    .where(
      and(
        eq(lessons.id, lessonId),
        inArray(lessons.programId, db.select({ id: programs.id }).from(programs).where(eq(programs.trainerId, trainer.userId))),
      ),
    )
  refresh()
}
