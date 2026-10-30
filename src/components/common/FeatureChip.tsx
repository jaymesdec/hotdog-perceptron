import { FEATURE_LABELS, type Bit, type FeatureKey } from '../../engine/types'

/**
 * A feature chip showing present (1) or absent (0). Accessibility: the state is
 * carried by an icon (✓ / ·), the number, and text — never color alone (§10).
 */
export function FeatureChip({
  feature,
  value,
  size = 'md',
}: {
  feature: FeatureKey
  value: Bit
  size?: 'sm' | 'md'
}) {
  const present = value === 1
  const paddingClass = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${paddingClass} ${
        present
          ? 'border-ink/25 bg-ink/5 text-ink'
          : 'border-dashed border-ink/20 bg-transparent text-ink/40'
      }`}
    >
      <span aria-hidden className="font-bold">
        {present ? '✓' : '·'}
      </span>
      {FEATURE_LABELS[feature]}
      <span className="font-mono font-bold">{value}</span>
      <span className="sr-only">{present ? 'present' : 'absent'}</span>
    </span>
  )
}
