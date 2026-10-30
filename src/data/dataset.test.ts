import { describe, expect, it } from 'vitest'
import {
  CHALLENGE_COLLECTION,
  DATASET,
  STARTER_COLLECTION,
  featureVectorKey,
  findContradictions,
  isLinearlySeparable,
} from './dataset'
import { FEATURE_KEYS } from '../engine/types'

describe('dataset shape', () => {
  it('has around 20 items with both classes represented', () => {
    expect(DATASET.length).toBeGreaterThanOrEqual(18)
    expect(DATASET.length).toBeLessThanOrEqual(24)
    expect(DATASET.some((item) => item.label === 1)).toBe(true)
    expect(DATASET.some((item) => item.label === 0)).toBe(true)
  })

  it('every item is well-formed: binary features, 0/1 label, non-empty alt text, unique id', () => {
    const seenIds = new Set<string>()
    for (const item of DATASET) {
      expect([0, 1]).toContain(item.label)
      for (const featureKey of FEATURE_KEYS) {
        expect([0, 1]).toContain(item.features[featureKey])
      }
      expect(item.alt_text.trim().length).toBeGreaterThan(0)
      expect(item.image).toMatch(/^food\/.+\.svg$/)
      expect(seenIds.has(item.id)).toBe(false)
      seenIds.add(item.id)
    }
  })

  it('splits into starter and challenge groups that partition the dataset', () => {
    expect(STARTER_COLLECTION.length + CHALLENGE_COLLECTION.length).toBe(DATASET.length)
    expect(STARTER_COLLECTION.every((item) => item.group === 'starter')).toBe(true)
    expect(CHALLENGE_COLLECTION.every((item) => item.group === 'challenge')).toBe(true)
  })
})

describe('dataset design requirement (spec §4)', () => {
  it('INVARIANT: the starter collection is linearly separable', () => {
    expect(isLinearlySeparable(STARTER_COLLECTION)).toBe(true)
  })

  it('INVARIANT: the starter collection contains NO identical-vector contradiction', () => {
    expect(findContradictions(STARTER_COLLECTION)).toHaveLength(0)
  })

  it('INVARIANT: the challenge collection introduces identical-vector contradictions', () => {
    const contradictions = findContradictions(DATASET)
    expect(contradictions.length).toBeGreaterThanOrEqual(1)
    // Every contradiction must involve at least one challenge item (the starter
    // set alone is contradiction-free, proven above).
    const challengeIds = new Set(CHALLENGE_COLLECTION.map((item) => item.id))
    for (const contradiction of contradictions) {
      const involvesChallenge =
        challengeIds.has(contradiction.hotDog.id) || challengeIds.has(contradiction.notHotDog.id)
      expect(involvesChallenge).toBe(true)
    }
  })

  it('INVARIANT: the full dataset (starter + challenge) is NOT linearly separable', () => {
    // A single identical-vector contradiction is already a definitive proof of
    // non-separability; the brute-force search must therefore find no witness.
    expect(isLinearlySeparable(DATASET)).toBe(false)
  })

  it('documents the hamburger/loaded-hot-dog (1,1,1) collision from the spec', () => {
    const loadedHotDog = DATASET.find((item) => item.id === 'hd_both')
    const hamburger = DATASET.find((item) => item.id === 'hamburger')
    expect(loadedHotDog).toBeDefined()
    expect(hamburger).toBeDefined()
    expect(featureVectorKey(loadedHotDog!.features)).toBe(featureVectorKey(hamburger!.features))
    expect(loadedHotDog!.label).not.toBe(hamburger!.label)
  })
})
