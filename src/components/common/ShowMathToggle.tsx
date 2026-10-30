import { useUi } from '../../ui'

/**
 * The "Show the math" toggle (spec §8): beginners see a plain visual pathway;
 * flipping it on reveals the symbolic notation.
 */
export function ShowMathToggle() {
  const { showMath, toggleShowMath } = useUi()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={showMath}
      onClick={toggleShowMath}
      className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-3 py-1.5 text-sm font-semibold text-ink"
    >
      <span
        aria-hidden
        className={`grid h-5 w-9 items-center rounded-full px-0.5 transition ${showMath ? 'bg-ink' : 'bg-ink/20'}`}
      >
        <span className={`h-4 w-4 rounded-full bg-white transition ${showMath ? 'translate-x-4' : ''}`} />
      </span>
      Show the math
    </button>
  )
}
