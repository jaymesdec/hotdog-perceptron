import { useStore } from '../../store'
import { testingItems, type TestResult } from '../../engine/state'
import { FEATURE_KEYS } from '../../engine/types'
import { FoodArt } from '../FoodArt'
import { FeatureChip } from '../common/FeatureChip'
import { Verdict, CorrectnessMark } from '../common/Verdict'
import { Button } from '../common/Button'
import { RunComparison } from './RunComparison'
import { IdenticalVectorReveal } from './IdenticalVectorReveal'

/**
 * Scene 7 — reflect and iterate (spec §6). Compares runs, lets learners inspect
 * a surprising mistake, and reveals the identical-vector limitation. Preserves
 * freedom to experiment: no competitive scoring.
 */
export function ReflectScene({
  onTryDifferent,
  onRandomizeRetrain,
}: {
  onTryDifferent: () => void
  onRandomizeRetrain: () => void
}) {
  const { state, dispatch } = useStore()

  // Surprising mistakes: test items the locked detector got wrong. The type
  // guard narrows `result` to a defined TestResult so no non-null assertion is
  // needed downstream.
  const testMistakes = testingItems(state)
    .map((item) => ({ item, result: state.testResults[item.id] as TestResult | undefined }))
    .filter((entry): entry is { item: (typeof entry)['item']; result: TestResult } =>
      entry.result !== undefined && !entry.result.correct,
    )

  return (
    <section aria-labelledby="reflect-heading" className="space-y-5">
      <h2 id="reflect-heading" className="font-display text-xl font-bold text-ink">
        Reflect &amp; iterate
      </h2>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink">Compare your runs</h3>
          <Button variant="ghost" onClick={() => dispatch({ type: 'recordRun' })}>
            Save this run
          </Button>
        </div>
        <RunComparison runs={state.runComparisons} />
      </div>

      {testMistakes.length > 0 && (
        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold text-ink">Inspect a surprising mistake</h3>
          <p className="mt-1 text-sm text-ink/70">
            What did the perceptron actually see? Remember, it only gets the three feature numbers.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {testMistakes.map(({ item, result }) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-ink/5 p-3">
                <FoodArt item={item} className="h-16 w-16 shrink-0" />
                <div className="space-y-1">
                  <div className="font-display text-sm font-semibold">{item.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {FEATURE_KEYS.map((featureKey) => (
                      <FeatureChip key={featureKey} feature={featureKey} value={item.features[featureKey]} size="sm" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    said <Verdict label={result.prediction} size="sm" /> · truth{' '}
                    <Verdict label={item.label} size="sm" />
                    <CorrectnessMark correct={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <IdenticalVectorReveal />

      <div className="flex flex-wrap gap-3">
        <Button onClick={onTryDifferent}>Try different training examples</Button>
        <Button variant="ghost" onClick={onRandomizeRetrain}>
          Randomize &amp; retrain
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: 'startOver' })}>
          Start over
        </Button>
      </div>
    </section>
  )
}
