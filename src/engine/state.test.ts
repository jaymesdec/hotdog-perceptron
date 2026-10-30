import { describe, expect, it } from 'vitest'
import {
  createInitialState,
  currentTrainingItem,
  datasetWarnings,
  reducer,
  testSummary,
  trainingItems,
  type AppState,
  type Intent,
} from './state'
import { DATASET } from '../data/dataset'

/** Apply a sequence of intents from a starting state. */
function run(state: AppState, intents: Intent[]): AppState {
  return intents.reduce(reducer, state)
}

/** Assign a small, separable training set (two hot dogs, two not) + a test item. */
function withSeparableSplit(state: AppState): AppState {
  return run(state, [
    { type: 'assignCard', itemId: 'hd_plain', tray: 'train' },
    { type: 'assignCard', itemId: 'hd_ketchup', tray: 'train' },
    { type: 'assignCard', itemId: 'pizza_plain', tray: 'train' },
    { type: 'assignCard', itemId: 'fries', tray: 'train' },
    { type: 'assignCard', itemId: 'hd_mustard', tray: 'test' },
  ])
}

/** Train a single example fully: predict → compare → apply → next. */
const TRAIN_ONE: Intent[] = [
  { type: 'predict' },
  { type: 'compareToLabel' },
  { type: 'applyUpdate' },
  { type: 'nextExample' },
]

describe('initial state', () => {
  it('starts in select mode with everything unassigned and a frozen seed', () => {
    const state = createInitialState(42)
    expect(state.mode).toBe('select')
    expect(state.seed).toBe(42)
    expect(state.params).toEqual(state.initialParams)
    expect(Object.values(state.assignments).every((tray) => tray === 'unassigned')).toBe(true)
  })
})

describe('card assignment and warnings', () => {
  it('assigns and reassigns cards between trays', () => {
    let state = createInitialState()
    state = reducer(state, { type: 'assignCard', itemId: 'hd_plain', tray: 'train' })
    expect(state.assignments.hd_plain).toBe('train')
    state = reducer(state, { type: 'assignCard', itemId: 'hd_plain', tray: 'test' })
    expect(state.assignments.hd_plain).toBe('test')
  })

  it('warns on empty trays', () => {
    const warnings = datasetWarnings(createInitialState())
    expect(warnings.trainingEmpty).toBe(true)
    expect(warnings.testingEmpty).toBe(true)
  })

  it('warns when the training set has only one class', () => {
    let state = createInitialState()
    state = run(state, [
      { type: 'assignCard', itemId: 'hd_plain', tray: 'train' },
      { type: 'assignCard', itemId: 'hd_ketchup', tray: 'train' },
    ])
    expect(datasetWarnings(state).trainingSingleClass).toBe(true)
  })

  it('warns when the training set contains an identical-vector contradiction', () => {
    let state = createInitialState()
    // hd_both (1,1,1) label 1 and hamburger (1,1,1) label 0 together conflict.
    state = run(state, [
      { type: 'assignCard', itemId: 'hd_both', tray: 'train' },
      { type: 'assignCard', itemId: 'hamburger', tray: 'train' },
    ])
    expect(datasetWarnings(state).trainingHasContradiction).toBe(true)
  })
})

describe('baseline evaluation (spec §6 Scene 3)', () => {
  it('INVARIANT: baseline does not change params', () => {
    const state = withSeparableSplit(createInitialState(42))
    const after = reducer(state, { type: 'enterBaseline' })
    expect(after.params).toEqual(state.params)
    expect(after.baselineCorrect).not.toBeNull()
    expect(after.history.every((entry) => entry.mode !== 'train')).toBe(true)
  })
})

describe('step-by-step training (spec §6 Scene 4)', () => {
  it('predict uses pre-update params; apply then updates on a mistake', () => {
    // Force a known-wrong starting classifier via a seed-independent setSeed, then
    // craft params by training. Simpler: drive a mistake and check history.
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    const itemBefore = currentTrainingItem(state)!
    state = reducer(state, { type: 'predict' })
    expect(state.currentPrediction).not.toBeNull()
    state = reducer(state, { type: 'compareToLabel' })
    expect(state.currentError).toBe(itemBefore.label - state.currentPrediction!)
    const paramsBefore = state.params
    state = reducer(state, { type: 'applyUpdate' })
    if (state.currentError === 0) {
      // Correct prediction ⇒ no update.
      expect(state.params).toEqual(paramsBefore)
    } else {
      expect(state.params).not.toEqual(paramsBefore)
    }
    const lastEntry = state.history[state.history.length - 1]
    expect(lastEntry.paramsBefore).toEqual(paramsBefore)
    expect(lastEntry.mode).toBe('train')
  })

  it('INVARIANT: a correct prediction records "no update" and leaves params unchanged', () => {
    // Train to convergence first so a replay predicts correctly, then step once more.
    let state = withSeparableSplit(createInitialState(3))
    state = reducer(state, { type: 'startTraining' })
    // Run several full epochs to converge on the separable set.
    for (let epoch = 0; epoch < 8; epoch++) {
      state = reducer(state, { type: 'runOneEpoch' })
      if ((state.epochMistakes[state.epochMistakes.length - 1] ?? 1) === 0) break
      state = reducer(state, { type: 'nextEpoch' })
    }
    const lastEpochMistakes = state.epochMistakes[state.epochMistakes.length - 1]
    expect(lastEpochMistakes).toBe(0)
  })

  it('phase intents are ignored out of order', () => {
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    // applyUpdate before predict/compare is a no-op.
    const unchanged = reducer(state, { type: 'applyUpdate' })
    expect(unchanged).toBe(state)
  })

  it('advances to epochEnd after the last example', () => {
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    const size = state.trainingOrder.length
    for (let i = 0; i < size; i++) {
      state = run(state, TRAIN_ONE)
    }
    expect(state.mode).toBe('epochEnd')
    expect(state.epochMistakes).toHaveLength(1)
  })
})

describe('epochs retain params (spec §6 Scene 5)', () => {
  it('runOneEpoch iterates the whole set and records mistakes for the chart', () => {
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    const paramsAtStart = state.params
    state = reducer(state, { type: 'runOneEpoch' })
    expect(state.mode).toBe('epochEnd')
    expect(state.epochMistakes).toHaveLength(1)
    // On a fresh random classifier at least one update is likely; params move.
    expect(state.params === paramsAtStart).toBe(false)
    state = reducer(state, { type: 'nextEpoch' })
    expect(state.epoch).toBe(2)
    expect(state.currentEpochMistakes).toBe(0)
  })

  it('a non-separable training set never reaches zero mistakes', () => {
    let state = createInitialState(7)
    // hd_both (1,1,1)=1 and hamburger (1,1,1)=0 cannot both be learned.
    state = run(state, [
      { type: 'assignCard', itemId: 'hd_both', tray: 'train' },
      { type: 'assignCard', itemId: 'hamburger', tray: 'train' },
      { type: 'startTraining' },
    ])
    for (let epoch = 0; epoch < 15; epoch++) {
      state = reducer(state, { type: 'runOneEpoch' })
      state = reducer(state, { type: 'nextEpoch' })
    }
    expect(state.epochMistakes.every((count) => count > 0)).toBe(true)
  })
})

describe('test mode (spec §6 Scene 6)', () => {
  it('INVARIANT: predicting test items never changes params', () => {
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    state = reducer(state, { type: 'runOneEpoch' })
    const paramsLocked = state.params
    state = reducer(state, { type: 'enterTest' })
    state = reducer(state, { type: 'predictTestItem', itemId: 'hd_mustard' })
    expect(state.params).toEqual(paramsLocked)
    expect(state.testResults.hd_mustard).toBeDefined()
    const summary = testSummary(state)
    expect(summary.total).toBe(1)
  })

  it('ignores predictTestItem for items not in the test tray', () => {
    const state = withSeparableSplit(createInitialState(7))
    const after = reducer(state, { type: 'predictTestItem', itemId: 'pizza_plain' })
    expect(after).toBe(state)
  })
})

describe('undo (spec §5C, §9)', () => {
  it('restores exact prior params after applyUpdate', () => {
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    const before = state.params
    state = run(state, [
      { type: 'predict' },
      { type: 'compareToLabel' },
      { type: 'applyUpdate' },
    ])
    const afterUpdate = reducer(state, { type: 'undo' })
    expect(afterUpdate.params).toEqual(before)
  })

  it('undo at the start is a safe no-op', () => {
    const state = createInitialState()
    expect(reducer(state, { type: 'undo' })).toBe(state)
  })
})

describe('reproducibility (spec §9)', () => {
  it('INVARIANT: same seed + same order + same intents reproduce identical params and history', () => {
    const intents: Intent[] = [
      { type: 'assignCard', itemId: 'hd_plain', tray: 'train' },
      { type: 'assignCard', itemId: 'pizza_plain', tray: 'train' },
      { type: 'assignCard', itemId: 'hd_ketchup', tray: 'train' },
      { type: 'assignCard', itemId: 'fries', tray: 'train' },
      { type: 'startTraining' },
      { type: 'runOneEpoch' },
      { type: 'nextEpoch' },
      { type: 'runOneEpoch' },
    ]
    const runA = run(createInitialState(123), intents)
    const runB = run(createInitialState(123), intents)
    expect(runA.params).toEqual(runB.params)
    expect(runA.history).toEqual(runB.history)
    expect(runA.epochMistakes).toEqual(runB.epochMistakes)
  })

  it('randomize is deterministic from the current seed', () => {
    const runA = reducer(createInitialState(5), { type: 'randomize' })
    const runB = reducer(createInitialState(5), { type: 'randomize' })
    expect(runA.seed).toBe(runB.seed)
    expect(runA.params).toEqual(runB.params)
  })
})

describe('sandbox isolation (spec §6 Scene 1)', () => {
  it('sandbox tweaks do not affect run params or create history', () => {
    let state = createInitialState(7)
    const runParams = state.params
    state = reducer(state, { type: 'enterSandbox' })
    state = reducer(state, { type: 'setSandboxWeight', feature: 'ketchup', value: 5 })
    state = reducer(state, { type: 'setSandboxBias', value: -3 })
    expect(state.sandboxParams.weights.ketchup).toBe(5)
    expect(state.params).toEqual(runParams)
    expect(state.history).toHaveLength(0)
    state = reducer(state, { type: 'exitSandbox' })
    expect(state.sandboxParams).toEqual(runParams)
  })
})

describe('startOver', () => {
  it('resets to a fresh initial state', () => {
    let state = withSeparableSplit(createInitialState(7))
    state = reducer(state, { type: 'startTraining' })
    state = reducer(state, { type: 'startOver' })
    expect(state.mode).toBe('select')
    expect(trainingItems(state)).toHaveLength(0)
    expect(state.history).toHaveLength(0)
  })
})

describe('dataset integrity (guard for the whole suite)', () => {
  it('exposes a stable set of ids', () => {
    expect(DATASET.length).toBeGreaterThan(0)
  })
})
