"use client"

import { createContext, startTransition, use, useActionState } from "react"
import { Button } from "@/components/ui/button"

export type ActionResult = { error: string } | undefined

const Pending = createContext(false)

// A <form> for a server action that may answer with { error } (it redirects or refreshes on success).
// Submits through onSubmit rather than <form action>, because React resets every field after a form action,
// which would wipe the user's input whenever the server answers with an error. To clear a form after success,
// give it a key that changes with the result (e.g. the item count).
export function ActionForm({
  action,
  id,
  className,
  children,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>
  id?: string
  className?: string
  children?: React.ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, undefined)
  return (
    <form
      id={id}
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        startTransition(() => formAction(data))
      }}
    >
      <Pending value={pending}>{children}</Pending>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}

// `confirm` asks before destructive submits
export function SubmitButton({ disabled, confirm, ...props }: React.ComponentProps<typeof Button> & { confirm?: string }) {
  const pending = use(Pending)
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      onClick={confirm ? (e) => window.confirm(confirm) || e.preventDefault() : undefined}
      {...props}
    />
  )
}
