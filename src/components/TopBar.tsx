import { useStore } from '../store'
import { useUi } from '../ui'
import { Button } from './common/Button'
import { ShowMathToggle } from './common/ShowMathToggle'

/**
 * Persistent top bar: identity, global preferences (Show the math, sound muted
 * by default per spec §7), the seed, contextual parameter controls, and the
 * always-available Start over (spec §10, §19).
 */
export function TopBar() {
  const { state, dispatch } = useStore()
  const { soundOn, toggleSound } = useUi()

  // Randomize/Reset are offered only where changing parameters makes sense —
  // never mid-run or in locked test mode (spec §5C contextual controls).
  const showParamControls = state.mode === 'sandbox' || state.mode === 'select' || state.mode === 'baseline'

  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">
            🌭
          </span>
          <h1 className="font-display text-lg font-bold text-ink">Hot Dog or Not?</h1>
          <span className="hidden rounded-full bg-ink/5 px-2 py-0.5 font-mono text-xs text-ink/60 sm:inline">
            seed {state.seed}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShowMathToggle />
          {showParamControls && (
            <>
              <Button variant="ghost" onClick={() => dispatch({ type: 'randomize' })}>
                Randomize
              </Button>
              <Button variant="ghost" onClick={() => dispatch({ type: 'resetToSeed' })}>
                Reset to seed
              </Button>
            </>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={soundOn}
            onClick={toggleSound}
            title={soundOn ? 'Sound on' : 'Sound muted'}
            className="rounded-full border border-ink/20 bg-white px-3 py-1.5 text-sm font-semibold text-ink"
          >
            <span aria-hidden>{soundOn ? '🔊' : '🔇'}</span>
            <span className="sr-only">{soundOn ? 'Mute sound' : 'Enable sound'}</span>
          </button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'startOver' })}>
            Start over
          </Button>
        </div>
      </div>
    </header>
  )
}
