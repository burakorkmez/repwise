import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Film, Pencil, Plus } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { meTrainer, programs } from "@/lib/mock-data"
import { money } from "@/lib/utils"

export const metadata: Metadata = { title: "Programs" }

export default function ProgramsPage() {
  const mine = programs.filter((p) => p.trainerId === meTrainer.id)

  return (
    <div className="space-y-6">
      <PageHeader title="Programs" description="Create programs, upload lessons, and set your prices.">
        <Link href="/dashboard/programs/new" className={buttonVariants({ size: "lg" })}>
          <Plus /> New program
        </Link>
      </PageHeader>

      {mine.length ? (
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
                        <Image src={p.coverUrl} alt="" fill sizes="80px" className="object-cover" />
                      </span>
                      <div>
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.lessons.length} lessons</p>
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
                  <TableCell className="text-right font-semibold">{money(p.sales * p.priceCents)}</TableCell>
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
      )}
    </div>
  )
}
