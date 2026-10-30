import type { DatasetWarnings } from '../../engine/state'

/**
 * Surfaces dataset-selection warnings (spec §5A): empty trays, a single-class
 * training set, and conflicting feature-label combinations. Rendered as an
 * alert region so assistive tech announces changes.
 */
export function Warnings({ warnings }: { warnings: DatasetWarnings }) {
  const messages: string[] = []
  if (warnings.trainingEmpty) messages.push('Your training tray is empty — add some labeled examples to teach the detector.')
  if (warnings.testingEmpty) messages.push('Your testing tray is empty — hold out a few examples to test on later.')
  if (warnings.trainingSingleClass)
    messages.push('Your training set has only one class. The detector needs both hot dogs and not-hot-dogs to learn a boundary.')
  if (warnings.trainingHasContradiction)
    messages.push(
      'Heads up: two training examples share identical features but opposite labels. No detector using only these three features can ever get both right.',
    )

  if (messages.length === 0) return null

  return (
    <div role="alert" className="rounded-xl border border-mustard/50 bg-mustard/10 p-3 text-sm text-ink">
      <ul className="list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
