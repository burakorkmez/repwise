import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BadgeCheck, ChevronRight, CircleCheck, Lock, MessageCircle, Play, ShieldCheck } from "lucide-react"
import { Rating } from "@/components/rating"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { getProgram, getTrainer, me, programs, purchases, type Program } from "@/lib/mock-data"
import { cn, money } from "@/lib/utils"

type Props = PageProps<"/programs/[id]">

export const generateStaticParams = () => programs.map((p) => ({ id: p.id }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = getProgram((await params).id)
  return program ? { title: program.title, description: program.description } : {}
}

const currentLesson = async (program: Program, searchParams: Props["searchParams"]) => {
  const { lesson } = await searchParams
  return program.lessons.find((l) => l.id === lesson) ?? program.lessons[0]
}

export default function ProgramPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="shell py-10"><Skeleton className="aspect-video max-w-4xl rounded-2xl" /></div>}>
      <ProgramView params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function ProgramView({ params, searchParams }: Props) {
  const program = getProgram((await params).id)
  if (!program) notFound()
  const trainer = getTrainer(program.trainerId)!
  const owned = purchases.some((p) => p.clientId === me.id && p.programId === program.id)

  return (
    <div className="shell py-10">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/trainers" className="hover:text-foreground">Trainers</Link>
        <ChevronRight className="size-4" />
        <Link href={`/trainers/${trainer.id}`} className="hover:text-foreground">{trainer.name}</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{program.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Suspense fallback={<Skeleton className="aspect-video rounded-2xl" />}>
            <Player program={program} owned={owned} searchParams={searchParams} />
          </Suspense>

          <h1 className="mt-8 text-3xl font-bold sm:text-4xl">{program.title}</h1>
          <Link href={`/trainers/${trainer.id}`} className="mt-4 inline-flex items-center gap-3">
            <UserAvatar name={trainer.name} src={trainer.avatarUrl} className="size-10" />
            <span>
              <span className="block text-sm font-semibold">{trainer.name}</span>
              <span className="text-sm text-muted-foreground">{trainer.headline}</span>
            </span>
          </Link>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{program.description}</p>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { k: `${program.lessons.length}`, v: "Video lessons" },
              { k: program.sales.toLocaleString("en-US"), v: "Students" },
              { k: "∞", v: "Lifetime access" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border bg-card p-4">
                <p className="font-heading text-2xl font-bold">{s.k}</p>
                <p className="text-sm text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          {owned ? (
            <div className="rounded-2xl border border-primary/40 bg-accent/40 p-6">
              <p className="flex items-center gap-2 font-semibold text-primary">
                <BadgeCheck className="size-5" /> You own this program
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Lifetime access to all {program.lessons.length} lessons. Questions? Your coach is one message away.
              </p>
              <Link href={`/messages?c=${trainer.id}`} className={cn(buttonVariants({ variant: "outline", size: "xl" }), "mt-5 w-full")}>
                <MessageCircle /> Message {trainer.name.split(" ")[0]}
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-6">
              <p className="font-heading text-4xl font-bold">{money(program.priceCents)}</p>
              <p className="mt-1 text-sm text-muted-foreground">One-time payment · lifetime access</p>
              <Button size="xl" className="mt-5 w-full shadow-[0_0_28px_-6px] shadow-primary/70">
                Buy program
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" /> Secure checkout with Stripe
              </p>
              <ul className="mt-6 space-y-2.5 border-t pt-6 text-sm">
                {[`${program.lessons.length} HD video lessons`, "Lesson 1 free to preview", "Watch on any device", "Chat with your coach"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CircleCheck className="size-4 text-primary" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
                <span className="text-muted-foreground">Coach rating</span>
                <Rating value={trainer.rating} count={trainer.reviewCount} />
              </div>
            </div>
          )}
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <LessonList program={program} owned={owned} searchParams={searchParams} />
          </Suspense>
        </aside>
      </div>
    </div>
  )
}

async function Player({ program, owned, searchParams }: { program: Program; owned: boolean; searchParams: Props["searchParams"] }) {
  const lesson = await currentLesson(program, searchParams)
  const unlocked = owned || lesson.position === 1

  return (
    <div data-theme="dark" className="relative isolate aspect-video overflow-hidden rounded-2xl border bg-black text-foreground">
      <Image
        src={program.coverUrl}
        alt=""
        fill
        loading="eager"
        sizes="(min-width: 1024px) 60vw, 100vw"
        className={cn("-z-10 object-cover", unlocked ? "opacity-75" : "scale-110 opacity-40 blur-lg")}
      />
      {unlocked ? (
        <>
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-transparent to-black/20" />
          <button
            aria-label="Play lesson"
            className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_48px_-4px] shadow-primary/70 transition hover:scale-105 sm:size-20"
          >
            <Play className="ml-1 size-6 fill-current sm:size-8" />
          </button>
          <div className="absolute inset-x-0 bottom-0 hidden p-5 sm:block">
            <p className="text-sm font-medium">
              Lesson {lesson.position} · {lesson.title}
            </p>
            <div className="mt-3 h-1 rounded-full bg-white/20">
              <div className="h-full w-0 rounded-full bg-primary" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/60">
              <span>0:00</span>
              <span>HD · Adaptive streaming</span>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-white/15 bg-black/50 backdrop-blur">
              <Lock className="size-6" />
            </span>
            <p className="mt-5 text-xl font-semibold">Lesson {lesson.position} is locked</p>
            <p className="mt-1 text-sm text-white/70">
              Buy {program.title} to unlock all {program.lessons.length} lessons.
            </p>
            <Button size="xl" className="mt-6">
              Unlock for {money(program.priceCents)}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

async function LessonList({ program, owned, searchParams }: { program: Program; owned: boolean; searchParams: Props["searchParams"] }) {
  const current = await currentLesson(program, searchParams)

  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Lessons</h2>
        <span className="text-sm text-muted-foreground">{program.lessons.length} videos</span>
      </div>
      <ol className="p-2">
        {program.lessons.map((l) => {
          const active = l.id === current.id
          const unlocked = owned || l.position === 1
          return (
            <li key={l.id}>
              <Link
                href={`/programs/${program.id}?lesson=${l.id}`}
                scroll={false}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted",
                  active && "bg-accent text-accent-foreground hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    active && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {active ? <Play className="size-3.5 fill-current" /> : l.position}
                </span>
                <span className="flex-1">{l.title}</span>
                {l.position === 1 && !owned && <Badge variant="secondary">Free</Badge>}
                {!unlocked && <Lock className="size-4 text-muted-foreground" />}
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
