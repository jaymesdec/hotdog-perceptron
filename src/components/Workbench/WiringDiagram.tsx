import { FEATURE_KEYS, FEATURE_LABELS, type FeatureKey, type FeatureVector, type Params } from '../../engine/types'
import { formatSigned } from './ScoreTrack'

/**
 * The spatially-causal wiring (spec §5B, §7): inputs flow along weighted
 * connections into a sum, with a separate bias block. Causality is left→right:
 * inputs → multiply by weight → sum (+ bias) → score.
 *
 * - Negative weights are drawn as dashed wires with a "−" glyph, distinct from
 *   the solid positive wires WITHOUT relying on color alone (spec §10).
 * - When `pulse` is set, only the active-input connections and the bias pulse
 *   (spec §7, visible learning pulse). Inactive features stay still.
 */
const INPUT_Y: Record<FeatureKey, number> = { ketchup: 46, mustard: 128, bun: 210 }
const SUM = { x: 360, y: 128 }

export function WiringDiagram({
  features,
  params,
  pulse = false,
  changedKeys,
  reducedMotion = false,
}: {
  features: FeatureVector
  params: Params
  pulse?: boolean
  changedKeys?: ReadonlySet<FeatureKey | 'bias'>
  reducedMotion?: boolean
}) {
  return (
    <svg viewBox="0 0 460 260" className="w-full" role="img" aria-label="Perceptron wiring: inputs times weights, summed with the bias.">
      {FEATURE_KEYS.map((featureKey) => {
        const active = features[featureKey] === 1
        const weight = params.weights[featureKey]
        const negative = weight < 0
        const startY = INPUT_Y[featureKey]
        const shouldPulse = pulse && active && changedKeys?.has(featureKey) && !reducedMotion
        return (
          <g key={featureKey}>
            {/* connection wire */}
            <path
              d={`M120 ${startY} C 220 ${startY}, 240 ${SUM.y}, 326 ${SUM.y}`}
              fill="none"
              stroke="#2B2320"
              strokeOpacity={active ? 0.85 : 0.2}
              strokeWidth={Math.min(9, 2 + Math.abs(weight) * 2)}
              strokeDasharray={negative ? '7 5' : undefined}
              strokeLinecap="round"
              className={shouldPulse ? 'animate-pulseWire' : undefined}
            />
            {/* weight label on the wire */}
            <g transform={`translate(210, ${(startY + SUM.y) / 2 - 6})`}>
              <rect x="-26" y="-12" width="52" height="22" rx="11" fill="white" stroke="#2B2320" strokeOpacity="0.2" />
              <text x="0" y="4" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="bold">
                {negative ? '−' : '+'}
                {Math.abs(Math.round(weight * 100) / 100)}
              </text>
            </g>
            {/* input node */}
            <g>
              <rect
                x="8"
                y={startY - 22}
                width="112"
                height="44"
                rx="12"
                fill={active ? '#FFFFFF' : '#F4E9D8'}
                stroke="#2B2320"
                strokeOpacity={active ? 0.6 : 0.25}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <text x="20" y={startY - 4} fontSize="12" fontWeight="600" fill="#2B2320">
                {FEATURE_LABELS[featureKey]}
              </text>
              <text x="20" y={startY + 14} fontSize="13" fontFamily="monospace" fontWeight="bold" fill="#2B2320">
                value = {features[featureKey]}
              </text>
            </g>
          </g>
        )
      })}

      {/* bias block — feeds the sum but is not a weight on any feature */}
      <g>
        <rect
          x="300"
          y="214"
          width="120"
          height="38"
          rx="10"
          fill="#F6E2B8"
          stroke="#2B2320"
          strokeOpacity="0.4"
          className={pulse && changedKeys?.has('bias') && !reducedMotion ? 'animate-pulseWire' : undefined}
        />
        <text x="360" y="231" textAnchor="middle" fontSize="11" fontWeight="600">
          bias
        </text>
        <text x="360" y="246" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="bold">
          {formatSigned(params.bias)}
        </text>
        <path d={`M360 214 L360 ${SUM.y + 34}`} stroke="#2B2320" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="4 4" />
      </g>

      {/* sum node */}
      <g>
        <circle cx={SUM.x} cy={SUM.y} r="34" fill="#2B2320" />
        <text x={SUM.x} y={SUM.y - 2} textAnchor="middle" fontSize="22" fill="#FFF9F0" fontWeight="bold">
          Σ
        </text>
        <text x={SUM.x} y={SUM.y + 14} textAnchor="middle" fontSize="9" fill="#FFF9F0" opacity="0.8">
          sum
        </text>
      </g>
      {/* arrow out to the score */}
      <path d={`M394 ${SUM.y} L440 ${SUM.y}`} stroke="#2B2320" strokeWidth="3" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="#2B2320" />
        </marker>
      </defs>
    </svg>
  )
}
