import { useState } from 'react'
import { useStore } from '../../store'
import { STARTER_COLLECTION } from '../../data/dataset'
import { FEATURE_KEYS, FEATURE_LABELS, type FeatureKey } from '../../engine/types'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Workbench } from '../Workbench/Workbench'
import { Button } from '../common/Button'
import { ExplainThis } from '../common/ExplainThis'
import { ShowMathToggle } from '../common/ShowMathToggle'
import { formatSigned } from '../Workbench/ScoreTrack'

/**
 * Scene 1 — the opening sandbox (spec §6). The learner drags weight and bias
 * sliders and watches the score and prediction change instantly. This is the
 * ONLY place sliders appear (spec §14). Nothing here is learning: tweaks are
 * isolated from the training run.
 */
const SAMPLE_ITEMS = STARTER_COLLECTION.filter((item) =>
  ['hd_plain', 'hd_both', 'pizza_km', 'fries'].includes(item.id),
)

export function SandboxScene({ onDone }: { onDone: () => void }) {
  const { state, dispatch } = useStore()
  const reducedMotion = useReducedMotion()
  const [sampleIndex, setSampleIndex] = useState(0)
  const item = SAMPLE_ITEMS[sampleIndex] ?? STARTER_COLLECTION[0]

  return (
    <section aria-labelledby="sandbox-heading" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="sandbox-heading" className="font-display text-xl font-bold text-ink">
            Meet the detector
          </h2>
          <p className="text-sm text-ink/70">
            Drag the sliders and watch the score move. This is manual exploration — not learning yet.
          </p>
        </div>
        <ShowMathToggle />
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <Workbench item={item} params={state.sandboxParams} showLabel reducedMotion={reducedMotion} />

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-ink/10 bg-shelf/40 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Adjust the parameters by hand</span>
              <Button variant="ghost" onClick={() => setSampleIndex((previous) => (previous + 1) % SAMPLE_ITEMS.length)}>
                Try another food
              </Button>
            </div>

            <div className="space-y-3">
              {FEATURE_KEYS.map((featureKey) => (
                <SliderRow
                  key={featureKey}
                  label={`${FEATURE_LABELS[featureKey]} weight`}
                  concept="weight"
                  value={state.sandboxParams.weights[featureKey]}
                  onChange={(value) => dispatch({ type: 'setSandboxWeight', feature: featureKey as FeatureKey, value })}
                />
              ))}
            </div>
          </div>

          <Button onClick={onDone} className="w-full">
            I'm ready to be the researcher →
          </Button>
        </aside>
      </div>
    </section>
  )
}

function SliderRow({
  label,
  concept,
  value,
  onChange,
}: {
  label: string
  concept: 'weight'
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
      <span className="flex min-w-32 items-center gap-1 text-sm font-semibold text-ink">
        {label}
        <ExplainThis concept={concept} />
      </span>
      <input
        type="range"
        min={-3}
        max={3}
        step={0.5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="flex-1 accent-ink"
      />
      <span className="w-12 text-right font-mono text-sm font-bold">{formatSigned(value)}</span>
    </div>
  )
}
