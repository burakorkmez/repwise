import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Rating } from "@/components/rating"
import { UserAvatar } from "@/components/user-avatar"
import { getTrainer, type Program, type Trainer } from "@/lib/mock-data"
import { specialtyLabel } from "@/lib/specialties"
import { money } from "@/lib/utils"

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <Link
      href={`/trainers/${trainer.id}`}
      className="group relative block overflow-hidden rounded-2xl border bg-card"
    >
      <div className="relative aspect-4/5">
        <Image
          src={trainer.avatarUrl}
          alt={trainer.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {trainer.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur"
            >
              {specialtyLabel(s)}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <Rating value={trainer.rating} count={trainer.reviewCount} />
          <h3 className="mt-1 text-xl font-semibold">{trainer.name}</h3>
          <p className="text-sm text-white/70">{trainer.headline}</p>
          <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-sm">
            <span>
              <span className="font-semibold">{money(trainer.sessionPriceCents)}</span>
              <span className="text-white/60"> / session</span>
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-[oklch(0.86_0.2_152)]">
              View profile
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ProgramCard({ program }: { program: Program }) {
  const trainer = getTrainer(program.trainerId)!
  return (
    <Link
      href={`/programs/${program.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={program.coverUrl}
          alt={program.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {program.lessons.length} lessons
        </span>
        <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">{program.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{program.description}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="flex items-center gap-2 text-sm">
            <UserAvatar name={trainer.name} src={trainer.avatarUrl} className="size-6" />
            {trainer.name}
          </span>
          <span className="font-heading text-lg font-semibold">{money(program.priceCents)}</span>
        </div>
      </div>
    </Link>
  )
}
