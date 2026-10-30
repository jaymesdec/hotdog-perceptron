import { useState } from 'react'
import { useStore } from '../../store'
import { testSummary, testingItems } from '../../engine/state'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Workbench } from '../Workbench/Workbench'
import { Button } from '../common/Button'
import { CorrectnessMark, Verdict } from '../common/Verdict'
import { ExplainThis } from '../common/ExplainThis'

/**
 * Scene 6 — testing on unseen images (spec §6). The SAME workbench is reused,
 * but every update control is gone and a prominent banner shows the parameters
 * are locked. Correctness is revealed only AFTER each prediction (spec §14).
 */
export function TestScene({ onReflect }: { onReflect: () => void }) {
  const { state, dispatch } = useStore()
  const reducedMotion = useReducedMotion()
  const testItems = testingItems(state)
  const [index, setIndex] = useState(0)

  const item = testItems[index]
  const summary = testSummary(state)
  const result = item ? state.testResults[item.id] : undefined

  if (!item) {
    return <p className="text-sm text-ink/60">No test images. Go back and hold some out first.</p>
  }

  const isLast = index >= testItems.length - 1
  const allRevealed = summary.revealed >= testItems.length

  return (
    <section aria-labelledby="test-heading" className="space-y-4">
      <div
        role="status"
        className="flex items-center justify-between gap-3 rounded-2xl border-2 border-no bg-no/10 px-4 py-3"
      >
        <div className="flex items-center gap-2 font-display font-bold text-no">
          <span aria-hidden>🔒</span> TEST MODE — weights and bias locked
        </div>
        <span className="flex items-center gap-1 text-sm text-ink/70">
          testing never changes parameters <ExplainThis concept="testSet" />
        </span>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="test-heading" className="font-display text-xl font-bold text-ink">
          Test image {index + 1} of {testItems.length}
        </h2>
        <div className="rounded-full bg-ink/5 px-3 py-1 font-mono text-sm font-semibold">
          Right so far: {summary.correct} / {summary.revealed}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <Workbench item={item} params={state.params} showLabel={Boolean(result)} reducedMotion={reducedMotion} />

        <aside className="rounded-2xl border border-ink/10 bg-shelf/40 p-4 lg:sticky lg:top-20">
          {!result ? (
            <div className="space-y-3">
              <p className="text-sm text-ink/80">Run this unseen image through the locked detector.</p>
              <Button className="w-full" onClick={() => dispatch({ type: 'predictTestItem', itemId: item.id })}>
                Predict (locked)
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink/70">Predicted</span>
                <Verdict label={result.prediction} size="sm" />
                <span className="text-sm text-ink/70">· truth</span>
                <Verdict label={item.label} size="sm" />
                <CorrectnessMark correct={result.correct} />
              </div>
              {isLast ? (
                <Button className="w-full" onClick={onReflect} disabled={!allRevealed}>
                  Reflect on the results →
                </Button>
              ) : (
                <Button className="w-full" onClick={() => setIndex((previous) => previous + 1)}>
                  Next image →
                </Button>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
