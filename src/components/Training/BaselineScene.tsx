import { useStore } from '../../store'
import { trainingItems } from '../../engine/state'
import { Button } from '../common/Button'
import { ExplainThis } from '../common/ExplainThis'

/**
 * Scene 3 — baseline evaluation (spec §6). Runs the frozen random parameters
 * over the training set WITHOUT updates, so learners can see "before learning"
 * accuracy and feel the change training makes.
 */
export function BaselineScene({ onStartTraining }: { onStartTraining: () => void }) {
  const { state, dispatch } = useStore()
  const total = trainingItems(state).length

  return (
    <section aria-labelledby="baseline-heading" className="space-y-4">
      <h2 id="baseline-heading" className="font-display text-xl font-bold text-ink">
        Before training — a baseline
      </h2>
      <p className="text-sm text-ink/70">
        Your starting weights and bias are random and frozen. Let's see how many training examples this
        untrained detector already gets right, just by luck.
      </p>

      {state.baselineCorrect === null ? (
        <Button onClick={() => dispatch({ type: 'enterBaseline' })}>Run baseline (no learning)</Button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 text-center shadow-sm">
            <div className="text-sm uppercase tracking-wide text-ink/60">Before learning</div>
            <div className="font-display text-4xl font-bold text-ink">
              {state.baselineCorrect} / {total}
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-ink/60">
              correct on the training set — no parameters were changed
              <ExplainThis concept="update" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onStartTraining}>Start training →</Button>
          </div>
        </div>
      )}
    </section>
  )
}
