import { describe, expect, it } from 'vitest'
import {
  classify,
  computeError,
  DECISION_THRESHOLD,
  predict,
  score,
  trainStep,
  update,
} from './perceptron'
import type { FeatureVector, Params } from './types'

const zeroParams: Params = {
  weights: { ketchup: 0, mustard: 0, bun: 0 },
  bias: 0,
}

function makeParams(ketchup: number, mustard: number, bun: number, bias: number): Params {
  return { weights: { ketchup, mustard, bun }, bias }
}

function makeFeatures(ketchup: 0 | 1, mustard: 0 | 1, bun: 0 | 1): FeatureVector {
  return { ketchup, mustard, bun }
}

describe('score', () => {
  it('computes the weighted sum plus bias', () => {
    const params = makeParams(2, 3, 5, 1)
    // 1·2 + 0·3 + 1·5 + 1 = 8
    expect(score(makeFeatures(1, 0, 1), params)).toBe(8)
  })

  it('returns the bias alone when all features are zero', () => {
    const params = makeParams(2, 3, 5, -4)
    expect(score(makeFeatures(0, 0, 0), params)).toBe(-4)
  })

  it('handles negative weights', () => {
    const params = makeParams(-2, 1, 0, 0)
    // 1·-2 + 1·1 + 0·0 + 0 = -1
    expect(score(makeFeatures(1, 1, 0), params)).toBe(-1)
  })
})

describe('predict (step activation at threshold 0)', () => {
  it('predicts Hot dog (1) when the score is positive', () => {
    expect(predict(0.5)).toBe(1)
  })

  it('predicts Hot dog (1) at exactly the threshold (>= is inclusive)', () => {
    expect(predict(DECISION_THRESHOLD)).toBe(1)
    expect(predict(0)).toBe(1)
  })

  it('predicts Not hot dog (0) when the score is negative', () => {
    expect(predict(-0.0001)).toBe(0)
  })
})

describe('computeError (label − prediction)', () => {
  it('is 1 when a hot dog is missed', () => {
    expect(computeError(1, 0)).toBe(1)
  })

  it('is -1 when a non-hot-dog is called a hot dog', () => {
    expect(computeError(0, 1)).toBe(-1)
  })

  it('is 0 when the prediction matches the label', () => {
    expect(computeError(1, 1)).toBe(0)
    expect(computeError(0, 0)).toBe(0)
  })
})

describe('update — invariants (spec §9)', () => {
  it('INVARIANT: correct prediction (error 0) leaves params unchanged', () => {
    const params = makeParams(0.5, -0.3, 0.8, 0.1)
    const result = update(params, makeFeatures(1, 1, 1), 0)
    expect(result).toEqual(params)
  })

  it('INVARIANT: a zero-valued feature does not change its weight, even on a mistake', () => {
    const params = makeParams(0.5, 0.5, 0.5, 0)
    // mustard = 0 here; its weight must stay 0.5 despite error = 1.
    const result = update(params, makeFeatures(1, 0, 1), 1)
    expect(result.weights.mustard).toBe(0.5)
    // active features move by error · 1:
    expect(result.weights.ketchup).toBe(1.5)
    expect(result.weights.bun).toBe(1.5)
  })

  it('INVARIANT: the bias update is independent of feature values', () => {
    const params = makeParams(0, 0, 0, 2)
    // Same error, different feature vectors — bias moves by error either way.
    const withAllOn = update(params, makeFeatures(1, 1, 1), -1)
    const withAllOff = update(params, makeFeatures(0, 0, 0), -1)
    expect(withAllOn.bias).toBe(1)
    expect(withAllOff.bias).toBe(1)
  })

  it('applies the classic rule for a negative error (false positive)', () => {
    const params = makeParams(1, 1, 1, 1)
    const result = update(params, makeFeatures(1, 0, 1), -1)
    expect(result.weights.ketchup).toBe(0)
    expect(result.weights.mustard).toBe(1) // inactive, unchanged
    expect(result.weights.bun).toBe(0)
    expect(result.bias).toBe(0)
  })

  it('does not mutate the input params object', () => {
    const params = makeParams(0.5, 0.5, 0.5, 0)
    const snapshot = JSON.stringify(params)
    update(params, makeFeatures(1, 1, 1), 1)
    expect(JSON.stringify(params)).toBe(snapshot)
  })
})

describe('classify', () => {
  it('scores then activates', () => {
    const params = makeParams(0, 0, 2, -1)
    expect(classify(makeFeatures(0, 0, 1), params)).toBe(1) // 2 - 1 = 1 >= 0
    expect(classify(makeFeatures(0, 0, 0), params)).toBe(0) // -1 < 0
  })
})

describe('trainStep — uses pre-update params for the prediction (spec §9)', () => {
  it('predicts with the old params, then returns updated params', () => {
    // Start with a classifier that mispredicts a plain hot dog (bun only).
    const params = makeParams(0, 0, -1, 0)
    const result = trainStep(params, makeFeatures(0, 0, 1), 1)
    expect(result.scoreValue).toBe(-1) // computed from the OLD params
    expect(result.prediction).toBe(0) // wrong — it is a hot dog
    expect(result.error).toBe(1)
    expect(result.changed).toBe(true)
    expect(result.params.weights.bun).toBe(0) // -1 + 1·1
    expect(result.params.bias).toBe(1) // 0 + 1
  })

  it('reports no change on a correct prediction', () => {
    const params = makeParams(0, 0, 2, 1)
    const result = trainStep(params, makeFeatures(0, 0, 1), 1)
    expect(result.changed).toBe(false)
    expect(result.params).toEqual(params)
  })
})

describe('convergence on a known separable fixture', () => {
  it('learns bun ⇒ hot dog within a few epochs', () => {
    // Four examples: a plain hot dog (bun) and plain not-hot-dogs (no bun).
    const examples: Array<{ features: FeatureVector; label: 0 | 1 }> = [
      { features: makeFeatures(0, 0, 1), label: 1 },
      { features: makeFeatures(1, 0, 1), label: 1 },
      { features: makeFeatures(0, 0, 0), label: 0 },
      { features: makeFeatures(1, 1, 0), label: 0 },
    ]
    let params = zeroParams
    let lastEpochMistakes = Infinity
    for (let epoch = 0; epoch < 20; epoch++) {
      let mistakes = 0
      for (const example of examples) {
        const result = trainStep(params, example.features, example.label)
        params = result.params
        if (result.changed) mistakes++
      }
      lastEpochMistakes = mistakes
      if (mistakes === 0) break
    }
    expect(lastEpochMistakes).toBe(0)
    // Final params classify every training example correctly.
    for (const example of examples) {
      expect(classify(example.features, params)).toBe(example.label)
    }
  })
})
