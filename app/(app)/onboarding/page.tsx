import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { homeFor, requireUser } from "@/lib/auth"
import { OnboardingForm } from "./onboarding-form"

export const metadata: Metadata = { title: "Welcome" }

export default function OnboardingPage() {
  return (
    <div className="relative isolate flex-1">
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]" />
      <Suspense fallback={<Skeleton className="mx-auto mt-16 h-96 max-w-3xl rounded-2xl" />}>
        <Onboarding />
      </Suspense>
    </div>
  )
}

// Every sign-in lands here: users who already onboarded go straight to their home
async function Onboarding() {
  const { profile } = await requireUser()
  if (profile) redirect(homeFor(profile.role))
  return <OnboardingForm />
}
