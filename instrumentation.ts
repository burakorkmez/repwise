import * as Sentry from "@sentry/nextjs";

// No edge config: nothing here runs on the edge runtime (proxy.ts is Node in Next 16)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

// Captures unhandled errors from Server Components, route handlers, and server actions
export const onRequestError = Sentry.captureRequestError;
