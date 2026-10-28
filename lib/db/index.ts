import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

// node-postgres pool: the app runs as a long-lived Node server (Cloudways), so pooled TCP beats per-query HTTP.
// Neon URLs say sslmode=require, which pg already treats as verify-full; naming it skips pg's warning.
export const db = drizzle(process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full") ?? "", { schema })

// An idle connection can drop (e.g. when the compute scales to zero); without a listener that crashes the server
db.$client.on("error", (error) => console.error("[db] idle client error", error))
