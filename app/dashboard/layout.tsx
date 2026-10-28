import { DashboardNav } from "@/components/dashboard-nav"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { meTrainer } from "@/lib/mock-data"

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const profileHref = `/trainers/${meTrainer.id}`

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card/40 p-4 lg:flex">
        <Logo className="px-2 py-1" />
        <DashboardNav profileHref={profileHref} />
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <UserAvatar name={meTrainer.name} src={meTrainer.avatarUrl} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{meTrainer.name}</p>
            <p className="text-xs text-muted-foreground">Trainer</p>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-5 py-3 backdrop-blur lg:hidden">
          <Logo />
          <ThemeToggle />
        </header>
        <DashboardNav mobile profileHref={profileHref} />
        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
