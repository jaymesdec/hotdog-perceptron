/**
 * The labeled food collection (spec §4).
 *
 * These are SUPERVISED examples: the true label is always shown in the dataset
 * shelf. The perceptron itself only ever receives the three feature bits; the
 * label is used solely to evaluate and to drive training updates.
 *
 * ── Dataset design requirement (spec §4) ────────────────────────────────────
 * A three-feature perceptron cannot separate items with identical feature
 * vectors but opposite labels. We therefore ship two groups:
 *
 *   • STARTER collection — linearly separable by the `bun` feature, so learners
 *     can watch the model actually succeed. Every hot dog has a bun; no starter
 *     not-hot-dog has one. A separating rule exists (e.g. w_bun = 2, bias = -1).
 *
 *   • CHALLENGE collection — each item deliberately shares a feature vector with
 *     a starter item of the OPPOSITE label (a hamburger coded (1,1,1) collides
 *     with a loaded hot dog; a bunless hot dog coded (0,0,0) collides with pizza).
 *     No model using only these three features can ever tell such pairs apart —
 *     and more epochs will never fix it. The app surfaces this honestly (§7).
 *
 * The feature/label matrix is asserted in dataset.test.ts: the starter set is
 * proven separable by brute-force search, and the challenge set is proven to
 * introduce genuine identical-vector contradictions.
 */

import type { FeatureKey, FeatureVector, Label } from '../engine/types'
import { FEATURE_KEYS } from '../engine/types'

export type DatasetGroup = 'starter' | 'challenge'

export interface FoodItem {
  readonly id: string
  /** Path (relative to the app base) of the illustration asset. */
  readonly image: string
  readonly alt_text: string
  readonly name: string
  readonly label: Label
  readonly features: FeatureVector
  /** Optional educator note explaining an interesting ambiguity. */
  readonly note?: string
  readonly group: DatasetGroup
}

function food(
  id: string,
  name: string,
  label: Label,
  features: FeatureVector,
  alt_text: string,
  group: DatasetGroup,
  note?: string,
): FoodItem {
  return { id, name, label, features, alt_text, group, note, image: `food/${id}.svg` }
}

function features(ketchup: 0 | 1, mustard: 0 | 1, bun: 0 | 1): FeatureVector {
  return { ketchup, mustard, bun }
}

/**
 * STARTER — linearly separable by `bun`. Hot dogs all have bun = 1; none of the
 * not-hot-dogs do. A learner who trains on these can reach zero mistakes.
 */
const STARTER_ITEMS: readonly FoodItem[] = [
  // Hot dogs (label 1) — the four distinct bun = 1 feature vectors.
  food('hd_plain', 'Plain hot dog', 1, features(0, 0, 1), 'A plain hot dog in a bun.', 'starter'),
  food('hd_ketchup', 'Ketchup hot dog', 1, features(1, 0, 1), 'A hot dog in a bun with a ketchup stripe.', 'starter'),
  food('hd_mustard', 'Mustard hot dog', 1, features(0, 1, 1), 'A hot dog in a bun with a mustard stripe.', 'starter'),
  food('hd_both', 'Loaded hot dog', 1, features(1, 1, 1), 'A hot dog in a bun with both ketchup and mustard.', 'starter'),

  // Not hot dogs (label 0) — none have a bun.
  food('pizza_plain', 'Cheese pizza', 0, features(0, 0, 0), 'A slice of cheese pizza.', 'starter'),
  food('pizza_ketchup', 'Pizza with ketchup', 0, features(1, 0, 0), 'A pizza slice drizzled with ketchup.', 'starter'),
  food('pizza_mustard', 'Pizza with mustard', 0, features(0, 1, 0), 'A pizza slice drizzled with mustard.', 'starter'),
  food('pizza_km', 'Pizza with ketchup & mustard', 0, features(1, 1, 0), 'A pizza slice drizzled with ketchup and mustard — an amusing counterexample.', 'starter', 'Ketchup and mustard on a pizza: the condiments match a loaded hot dog, but there is no bun.'),
  food('fries', 'French fries', 0, features(0, 0, 0), 'A paper cone of french fries.', 'starter'),
  food('pretzel', 'Soft pretzel', 0, features(0, 0, 0), 'A twisted soft pretzel.', 'starter'),
  food('sushi', 'Sushi roll', 0, features(0, 0, 0), 'Two pieces of sushi.', 'starter'),
  food('taco', 'Taco', 0, features(0, 0, 0), 'A folded taco.', 'starter'),
  food('donut', 'Donut', 0, features(0, 0, 0), 'A glazed donut.', 'starter'),
  food('onion_rings', 'Onion rings', 0, features(0, 0, 0), 'A stack of onion rings.', 'starter'),
]

/**
 * CHALLENGE — each collides with a starter item of the opposite label, exposing
 * the insufficiency of three features (spec §4, §7).
 */
const CHALLENGE_ITEMS: readonly FoodItem[] = [
  food('hamburger', 'Hamburger', 0, features(1, 1, 1), 'A hamburger in a bun with ketchup and mustard.', 'challenge', 'Same features as the loaded hot dog (1,1,1), but it is not a hot dog. The model cannot tell them apart.'),
  food('cheeseburger', 'Cheeseburger', 0, features(1, 0, 1), 'A cheeseburger in a bun with ketchup.', 'challenge', 'Shares the ketchup-hot-dog feature vector (1,0,1) with the opposite label.'),
  food('mustard_burger', 'Mustard burger', 0, features(0, 1, 1), 'A burger in a bun with mustard.', 'challenge', 'Shares the mustard-hot-dog feature vector (0,1,1) with the opposite label.'),
  food('empty_bun', 'Empty bun', 0, features(0, 0, 1), 'An empty hot dog bun with nothing inside.', 'challenge', 'A bun with no sausage. Identical features to a plain hot dog (0,0,1), opposite label.'),
  food('bunless_hotdog', 'Bunless hot dog', 1, features(0, 0, 0), 'A hot dog served on a plate with no bun.', 'challenge', 'A real hot dog, but with no bun the features (0,0,0) look exactly like plain pizza or fries.'),
  food('corndog', 'Corn dog', 1, features(0, 0, 0), 'A corn dog on a stick.', 'challenge', 'A hot dog in cornbread on a stick — no bun feature, so (0,0,0) collides with the not-hot-dogs.'),
]

export const DATASET: readonly FoodItem[] = [...STARTER_ITEMS, ...CHALLENGE_ITEMS]

export const STARTER_COLLECTION = STARTER_ITEMS
export const CHALLENGE_COLLECTION = CHALLENGE_ITEMS

export function getItem(id: string): FoodItem | undefined {
  return DATASET.find((item) => item.id === id)
}

/** A canonical string key for a feature vector, e.g. "1,0,1". */
export function featureVectorKey(vector: FeatureVector): string {
  return FEATURE_KEYS.map((featureKey) => vector[featureKey]).join(',')
}

/**
 * Find every pair of items that share an identical feature vector but carry
 * opposite labels. Such a pair is a definitive proof of feature insufficiency:
 * no function of the three features can classify both correctly.
 */
export interface Contradiction {
  readonly vectorKey: string
  readonly hotDog: FoodItem
  readonly notHotDog: FoodItem
}

export function findContradictions(items: readonly FoodItem[]): Contradiction[] {
  const byVector = new Map<string, FoodItem[]>()
  for (const item of items) {
    const key = featureVectorKey(item.features)
    const bucket = byVector.get(key) ?? []
    bucket.push(item)
    byVector.set(key, bucket)
  }

  const contradictions: Contradiction[] = []
  for (const [vectorKey, bucket] of byVector) {
    const hotDog = bucket.find((item) => item.label === 1)
    const notHotDog = bucket.find((item) => item.label === 0)
    if (hotDog && notHotDog) {
      contradictions.push({ vectorKey, hotDog, notHotDog })
    }
  }
  return contradictions
}

/**
 * Brute-force search for integer weights and bias (within ±range) that classify
 * every given item correctly. Returns a witness when one exists. Finding a
 * witness proves linear separability; this is used to guarantee the starter set
 * stays learnable even as authors edit the data.
 */
export function findSeparatingParams(
  items: readonly FoodItem[],
  range = 3,
): { weights: Record<FeatureKey, number>; bias: number } | null {
  for (let weightKetchup = -range; weightKetchup <= range; weightKetchup++) {
    for (let weightMustard = -range; weightMustard <= range; weightMustard++) {
      for (let weightBun = -range; weightBun <= range; weightBun++) {
        for (let bias = -range; bias <= range; bias++) {
          const candidate = {
            weights: { ketchup: weightKetchup, mustard: weightMustard, bun: weightBun },
            bias,
          }
          const classifiesAll = items.every((item) => {
            const scoreValue =
              item.features.ketchup * candidate.weights.ketchup +
              item.features.mustard * candidate.weights.mustard +
              item.features.bun * candidate.weights.bun +
              candidate.bias
            const prediction = scoreValue >= 0 ? 1 : 0
            return prediction === item.label
          })
          if (classifiesAll) return candidate
        }
      }
    }
  }
  return null
}

export function isLinearlySeparable(items: readonly FoodItem[], range = 3): boolean {
  return findSeparatingParams(items, range) !== null
}
