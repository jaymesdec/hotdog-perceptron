import { describe, expect, it } from 'vitest'
import { FEATURE_KEYS } from './types'
import {
  createRandom,
  INITIAL_PARAM_MAX,
  INITIAL_PARAM_MIN,
  nextSeed,
  randomParams,
} from './rng'

describe('createRandom', () => {
  it('is deterministic: same seed yields the same sequence', () => {
    const first = createRandom(42)
    const second = createRandom(42)
    for (let step = 0; step < 10; step++) {
      expect(first()).toBe(second())
    }
  })

  it('produces values in [0, 1)', () => {
    const next = createRandom(123)
    for (let step = 0; step < 1000; step++) {
      const value = next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('different seeds generally produce different first values', () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)())
  })
})

describe('randomParams', () => {
  it('INVARIANT: same seed produces identical params (reproducibility)', () => {
    expect(randomParams(7)).toEqual(randomParams(7))
  })

  it('INVARIANT: every weight and the bias lie within [-1, 1]', () => {
    for (const seed of [0, 1, 42, 999, 123456]) {
      const params = randomParams(seed)
      for (const featureKey of FEATURE_KEYS) {
        expect(params.weights[featureKey]).toBeGreaterThanOrEqual(INITIAL_PARAM_MIN)
        expect(params.weights[featureKey]).toBeLessThanOrEqual(INITIAL_PARAM_MAX)
      }
      expect(params.bias).toBeGreaterThanOrEqual(INITIAL_PARAM_MIN)
      expect(params.bias).toBeLessThanOrEqual(INITIAL_PARAM_MAX)
    }
  })

  it('produces tidy two-decimal numbers for display', () => {
    const params = randomParams(42)
    for (const featureKey of FEATURE_KEYS) {
      const rounded = Math.round(params.weights[featureKey] * 100) / 100
      expect(params.weights[featureKey]).toBe(rounded)
    }
  })

  it('different seeds generally produce different params', () => {
    expect(randomParams(1)).not.toEqual(randomParams(2))
  })
})

describe('nextSeed', () => {
  it('is deterministic', () => {
    expect(nextSeed(42)).toBe(nextSeed(42))
  })

  it('returns a non-negative 32-bit integer', () => {
    const seed = nextSeed(42)
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThanOrEqual(0xffffffff)
  })

  it('generally advances to a different seed', () => {
    expect(nextSeed(42)).not.toBe(42)
  })
})
