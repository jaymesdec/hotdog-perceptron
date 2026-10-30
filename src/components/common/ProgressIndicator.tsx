import { ExplainThis } from './ExplainThis'

/**
 * The persistent progress indicator (spec §5C): "Example N of M · Epoch K".
 */
export function ProgressIndicator({
  exampleNumber,
  total,
  epoch,
}: {
  exampleNumber: number
  total: number
  epoch: number
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1 font-mono text-sm font-semibold text-ink">
      Example {exampleNumber} of {total} · Epoch {epoch}
      <ExplainThis concept="epoch" />
    </div>
  )
}
