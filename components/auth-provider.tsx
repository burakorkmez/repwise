"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui"
import { authClient } from "@/lib/auth-client"

// Prebuilt auth UI context. `contents` keeps the wrapper div out of the body's flex layout.
// Sign-in and sign-up both land on /onboarding, which forwards users who already have a profile.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      redirectTo="/onboarding"
      social={{ providers: ["google"] }}
      credentials={{ forgotPassword: true }}
      account={false}
      defaultTheme="dark"
      className="contents"
    >
      {children}
    </NeonAuthUIProvider>
  )
}
