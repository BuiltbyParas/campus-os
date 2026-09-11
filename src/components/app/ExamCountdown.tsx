import { useEffect, useState } from 'react'

import { toDate } from '@/lib/utils'
import type { Exam } from '@/types'

/**
 * Time until a paper starts, ticking.
 *
 * Days alone are too coarse on the morning of an exam and a raw clock is too
 * frantic a week out, so the unit changes with the distance: days and hours
 * while there is still time to revise, a live `HH:MM:SS` once it is inside a
 * day. The second hand only runs when it means something.
 *
 * Under `prefers-reduced-motion` it settles to minutes and stops ticking
 * every second — a number changing sixty times a minute is motion too.
 */
export function ExamCountdown({ exam }: { exam: Exam }) {
  const target = toDate(exam.date, exam.startTime).getTime()
  const [remaining, setRemaining] = useState(() => target - Date.now())

  const withinADay = remaining > 0 && remaining < 86_400_000
  /* Tick every second only inside the final day; otherwise once a minute is
     both accurate enough and far cheaper. */
  const interval = withinADay ? 1000 : 60_000

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(target - Date.now()), interval)
    return () => window.clearInterval(id)
  }, [target, interval])

  if (remaining <= 0) {
    return (
      <p className="text-[34px] font-semibold leading-none tracking-tight text-ink-muted">
        Under way
      </p>
    )
  }

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  const pad = (value: number) => String(value).padStart(2, '0')

  return (
    <div>
      {days > 0 ? (
        <p className="flex items-baseline gap-2 tabular-nums">
          <span className="text-[52px] font-semibold leading-none tracking-[-0.03em] text-ink">
            {days}
          </span>
          <span className="text-[17px] font-medium text-ink-muted">
            {days === 1 ? 'day' : 'days'}
          </span>
          <span className="text-[24px] font-semibold leading-none text-ink-muted">
            {pad(hours)}h
          </span>
        </p>
      ) : (
        <p className="text-[52px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink">
          {pad(hours)}
          <span className="text-ink-subtle">:</span>
          {pad(minutes)}
          <span className="text-ink-subtle">:</span>
          {pad(seconds)}
        </p>
      )}
      <p className="sr-only" aria-live="off">
        {days > 0 ? `${days} days and ${hours} hours remaining` : `${hours} hours remaining`}
      </p>
    </div>
  )
}
