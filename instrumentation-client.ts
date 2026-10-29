import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://30d7a58557424bf6832c7f5f3588558b@o4509813037137920.ingest.de.sentry.io/4512340709408848",

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: every session in dev, 10% in production, and always the sessions that hit an error.
  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    // Unmasked: replays show real text, typed input, and images. Password fields stay masked regardless.
    Sentry.replayIntegration({ maskAllText: false, maskAllInputs: false, blockAllMedia: false }),
    // Forward console.warn/error to Sentry Logs
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
