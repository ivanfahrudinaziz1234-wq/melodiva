'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { SubmitButton, FormMessage } from '@/components/admin/submit-button'
import { saveInternalNoteAction, sendReplyAction, updateMessageStatusAction } from '@/app/admin/actions/messages'
import { messageStatusLabels, messageStatuses, type ActionState, type ReplyTemplate } from '@/lib/admin/constants'

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50'

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="message-status">Status</Label>
      <select
        id="message-status"
        className={selectClass}
        value={value}
        disabled={pending}
        aria-busy={pending}
        onChange={(e) => {
          const next = e.target.value
          const previous = value
          setValue(next)
          startTransition(async () => {
            const result = await updateMessageStatusAction(id, next)
            if (result.error) {
              setValue(previous)
              toast.error(result.error)
              return
            }
            toast.success(result.message, {
              duration: 6000,
              action: {
                label: 'Urungkan',
                onClick: () =>
                  startTransition(async () => {
                    const undo = await updateMessageStatusAction(id, previous)
                    if (undo.error) toast.error(undo.error)
                    else {
                      setValue(previous)
                      toast.success(`Status dikembalikan ke "${messageStatusLabels[previous as keyof typeof messageStatusLabels] ?? previous}".`)
                    }
                  }),
              },
            })
          })
        }}
      >
        {messageStatuses.map((s) => (
          <option key={s} value={s}>
            {messageStatusLabels[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

export function NoteForm({ id, note }: { id: string; note: string | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveInternalNoteAction, {})
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <Label htmlFor="note">Catatan internal</Label>
      <Textarea id="note" name="note" defaultValue={note ?? ''} rows={4} maxLength={2000} placeholder="Hanya terlihat oleh admin." />
      <FormMessage state={state} />
      <SubmitButton variant="outline" pendingText="Menyimpan...">
        Simpan catatan
      </SubmitButton>
    </form>
  )
}

export function ReplyComposer({
  id,
  name,
  email,
  refCode,
  templates,
}: {
  id: string
  name: string
  email: string
  refCode: string
  templates: ReplyTemplate[]
}) {
  const [state, action] = useActionState<ActionState, FormData>(sendReplyAction, {})
  const [subject, setSubject] = useState(`Re: Pertanyaan Anda ke Melodiva`)
  const [body, setBody] = useState(`Halo ${name},\n\n`)
  const [previewOpen, setPreviewOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const isEmpty = !body.trim() || body.trim() === `Halo ${name},`

  function openPreview() {
    if (isEmpty) {
      toast.error('Tulis isi balasan terlebih dahulu.')
      return
    }
    if (!subject.trim()) {
      toast.error('Subjek tidak boleh kosong.')
      return
    }
    setPreviewOpen(true)
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        if (isEmpty) {
          e.preventDefault()
          toast.error('Tulis isi balasan terlebih dahulu.')
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-muted-foreground">
        Kepada <span className="font-medium text-foreground">{email}</span> · Ref {refCode}
      </p>
      {templates.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="template">Pakai template</Label>
          <select
            id="template"
            className={selectClass}
            defaultValue=""
            onChange={(e) => {
              const t = templates.find((tpl) => tpl.id === e.target.value)
              if (!t) return
              setSubject(t.subject)
              setBody(t.body.replaceAll('{nama}', name))
            }}
          >
            <option value="">Pilih template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subjek</Label>
        <Input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Isi balasan</Label>
        <Textarea id="body" name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} required maxLength={10000} />
        <p className="text-xs text-muted-foreground">{'{nama}'} akan diganti otomatis dengan nama pengirim.</p>
      </div>
      <FormMessage state={state} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={openPreview}>
          <Eye data-icon="inline-start" aria-hidden="true" />
          Pratinjau
        </Button>
        <SubmitButton pendingText="Mengirim...">Kirim balasan</SubmitButton>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Pratinjau balasan</DialogTitle>
            <DialogDescription>Periksa kembali sebelum dikirim ke {email}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
              <dt>Kepada</dt>
              <dd className="truncate text-foreground">{email}</dd>
              <dt>Subjek</dt>
              <dd className="text-foreground">{subject}</dd>
            </dl>
            <div className="max-h-80 overflow-y-auto border-t border-border pt-3 leading-relaxed whitespace-pre-wrap text-foreground">
              {body.replaceAll('{nama}', name)}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              Edit lagi
            </Button>
            <Button
              type="button"
              onClick={() => {
                setPreviewOpen(false)
                formRef.current?.requestSubmit()
              }}
            >
              Kirim sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
