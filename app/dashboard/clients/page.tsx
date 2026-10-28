import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { MessageCircle, Users } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { LocalTime } from "@/components/local-time"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserAvatar } from "@/components/user-avatar"
import { requireTrainer } from "@/lib/auth"
import { trainerClients } from "@/lib/queries"
import { money } from "@/lib/utils"

export const metadata: Metadata = { title: "Clients" }

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Everyone who bought a program or booked a session with you." />
      <Suspense fallback={<Skeleton className="h-80 rounded-2xl" />}>
        <ClientTable />
      </Suspense>
    </div>
  )
}

async function ClientTable() {
  const me = await requireTrainer()
  const rows = await trainerClients(me.userId)

  if (!rows.length) {
    return <EmptyState icon={Users} title="No clients yet" description="When someone buys a program or books a session, they'll appear here." />
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Client</TableHead>
            <TableHead>Purchases</TableHead>
            <TableHead className="text-right">Total spent</TableHead>
            <TableHead>Last purchase</TableHead>
            <TableHead className="pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="pl-6">
                <span className="flex items-center gap-3 py-1">
                  <UserAvatar name={r.name} src={r.avatarUrl} className="size-9" />
                  <span className="font-semibold">{r.name}</span>
                </span>
              </TableCell>
              <TableCell>
                <span className="flex flex-wrap gap-1.5">
                  {r.programTitles.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                  {r.sessions > 0 && (
                    <Badge variant="outline">
                      {r.sessions} {r.sessions === 1 ? "session" : "sessions"}
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-right font-semibold">{money(r.totalCents)}</TableCell>
              <TableCell className="text-muted-foreground">
                <LocalTime date={r.lastPurchaseAt} format={{ month: "short", day: "numeric" }} />
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Link href={`/messages?c=${r.id}`} className={buttonVariants({ variant: "outline" })}>
                  <MessageCircle /> Message
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
