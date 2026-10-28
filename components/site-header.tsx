import Link from "next/link"
import { Menu } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ponytail: shows every route for the UI demo; auth will swap Log in/Join for the user button
const links = [
  { href: "/trainers", label: "Trainers" },
  { href: "/library", label: "My Library" },
  { href: "/messages", label: "Messages" },
  { href: "/dashboard", label: "Trainer Dashboard" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="shell flex h-16 items-center gap-8">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-muted-foreground transition hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "hidden sm:inline-flex")}
          >
            Log in
          </Link>
          <Link
            href="/auth/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "px-4 font-semibold shadow-[0_0_24px_-6px] shadow-primary/70",
            )}
          >
            Join now
          </Link>
          <details className="relative md:hidden">
            <summary
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "list-none [&::-webkit-details-marker]:hidden")}
              aria-label="Menu"
            >
              <Menu />
            </summary>
            <nav className="absolute right-0 mt-2 flex w-56 flex-col rounded-xl border bg-popover p-2 shadow-xl">
              {[...links, { href: "/auth/sign-in", label: "Log in" }].map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  {l.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
