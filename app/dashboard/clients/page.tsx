import type { Metadata } from "next"
import Link from "next/link"
import { MessageCircle, Users } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserAvatar } from "@/components/user-avatar"
import { getProgram, meTrainer, person, purchases } from "@/lib/mock-data"
import { formatDate, money } from "@/lib/utils"

export const metadata: Metadata = { title: "Clients" }

export default function ClientsPage() {
  // Purchases are newest-first, so list[0] is each client's latest
  const rows = Object.values(Object.groupBy(purchases.filter((p) => p.trainerId === meTrainer.id), (p) => p.clientId)).map(
    (list) => ({
      client: person(list![0].clientId)!,
      programs: list!.filter((p) => p.programId).map((p) => getProgram(p.programId!)!.title),
      sessions: list!.filter((p) => p.kind === "session").length,
      total: list!.reduce((sum, p) => sum + p.amountCents, 0),
      last: list![0].createdAt,
    }),
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Everyone who bought a program or booked a session with you." />

      {rows.length ? (
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
                <TableRow key={r.client.id}>
                  <TableCell className="pl-6">
                    <span className="flex items-center gap-3 py-1">
                      <UserAvatar name={r.client.name} className="size-9" />
                      <span className="font-semibold">{r.client.name}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1.5">
                      {r.programs.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                      {r.sessions > 0 && (
                        <Badge variant="outline">
                          {r.sessions} {r.sessions === 1 ? "session" : "sessions"}
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{money(r.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(r.last, { month: "short", day: "numeric" })}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Link href={`/messages?c=${r.client.id}`} className={buttonVariants({ variant: "outline" })}>
                      <MessageCircle /> Message
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Users} title="No clients yet" description="When someone buys a program or books a session, they'll appear here." />
      )}
    </div>
  )
}
