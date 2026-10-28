import { auth } from "@/lib/auth"

// Optimistic gate only: layouts and server actions re-check the session and role
export default auth.middleware({ loginUrl: "/auth/sign-in" })

export const config = {
  matcher: ["/onboarding", "/library", "/messages", "/call/:path*", "/dashboard/:path*"],
}
