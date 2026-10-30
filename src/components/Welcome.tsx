import { useStore } from '../store'
import { Button } from './common/Button'

/**
 * The opening invitation. Routes into the Scene 1 sandbox (manual play) or
 * straight to sorting the dataset.
 */
export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  const { dispatch } = useStore()

  return (
    <section className="mx-auto max-w-2xl space-y-5 py-8 text-center">
      <div className="text-6xl" aria-hidden>
        🌭🔎
      </div>
      <h2 className="font-display text-3xl font-bold text-ink">Be an AI researcher</h2>
      <p className="text-ink/75">
        You'll train a tiny detector — a single <em>perceptron</em> — to tell hot dogs from everything
        else. It never sees the picture, only three facts: is there <strong>ketchup</strong>,{' '}
        <strong>mustard</strong>, and a <strong>bun</strong>? Watch every number change as it learns.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => {
            onDismiss()
            dispatch({ type: 'enterSandbox' })
          }}
        >
          Play in the sandbox first
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Skip to sorting the data
        </Button>
      </div>
    </section>
  )
}
