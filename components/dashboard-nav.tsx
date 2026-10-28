"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, CalendarDays, Film, LayoutDashboard, MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/programs", label: "Programs", icon: Film },
  { href: "/dashboard/slots", label: "Slots & bookings", icon: CalendarDays },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
]

export function DashboardNav({ mobile, profileHref }: { mobile?: boolean; profileHref: string }) {
  const pathname = usePathname()
  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href))
  const link = "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"

  return (
    <nav className={mobile ? "flex gap-1 overflow-x-auto border-b px-3 py-2 lg:hidden" : "mt-8 flex flex-1 flex-col gap-1"}>
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={cn(link, active(href) && "bg-accent text-accent-foreground hover:bg-accent")}>
          <Icon className="size-4" /> {label}
        </Link>
      ))}
      {!mobile && (
        <>
          <span className="my-3 h-px bg-border" />
          <Link href={profileHref} className={link}>
            <ArrowUpRight className="size-4" /> View public profile
          </Link>
        </>
      )}
    </nav>
  )
}
