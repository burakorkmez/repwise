import Link from "next/link"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-12 font-heading text-8xl font-black text-primary">404</p>
      <p className="mt-2 -rotate-3 font-script text-3xl">Rest day?</p>
      <p className="mt-4 max-w-sm text-muted-foreground">This page skipped leg day and never showed up. Let&apos;s get you back to training.</p>
      <Link href="/" className={buttonVariants({ size: "xl", className: "mt-8" })}>
        Back to home
      </Link>
    </div>
  )
}
