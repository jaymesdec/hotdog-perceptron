import { FEATURE_KEYS, FEATURE_LABELS, type FeatureVector, type Params } from '../../engine/types'
import { useUi } from '../../ui'
import { formatSigned } from './ScoreTrack'

/**
 * The live equation (spec §5B): each product, the sum, and the bias, with exact
 * numbers. "Show the math" (spec §8) switches between a plain visual pathway and
 * the symbolic form.
 */
export function Equation({ features, params }: { features: FeatureVector; params: Params }) {
  const { showMath } = useUi()
  const terms = FEATURE_KEYS.map((featureKey) => ({
    featureKey,
    value: features[featureKey],
    weight: params.weights[featureKey],
    product: features[featureKey] * params.weights[featureKey],
  }))
  const sum = terms.reduce((total, term) => total + term.product, 0) + params.bias

  if (!showMath) {
    return (
      <div className="space-y-1 text-sm">
        {terms.map((term) => (
          <div key={term.featureKey} className="flex items-center justify-between rounded-lg bg-ink/5 px-3 py-1">
            <span>
              {FEATURE_LABELS[term.featureKey]} is{' '}
              <strong>{term.value === 1 ? 'present' : 'absent'}</strong>
            </span>
            <span className="font-mono">
              {term.value === 1 ? `adds ${formatSigned(term.weight)}` : 'adds +0'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-bun/20 px-3 py-1">
          <span>Bias always adds</span>
          <span className="font-mono">{formatSigned(params.bias)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-ink px-3 py-1 font-bold text-paper">
          <span>Total score</span>
          <span className="font-mono">{formatSigned(sum)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-ink/5 p-3 font-mono text-sm leading-relaxed">
      <div className="text-ink/70">score =</div>
      {terms.map((term) => (
        <div key={term.featureKey} className="pl-4">
          {term.value}·({formatSigned(term.weight)}){' '}
          <span className="text-ink/50">= {formatSigned(term.product)}</span>{' '}
          <span className="text-ink/40">({FEATURE_LABELS[term.featureKey]})</span>
        </div>
      ))}
      <div className="pl-4">
        {formatSigned(params.bias)} <span className="text-ink/40">(bias)</span>
      </div>
      <div className="mt-1 border-t border-ink/20 pt-1 font-bold">= {formatSigned(sum)}</div>
    </div>
  )
}
