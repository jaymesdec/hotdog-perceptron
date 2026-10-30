/**
 * Application state, intents, and the pure reducer (spec §9).
 *
 * All learning logic lives behind the engine (perceptron.ts) and this reducer.
 * React components only render state and dispatch intents — they hold no math.
 * This is what makes the §9 invariants enforceable and testable:
 *
 *  - No parameter mutation in test mode or baseline mode.
 *  - A correct prediction produces no update.
 *  - Zero-valued features produce zero weight change (enforced in the engine).
 *  - The bias update is independent of feature values (enforced in the engine).
 *  - Same seed + same data order + same actions reproduce the same run.
 *  - The current example's prediction uses the PRE-update weights.
 *
 * The reducer is a pure function: (state, intent) -> state. No I/O, no clocks,
 * no randomness beyond the seeded RNG.
 */

import {
  classify,
  computeError,
  predict,
  score,
  trainStep,
  update,
} from './perceptron'
import { nextSeed, randomParams } from './rng'
import type {
  FeatureVector,
  Label,
  Params,
  PerceptronError,
} from './types'
import {
  CHALLENGE_COLLECTION,
  DATASET,
  findContradictions,
  getItem,
  STARTER_COLLECTION,
  type FoodItem,
} from '../data/dataset'

export type Tray = 'unassigned' | 'train' | 'test'

export type Mode = 'select' | 'baseline' | 'train' | 'epochEnd' | 'test' | 'reflect' | 'sandbox'

/** Where we are inside a single training example (Scene 4). */
export type StepPhase = 'show' | 'predicted' | 'compared' | 'resolved'

export interface HistoryEntry {
  readonly epoch: number
  readonly exampleIndex: number
  readonly itemId: string
  readonly features: FeatureVector
  readonly target: Label
  readonly prediction: Label
  readonly scoreValue: number
  readonly error: PerceptronError
  readonly changed: boolean
  readonly paramsBefore: Params
  readonly paramsAfter: Params
  readonly mode: 'baseline' | 'train' | 'test'
}

export interface TestResult {
  readonly itemId: string
  readonly prediction: Label
  readonly correct: boolean
  readonly revealed: boolean
}

export interface RunRecord {
  readonly seed: number
  readonly trainingSize: number
  readonly epochs: number
  readonly trainMistakesLastEpoch: number
  readonly testCorrect: number
  readonly testTotal: number
}

export interface AppState {
  readonly assignments: Readonly<Record<string, Tray>>
  readonly seed: number
  /** Parameters frozen at the moment of randomize/reset — the run's starting point. */
  readonly initialParams: Params
  readonly params: Params
  readonly mode: Mode
  readonly stepPhase: StepPhase
  readonly epoch: number
  /** Ordered training item ids for the current pass (supports shuffle). */
  readonly trainingOrder: readonly string[]
  readonly currentIndex: number
  readonly shuffle: boolean
  // Live evaluation of the current example:
  readonly currentScore: number | null
  readonly currentPrediction: Label | null
  readonly currentTarget: Label | null
  readonly currentError: PerceptronError | null
  // Records & summaries:
  readonly history: readonly HistoryEntry[]
  readonly epochMistakes: readonly number[]
  readonly currentEpochMistakes: number
  readonly baselineCorrect: number | null
  readonly testResults: Readonly<Record<string, TestResult>>
  readonly runComparisons: readonly RunRecord[]
  // Sandbox (Scene 1) is isolated from the training run:
  readonly sandboxParams: Params
  // Undo stack (bounded); snapshots carry an empty stack to stay flat.
  readonly undoStack: readonly AppState[]
}

export const DEFAULT_SEED = 1
const UNDO_LIMIT = 50

export function createInitialState(seed: number = DEFAULT_SEED): AppState {
  const initialParams = randomParams(seed)
  const assignments: Record<string, Tray> = {}
  for (const item of DATASET) {
    assignments[item.id] = 'unassigned'
  }
  return {
    assignments,
    seed,
    initialParams,
    params: initialParams,
    mode: 'select',
    stepPhase: 'show',
    epoch: 1,
    trainingOrder: [],
    currentIndex: 0,
    shuffle: false,
    currentScore: null,
    currentPrediction: null,
    currentTarget: null,
    currentError: null,
    history: [],
    epochMistakes: [],
    currentEpochMistakes: 0,
    baselineCorrect: null,
    testResults: {},
    runComparisons: [],
    sandboxParams: initialParams,
    undoStack: [],
  }
}

// ── Selectors ────────────────────────────────────────────────────────────────

export function itemsInTray(state: AppState, tray: Tray): FoodItem[] {
  return DATASET.filter((item) => state.assignments[item.id] === tray)
}

export function trainingItems(state: AppState): FoodItem[] {
  return itemsInTray(state, 'train')
}

export function testingItems(state: AppState): FoodItem[] {
  return itemsInTray(state, 'test')
}

export function orderedTrainingItems(state: AppState): FoodItem[] {
  return state.trainingOrder
    .map((id) => getItem(id))
    .filter((item): item is FoodItem => item !== undefined)
}

export function currentTrainingItem(state: AppState): FoodItem | null {
  const id = state.trainingOrder[state.currentIndex]
  return id ? (getItem(id) ?? null) : null
}

export interface DatasetWarnings {
  readonly trainingEmpty: boolean
  readonly testingEmpty: boolean
  readonly trainingSingleClass: boolean
  readonly trainingHasContradiction: boolean
}

export function datasetWarnings(state: AppState): DatasetWarnings {
  const training = trainingItems(state)
  const labels = new Set(training.map((item) => item.label))
  return {
    trainingEmpty: training.length === 0,
    testingEmpty: testingItems(state).length === 0,
    trainingSingleClass: training.length > 0 && labels.size === 1,
    trainingHasContradiction: findContradictions(training).length > 0,
  }
}

export function testSummary(state: AppState): { correct: number; total: number; revealed: number } {
  const results = Object.values(state.testResults)
  return {
    correct: results.filter((result) => result.correct).length,
    total: testingItems(state).length,
    revealed: results.filter((result) => result.revealed).length,
  }
}

// ── Intents ──────────────────────────────────────────────────────────────────

export type Intent =
  | { type: 'assignCard'; itemId: string; tray: Tray }
  | { type: 'applyDefaultSplit' }
  | { type: 'clearAssignments' }
  | { type: 'randomize' }
  | { type: 'setSeed'; seed: number }
  | { type: 'resetToSeed' }
  | { type: 'enterBaseline' }
  | { type: 'startTraining' }
  | { type: 'predict' }
  | { type: 'compareToLabel' }
  | { type: 'applyUpdate' }
  | { type: 'nextExample' }
  | { type: 'nextEpoch' }
  | { type: 'runOneEpoch' }
  | { type: 'toggleShuffle' }
  | { type: 'enterTest' }
  | { type: 'predictTestItem'; itemId: string }
  | { type: 'enterReflect' }
  | { type: 'goToSelect' }
  | { type: 'recordRun' }
  | { type: 'enterSandbox' }
  | { type: 'setSandboxWeight'; feature: keyof Params['weights']; value: number }
  | { type: 'setSandboxBias'; value: number }
  | { type: 'exitSandbox' }
  | { type: 'undo' }
  | { type: 'startOver' }

const UNDOABLE: ReadonlySet<Intent['type']> = new Set([
  'applyUpdate',
  'nextExample',
  'nextEpoch',
  'runOneEpoch',
  'randomize',
  'resetToSeed',
])

function pushUndo(state: AppState): readonly AppState[] {
  const snapshot: AppState = { ...state, undoStack: [] }
  return [...state.undoStack, snapshot].slice(-UNDO_LIMIT)
}

/** Build a default, class-balanced train/test split from the starter set. */
function defaultSplit(): Record<string, Tray> {
  const assignments: Record<string, Tray> = {}
  for (const item of DATASET) {
    assignments[item.id] = 'unassigned'
  }
  const hotDogs = STARTER_COLLECTION.filter((item) => item.label === 1)
  const notHotDogs = STARTER_COLLECTION.filter((item) => item.label === 0)
  const take = (items: FoodItem[], count: number, tray: Tray) => {
    items.slice(0, count).forEach((item) => (assignments[item.id] = tray))
    items.slice(count, count * 2).forEach((item) => (assignments[item.id] = 'test'))
  }
  take(hotDogs, 2, 'train')
  take(notHotDogs, 2, 'train')
  return assignments
}

function evaluate(params: Params, features: FeatureVector) {
  const scoreValue = score(features, params)
  return { scoreValue, prediction: predict(scoreValue) }
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: AppState, intent: Intent): AppState {
  const withUndo = (next: AppState): AppState =>
    UNDOABLE.has(intent.type) ? { ...next, undoStack: pushUndo(state) } : next

  switch (intent.type) {
    case 'assignCard': {
      return {
        ...state,
        assignments: { ...state.assignments, [intent.itemId]: intent.tray },
      }
    }

    case 'applyDefaultSplit': {
      return { ...state, assignments: defaultSplit() }
    }

    case 'clearAssignments': {
      const cleared: Record<string, Tray> = {}
      for (const item of DATASET) cleared[item.id] = 'unassigned'
      return { ...state, assignments: cleared }
    }

    case 'randomize': {
      const seed = nextSeed(state.seed)
      const params = randomParams(seed)
      return withUndo({
        ...state,
        seed,
        initialParams: params,
        params,
        sandboxParams: params,
      })
    }

    case 'setSeed': {
      const params = randomParams(intent.seed)
      return {
        ...state,
        seed: intent.seed,
        initialParams: params,
        params,
        sandboxParams: params,
      }
    }

    case 'resetToSeed': {
      return withUndo({
        ...state,
        params: state.initialParams,
        sandboxParams: state.initialParams,
      })
    }

    case 'enterBaseline': {
      // Read-only evaluation over the training set. MUST NOT change params.
      const training = trainingItems(state)
      let correct = 0
      const historyEntries: HistoryEntry[] = training.map((item, index) => {
        const { scoreValue, prediction } = evaluate(state.params, item.features)
        if (prediction === item.label) correct++
        return {
          epoch: 0,
          exampleIndex: index,
          itemId: item.id,
          features: item.features,
          target: item.label,
          prediction,
          scoreValue,
          error: computeError(item.label, prediction),
          changed: false,
          paramsBefore: state.params,
          paramsAfter: state.params,
          mode: 'baseline',
        }
      })
      return {
        ...state,
        mode: 'baseline',
        baselineCorrect: correct,
        history: [...state.history, ...historyEntries],
      }
    }

    case 'startTraining': {
      const order = trainingItems(state).map((item) => item.id)
      const ordered = state.shuffle ? shuffleWithSeed(order, state.seed) : order
      return {
        ...state,
        mode: 'train',
        trainingOrder: ordered,
        currentIndex: 0,
        epoch: 1,
        stepPhase: 'show',
        currentEpochMistakes: 0,
        currentScore: null,
        currentPrediction: null,
        currentTarget: null,
        currentError: null,
      }
    }

    case 'predict': {
      if (state.mode !== 'train' || state.stepPhase !== 'show') return state
      const item = currentTrainingItem(state)
      if (!item) return state
      const { scoreValue, prediction } = evaluate(state.params, item.features)
      return {
        ...state,
        stepPhase: 'predicted',
        currentScore: scoreValue,
        currentPrediction: prediction,
      }
    }

    case 'compareToLabel': {
      if (state.mode !== 'train' || state.stepPhase !== 'predicted') return state
      const item = currentTrainingItem(state)
      if (!item || state.currentPrediction === null) return state
      return {
        ...state,
        stepPhase: 'compared',
        currentTarget: item.label,
        currentError: computeError(item.label, state.currentPrediction),
      }
    }

    case 'applyUpdate': {
      if (state.mode !== 'train' || state.stepPhase !== 'compared') return state
      const item = currentTrainingItem(state)
      if (!item || state.currentError === null || state.currentPrediction === null) return state
      const paramsBefore = state.params
      const paramsAfter = update(paramsBefore, item.features, state.currentError)
      const changed = state.currentError !== 0
      const entry: HistoryEntry = {
        epoch: state.epoch,
        exampleIndex: state.currentIndex,
        itemId: item.id,
        features: item.features,
        target: item.label,
        prediction: state.currentPrediction,
        scoreValue: state.currentScore ?? score(item.features, paramsBefore),
        error: state.currentError,
        changed,
        paramsBefore,
        paramsAfter,
        mode: 'train',
      }
      return withUndo({
        ...state,
        params: paramsAfter,
        stepPhase: 'resolved',
        currentEpochMistakes: state.currentEpochMistakes + (changed ? 1 : 0),
        history: [...state.history, entry],
      })
    }

    case 'nextExample': {
      if (state.mode !== 'train' || state.stepPhase !== 'resolved') return state
      const isLast = state.currentIndex >= state.trainingOrder.length - 1
      if (isLast) {
        return withUndo({
          ...state,
          mode: 'epochEnd',
          epochMistakes: [...state.epochMistakes, state.currentEpochMistakes],
        })
      }
      return withUndo({
        ...state,
        currentIndex: state.currentIndex + 1,
        stepPhase: 'show',
        currentScore: null,
        currentPrediction: null,
        currentTarget: null,
        currentError: null,
      })
    }

    case 'nextEpoch': {
      if (state.mode !== 'epochEnd') return state
      const order = trainingItems(state).map((item) => item.id)
      const ordered = state.shuffle ? shuffleWithSeed(order, state.seed + state.epoch) : order
      return withUndo({
        ...state,
        mode: 'train',
        epoch: state.epoch + 1,
        trainingOrder: ordered,
        currentIndex: 0,
        stepPhase: 'show',
        currentEpochMistakes: 0,
        currentScore: null,
        currentPrediction: null,
        currentTarget: null,
        currentError: null,
      })
    }

    case 'runOneEpoch': {
      // Non-interactive fast pass through the whole training set, retaining
      // params across examples. Uses pre-update params for each prediction.
      const order =
        state.mode === 'train' && state.trainingOrder.length > 0
          ? state.trainingOrder
          : trainingItems(state).map((item) => item.id)
      if (order.length === 0) return state
      let params = state.params
      let mistakes = 0
      const entries: HistoryEntry[] = []
      order.forEach((id, index) => {
        const item = getItem(id)
        if (!item) return
        const result = trainStep(params, item.features, item.label)
        entries.push({
          epoch: state.epoch,
          exampleIndex: index,
          itemId: id,
          features: item.features,
          target: item.label,
          prediction: result.prediction,
          scoreValue: result.scoreValue,
          error: result.error,
          changed: result.changed,
          paramsBefore: params,
          paramsAfter: result.params,
          mode: 'train',
        })
        params = result.params
        if (result.changed) mistakes++
      })
      return withUndo({
        ...state,
        mode: 'epochEnd',
        params,
        trainingOrder: order,
        currentIndex: order.length - 1,
        stepPhase: 'resolved',
        epoch: state.epoch,
        currentEpochMistakes: mistakes,
        epochMistakes: [...state.epochMistakes, mistakes],
        history: [...state.history, ...entries],
      })
    }

    case 'toggleShuffle': {
      return { ...state, shuffle: !state.shuffle }
    }

    case 'enterTest': {
      return { ...state, mode: 'test' }
    }

    case 'predictTestItem': {
      // Read-only. MUST NOT change params (spec §9 test-mode invariant).
      const item = getItem(intent.itemId)
      if (!item || state.assignments[intent.itemId] !== 'test') return state
      const { scoreValue, prediction } = evaluate(state.params, item.features)
      const result: TestResult = {
        itemId: item.id,
        prediction,
        correct: prediction === item.label,
        revealed: true,
      }
      const entry: HistoryEntry = {
        epoch: state.epoch,
        exampleIndex: 0,
        itemId: item.id,
        features: item.features,
        target: item.label,
        prediction,
        scoreValue,
        error: computeError(item.label, prediction),
        changed: false,
        paramsBefore: state.params,
        paramsAfter: state.params,
        mode: 'test',
      }
      return {
        ...state,
        testResults: { ...state.testResults, [item.id]: result },
        history: [...state.history, entry],
      }
    }

    case 'enterReflect': {
      return { ...state, mode: 'reflect' }
    }

    case 'goToSelect': {
      return { ...state, mode: 'select' }
    }

    case 'recordRun': {
      const summary = testSummary(state)
      const record: RunRecord = {
        seed: state.seed,
        trainingSize: trainingItems(state).length,
        epochs: state.epoch,
        trainMistakesLastEpoch:
          state.epochMistakes[state.epochMistakes.length - 1] ?? state.currentEpochMistakes,
        testCorrect: summary.correct,
        testTotal: summary.total,
      }
      return { ...state, runComparisons: [...state.runComparisons, record] }
    }

    case 'enterSandbox': {
      return { ...state, mode: 'sandbox', sandboxParams: state.params }
    }

    case 'setSandboxWeight': {
      return {
        ...state,
        sandboxParams: {
          ...state.sandboxParams,
          weights: { ...state.sandboxParams.weights, [intent.feature]: intent.value },
        },
      }
    }

    case 'setSandboxBias': {
      return { ...state, sandboxParams: { ...state.sandboxParams, bias: intent.value } }
    }

    case 'exitSandbox': {
      // Sandbox tweaks are isolated: leaving discards them, restoring run params.
      return { ...state, mode: 'select', sandboxParams: state.params }
    }

    case 'undo': {
      const previous = state.undoStack[state.undoStack.length - 1]
      if (!previous) return state
      return { ...previous, undoStack: state.undoStack.slice(0, -1) }
    }

    case 'startOver': {
      return createInitialState(DEFAULT_SEED)
    }

    default: {
      // Exhaustiveness guard.
      const _never: never = intent
      return _never
    }
  }
}

/** Deterministic Fisher–Yates shuffle driven by the seeded RNG. */
function shuffleWithSeed(ids: readonly string[], seed: number): string[] {
  const result = [...ids]
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
  for (let index = result.length - 1; index > 0; index--) {
    const swapWith = Math.floor(next() * (index + 1))
    ;[result[index], result[swapWith]] = [result[swapWith], result[index]]
  }
  return result
}

/** Convenience used by tests and the sandbox to read a live classification. */
export function liveClassification(params: Params, features: FeatureVector) {
  return { scoreValue: score(features, params), prediction: classify(features, params) }
}

export { CHALLENGE_COLLECTION, STARTER_COLLECTION }
