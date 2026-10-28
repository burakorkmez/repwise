import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, Suspense } from "react"
import { CalendarDays, Clock, MessageCircle, ShieldCheck, Star, Video } from "lucide-react"
import { ProgramCard } from "@/components/cards"
import { Rating, Stars } from "@/components/rating"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { getTrainer, me, person, programs, purchases, reviews, slots, trainers } from "@/lib/mock-data"
import { specialtyLabel } from "@/lib/specialties"
import { cn, formatDate, money } from "@/lib/utils"

export const generateStaticParams = () => trainers.map((t) => ({ id: t.id }))

export async function generateMetadata({ params }: PageProps<"/trainers/[id]">): Promise<Metadata> {
  const trainer = getTrainer((await params).id)
  return trainer ? { title: trainer.name, description: trainer.headline } : {}
}

// Params are URL data: read them inside Suspense so client navigations stay instant
export default function TrainerPage({ params }: PageProps<"/trainers/[id]">) {
  return (
    <Suspense fallback={<div className="shell py-12"><Skeleton className="h-[70vh] rounded-3xl" /></div>}>
      <Trainer params={params} />
    </Suspense>
  )
}

async function Trainer({ params }: Pick<PageProps<"/trainers/[id]">, "params">) {
  const trainer = getTrainer((await params).id)
  if (!trainer) notFound()

  const trainerPrograms = programs.filter((p) => p.trainerId === trainer.id && p.published)
  const trainerReviews = reviews.filter((r) => r.trainerId === trainer.id)
  const days = Object.entries(
    Object.groupBy(
      slots.filter((s) => s.trainerId === trainer.id),
      (s) => formatDate(s.startsAt, { weekday: "short", month: "short", day: "numeric" }),
    ),
  )
  const canReview = purchases.some((p) => p.clientId === me.id && p.trainerId === trainer.id)
  const firstName = trainer.name.split(" ")[0]

  return (
    <div className="shell py-12">
      {/* Profile hero */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <div className="relative aspect-4/5 overflow-hidden rounded-3xl border">
          <Image src={trainer.avatarUrl} alt={trainer.name} fill loading="eager" sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((s) => (
              <Badge key={s} variant="secondary" className="h-7 px-3">
                {specialtyLabel(s)}
              </Badge>
            ))}
          </div>
          <h1 className="mt-5 text-5xl font-bold sm:text-6xl">{trainer.name}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{trainer.headline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Rating value={trainer.rating} count={trainer.reviewCount} />
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Video className="size-4" /> 1:1 video sessions
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-4" /> Verified coach
            </span>
          </div>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{trainer.bio}</p>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-heading text-3xl font-bold">
                {money(trainer.sessionPriceCents)}
                <span className="text-base font-normal text-muted-foreground"> / session</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" /> 60-minute video call
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/messages?c=${trainer.id}`} className={buttonVariants({ size: "xl", variant: "outline" })}>
                <MessageCircle /> Message
              </Link>
              <a href="#book" className={cn(buttonVariants({ size: "xl" }), "shadow-[0_0_28px_-6px] shadow-primary/70")}>
                <CalendarDays /> Book a session
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      {trainerPrograms.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl font-bold">Programs by {firstName}</h2>
          <p className="mt-2 text-muted-foreground">Watch the first lesson of any program for free.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trainerPrograms.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}

      {/* Booking */}
      <section id="book" className="mt-24 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Book a 1:1 session</h2>
            <p className="mt-2 text-muted-foreground">
              Pick a time below. Times are shown in your time zone · secure checkout with Stripe.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{money(trainer.sessionPriceCents)}</span> · 60 min
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {days.map(([day, daySlots]) => (
            <div key={day} className="rounded-2xl border bg-card p-4">
              <p className="text-sm font-semibold">{day}</p>
              <div className="mt-3 grid gap-2">
                {daySlots!.map((s) =>
                  s.status === "open" ? (
                    <Button key={s.id} variant="outline" size="lg" className="justify-center hover:border-primary hover:bg-primary hover:text-primary-foreground">
                      {formatDate(s.startsAt, { hour: "numeric", minute: "2-digit" })}
                    </Button>
                  ) : (
                    <span key={s.id} className="flex h-9 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground line-through">
                      {formatDate(s.startsAt, { hour: "numeric", minute: "2-digit" })}
                    </span>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-24 grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 className="text-3xl font-bold">Reviews</h2>
          <div className="mt-6 rounded-2xl border bg-card p-6">
            <p className="font-heading text-6xl font-bold">{trainer.rating.toFixed(1)}</p>
            <Stars value={Math.round(trainer.rating)} className="mt-2" />
            <p className="mt-2 text-sm text-muted-foreground">Based on {trainer.reviewCount} reviews</p>
          </div>
          {canReview && <ReviewForm name={firstName} />}
        </div>
        <ul className="space-y-4">
          {trainerReviews.map((r) => {
            const author = person(r.clientId)!
            return (
              <li key={r.id} className="rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-3">
                  <UserAvatar name={author.name} className="size-10" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{author.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt, { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-4 leading-relaxed">{r.comment}</p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

// CSS-only star picker: inputs come in reverse order so `peer-checked` lights every lower star
function ReviewForm({ name }: { name: string }) {
  return (
    <form className="mt-4 rounded-2xl border border-primary/30 bg-accent/40 p-6">
      <p className="font-semibold">You trained with {name}</p>
      <p className="mt-1 text-sm text-muted-foreground">How was it? Your review helps others choose.</p>
      <fieldset className="mt-4 flex flex-row-reverse justify-end gap-1">
        <legend className="sr-only">Rating</legend>
        {[5, 4, 3, 2, 1].map((n) => (
          <Fragment key={n}>
            <input id={`star-${n}`} type="radio" name="rating" value={n} defaultChecked={n === 5} className="peer sr-only" />
            <label
              htmlFor={`star-${n}`}
              className="cursor-pointer text-muted-foreground/30 transition peer-checked:text-primary hover:text-primary [&:hover~label]:text-primary"
            >
              <Star className="size-7 fill-current" />
              <span className="sr-only">{n} stars</span>
            </label>
          </Fragment>
        ))}
      </fieldset>
      <Textarea name="comment" rows={3} placeholder="Share what you liked…" className="mt-4 bg-background" />
      <Button type="button" size="lg" className="mt-3 w-full">
        Post review
      </Button>
    </form>
  )
}
