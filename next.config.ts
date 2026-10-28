import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// ponytail: Cloudways deploys don't delete files removed from git, so the old habit-tracker
// app/page.tsx lingers on the server and shadows app/(site)/page.tsx at "/". Remove it before
// building; drop this block once the server copy is gone.
const stalePage = join(process.cwd(), "app/page.tsx");
if (existsSync(stalePage) && readFileSync(stalePage, "utf8").includes("repwise-habits")) {
  rmSync(stalePage, { force: true });
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Google sign-ups keep their Google photo as avatar
  images: { remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
