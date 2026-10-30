import type { Label } from '../../engine/types'

/**
 * The large binary output indicator (spec §5B). Color-independent: shape, icon,
 * and text all carry the meaning, so it reads the same without color (§10).
 */
export function Verdict({ label, size = 'lg' }: { label: Label; size?: 'sm' | 'lg' }) {
  const isHotDog = label === 1
  const big = size === 'lg'
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl border-2 font-display font-bold ${
        big ? 'px-5 py-3 text-2xl' : 'px-3 py-1.5 text-sm'
      } ${
        isHotDog
          ? 'border-yes bg-yes/10 text-yes'
          : 'border-no bg-no/10 text-no'
      }`}
      role="status"
    >
      <span aria-hidden className={big ? 'text-3xl' : 'text-lg'}>
        {isHotDog ? '🌭' : '🚫'}
      </span>
      {isHotDog ? 'HOT DOG' : 'NOT HOT DOG'}
    </span>
  )
}

/** Correct / incorrect marker — again icon + text, not color alone. */
export function CorrectnessMark({ correct }: { correct: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        correct ? 'bg-yes/15 text-yes' : 'bg-no/15 text-no'
      }`}
    >
      <span aria-hidden>{correct ? '✓' : '✗'}</span>
      {correct ? 'Correct' : 'Wrong'}
    </span>
  )
}
