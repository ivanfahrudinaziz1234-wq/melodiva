'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = React.ComponentProps<typeof Button> & { pendingText?: string }

/** Disabled while its form is submitting so a double click never sends twice. */
export function SubmitButton({ children, pendingText, disabled, ...props }: Props) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {pending ? (pendingText ?? children) : children}
    </Button>
  )
}

export function FormMessage({ state }: { state: { ok?: boolean; error?: string; message?: string } }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {state.error}
      </p>
    )
  }
  if (state.message) {
    return (
      <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
        {state.message}
      </p>
    )
  }
  return null
}
