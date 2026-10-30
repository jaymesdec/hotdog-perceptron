/**
 * The pure perceptron core (spec §3, §9).
 *
 * Every function here is deterministic and free of I/O, randomness, and
 * mutation. These are the correctness-critical invariants the whole app
 * depends on, so they live in one small, independently-tested module.
 *
 * score      = Σ featureᵢ · weightᵢ + bias
 * prediction = 1 ("Hot dog") if score >= 0, else 0 ("Not hot dog")
 * error      = trueLabel − prediction
 * update     = classic rule, learning rate fixed at 1 (not exposed in v1):
 *                weightᵢ_new = weightᵢ_old + error · featureᵢ
 *                bias_new     = bias_old + error
 */

import {
  FEATURE_KEYS,
  type FeatureVector,
  type Label,
  type Params,
  type PerceptronError,
} from './types'

/** The decision threshold is fixed at zero (spec §3). */
export const DECISION_THRESHOLD = 0

/** The learning rate is fixed at 1 and intentionally not exposed in v1 (spec §3). */
export const LEARNING_RATE = 1

/** Weighted sum of the inputs plus the bias. This is the decision margin — the
 * signed distance from the decision line — never a probability (spec §3, §9). */
export function score(features: FeatureVector, params: Params): number {
  let runningScore = params.bias
  for (const featureKey of FEATURE_KEYS) {
    runningScore += features[featureKey] * params.weights[featureKey]
  }
  return runningScore
}

/** Step activation: a score at or above the threshold predicts "Hot dog". */
export function predict(scoreValue: number): Label {
  return scoreValue >= DECISION_THRESHOLD ? 1 : 0
}

/** Convenience: score then activate in one call. */
export function classify(features: FeatureVector, params: Params): Label {
  return predict(score(features, params))
}

/** error = trueLabel − prediction, so it is always -1, 0, or 1. */
export function computeError(trueLabel: Label, prediction: Label): PerceptronError {
  return (trueLabel - prediction) as PerceptronError
}

/**
 * The classic perceptron learning rule, as a pure function returning new params.
 *
 * Invariants enforced here (spec §9):
 *  - error === 0  ⇒  params are returned unchanged (correct ⇒ no update).
 *  - featureᵢ === 0  ⇒  weightᵢ is unchanged (zero input ⇒ zero weight update).
 *  - the bias update is independent of feature values.
 */
export function update(
  params: Params,
  features: FeatureVector,
  perceptronError: PerceptronError,
): Params {
  if (perceptronError === 0) {
    return params
  }

  const updatedWeights = { ...params.weights }
  for (const featureKey of FEATURE_KEYS) {
    updatedWeights[featureKey] =
      params.weights[featureKey] + LEARNING_RATE * perceptronError * features[featureKey]
  }

  return {
    weights: updatedWeights,
    bias: params.bias + LEARNING_RATE * perceptronError,
  }
}

/**
 * One full training step on a single labeled example. Returns the prediction
 * made with the PRE-update params (spec §9) and the resulting params. Pure.
 */
export interface TrainStepResult {
  readonly scoreValue: number
  readonly prediction: Label
  readonly error: PerceptronError
  readonly params: Params
  readonly changed: boolean
}

export function trainStep(
  params: Params,
  features: FeatureVector,
  trueLabel: Label,
): TrainStepResult {
  const scoreValue = score(features, params)
  const prediction = predict(scoreValue)
  const perceptronError = computeError(trueLabel, prediction)
  const nextParams = update(params, features, perceptronError)
  return {
    scoreValue,
    prediction,
    error: perceptronError,
    params: nextParams,
    changed: perceptronError !== 0,
  }
}
