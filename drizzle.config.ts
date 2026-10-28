import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")

// Direct (unpooled) URL: migrations need session state PgBouncer doesn't keep
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! },
  schemaFilter: ["public"],
})
