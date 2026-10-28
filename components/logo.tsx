import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-heading text-xl font-bold tracking-tight", className)}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Dumbbell className="size-4.5 -rotate-45" />
      </span>
      Repwise
    </Link>
  )
}
