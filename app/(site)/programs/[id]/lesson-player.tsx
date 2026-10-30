"use client"

import { useEffect, useRef } from "react"
import { videoPlayer } from "@imagekit/video-player"
import "@imagekit/video-player/styles.css"
import { signLessonUrl } from "@/app/actions/media"

// Required by the player but only used by its analytics; endpoints look like https://ik.imagekit.io/<imagekitId>
const imagekitId = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "").split("/")[3]

// `src` is the lesson's private video, `poster` the public cover.
// Not the package's <IKVideoPlayer>: its cleanup lets Video.js delete the <video> React rendered, so StrictMode's
// remount in dev finds a detached element. Creating the element here keeps every mount self-contained.
export function LessonPlayer({ lessonId, src, poster }: { lessonId: string; src: string; poster?: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let player: ReturnType<typeof videoPlayer> | undefined
    // A tick late: the player keeps preparing its source after dispose() and then throws, so StrictMode's instant
    // mount-unmount in dev must not build one
    const start = setTimeout(() => {
      const video = document.createElement("video")
      video.className = "video-js"
      container.current!.append(video)
      player = videoPlayer(
        video,
        {
          imagekitId,
          abs: { protocol: "hls", sr: [360, 480, 720, 1080] },
          seekThumbnails: true,
          // Runs for every private file the player loads (HLS manifest, seek thumbnails, subtitles, chapters), and
          // the server re-checks access each time. The public cover poster passes through as-is.
          signerFn: async (url) => {
            if (!url.startsWith(src)) return url
            const signed = await signLessonUrl(lessonId, url)
            if (!signed) throw new Error("This lesson is locked")
            return signed
          },
        },
        { fill: true, controls: true, preload: "auto" },
      )
      // AI-generated subtitles and chapters, built by ImageKit from the video itself
      player.src({ src, poster: poster ? { src: poster } : undefined, chapters: true, textTracks: [{ autoGenerate: true }] })
    })
    return () => {
      clearTimeout(start)
      player?.dispose()
    }
  }, [lessonId, src, poster])

  return <div ref={container} className="size-full" />
}
