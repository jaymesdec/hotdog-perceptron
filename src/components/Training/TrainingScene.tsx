import { useState } from 'react'
import { useStore } from '../../store'
import { currentTrainingItem, type HistoryEntry } from '../../engine/state'
import { predict, score } from '../../engine/perceptron'
import { FEATURE_KEYS, FEATURE_LABELS, type FeatureKey, type Params } from '../../engine/types'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Workbench } from '../Workbench/Workbench'
import { Button } from '../common/Button'
import { ProgressIndicator } from '../common/ProgressIndicator'
import { ExplainThis } from '../common/ExplainThis'
import { Verdict, CorrectnessMark } from '../common/Verdict'
import { formatSigned } from '../Workbench/ScoreTrack'

/** Feature weights whose value differs between two parameter sets. */
function changedParamKeys(before: Params, after: Params): Set<FeatureKey> {
  const changed = new Set<FeatureKey>()
  for (const featureKey of FEATURE_KEYS) {
    if (before.weights[featureKey] !== after.weights[featureKey]) changed.add(featureKey)
  }
  return changed
}

export function TrainingScene() {
  const { state, dispatch } = useStore()
  const reducedMotion = useReducedMotion()
  const item = currentTrainingItem(state)
  const [guesses, setGuesses] = useState<Set<FeatureKey>>(new Set())
  const [peek, setPeek] = useState(false)

  // In the resolved phase the run params are already the post-update params, so
  // the workbench should display the PRE-update params from the history entry.
  const lastEntry: HistoryEntry | undefined =
    state.stepPhase === 'resolved' ? state.history[state.history.length - 1] : undefined
  const displayParams = lastEntry ? lastEntry.paramsBefore : state.params
  const changedKeys = lastEntry ? changedParamKeys(lastEntry.paramsBefore, lastEntry.paramsAfter) : undefined

  const resetStepLocalState = () => {
    setGuesses(new Set())
    setPeek(false)
  }

  if (!item) return null

  const toggleGuess = (key: FeatureKey) => {
    setGuesses((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <section aria-labelledby="train-heading" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="train-heading" className="font-display text-xl font-bold text-ink">
          Train, one example at a time
        </h2>
        <ProgressIndicator
          exampleNumber={state.currentIndex + 1}
          total={state.trainingOrder.length}
          epoch={state.epoch}
        />
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <Workbench
          item={item}
          params={displayParams}
          showLabel
          pulse={state.stepPhase === 'resolved' && (lastEntry?.changed ?? false)}
          changedKeys={changedKeys}
          reducedMotion={reducedMotion}
        />

        {/* Contextual controls + prompts, revealed by phase (spec §5C, §6 Scene 4).
            Kept in a sticky side panel so the interactive controls stay above the fold. */}
        <aside className="rounded-2xl border border-ink/10 bg-shelf/40 p-4 lg:sticky lg:top-20">
        {state.stepPhase === 'show' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/80">
              Which input has the strongest effect on the score right now? Make a prediction.
            </p>
            <div className="flex gap-2">
              {/* "Run one epoch" (spec §5C) is offered only at the very start of an
                  epoch so it can't double-count examples already stepped through. */}
              {state.currentIndex === 0 && (
                <Button variant="ghost" onClick={() => dispatch({ type: 'runOneEpoch' })}>
                  Run the whole epoch
                </Button>
              )}
              <Button onClick={() => dispatch({ type: 'predict' })}>Predict</Button>
            </div>
          </div>
        )}

        {state.stepPhase === 'predicted' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/80">
              The detector guessed. Now compare it to the true label.
            </p>
            <Button onClick={() => dispatch({ type: 'compareToLabel' })}>Compare to label</Button>
          </div>
        )}

        {state.stepPhase === 'compared' && state.currentError !== null && (
          <div className="space-y-3">
            <ErrorLine
              target={state.currentTarget ?? item.label}
              prediction={state.currentPrediction ?? predict(score(item.features, state.params))}
              error={state.currentError}
            />
            {state.currentError === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-yes">
                  The prediction was correct. What should happen to the weights?
                </p>
                <Button variant="secondary" onClick={() => dispatch({ type: 'applyUpdate' })}>
                  Check what happens
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-ink/80">
                  It made a mistake. Before you apply the update, predict: which parameters will change, and why?
                </p>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_KEYS.map((featureKey) => (
                    <GuessChip
                      key={featureKey}
                      label={`${FEATURE_LABELS[featureKey]} weight`}
                      active={guesses.has(featureKey)}
                      onClick={() => toggleGuess(featureKey)}
                    />
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => dispatch({ type: 'applyUpdate' })}>Apply learning update</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {state.stepPhase === 'resolved' && lastEntry && (
          <ResolvedPanel
            entry={lastEntry}
            guesses={guesses}
            changedKeys={changedKeys ?? new Set()}
            peek={peek}
            onPeek={() => setPeek(true)}
            onNext={() => {
              resetStepLocalState()
              dispatch({ type: 'nextExample' })
            }}
            canUndo={state.undoStack.length > 0}
            onUndo={() => {
              resetStepLocalState()
              dispatch({ type: 'undo' })
            }}
          />
        )}
        </aside>
      </div>
    </section>
  )
}

function ErrorLine({ target, prediction, error }: { target: 0 | 1; prediction: 0 | 1; error: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="flex items-center gap-1">
        error <ExplainThis concept="error" /> = label − prediction =
      </span>
      <Verdict label={target} size="sm" />
      <span>−</span>
      <Verdict label={prediction} size="sm" />
      <span className="font-mono font-bold">= {error > 0 ? '+1' : error}</span>
    </div>
  )
}

function GuessChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        active ? 'border-ink bg-ink text-paper' : 'border-ink/30 bg-white text-ink hover:bg-ink/10'
      }`}
    >
      will change? {label}
    </button>
  )
}

function ResolvedPanel({
  entry,
  guesses,
  changedKeys,
  peek,
  onPeek,
  onNext,
  canUndo,
  onUndo,
}: {
  entry: HistoryEntry
  guesses: Set<FeatureKey>
  changedKeys: Set<FeatureKey>
  peek: boolean
  onPeek: () => void
  onNext: () => void
  canUndo: boolean
  onUndo: () => void
}) {
  const peekScore = score(entry.features, entry.paramsAfter)
  const peekPrediction = predict(peekScore)

  return (
    <div className="space-y-3">
      {entry.changed ? (
        <>
          <p className="text-sm font-semibold text-ink">
            Mistake → the classic rule nudged the active inputs:
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURE_KEYS.map((featureKey) => (
              <DeltaRow
                key={featureKey}
                name={`${FEATURE_LABELS[featureKey]} weight`}
                before={entry.paramsBefore.weights[featureKey]}
                after={entry.paramsAfter.weights[featureKey]}
                changed={changedKeys.has(featureKey)}
                guessedCorrectly={guesses.has(featureKey) === changedKeys.has(featureKey)}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-yes/10 px-3 py-2 text-sm font-semibold text-yes">
          No update: prediction matched label. Correct guesses never change the parameters.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {entry.changed && !peek && (
            <Button variant="ghost" onClick={onPeek}>
              See updated prediction
            </Button>
          )}
          {canUndo && (
            <Button variant="ghost" onClick={onUndo}>
              Undo last step
            </Button>
          )}
        </div>
        <Button onClick={onNext}>Next example →</Button>
      </div>

      {peek && (
        <p className="text-sm text-ink/70">
          With the updated parameters, this same example would now predict{' '}
          <strong>{peekPrediction === 1 ? 'Hot dog' : 'Not hot dog'}</strong> (score {formatSigned(peekScore)}).
          This peek does not count as another training step.
        </p>
      )}
    </div>
  )
}

function DeltaRow({
  name,
  before,
  after,
  changed,
  guessedCorrectly,
}: {
  name: string
  before: number
  after: number
  changed: boolean
  guessedCorrectly: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs ${
        changed ? 'border-ink bg-white font-semibold' : 'border-ink/15 bg-transparent text-ink/50'
      }`}
    >
      <div>{name}</div>
      <div className="font-mono">
        {formatSigned(before)}
        {changed ? ` → ${formatSigned(after)}` : ' (unchanged)'}
      </div>
      <div className="mt-1">
        <CorrectnessMark correct={guessedCorrectly} />
        <span className="sr-only">your guess was {guessedCorrectly ? 'right' : 'wrong'}</span>
      </div>
    </div>
  )
}
