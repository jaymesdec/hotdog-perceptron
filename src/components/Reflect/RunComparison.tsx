import type { RunRecord } from '../../engine/state'

/**
 * A small run-comparison table (spec §6 Scene 7): training set size, starting
 * seed, epochs, train errors, test correct. No competitive scoring — it exists
 * to help learners see how their choices changed the outcome.
 */
export function RunComparison({ runs }: { runs: readonly RunRecord[] }) {
  if (runs.length === 0) {
    return <p className="text-sm text-ink/50">Save a run to start comparing.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/15 text-xs uppercase tracking-wide text-ink/60">
            <th className="py-2 pr-3">Run</th>
            <th className="py-2 pr-3">Seed</th>
            <th className="py-2 pr-3">Train size</th>
            <th className="py-2 pr-3">Epochs</th>
            <th className="py-2 pr-3">Train mistakes (last)</th>
            <th className="py-2 pr-3">Test correct</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, index) => (
            <tr key={index} className="border-b border-ink/10">
              <td className="py-2 pr-3 font-semibold">#{index + 1}</td>
              <td className="py-2 pr-3 font-mono">{run.seed}</td>
              <td className="py-2 pr-3">{run.trainingSize}</td>
              <td className="py-2 pr-3">{run.epochs}</td>
              <td className="py-2 pr-3">{run.trainMistakesLastEpoch}</td>
              <td className="py-2 pr-3">
                {run.testCorrect} / {run.testTotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
