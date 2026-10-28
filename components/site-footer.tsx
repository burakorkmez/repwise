import Link from "next/link"
import { Logo } from "@/components/logo"

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/trainers", label: "Find a trainer" },
      { href: "/trainers?specialty=strength", label: "Strength" },
      { href: "/trainers?specialty=yoga", label: "Yoga & mobility" },
      { href: "/trainers?specialty=hiit", label: "HIIT" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/sign-in", label: "Log in" },
      { href: "/auth/sign-up", label: "Create account" },
      { href: "/library", label: "My library" },
      { href: "/messages", label: "Messages" },
    ],
  },
  {
    title: "Coaches",
    links: [
      { href: "/auth/sign-up", label: "Become a trainer" },
      { href: "/dashboard", label: "Trainer dashboard" },
      { href: "/dashboard/programs", label: "Sell programs" },
      { href: "/dashboard/slots", label: "Offer 1:1 sessions" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Elite coaches, video programs, and 1:1 sessions. Train smarter, wherever you are.
          </p>
          <p className="mt-6 font-script text-2xl text-primary">#TrainSmarter</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="shell flex flex-col justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Repwise. All rights reserved.</p>
          <p>Payments by Stripe · Video by ImageKit · Chat & calls by Stream</p>
        </div>
      </div>
    </footer>
  )
}
