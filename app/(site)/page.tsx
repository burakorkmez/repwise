import Link from "next/link"
import { Image } from "@imagekit/next"
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  CirclePlay,
  Dumbbell,
  HeartPulse,
  MessageCircle,
  Mic,
  Play,
  Quote,
  Video,
} from "lucide-react"
import { Suspense } from "react"
import { ProgramCard, TrainerCard } from "@/components/cards"
import { Stars } from "@/components/rating"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { featuredReviews, listTrainers, publishedPrograms } from "@/lib/queries"
import { specialties } from "@/lib/specialties"
import { cn, imageProps } from "@/lib/utils"

const stats = [
  { value: "120+", label: "Elite coaches" },
  { value: "2,400+", label: "Video lessons" },
  { value: "4.9", label: "Average rating" },
]

const pillars = [
  { icon: Dumbbell, title: "Train", text: "Video programs, anytime" },
  { icon: MessageCircle, title: "Connect", text: "Chat with your coach" },
  { icon: HeartPulse, title: "Thrive", text: "Real, lasting results" },
]

const features = [
  { icon: Play, title: "Video programs", text: "Follow step-by-step lessons. The first one is always free." },
  { icon: Video, title: "1:1 video calls", text: "Book a slot and train face-to-face with your coach." },
  { icon: MessageCircle, title: "Chat & threads", text: "Ask questions, share progress, react to wins." },
  { icon: CalendarCheck, title: "Book in seconds", text: "Pick an open time and pay securely with Stripe." },
]

const glow = "shadow-[0_0_32px_-6px] shadow-primary/70"

export default function HomePage() {
  return (
    <>
      {/* Hero stays dark in both themes: it sits on a dark photo */}
      <section data-theme="dark" className="relative isolate overflow-hidden bg-background text-foreground">
        <Image
          {...imageProps("/images/hero.jpg")}
          alt=""
          fill
          loading="eager"
          sizes="100vw"
          className="-z-10 object-cover object-[75%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/80 to-background/5" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-background" />

        <div className="shell grid min-h-170 items-center gap-10 py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">Stronger every day</p>
            <h1 className="mt-5 text-5xl leading-[1.02] font-bold sm:text-6xl lg:text-7xl">
              Train with the best.
              <span className="block text-primary">Anywhere.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Elite personal trainers, step-by-step video programs, and 1:1 coaching calls — all in one
              place, built around your schedule.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/trainers" className={cn(buttonVariants({ size: "xl" }), glow)}>
                Find your trainer <ArrowRight />
              </Link>
              <Link href="#programs" className={buttonVariants({ size: "xl", variant: "outline" })}>
                <CirclePlay /> Watch a free lesson
              </Link>
            </div>
            <dl className="mt-14 flex gap-8">
              {stats.map((s, i) => (
                <div key={s.label} className={cn(i > 0 && "border-l pl-8")}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-heading text-3xl font-bold">{s.value}</dd>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden h-full min-h-130 lg:block">
            <p className="absolute top-6 right-0 -rotate-8 text-right font-script text-4xl leading-snug text-primary">
              Stronger.
              <br />
              Fitter.
              <br />
              Unstoppable.
            </p>
            <ul className="absolute right-0 bottom-6 space-y-6">
              {pillars.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-full border border-primary/40 bg-background/60 text-primary backdrop-blur">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold tracking-wider uppercase">{title}</span>
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="shell py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Workouts for every goal</h2>
            <p className="mt-2 text-muted-foreground">
              From heavy barbells to deep stretches — find a coach for what moves you.
            </p>
          </div>
          <p className="hidden text-right font-heading text-5xl leading-[0.9] font-black text-foreground/6 uppercase select-none lg:block">
            Discipline
            <br />
            builds freedom
          </p>
        </div>
        <div className="mt-10 grid grid-cols-4 gap-y-8 sm:grid-cols-8">
          {specialties.map(({ slug, label, icon: Icon }) => (
            <Link key={slug} href={`/trainers?specialty=${slug}`} className="group flex flex-col items-center gap-3">
              <span className="grid size-16 place-items-center rounded-full border bg-card text-primary transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured trainers */}
      <section className="border-y bg-card/40 py-20">
        <div className="shell">
          <SectionHeader title="Meet your coaches" text="Certified pros who've helped thousands get results." href="/trainers" cta="View all trainers" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Suspense fallback={<CardsSkeleton count={4} className="aspect-4/5" />}>
              <FeaturedTrainers />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Product showcase */}
      <section className="shell grid items-center gap-16 py-24 lg:grid-cols-2">
        <CallPreview />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">Built for real coaching</p>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Your coach.
            <br />
            One tap away.
          </h2>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Everything you need to train with a world-class coach: lessons you can follow at your own pace,
            live sessions when you need feedback, and a direct line between them.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 -rotate-3 font-script text-3xl text-primary">Small steps. Big changes.</p>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="shell scroll-mt-20 py-12">
        <SectionHeader title="Training programs" text="Goal-based plans designed by experts. Watch the first lesson of any program free." href="/trainers" cta="Browse coaches" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<CardsSkeleton count={3} className="aspect-4/3" />}>
            <LatestPrograms />
          </Suspense>
        </div>
      </section>

      {/* Testimonials */}
      <section className="shell py-20">
        <SectionHeader title="Real people. Real results." text="Thousands of clients have transformed their training with Repwise." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Suspense fallback={<CardsSkeleton count={3} className="h-56" />}>
            <Testimonials />
          </Suspense>
        </div>
      </section>

      {/* Trainer CTA */}
      <section className="shell pb-4">
        <div data-theme="dark" className="relative isolate overflow-hidden rounded-3xl border bg-background text-foreground">
          <div className="absolute inset-y-0 left-0 -z-10 w-full md:w-1/2">
            <Image
              {...imageProps("/images/trainers/leo-novak.jpg")}
              alt=""
              fill
              sizes="(min-width: 768px) 40rem, 100vw"
              className="object-cover object-[50%_20%]"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-background/40 via-background/95 to-background md:from-transparent md:from-15% md:via-background/70 md:via-40% md:to-background md:to-50%" />
          <div className="ml-auto max-w-xl px-8 py-16 md:px-12">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">For coaches</p>
            <h2 className="mt-4 text-4xl font-bold">Turn your expertise into income.</h2>
            <p className="mt-4 text-muted-foreground">
              Sell video programs, fill your calendar with 1:1 sessions, and chat with clients. We handle
              payments, video hosting, and calls.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Set your own prices", "Live earnings dashboard", "No monthly fees"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CircleCheck className="size-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "xl" }), glow)}>
                Become a trainer <ArrowRight />
              </Link>
              <Link href="/dashboard" className={buttonVariants({ size: "xl", variant: "outline" })}>
                See the dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

async function FeaturedTrainers() {
  const trainers = await listTrainers({ limit: 4 })
  return trainers.map((t) => <TrainerCard key={t.id} trainer={t} />)
}

async function LatestPrograms() {
  const programs = await publishedPrograms(6)
  return programs.map((p) => <ProgramCard key={p.id} program={p} />)
}

async function Testimonials() {
  const reviews = await featuredReviews()
  return reviews.map((r) => (
    <figure key={r.id} className="flex flex-col rounded-2xl border bg-card p-6">
      <Quote className="size-6 text-primary" />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">“{r.comment}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <UserAvatar name={r.clientName} src={r.clientAvatarUrl} className="size-10" />
        <div className="flex-1">
          <p className="text-sm font-semibold">{r.clientName}</p>
          <p className="text-xs text-muted-foreground">Trained with {r.trainerName}</p>
        </div>
        <Stars value={r.rating} />
      </figcaption>
    </figure>
  ))
}

function CardsSkeleton({ count, className }: { count: number; className: string }) {
  return Array.from({ length: count }, (_, i) => <Skeleton key={i} className={cn("rounded-2xl", className)} />)
}

function SectionHeader({ title, text, href, cta }: { title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-2 text-muted-foreground">{text}</p>
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {cta} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

// Static mock of the call + chat experience
function CallPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg pb-10 lg:pb-0">
      <div data-theme="dark" className="relative aspect-4/5 overflow-hidden rounded-3xl border bg-background text-foreground shadow-2xl shadow-primary/10">
        <Image {...imageProps("/images/trainers/maya-chen.jpg")} alt="" fill sizes="32rem" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur">
          <span className="size-2 animate-pulse rounded-full bg-red-500" /> Live · 24:13
        </div>
        <div className="absolute top-4 right-4 grid h-28 w-20 place-items-center rounded-xl border border-white/15 bg-neutral-800">
          <UserAvatar name="Alex Morgan" className="size-10" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
          <span className="rounded-lg bg-black/50 px-2.5 py-1 text-sm font-medium backdrop-blur">Maya Chen</span>
          <div className="flex gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur"><Mic className="size-4" /></span>
            <span className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur"><Video className="size-4" /></span>
            <span className="grid h-10 place-items-center rounded-full bg-red-500 px-4 text-sm font-medium">Leave</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 bottom-24 w-64 rounded-2xl border bg-popover p-4 shadow-xl sm:-right-10">
        <div className="flex items-center gap-2">
          <UserAvatar name="Maya Chen" src="/images/trainers/maya-chen.jpg" className="size-7" />
          <span className="text-sm font-semibold">Maya Chen</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Great depth on that last set! Keep the chest up 💪</p>
        <div className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs">🔥 2</div>
      </div>
      <div className="absolute -bottom-2 -left-4 flex items-center gap-3 rounded-2xl border bg-popover p-3 pr-5 shadow-xl sm:-left-10">
        <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <CalendarCheck className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Session booked</p>
          <p className="text-xs text-muted-foreground">Mon, Nov 2 · 10:00 AM</p>
        </div>
      </div>
    </div>
  )
}
