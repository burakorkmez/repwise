"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { ImageKitAbortError, upload } from "@imagekit/next"
import { getUploadAuth } from "@/app/actions/media"
import type { ActionResult } from "@/components/action-form"
import { cn } from "@/lib/utils"

export const MB = 2 ** 20

type Props = {
  // Comma-separated MIME types. The picker only hints with them, so the file is checked again before uploading.
  accept: string
  maxBytes: number
  folder: string
  private?: boolean
  // Gets the uploaded file's ImageKit path; a server action that saves it may answer with { error }
  onUpload: (filePath: string) => Promise<ActionResult> | void
  className?: string
  children: React.ReactNode
}

// A file picker (the children are its clickable face) that uploads straight from the browser to ImageKit
export function Uploader({ accept, maxBytes, folder, private: isPrivateFile = false, onUpload, className, children }: Props) {
  const [progress, setProgress] = useState<number>()
  const [error, setError] = useState<string>()
  const [saving, startSaving] = useTransition()
  const aborter = useRef<AbortController>(null)
  // Leaving the page cancels an upload in flight
  useEffect(() => () => aborter.current?.abort(), [])

  async function pick(input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = "" // so picking the same file again still fires a change
    if (!file) return
    if (!accept.split(",").includes(file.type)) return setError("That file type isn't supported")
    if (file.size > maxBytes) return setError(`Files can be up to ${maxBytes / MB} MB`)

    setError(undefined)
    setProgress(0)
    aborter.current = new AbortController()
    try {
      const { filePath } = await upload({
        ...(await getUploadAuth()),
        file,
        fileName: file.name,
        folder,
        isPrivateFile,
        abortSignal: aborter.current.signal,
        onProgress: (e) => setProgress((e.loaded / e.total) * 100),
      })
      startSaving(async () => {
        const result = await onUpload(filePath!)
        if (result?.error) setError(result.error)
      })
    } catch (e) {
      if (!(e instanceof ImageKitAbortError)) setError("Upload failed. Try again.")
    } finally {
      setProgress(undefined)
    }
  }

  const busy = progress !== undefined || saving
  return (
    <div>
      <label className={cn("relative cursor-pointer has-focus-visible:ring-2 has-focus-visible:ring-ring", busy && "pointer-events-none opacity-70", className)}>
        <input type="file" accept={accept} disabled={busy} onChange={(e) => pick(e.currentTarget)} className="sr-only" />
        {children}
      </label>
      {busy && (
        <div role="progressbar" aria-label="Upload progress" aria-valuenow={Math.round(progress ?? 100)} className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress ?? 100}%` }} />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
