import { useStore } from '../../store'
import { testingItems } from '../../engine/state'
import { Button } from '../common/Button'
import { ExplainThis } from '../common/ExplainThis'
import { MistakesChart } from '../History/MistakesChart'

/**
 * Scene 5 — end of an epoch (spec §6). Shows mistakes this pass, the chart, and
 * offers another epoch (parameters retained) or moving on to testing.
 */
export function EpochEndScene({ onGoToTest }: { onGoToTest: () => void }) {
  const { state, dispatch } = useStore()
  const lastMistakes = state.epochMistakes[state.epochMistakes.length - 1] ?? 0
  const hasTestSet = testingItems(state).length > 0

  return (
    <section aria-labelledby="epoch-heading" className="space-y-4">
      <h2 id="epoch-heading" className="font-display text-xl font-bold text-ink">
        Epoch {state.epoch} complete
      </h2>
      <p className="text-sm text-ink/70">
        {lastMistakes === 0
          ? 'Zero mistakes this pass — the detector classified every training example correctly.'
          : `${lastMistakes} mistake${lastMistakes === 1 ? '' : 's'} this pass. Another epoch revisits the same examples with the parameters you have now.`}
      </p>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <MistakesChart mistakes={state.epochMistakes} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={state.shuffle}
          onChange={() => dispatch({ type: 'toggleShuffle' })}
          className="h-4 w-4"
        />
        Shuffle example order next epoch
        {state.shuffle && <span className="rounded bg-ink/10 px-1.5 text-xs font-semibold">shuffled</span>}
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-sm text-ink/60">
          one epoch = one pass through the training set <ExplainThis concept="epoch" />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => dispatch({ type: 'nextEpoch' })}>
            Run another epoch
          </Button>
          <Button onClick={onGoToTest} disabled={!hasTestSet}>
            Go to testing →
          </Button>
        </div>
      </div>
    </section>
  )
}
