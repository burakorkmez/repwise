import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://30d7a58557424bf6832c7f5f3588558b@o4509813037137920.ingest.de.sentry.io/4512340709408848",

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Attach local variable values to stack frames
  includeLocalVariables: true,

  // Forward console.warn/error to Sentry Logs (Sentry.logger.* calls are always sent)
  integrations: [Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] })],
});
