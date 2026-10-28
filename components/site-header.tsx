import Link from "next/link"
import { Suspense } from "react"
import { Menu } from "lucide-react"
import { UserButton } from "@neondatabase/auth/react/ui"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

type NavLink = { href: string; label: string }

const trainersLink = { href: "/trainers", label: "Trainers" }

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="shell flex h-16 items-center gap-8">
        <Logo />
        <Suspense fallback={<HeaderNav links={[trainersLink]} />}>
          <UserHeaderNav />
        </Suspense>
      </div>
    </header>
  )
}

async function UserHeaderNav() {
  const user = await getUser()
  if (!user) return <HeaderNav links={[trainersLink]} signedIn={false} />

  const home = user.profile?.role === "trainer"
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/library", label: "My Library" }
  return <HeaderNav links={[trainersLink, home, { href: "/messages", label: "Messages" }]} signedIn />
}

// signedIn undefined = session still streaming in
function HeaderNav({ links, signedIn }: { links: NavLink[]; signedIn?: boolean }) {
  const menuLinks = signedIn === false ? [...links, { href: "/auth/sign-in", label: "Log in" }] : links

  return (
    <>
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
        {signedIn === undefined && <Skeleton className="size-9 rounded-full" />}
        {signedIn === true && <UserButton size="icon" />}
        {signedIn === false && (
          <>
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
          </>
        )}
        <details className="relative md:hidden">
          <summary
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "list-none [&::-webkit-details-marker]:hidden")}
            aria-label="Menu"
          >
            <Menu />
          </summary>
          <nav className="absolute right-0 mt-2 flex w-56 flex-col rounded-xl border bg-popover p-2 shadow-xl">
            {menuLinks.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                {l.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </>
  )
}
