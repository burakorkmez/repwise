import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Film, Pencil, Plus } from "lucide-react"
import { ProgramCover } from "@/components/cards"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireTrainer } from "@/lib/auth"
import { trainerPrograms } from "@/lib/queries"
import { money } from "@/lib/utils"

export const metadata: Metadata = { title: "Programs" }

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Programs" description="Create programs, add lessons, and set your prices.">
        <Link href="/dashboard/programs/new" className={buttonVariants({ size: "lg" })}>
          <Plus /> New program
        </Link>
      </PageHeader>
      <Suspense fallback={<Skeleton className="h-80 rounded-2xl" />}>
        <ProgramTable />
      </Suspense>
    </div>
  )
}

async function ProgramTable() {
  const me = await requireTrainer()
  const mine = await trainerPrograms(me.userId, true)

  return mine.length ? (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Sales</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {mine.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="pl-6">
                <div className="flex items-center gap-4 py-1">
                  <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                    <ProgramCover program={p} sizes="80px" />
                  </span>
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.lessonCount} lessons</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={p.published ? "secondary" : "outline"}>
                  {p.published && <span className="size-1.5 rounded-full bg-primary" />}
                  {p.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{money(p.priceCents)}</TableCell>
              <TableCell className="text-right">{p.sales}</TableCell>
              <TableCell className="text-right font-semibold">{money(p.revenueCents)}</TableCell>
              <TableCell className="pr-6 text-right">
                <Link href={`/dashboard/programs/${p.id}`} className={buttonVariants({ variant: "outline" })}>
                  <Pencil /> Edit
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <EmptyState icon={Film} title="No programs yet" description="Package your best workouts into a video program and start selling.">
      <Link href="/dashboard/programs/new" className={buttonVariants()}>
        <Plus /> Create your first program
      </Link>
    </EmptyState>
  )
}
