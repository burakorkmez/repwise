import { SiteHeader } from "@/components/site-header"

// Full-height app screens (messages, onboarding): header, no footer
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  )
}
