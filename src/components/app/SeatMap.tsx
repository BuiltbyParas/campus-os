import { cn } from '@/lib/utils'
import type { ExamSeat } from '@/types'

/**
 * Where the seat actually is in the room.
 *
 * "B-12" is a label, not a location. Parsing the row letter and the seat number
 * back into a grid turns it into somewhere you can walk to — which is the whole
 * question a student has standing in a doorway with three minutes to spare.
 *
 * Deliberately schematic, not a floor plan: the room's real shape is unknown,
 * so this shows position within the lettered rows and nothing it cannot back
 * up. The front of the room is marked because "row B" is meaningless without
 * knowing which end counts as first.
 */
export function SeatMap({ seat, className }: { seat: ExamSeat; className?: string }) {
  const parsed = /^([A-Za-z]+)[-\s]?(\d+)$/.exec(seat.seat.trim())

  /* A label we cannot read is shown as-is rather than guessed at. */
  if (!parsed) {
    return (
      <p className={cn('text-[13px] text-ink-muted', className)}>
        Seat <span className="font-semibold text-ink">{seat.seat}</span>
      </p>
    )
  }

  const rowLetter = parsed[1].toUpperCase()
  const seatNumber = Number(parsed[2])

  /* Enough of the room to place the seat in context, without inventing its
     true dimensions: four rows around the student's, and a run of seats that
     comfortably contains theirs. */
  const rows = ['A', 'B', 'C', 'D']
  const columns = Math.max(8, Math.min(12, seatNumber + 3))

  return (
    <div className={cn('min-w-0', className)}>
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
        Front of room
      </p>
      <div
        className="mx-auto flex w-full max-w-[260px] flex-col gap-1.5"
        role="img"
        aria-label={`Seat ${seat.seat}: row ${rowLetter}, seat ${seatNumber} of the room`}
      >
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-3 shrink-0 text-[9.5px] font-medium',
                row === rowLetter ? 'text-brand-ink' : 'text-ink-subtle/60',
              )}
            >
              {row}
            </span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: columns }).map((_, index) => {
                const mine = row === rowLetter && index + 1 === seatNumber
                return (
                  <span
                    key={index}
                    className={cn(
                      'h-2.5 flex-1 rounded-[2px] transition-colors',
                      mine
                        ? 'bg-brand shadow-[0_0_10px_var(--brand)]'
                        : row === rowLetter
                          ? 'bg-surface-muted'
                          : 'bg-surface-muted/50',
                    )}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[12px] text-ink-muted">
        Row <span className="font-semibold text-ink">{rowLetter}</span>, seat{' '}
        <span className="font-semibold text-ink">{seatNumber}</span>
        {seat.note ? <span className="block mt-0.5 text-ink-subtle">{seat.note}</span> : null}
      </p>
    </div>
  )
}
