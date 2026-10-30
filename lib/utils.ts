import { buildSrc, type Transformation } from "@imagekit/javascript"

export { cn } from "cn"

// Stored images are ImageKit file paths ("/avatars/…"), so a size is just a transformation in the URL.
// Absolute URLs are Google sign-up photos: they render as-is, untransformed.
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
const isImageKitPath = (src: string) => src.startsWith("/")

// Props for the ImageKit <Image> (from @imagekit/next), which adds automatic format and a responsive srcset
export const imageProps = (src: string, transformation: Transformation[] = []) =>
  isImageKitPath(src) ? { urlEndpoint, src, transformation } : { urlEndpoint, src, responsive: false }

export const imageUrl = (src: string, transformation: Transformation[] = []) =>
  isImageKitPath(src) ? buildSrc({ urlEndpoint, src, transformation }) : src

// Small round face crop: avatars across the site, and the absolute URL Stream needs for chat and calls
export const avatarUrl = (src: string | null | undefined) =>
  src ? imageUrl(src, [{ width: 80, height: 80, focus: "face", radius: "max" }]) : undefined

export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100)

export const formatDate = (date: Date | string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opts).format(new Date(date))

export const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
