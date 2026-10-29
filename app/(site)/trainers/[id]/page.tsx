import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, Suspense } from "react"
import { CalendarDays, Clock, MessageCircle, ShieldCheck, Star, Video } from "lucide-react"
import { submitReview } from "@/app/actions/reviews"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { ProgramCard } from "@/components/cards"
import { LiveSlots } from "@/components/live-slots"
import { LocalTime } from "@/components/local-time"
import { Rating, Stars } from "@/components/rating"
import { ShareProfileButton } from "@/components/share-profile-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { canReview } from "@/lib/access"
import { getUser } from "@/lib/auth"
import { getTrainer, hasPurchasedFrom, trainerPrograms, trainerReviews } from "@/lib/queries"
import { loadSlots } from "@/lib/realtime"
import { specialtyLabel } from "@/lib/specialties"
import { cn, initials, money } from "@/lib/utils"

type Props = PageProps<"/trainers/[id]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trainer = await getTrainer((await params).id)
  return trainer ? { title: trainer.name, description: trainer.headline } : {}
}

// Params are URL data: read them inside Suspense so client navigations stay instant
export default function TrainerPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="shell py-12"><Skeleton className="h-[70vh] rounded-3xl" /></div>}>
      <Trainer params={params} />
    </Suspense>
  )
}

async function Trainer({ params }: Pick<Props, "params">) {
  const trainer = await getTrainer((await params).id)
  if (!trainer) notFound()

  const [programs, slots, reviews, viewer] = await Promise.all([
    trainerPrograms(trainer.id),
    loadSlots(trainer.id),
    trainerReviews(trainer.id),
    getUser(),
  ])
  const isSelf = viewer?.id === trainer.id
  const reviewable = viewer ? canReview({ isSelf, hasPurchase: await hasPurchasedFrom(viewer.id, trainer.id) }) : false
  const myReview = reviews.find((r) => r.clientId === viewer?.id)
  const firstName = trainer.name.split(" ")[0]
  const price = money(trainer.sessionPriceCents ?? 0)

  return (
    <div className="shell py-12">
      {/* Profile hero */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <div className="relative aspect-4/5 overflow-hidden rounded-3xl border bg-accent">
          {trainer.avatarUrl ? (
            <Image src={trainer.avatarUrl} alt={trainer.name} fill loading="eager" sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center font-heading text-8xl font-bold text-accent-foreground">{initials(trainer.name)}</span>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {trainer.specialties?.map((s) => (
              <Badge key={s} variant="secondary" className="h-7 px-3">
                {specialtyLabel(s)}
              </Badge>
            ))}
          </div>
          <h1 className="mt-5 text-5xl font-bold sm:text-6xl">{trainer.name}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{trainer.headline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {trainer.reviewCount > 0 && <Rating value={trainer.rating} count={trainer.reviewCount} />}
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
                {price}
                <span className="text-base font-normal text-muted-foreground"> / session</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" /> 60-minute video call
              </p>
            </div>
            {!isSelf && (
              <div className="flex gap-2">
                <ShareProfileButton name={trainer.name} specialties={trainer.specialties ?? []} />
                <Link href={`/messages?c=${trainer.id}`} className={buttonVariants({ size: "xl", variant: "outline" })}>
                  <MessageCircle /> Message
                </Link>
                <a href="#book" className={cn(buttonVariants({ size: "xl" }), "shadow-[0_0_28px_-6px] shadow-primary/70")}>
                  <CalendarDays /> Book a session
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Programs */}
      {programs.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl font-bold">Programs by {firstName}</h2>
          <p className="mt-2 text-muted-foreground">Watch the first lesson of any program for free.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
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
              {isSelf ? "Clients pick from these times. Manage them from your dashboard." : "Pick a time below. Times are shown in your time zone."}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{price}</span> · 60 min
          </p>
        </div>
        <div className="mt-8">
          <LiveSlots
            key={slots.sealedQuery.queryFingerprint}
            url={process.env.NEON_REALTIME_URL!}
            trainerId={trainer.id}
            firstName={firstName}
            isSelf={isSelf}
            since={slots.since}
            sealedQuery={slots.sealedQuery}
            initialData={slots.rows}
          />
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-24 grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 className="text-3xl font-bold">Reviews</h2>
          <div className="mt-6 rounded-2xl border bg-card p-6">
            {trainer.reviewCount > 0 ? (
              <>
                <p className="font-heading text-6xl font-bold">{trainer.rating.toFixed(1)}</p>
                <Stars value={Math.round(trainer.rating)} className="mt-2" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on {trainer.reviewCount} {trainer.reviewCount === 1 ? "review" : "reviews"}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </div>
          {reviewable && <ReviewForm trainerId={trainer.id} name={firstName} existing={myReview} />}
        </div>
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <UserAvatar name={r.clientName} src={r.clientAvatarUrl} className="size-10" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    <LocalTime date={r.createdAt} format={{ month: "long", day: "numeric", year: "numeric" }} />
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-4 leading-relaxed">{r.comment}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// CSS-only star picker: inputs come in reverse order so `peer-checked` lights every lower star
function ReviewForm({ trainerId, name, existing }: { trainerId: string; name: string; existing?: { rating: number; comment: string | null } }) {
  return (
    <ActionForm action={submitReview.bind(null, trainerId)} className="mt-4 rounded-2xl border border-primary/30 bg-accent/40 p-6">
      <p className="font-semibold">{existing ? "Your review" : `You trained with ${name}`}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {existing ? "Update it anytime." : "How was it? Your review helps others choose."}
      </p>
      <fieldset className="mt-4 flex flex-row-reverse justify-end gap-1">
        <legend className="sr-only">Rating</legend>
        {[5, 4, 3, 2, 1].map((n) => (
          <Fragment key={n}>
            <input id={`star-${n}`} type="radio" name="rating" value={n} defaultChecked={n === (existing?.rating ?? 5)} className="peer sr-only" />
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
      <Textarea name="comment" rows={3} maxLength={1000} defaultValue={existing?.comment ?? ""} placeholder="Share what you liked…" className="mt-4 bg-background" />
      <SubmitButton size="lg" className="mt-3 w-full">
        {existing ? "Update review" : "Post review"}
      </SubmitButton>
    </ActionForm>
  )
}
