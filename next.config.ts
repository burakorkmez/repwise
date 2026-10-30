import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

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
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: "codesistency-gs",
  project: "repwise",
  // Build-time secret for source map upload; without it the build still works, just no upload
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // Send browser events through /monitoring so ad-blockers don't drop them
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
