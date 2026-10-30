import { predict, score } from '../../engine/perceptron'
import type { FeatureKey, Label, Params } from '../../engine/types'
import type { FoodItem } from '../../data/dataset'
import { FoodArt } from '../FoodArt'
import { Verdict } from '../common/Verdict'
import { ExplainThis } from '../common/ExplainThis'
import { WiringDiagram } from './WiringDiagram'
import { Equation } from './Equation'
import { ScoreTrack } from './ScoreTrack'

/**
 * The live perceptron workbench (spec §5B). The SAME component is reused in
 * training, testing, and the sandbox — only the surrounding controls change.
 * It renders nothing of its own math; it reads the engine's pure functions.
 */
export function Workbench({
  item,
  params,
  showLabel,
  pulse = false,
  changedKeys,
  reducedMotion = false,
}: {
  item: FoodItem
  params: Params
  /** Whether to show the item's true label (hidden in test until revealed). */
  showLabel: boolean
  pulse?: boolean
  changedKeys?: ReadonlySet<FeatureKey | 'bias'>
  reducedMotion?: boolean
}) {
  const scoreValue = score(item.features, params)
  const prediction: Label = predict(scoreValue)

  return (
    <div className="grid gap-5 rounded-3xl border border-ink/10 bg-white p-5 shadow-sm lg:grid-cols-[auto_1fr]">
      {/* Current food + label */}
      <div className="flex flex-col items-center gap-2">
        <FoodArt item={item} className="h-28 w-28" />
        <div className="text-center font-display text-sm font-semibold text-ink">{item.name}</div>
        {showLabel ? (
          <div className="flex items-center gap-1 text-xs text-ink/70">
            true label <ExplainThis concept="label" />
            <Verdict label={item.label} size="sm" />
          </div>
        ) : (
          <div className="rounded-full bg-ink/5 px-2 py-1 text-xs text-ink/50">label hidden in test</div>
        )}
      </div>

      {/* The causal chain */}
      <div className="space-y-4">
        <WiringDiagram
          features={item.features}
          params={params}
          pulse={pulse}
          changedKeys={changedKeys}
          reducedMotion={reducedMotion}
        />
        <Equation features={item.features} params={params} />
        <ScoreTrack scoreValue={scoreValue} />
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="text-sm font-semibold uppercase tracking-wide text-ink/60">Prediction</span>
          <Verdict label={prediction} />
        </div>
      </div>
    </div>
  )
}
