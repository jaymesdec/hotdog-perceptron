/**
 * Mistakes-per-epoch chart (spec §5D). Deliberately faithful: it plots the raw
 * counts with no smoothing, and the caption makes clear the count can go UP as
 * well as down — especially on inconsistent datasets. It never implies that
 * more epochs must reduce error (spec §5D, §8).
 */
export function MistakesChart({ mistakes }: { mistakes: readonly number[] }) {
  if (mistakes.length === 0) {
    return <p className="text-sm text-ink/50">Run an epoch to start plotting mistakes.</p>
  }
  const maxMistakes = Math.max(1, ...mistakes)
  const barWidth = 100 / mistakes.length

  return (
    <figure className="space-y-1">
      <figcaption className="text-xs font-semibold uppercase tracking-wide text-ink/60">
        Mistakes per epoch
      </figcaption>
      <svg viewBox="0 0 100 44" className="h-28 w-full" role="img" aria-label={`Mistakes per epoch: ${mistakes.join(', ')}`}>
        {mistakes.map((count, index) => {
          const height = (count / maxMistakes) * 34
          return (
            <g key={index}>
              <rect
                x={index * barWidth + barWidth * 0.15}
                y={38 - height}
                width={barWidth * 0.7}
                height={height}
                rx="1"
                fill="#6B5B95"
              />
              <text x={index * barWidth + barWidth / 2} y={38 - height - 1.5} textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#2B2320">
                {count}
              </text>
              <text x={index * barWidth + barWidth / 2} y="43" textAnchor="middle" fontSize="3" fill="#2B2320" opacity="0.6">
                e{index + 1}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-xs text-ink/50">
        Mistake counts can rise or fall between epochs. On a dataset with contradictions, they may never reach zero.
      </p>
    </figure>
  )
}
