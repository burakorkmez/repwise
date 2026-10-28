import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { AuthView } from "@neondatabase/auth/react/ui"
import { authViewPaths } from "@neondatabase/auth/react/ui/server"
import { Logo } from "@/components/logo"
import { Stars } from "@/components/rating"
import { Skeleton } from "@/components/ui/skeleton"

type Props = PageProps<"/auth/[path]">

const paths: string[] = Object.values(authViewPaths)
export const generateStaticParams = () => paths.map((path) => ({ path }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await params).path === "sign-up" ? "Create account" : "Log in" }
}

export default function AuthPage({ params }: Props) {
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
          <Suspense fallback={<Skeleton className="h-112 rounded-2xl" />}>
            <View params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function View({ params }: Pick<Props, "params">) {
  const { path } = await params
  if (!paths.includes(path)) notFound()
  return <AuthView path={path} classNames={{ base: "border-0 bg-transparent p-0 shadow-none ring-0" }} />
}
