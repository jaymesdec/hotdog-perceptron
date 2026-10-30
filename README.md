# Hot Dog or Not? — An Explorable Perceptron

A delightful, browser-based interactive explanation in which students act as AI
researchers. They sort labeled food images into training and testing trays,
inspect a single perceptron, train it one example at a time with the classic
perceptron learning rule, and test it on held-out images. Every computation and
parameter change is visible, causally connected to an action, and reversible.

Built for high-school learners meeting supervised machine learning for the first
time. Single perceptron, three binary features (ketchup, mustard, bun). No
backend, no accounts, no API keys — everything ships locally.

## Run it

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build (static assets in dist/)
npm test         # run the test suite (Vitest)
```

## How it's built

- **`src/engine/`** — the correctness core. `perceptron.ts` is a pure,
  dependency-free implementation of score / predict / error / update; `rng.ts`
  is a seeded deterministic PRNG; `state.ts` holds the immutable app state and a
  pure reducer. All of the spec's §9 invariants are enforced and tested here,
  independently of any UI.
- **`src/data/dataset.ts`** — ~20 labeled foods split into a linearly-separable
  **starter** collection and **challenge** examples that expose the insufficiency
  of three features. Separability and the identical-vector contradictions are
  proven by tests.
- **`src/components/`** — the presentation layer. Components render state and
  dispatch intents; they contain no learning math.

### A note on the score

The number on the score track is a **distance from the decision line** — a
signed margin — not a probability or a confidence percentage. The UI never
labels it "% confident".

## Scope (version one)

A single perceptron only. No hidden layers, gradient descent, backpropagation,
learning-rate control, or feature editing. See
`docs/plans/2026-10-30-001-feat-hot-dog-perceptron-explorable-plan.md` for the
full plan and the deliberately-excluded future work.
