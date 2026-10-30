/**
 * Core domain types shared by the engine, dataset, and app state.
 *
 * Version one fixes three binary features (spec §3). Keeping them as a named
 * record (rather than a positional array) makes the workbench wiring and the
 * live equation read naturally, and keeps call sites self-documenting.
 */

export type FeatureKey = 'ketchup' | 'mustard' | 'bun'

/** The three features, in the fixed display order used across the UI. */
export const FEATURE_KEYS: readonly FeatureKey[] = ['ketchup', 'mustard', 'bun']

/** Human-facing labels for each feature. */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  ketchup: 'Ketchup',
  mustard: 'Mustard',
  bun: 'Bun',
}

/** A binary feature value: present (1) or absent (0). */
export type Bit = 0 | 1

/** The numeric features a perceptron actually receives — never the picture. */
export type FeatureVector = Record<FeatureKey, Bit>

/** 1 means "Hot dog", 0 means "Not hot dog". */
export type Label = 0 | 1

/** The learnable parameters: one weight per feature plus a single bias. */
export interface Params {
  weights: Record<FeatureKey, number>
  bias: number
}

/** error = label − prediction, so it is always -1, 0, or 1. */
export type PerceptronError = -1 | 0 | 1
