/**
 * Deterministic seeded pseudo-randomness (spec §3, §9).
 *
 * The app must be fully reproducible: the same seed produces the same initial
 * weights and bias every time, enabling "Randomize", "Reset to this seed", and
 * the reproducibility invariant. Nothing in the engine ever calls Math.random.
 */

import { FEATURE_KEYS, type Params } from './types'

/** Smallest and largest initial parameter value (spec §3: bounded [-1, 1]). */
export const INITIAL_PARAM_MIN = -1
export const INITIAL_PARAM_MAX = 1

/**
 * mulberry32 — a tiny, fast, well-distributed 32-bit PRNG. Given a seed it
 * returns a generator producing numbers in [0, 1). Deterministic by construction.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return function next(): number {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

/** Map a unit-interval value into the bounded initial parameter range. */
function toParamRange(unitValue: number): number {
  const spanned = INITIAL_PARAM_MIN + unitValue * (INITIAL_PARAM_MAX - INITIAL_PARAM_MIN)
  // Round to two decimals so the workbench shows tidy, readable numbers.
  return Math.round(spanned * 100) / 100
}

/**
 * Produce a complete set of initial parameters from a seed. Pure: the same seed
 * always yields identical params, and every value lies within [-1, 1].
 */
export function randomParams(seed: number): Params {
  const next = createRandom(seed)
  const weights = {} as Params['weights']
  for (const featureKey of FEATURE_KEYS) {
    weights[featureKey] = toParamRange(next())
  }
  return {
    weights,
    bias: toParamRange(next()),
  }
}

/**
 * Derive a fresh integer seed from a previous one, deterministically. Used by
 * the "Randomize" control so repeated presses walk a reproducible sequence of
 * seeds rather than depending on wall-clock time.
 */
export function nextSeed(previousSeed: number): number {
  const next = createRandom(previousSeed)
  return Math.floor(next() * 0xffffffff) >>> 0
}
