import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-4 fill-primary text-primary" />
      <span className="font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && <span className="opacity-60">({count})</span>}
    </span>
  )
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-4", n <= value ? "fill-primary text-primary" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  )
}
