import type { Metadata } from "next";
import { Inter, Kaushan_Script, Outfit } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const kaushan = Kaushan_Script({ variable: "--font-kaushan", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "Repwise — Train with the best", template: "%s · Repwise" },
  description:
    "Find elite personal trainers, follow their video programs, and book 1:1 coaching sessions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${outfit.variable} ${kaushan.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0a0f0d" />
        {/* Apply the saved theme (and matching browser UI color) before paint; dark is the default */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme")||"dark";document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="light"?"#f8fbf9":"#0a0f0d"}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
