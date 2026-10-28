import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { SearchX } from "lucide-react"
import { TrainerCard } from "@/components/cards"
import { EmptyState } from "@/components/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trainers } from "@/lib/mock-data"
import { specialties } from "@/lib/specialties"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Find a trainer" }

export default function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  return (
    <div className="shell py-14">
      <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">Coaches</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Find your coach</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Browse certified trainers, watch a free lesson, and book a 1:1 session when you&apos;re ready.
      </p>
      <Suspense fallback={<DirectorySkeleton />}>
        <Directory searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function Directory({ searchParams }: Pick<PageProps<"/trainers">, "searchParams">) {
  const { specialty } = await searchParams
  const active = typeof specialty === "string" ? specialty : undefined
  const list = active ? trainers.filter((t) => t.specialties.includes(active)) : trainers

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        <Chip href="/trainers" active={!active}>
          All
        </Chip>
        {specialties.map(({ slug, label, icon: Icon }) => (
          <Chip key={slug} href={`/trainers?specialty=${slug}`} active={active === slug}>
            <Icon className="size-4" /> {label}
          </Chip>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {list.length} {list.length === 1 ? "trainer" : "trainers"}
      </p>
      {list.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((t) => (
            <TrainerCard key={t.id} trainer={t} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="No trainers yet" description="Nobody coaches this specialty yet. Try another one, or check back soon.">
            <Link href="/trainers" className={buttonVariants({ variant: "outline" })}>
              Show all trainers
            </Link>
          </EmptyState>
        </div>
      )}
    </>
  )
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
      )}
    >
      {children}
    </Link>
  )
}

function DirectorySkeleton() {
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-4/5 rounded-2xl" />
        ))}
      </div>
    </>
  )
}
