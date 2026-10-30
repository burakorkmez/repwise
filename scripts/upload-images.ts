// One-off: uploads public/images/** to ImageKit under the same paths, so "/images/trainers/maya-chen.jpg" in
// lib/mock-data and the database works as an ImageKit path. Skips files already there, so it's safe to rerun.
// npx tsx --env-file=.env.local scripts/upload-images.ts
import { readdir, readFile } from "node:fs/promises"
import { basename, dirname } from "node:path"

// The server-side API uses Basic auth: the private key is the username, the password stays empty
const authorization = `Basic ${Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`

// Asks the media library, not the CDN: the CDN briefly caches 404s, so a HEAD would miss fresh uploads
async function filesIn(folder: string) {
  const query = new URLSearchParams({ path: folder, type: "file", limit: "1000" })
  const res = await fetch(`https://api.imagekit.io/v1/files?${query}`, { headers: { authorization } })
  if (!res.ok) throw new Error(`List ${folder}: ${res.status} ${await res.text()}`)
  return ((await res.json()) as { filePath: string }[]).map((f) => f.filePath)
}

async function main() {
  const paths = (await readdir("public/images", { recursive: true })).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).map((f) => `/images/${f}`)
  const existing = new Set((await Promise.all([...new Set(paths.map(dirname))].map(filesIn))).flat())
  for (const path of paths) {
    if (existing.has(path)) {
      console.log(`skip    ${path}`)
      continue
    }
    const form = new FormData()
    form.append("file", new Blob([await readFile(`public${path}`)]))
    form.append("fileName", basename(path))
    form.append("folder", dirname(path))
    form.append("useUniqueFileName", "false")
    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", headers: { authorization }, body: form })
    if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
    console.log(`upload  ${path}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
