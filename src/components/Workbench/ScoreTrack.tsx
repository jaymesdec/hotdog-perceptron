import { ExplainThis } from '../common/ExplainThis'

/**
 * The score track with a fixed zero threshold and a moving marker (spec §5B).
 * The score is labeled a "distance from the decision line" — never a
 * probability or confidence percentage (spec §3, §11).
 */
export function ScoreTrack({ scoreValue }: { scoreValue: number }) {
  const span = Math.max(3, Math.ceil(Math.abs(scoreValue)) + 1)
  // Map score in [-span, span] to 0..100% across the track.
  const markerPercent = ((scoreValue + span) / (2 * span)) * 100
  const isHotDogSide = scoreValue >= 0

  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink/60">
        Score — distance from decision line
        <ExplainThis concept="score" />
      </div>
      <div className="relative h-12 rounded-full bg-gradient-to-r from-no/20 via-ink/5 to-yes/20">
        {/* Fixed zero threshold in the exact middle. */}
        <div
          className="absolute top-0 h-full w-0.5 bg-ink"
          style={{ left: '50%' }}
          aria-hidden
        />
        <div className="absolute -top-5 text-[10px] font-bold text-ink" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          threshold 0
        </div>
        <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-no">◀ not hot dog</span>
        <span className="absolute bottom-1 right-2 text-[10px] font-semibold text-yes">hot dog ▶</span>
        {/* The moving marker. */}
        <div
          className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-[left] duration-300"
          style={{ left: `${markerPercent}%` }}
        >
          <div
            className={`grid h-7 w-7 place-items-center rounded-full border-2 font-mono text-xs font-bold text-white ${
              isHotDogSide ? 'border-yes bg-yes' : 'border-no bg-no'
            }`}
          >
            <span aria-hidden>{isHotDogSide ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>
      <p className="mt-1 text-center text-sm">
        score = <span className="font-mono font-bold">{formatSigned(scoreValue)}</span>{' '}
        <span className="text-ink/60">
          ({isHotDogSide ? 'at or above' : 'below'} the line → {isHotDogSide ? 'Hot dog' : 'Not hot dog'})
        </span>
      </p>
    </div>
  )
}

export function formatSigned(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return rounded >= 0 ? `+${rounded}` : `${rounded}`
}
