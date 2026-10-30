import { FEATURE_KEYS } from '../../engine/types'
import { findContradictions, DATASET } from '../../data/dataset'
import { FoodArt } from '../FoodArt'
import { FeatureChip } from '../common/FeatureChip'
import { Verdict } from '../common/Verdict'

/**
 * Signature moment (spec §7): two different foods with the same feature vector.
 * Overlaying their identical inputs explains why the model cannot tell them
 * apart — and why more epochs will never fix it.
 */
export function IdenticalVectorReveal() {
  const contradiction = findContradictions(DATASET)[0]
  if (!contradiction) return null
  const { hotDog, notHotDog } = contradiction

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-ink">Why can't it tell these apart?</h3>
      <p className="mt-1 text-sm text-ink/70">
        These two pictures look different to you. But the detector only sees three numbers — and for these two,
        those numbers are <strong>identical</strong>. No weights or bias can ever separate them.
      </p>
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <FoodFace itemName={hotDog.name} label={1} art={<FoodArt item={hotDog} className="h-24 w-24" />} />
        <div className="text-center font-display text-2xl text-ink/40">=</div>
        <FoodFace itemName={notHotDog.name} label={0} art={<FoodArt item={notHotDog} className="h-24 w-24" />} />
      </div>
      <div className="mt-4 rounded-xl bg-ink/5 p-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/60">
          What the perceptron actually sees (identical)
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURE_KEYS.map((featureKey) => (
            <FeatureChip key={featureKey} feature={featureKey} value={hotDog.features[featureKey]} />
          ))}
        </div>
      </div>
      {notHotDog.note && <p className="mt-3 text-sm italic text-ink/60">{notHotDog.note}</p>}
    </div>
  )
}

function FoodFace({ itemName, label, art }: { itemName: string; label: 0 | 1; art: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {art}
      <div className="text-center font-display text-sm font-semibold">{itemName}</div>
      <Verdict label={label} size="sm" />
    </div>
  )
}
