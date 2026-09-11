import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useStore } from '@/app/store'
import { PageContainer } from '@/components/layout/PageContainer'
import { Field, Input, Textarea } from '@/components/ui/Input'
import {
  blocks,
  categoryLabel,
  categoryShortLabel,
  priorityHint,
  priorityLabel,
} from '@/data'
import { cn } from '@/lib/utils'
import { createComplaint, suggestCategory } from '@/services/complaints'
import type { Complaint, ComplaintCategory, ComplaintPriority } from '@/types'

const categories = Object.keys(categoryLabel) as ComplaintCategory[]
const priorities: ComplaintPriority[] = ['low', 'medium', 'high']
const MAX_PHOTOS = 3

interface Photo {
  id: string
  name: string
  url: string
}

/* ------------------------------------------------------------------ steps */

function Step({
  index,
  title,
  hint,
  children,
}: {
  index: number
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-baseline gap-3">
        <span className="text-[12px] font-semibold tabular-nums text-ink-subtle">
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold tracking-tight text-ink">{title}</h2>
          {hint ? <p className="mt-1 text-[13px] text-ink-muted">{hint}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------- page */

export default function ReportIssue() {
  const navigate = useNavigate()
  const { student } = useStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [category, setCategory] = useState<ComplaintCategory | null>(null)
  const [priority, setPriority] = useState<ComplaintPriority>('medium')
  const [block, setBlock] = useState(student.hostel)
  const [room, setRoom] = useState(student.room)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [created, setCreated] = useState<Complaint | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Object URLs are only valid while the page lives — release them on unmount. */
  useEffect(
    () => () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    },
    [photos],
  )

  /**
   * The category suggestion. It reads what has been typed so far and proposes a
   * category the student can accept or override — the choice is never made for
   * them, and the form says where the suggestion came from.
   */
  const suggestion = suggestCategory(`${title} ${description}`)
  const effectiveCategory = category ?? (suggestion.confident ? suggestion.category : null)
  const usingSuggestion = category === null && suggestion.confident

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
    if (files.length === 0) return

    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ])

    // Reset so picking the same file twice still fires a change event.
    event.target.value = ''
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((entry) => entry.id === id)
      if (photo) URL.revokeObjectURL(photo.url)
      return prev.filter((entry) => entry.id !== id)
    })
  }

  function validate() {
    const next: Record<string, string> = {}
    if (title.trim().length < 5) next.title = 'Give the issue a short title (at least 5 characters).'
    if (description.trim().length < 15)
      next.description = 'Add a little more detail so it can be routed correctly.'
    if (!effectiveCategory) next.category = 'Choose a category.'
    if (!room.trim()) next.room = 'Tell us where the problem is.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)
    if (!validate() || !effectiveCategory) return

    setSubmitting(true)
    try {
      const complaint = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: effectiveCategory,
        priority,
        block,
        room: room.trim(),
        photoCount: photos.length,
      })
      setCreated(complaint)
    } catch {
      setSubmitError('We could not submit your report. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ----------------------------------------------------------- success */

  if (created) {
    return (
      <PageContainer width="narrow">
        <div className="rounded-card border border-ok/25 bg-surface p-6 text-center sm:p-8">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-ok-soft">
            <Check className="size-6 text-ok-ink" aria-hidden />
          </span>

          <h1 className="mt-5 text-[22px] font-semibold tracking-tight text-ink">
            Request submitted
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
            Your reference is{' '}
            <span className="font-medium text-ink">{created.reference}</span>. You will see each
            stage as it happens — from campus services picking it up to the repair being confirmed.
          </p>

          <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-px overflow-hidden rounded-tile border border-line bg-line text-left">
            <div className="bg-surface px-3.5 py-2.5">
              <dt className="text-[11px] text-ink-subtle">Category</dt>
              <dd className="mt-0.5 text-[13.5px] font-medium text-ink">
                {categoryShortLabel[created.category]}
              </dd>
            </div>
            <div className="bg-surface px-3.5 py-2.5">
              <dt className="text-[11px] text-ink-subtle">Priority</dt>
              <dd className="mt-0.5 text-[13.5px] font-medium text-ink">
                {priorityLabel[created.priority]}
              </dd>
            </div>
            <div className="col-span-2 bg-surface px-3.5 py-2.5">
              <dt className="text-[11px] text-ink-subtle">Location</dt>
              <dd className="mt-0.5 text-[13.5px] font-medium text-ink">
                {created.block} · {created.room}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(`/app/complaints/${created.id}`)}
              className="press inline-flex h-11 items-center justify-center rounded-control bg-brand px-5 text-[14px] font-medium text-on-brand hover:bg-brand-hover"
            >
              Track this request
            </button>
            <Link
              to="/app/complaints"
              className="press inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface px-5 text-[14px] font-medium text-ink hover:border-line-strong"
            >
              All requests
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  /* -------------------------------------------------------------- form */

  return (
    <PageContainer width="narrow" className="space-y-6">
      <div>
        <Link
          to="/app/complaints"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Complaints
        </Link>
        <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-ink sm:text-[32px]">
          Report an issue
        </h1>
        <p className="mt-1.5 text-[14.5px] text-ink-muted">
          Describe the problem and we will route it to the right team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* ------------------------------------------------- 1. the problem */}
        <Step index={1} title="What’s wrong?">
          <div className="space-y-4">
            <Field label="Title" htmlFor="title" error={errors.title}>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Hostel AC not working"
                aria-invalid={Boolean(errors.title)}
              />
            </Field>

            <Field
              label="Details"
              htmlFor="description"
              error={errors.description}
              hint="What happens, when it started, and anything you have already tried."
            >
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="The air conditioner powers on but no cold air comes out…"
                aria-invalid={Boolean(errors.description)}
              />
            </Field>
          </div>
        </Step>

        {/* ----------------------------------------------------- 2. photos */}
        <Step
          index={2}
          title="Add photos"
          hint={`Optional, but they help the technician arrive prepared. Up to ${MAX_PHOTOS}.`}
        >
          <div className="flex flex-wrap gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative size-24 overflow-hidden rounded-tile border border-line"
              >
                <img src={photo.url} alt={photo.name} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  aria-label={`Remove ${photo.name}`}
                  className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center bg-canvas/85 text-ink-muted opacity-0 transition-opacity hover:text-danger-ink focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="press flex size-24 flex-col items-center justify-center gap-1.5 rounded-tile border border-dashed border-line-strong bg-surface-raised text-ink-subtle hover:border-brand-border hover:text-ink-muted"
              >
                <ImagePlus className="size-5" aria-hidden />
                <span className="text-[11.5px] font-medium">Add photo</span>
              </button>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="sr-only"
            aria-label="Choose photos"
          />
        </Step>

        {/* --------------------------------------------------- 3. category */}
        <Step index={3} title="Category">
          {suggestion.confident ? (
            <div
              className={cn(
                'mb-4 flex items-start gap-2.5 rounded-tile border px-3.5 py-3',
                usingSuggestion
                  ? 'border-brand-border/40 bg-brand-soft'
                  : 'border-line bg-surface-raised',
              )}
            >
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <p className="text-[13px] leading-relaxed text-ink-muted">
                {usingSuggestion ? (
                  <>
                    Suggested{' '}
                    <span className="font-medium text-ink">
                      {categoryLabel[suggestion.category]}
                    </span>{' '}
                    because you mentioned “{suggestion.matched}”. Change it below if that is wrong.
                  </>
                ) : (
                  <>
                    We would have suggested{' '}
                    <span className="font-medium text-ink">
                      {categoryLabel[suggestion.category]}
                    </span>
                    . Your choice is used instead.
                  </>
                )}
              </p>
            </div>
          ) : null}

          <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-2">
            {categories.map((entry) => {
              const active = effectiveCategory === entry
              return (
                <button
                  key={entry}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCategory(entry)}
                  className={cn(
                    'press rounded-full border px-3.5 py-2 text-[13px] font-medium',
                    active
                      ? 'border-brand-border/50 bg-brand-soft text-ink'
                      : 'border-line bg-surface-raised text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {categoryShortLabel[entry]}
                </button>
              )
            })}
          </div>

          {errors.category ? (
            <p role="alert" className="mt-2 text-[13px] text-danger-ink">
              {errors.category}
            </p>
          ) : null}
        </Step>

        {/* --------------------------------------------------- 4. priority */}
        <Step index={4} title="How urgent is it?">
          <div role="radiogroup" aria-label="Priority" className="grid gap-2.5 sm:grid-cols-3">
            {priorities.map((entry) => {
              const active = priority === entry
              return (
                <button
                  key={entry}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPriority(entry)}
                  className={cn(
                    'press rounded-tile border px-3.5 py-3 text-left',
                    active
                      ? 'border-brand-border/50 bg-brand-soft'
                      : 'border-line bg-surface-raised hover:border-line-strong',
                  )}
                >
                  <span className="block text-[13.5px] font-medium text-ink">
                    {priorityLabel[entry]}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-ink-subtle">
                    {priorityHint[entry]}
                  </span>
                </button>
              )
            })}
          </div>
        </Step>

        {/* --------------------------------------------------- 5. location */}
        <Step index={5} title="Where is it?">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Block" htmlFor="block">
              <select
                id="block"
                value={block}
                onChange={(event) => setBlock(event.target.value)}
                className="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-brand focus-visible:outline-none"
              >
                {blocks.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Room or area" htmlFor="room" error={errors.room}>
              <Input
                id="room"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="e.g. Room 204"
                aria-invalid={Boolean(errors.room)}
              />
            </Field>
          </div>
        </Step>

        {/* ----------------------------------------------------- 6. submit */}
        {submitError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-card border border-danger/25 bg-danger-soft/40 px-4 py-3.5"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger-ink" aria-hidden />
            <p className="text-[13.5px] text-ink-muted">{submitError}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="submit"
            disabled={submitting}
            className="press inline-flex h-11 items-center justify-center gap-2 rounded-control bg-brand px-5 text-[14.5px] font-medium text-on-brand hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-60 sm:min-w-[180px]"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Submitting
              </>
            ) : (
              'Submit request'
            )}
          </button>

          <Link
            to="/app/complaints"
            className="press inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface px-5 text-[14.5px] font-medium text-ink hover:border-line-strong"
          >
            Cancel
          </Link>
        </div>

        <p className="text-[12.5px] text-ink-subtle">
          Demo environment — requests are stored in this browser session only and are not sent to
          campus services.
        </p>
      </form>
    </PageContainer>
  )
}
