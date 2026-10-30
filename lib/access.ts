// Pure access rules, shared by pages (what to show) and server actions (what to allow)

// The first lesson is the free preview; owners and buyers see everything
export const canWatchLesson = ({ isPreview, isOwner, hasPurchase }: { isPreview: boolean; isOwner: boolean; hasPurchase: boolean }) =>
  isPreview || isOwner || hasPurchase

// Any paid purchase from a trainer earns one (editable) review; nobody reviews themselves
export const canReview = ({ isSelf, hasPurchase }: { isSelf: boolean; hasPurchase: boolean }) => !isSelf && hasPurchase

// DMs are client↔trainer or trainer↔trainer; clients can't cold-message each other, and nobody DMs themselves
export const canMessage = ({ isSelf, roles }: { isSelf: boolean; roles: ["client" | "trainer", "client" | "trainer"] }) =>
  !isSelf && roles.includes("trainer")

// An uploaded path the browser asks us to save: one file directly in `folder`, named the way ImageKit names
// uploads (letters, digits, _ . -). No "/" and no leading "." means "../" can't climb into another folder,
// e.g. pointing your free preview at another trainer's private video.
export const isFileIn = (folder: string, path: string) =>
  path.startsWith(`${folder}/`) && /^[\p{L}\p{N}_-][\p{L}\p{M}\p{N}_.-]*$/u.test(path.slice(folder.length + 1))

// The video player asks to sign a lesson's file and the files ImageKit derives from it (HLS manifest, poster,
// seek thumbnails, subtitles, chapters), which all live under the file's own URL. Anything else is refused,
// including URLs that only reach the file through "../" (the href check catches what URL parsing rewrites).
export const isDerivedUrl = (url: string, fileUrl: string) =>
  URL.canParse(url) &&
  new URL(url).href === url &&
  (url === fileUrl || url.startsWith(`${fileUrl}/ik-`) || url.startsWith(`${fileUrl}?`))
