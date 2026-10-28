import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Logo } from "@/components/logo"
import { Stars } from "@/components/rating"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Props = PageProps<"/auth/[path]">

// ponytail: placeholder screens; Phase 2 swaps them for Neon Auth's prebuilt UI at the same /auth/[path] routes
export const generateStaticParams = () => [{ path: "sign-in" }, { path: "sign-up" }]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await params).path === "sign-up" ? "Create account" : "Log in" }
}

export default function AuthPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="m-6 min-h-[90vh] rounded-3xl" />}>
      <AuthView params={params} />
    </Suspense>
  )
}

async function AuthView({ params }: Pick<Props, "params">) {
  const { path } = await params
  if (path !== "sign-in" && path !== "sign-up") notFound()
  const signUp = path === "sign-up"

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div data-theme="dark" className="relative isolate hidden flex-col justify-between bg-background p-10 text-foreground lg:flex">
        <Image src="/images/programs/strength-foundations.jpg" alt="" fill loading="eager" sizes="50vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/40 to-black/30" />
        <Logo />
        <figure className="max-w-md">
          <Stars value={5} />
          <blockquote className="mt-4 text-2xl leading-snug font-medium">
            “Added 40 lb to my squat in eight weeks. Maya&apos;s cues just click.”
          </blockquote>
          <figcaption className="mt-4 text-sm text-white/70">Jordan Lee · Strength Foundations</figcaption>
        </figure>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-10">
        <Logo className="lg:hidden" />
        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="text-3xl font-bold">{signUp ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-2 text-muted-foreground">
            {signUp ? "Start training with the best coaches in minutes." : "Log in to continue your training."}
          </p>

          <Button variant="outline" size="xl" className="mt-8 w-full">
            <GoogleIcon /> Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4">
            {signUp && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" autoComplete="name" placeholder="Alex Morgan" className="h-10" />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-10" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!signUp && <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link>}
              </div>
              <Input id="password" type="password" autoComplete={signUp ? "new-password" : "current-password"} placeholder="••••••••" className="h-10" />
            </div>
            <Link href={signUp ? "/onboarding" : "/library"} className={cn(buttonVariants({ size: "xl" }), "mt-2 w-full")}>
              {signUp ? "Create account" : "Log in"}
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {signUp ? "Already have an account? " : "New to Repwise? "}
            <Link href={signUp ? "/auth/sign-in" : "/auth/sign-up"} className="font-medium text-primary hover:underline">
              {signUp ? "Log in" : "Create an account"}
            </Link>
          </p>
          {signUp && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
