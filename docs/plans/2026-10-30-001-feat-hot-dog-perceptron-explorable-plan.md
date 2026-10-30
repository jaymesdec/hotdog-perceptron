---
title: "feat: Hot Dog or Not? — Explorable Perceptron"
type: feat
status: active
date: 2026-10-30
origin: /Users/jdec/Downloads/hot_dog_perceptron_explorable_spec.md
---

# feat: Hot Dog or Not? — Explorable Perceptron

## Overview

Build a delightful, browser-first interactive explanation in which high-school learners act as AI researchers: they assign labeled food images into training/testing trays, inspect a single perceptron, train it one example at a time with the classic perceptron learning rule, and test it on held-out images. Every computation and parameter change is visible, causally connected to an action, and reversible.

The deliverable is a self-contained static single-page app (no backend, no API key, assets shipped locally). The learning engine is a deterministic, pure, independently-tested module; the UI is a separate presentation layer that animates engine state transitions.

**Hard scope boundary from the spec: single perceptron only. No multilayer network, no gradient descent, no backprop, no learning-rate control in v1.**

## Problem Frame

High schoolers meeting supervised ML need to internalize eight concrete ideas (see Requirements Trace) by *doing*, not reading. The spec (origin document) specifies a "responsive scientific toy" inspired by Bret Victor's immediate feedback and Nicky Case's explorable explanations — original interaction design, no copied assets. The central pedagogical risk the spec calls out explicitly: a 3-feature perceptron **cannot** separate items with identical feature vectors but opposite labels, and the app must make that limitation honest and visible rather than implying "more epochs will fix it."

## Requirements Trace

Learning outcomes the app must make explorable (origin §2):
- R1. A perceptron receives numeric features, not picture understanding.
- R2. Each input has a weight; weighted inputs + bias produce a score.
- R3. A step activation converts score → binary prediction (`>= 0` ⇒ Hot dog).
- R4. A labeled example provides a target to compare against the prediction.
- R5. Classic rule: mistakes change weights/bias; correct predictions do not.
- R6. Training changes parameters; testing evaluates without changing them.
- R7. Epochs and example selection affect learning.
- R8. A model can fail from insufficient features or an unrepresentative dataset.

Behavioral/correctness criteria (origin §9, §11):
- R9. Deterministic pure perceptron function, unit-tested independently of UI.
- R10. Invariants: no mutation in test/baseline mode; correct ⇒ no update; zero-valued feature ⇒ zero weight change; bias update independent of feature values; same seed + data order + actions reproduce the run; current-example prediction uses pre-update weights.
- R11. Score is a *decision margin / distance from decision line*, never a probability or "% confident."
- R12. Dataset must be checked for linear separability; ship a learnable **starter collection** plus honest **challenge examples** that expose feature insufficiency (identical-vector contradiction).
- R13. Full learner journey (origin §11): assign train/test images → inspect 3 binary features → see random init weights/bias → predict & reveal → train step-by-step with correct updates → multiple epochs → test on held-out images without updating → review mistakes → reset and reproduce a run.

UX/accessibility criteria (origin §5–§10):
- R14. Dataset shelf with labeled cards + feature chips; train/test trays; warnings (empty tray, single-class training, conflicting feature-label combos).
- R15. Live workbench: inputs → weighted connections → sum+bias → threshold → prediction, spatially causal; signed weight bars (negative visibly differs from positive); separate bias block; live equation; score track with fixed zero threshold + moving marker; large binary output.
- R16. Contextual controls (not all at once) + persistent progress indicator `Example N of M · Epoch K`.
- R17. Learning history timeline + optional mistakes-per-epoch chart (must NOT promise monotonic decrease).
- R18. Accessibility: reduced-motion support, keyboard alternatives, color-independent indicators, text equivalents for motion/audio, sound muted by default, responsive on laptop/tablet/touch.
- R19. Local-storage persistence (if feasible) with **Start over**.
- R20. "Explain this" affordance + "Show the math" toggle.

## Scope Boundaries

Explicit non-goals for v1 (origin §12):
- No multilayer network, hidden layers, or backpropagation.
- No gradient descent, probability calibration, or learning-rate slider (rate fixed at 1, not exposed).
- No feature selection / manual feature labeling / new-feature creation.
- No smallest-training-set challenge game, no competitive scoring, no timers.
- No teacher dashboard, no accounts, no backend, no network calls at runtime.
- No advanced charts beyond mistakes-per-epoch.

### Deferred to Separate Tasks
- Polished AI-generated food illustration set (Unit 14): the app ships functional with SVG/emoji illustrations; swapping in generated art is an isolated, optional upgrade that does not block v1 acceptance.
- Future-version features above (feature `sausage`, etc.): out of scope entirely.

## Context & Research

### Relevant Code and Patterns
- Greenfield: working dir `/Users/jdec/Documents/hotdog-perceptron` is empty; no existing code to mirror.
- Franklin ecosystem convention (parent `Documents/CLAUDE.md`): Node projects use `npm`, Tailwind CSS. Adopt that for consistency.
- `franklin-design` skill is available for Franklin brand tokens (color/type/UI kit). Treat as an optional reference for cohesive styling; the spec's own playful, original aesthetic leads. Do **not** copy Victor/Case visual assets.

### Institutional Learnings
- None on disk (`docs/solutions/` does not exist in this greenfield project). The spec's §9 invariants and §4 dataset-design requirement are the authoritative "gotchas" and are encoded directly into Units 2 and 3.

### External References
- Classic perceptron learning rule (Rosenblatt): `w_i += (target − prediction) · x_i`, `bias += (target − prediction)`, step activation at threshold 0. Fixed in origin §3; no external research needed — the algorithm is small, closed-form, and fully specified.
- Linear separability check for the starter set is a simple finite enumeration (8 feature patterns), computed directly in Unit 3's data-authoring step.

## Key Technical Decisions

- **Stack: Vite + React + TypeScript + Tailwind CSS + Vitest.** Rationale: static-deployable SPA with zero backend (satisfies §10); TypeScript makes the engine's numeric invariants explicit and testable; Vitest tests the pure engine independently of the UI (R9); Tailwind matches Franklin convention. React component tree maps cleanly to the spatially-causal workbench (R15).
- **Engine/UI separation.** A framework-free `perceptron` engine module (pure functions + a reducer over an immutable app-state shape) holds *all* learning logic and invariants. React only renders state and dispatches intents. This is what makes R9/R10 enforceable and lets the signature animations be pure presentation. (origin §9)
- **Seeded deterministic RNG** (small mulberry32/xmorshift-style PRNG seeded by an integer) for initial weights/bias in `[-1, 1]`. Enables **Randomize**, **Reset to this seed**, and the reproducibility invariant (R10). No `Math.random()` in engine paths.
- **State transitions are explicit and reversible.** App state carries a step-phase machine and an undo stack of prior states (bounded). "Undo last step" pops; history snapshots are derived from the recorded transitions. (origin §5C, §9)
- **Score is a decision margin.** All UI copy and labels say "score / distance from decision line." A lint-style test asserts the strings "%", "confiden", "probab" never appear in score-display components. (R11, origin §3)
- **Animation via a restrained motion layer** (Framer Motion or CSS transitions) that is fully gated by `prefers-reduced-motion` and a global toggle; animations never gate correctness — engine state is correct the instant a transition is dispatched, independent of animation completion. (R18, origin §7)
- **Dataset is authored as a typed data file plus a build-time/test-time separability assertion.** The starter collection is proven linearly separable by an actual test; challenge examples are flagged `challenge: true` and the identical-vector contradiction is asserted to exist. (R12, origin §4)
- **Persistence via `localStorage`** behind a thin serializer, versioned, with graceful fallback if unavailable. **Start over** clears it. (R19)

## Open Questions

### Resolved During Planning
- Framework choice: React + Vite + TS (see Key Technical Decisions).
- Image strategy for v1: ship cohesive SVG/emoji-styled illustration cards so the app is fully functional and self-contained; generated art is an optional later swap (Unit 14). Resolves the origin §14 "final food-image style" open decision for v1 without blocking.
- Manual sliders: exposed only in the opening sandbox (origin §14 recommended default).
- Test-label visibility: reveal test correctness *after* prediction, while test-set labels remain visible in the dataset shelf (origin §14 recommended default + §5B).
- Feature editing: features are prefilled and read-only in v1 (origin §14 recommended default).

### Deferred to Implementation
- Exact component/hook/file names beyond those listed per unit (choose idiomatically during implementation).
- Precise easing/duration values for the "threshold crossing" and "learning pulse" transitions (tune against real rendering; must respect reduced-motion).
- Exact Tailwind token values / whether to pull specific Franklin brand colors (decide while building Unit 1 styling; must keep color-independent indicators per R18).
- Whether the mistakes-per-epoch chart is hand-rolled SVG or a tiny chart helper (decide in Unit 9; must not imply monotonic decrease).

## Output Structure

    hotdog-perceptron/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── vitest.config.ts
    ├── docs/
    │   └── plans/ (this plan)
    ├── public/
    │   └── assets/food/            # SVG/emoji illustration assets (+ generated art in Unit 14)
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── engine/                 # framework-free, pure, fully tested (R9/R10)
        │   ├── perceptron.ts       # score, predict, error, update (pure)
        │   ├── rng.ts              # seeded deterministic PRNG
        │   ├── state.ts            # AppState shape + reducer + intents + undo
        │   ├── perceptron.test.ts
        │   ├── rng.test.ts
        │   └── state.test.ts
        ├── data/
        │   ├── dataset.ts          # typed dataset + feature/label matrix
        │   └── dataset.test.ts     # separability + contradiction assertions
        ├── components/             # presentation only, dispatch intents
        │   ├── DatasetShelf/
        │   ├── Workbench/          # inputs, weight bars, bias, equation, score track, output, SVG wiring
        │   ├── Controls/
        │   ├── History/
        │   ├── Sandbox/
        │   ├── TestMode/
        │   ├── Reflect/
        │   └── common/             # ExplainThis, ShowMathToggle, indicators
        ├── hooks/
        │   ├── usePersistence.ts
        │   └── useReducedMotion.ts
        └── styles/

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Causal data flow the UI must make spatially obvious (origin §5B):**

```
 inputs (ketchup,mustard,bun ∈ {0,1})
      │  × weights (signed bars)
      ▼
   products ── Σ ──(+ bias block)──► score ──► [ threshold @ 0 ] ──► HOT DOG / NOT HOT DOG
                                        │
                              (training only) compare to label ⇒ error = label − prediction
                                        │
                              error ≠ 0 ⇒ update active-input weights + bias (learning pulse)
```

**Engine contract (pure; the correctness core, R9/R10):**

```
score(features, params)      -> number            // Σ xᵢ·wᵢ + bias
predict(score)               -> 0 | 1             // score >= 0 ? 1 : 0
computeError(label, pred)    -> -1 | 0 | 1         // label − pred
update(params, features, err)-> params'           // wᵢ' = wᵢ + err·xᵢ ; bias' = bias + err
                                                   // err = 0 ⇒ params unchanged (identity)
randomParams(seed)           -> params in [-1,1]   // deterministic from seed
```

**App state machine (step phases for Scene 4, origin §6):**

```
SELECT ─► BASELINE ─► TRAIN{ show → predict → compare → (await) → applyUpdate | noUpdate → next } ─► EPOCH_END ─┐
   ▲                                                                                                           │
   └──────────────────────────── (another epoch, params retained) ◄───────────────────────────────────────────┘
                                                                     └─► TEST{ locked params } ─► REFLECT
```

Every transition is a reducer intent; `undo` pops a bounded prior-state stack. Baseline and Test intents are *forbidden* from calling `update` (asserted in tests, R10).

## Implementation Units

Grouped into phases mirroring the spec's suggested build sequence (origin §13): engine-first, then selection/testing, then history/epochs/seeds, then polish/assets/a11y.

### Phase 1 — Correctness core

- [ ] **Unit 1: Project scaffolding & tooling**

**Goal:** Stand up the Vite + React + TS + Tailwind + Vitest project that builds and serves a blank shell.

**Requirements:** Enables all; satisfies §10 (static, no backend).

**Dependencies:** None.

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`
- Test: `src/engine/smoke.test.ts` (trivial test proving Vitest runs)

**Approach:**
- React 19 + Vite + TS strict mode; Tailwind 4 configured; Vitest with jsdom for component tests later.
- App.tsx renders a placeholder; no business logic yet.

**Patterns to follow:** Franklin Node convention (npm, Tailwind) from parent `CLAUDE.md`.

**Test scenarios:**
- Test expectation: none beyond a smoke test — scaffolding has no behavior. Verify `npm run build`, `npm run dev`, `npm test` all succeed.

**Verification:** Dev server serves a blank page; `npm test` runs green; production build emits static assets.

- [ ] **Unit 2: Pure perceptron engine + seeded RNG**

**Goal:** Implement the deterministic, framework-free learning core and prove every §9 invariant with tests.

**Requirements:** R1, R2, R3, R4, R5, R9, R10.

**Dependencies:** Unit 1.

**Files:**
- Create: `src/engine/perceptron.ts`, `src/engine/rng.ts`
- Test: `src/engine/perceptron.test.ts`, `src/engine/rng.test.ts`

**Approach:**
- `perceptron.ts`: pure `score`, `predict` (`>=0 ⇒ 1`), `computeError`, `update` per origin §3. No I/O, no randomness, no mutation — `update` returns new params.
- `rng.ts`: seeded PRNG (e.g. mulberry32) → `randomParams(seed)` producing weights/bias in `[-1,1]`.
- Fixed learning rate = 1, not parameterized/exposed.

**Execution note:** Implement test-first — the §9 invariants are the spec of this unit; write the invariant assertions before the implementation.

**Technical design:** See engine contract in High-Level Technical Design.

**Patterns to follow:** None (new core); keep it dependency-free.

**Test scenarios:**
- Happy path: `score({k:1,m:0,b:1},{wk,wm,wb,bias})` equals `1·wk + 0·wm + 1·wb + bias`.
- Happy path: `predict` returns 1 at score 0 and above, 0 below (boundary at exactly 0 ⇒ 1).
- Happy path: `computeError(1, 0) = 1`, `computeError(0, 1) = -1`, `computeError(1,1)=0`.
- Edge/invariant (R10): `error = 0` ⇒ `update` returns params deep-equal to input (correct ⇒ no update).
- Edge/invariant (R10): feature `xᵢ = 0` ⇒ that weight unchanged after update, even when error ≠ 0.
- Edge/invariant (R10): bias update = `bias + error`, independent of feature values.
- Edge/invariant (R10): `randomParams(seed)` is pure — same seed ⇒ identical params; different seed ⇒ (generally) different; all values within `[-1,1]`.
- Edge: a known fixture (hand-computed example) trains to a correct classifier over a fixed sequence, asserting exact old→new params at each step.

**Verification:** All invariant tests pass; engine has zero imports from React/DOM.

### Phase 2 — Dataset & app state

- [ ] **Unit 3: Dataset authoring + separability/contradiction checks**

**Goal:** Author ~20 labeled items with 3 binary features, split into a **linearly-separable starter collection** and **challenge examples**, and prove the separability/contradiction properties by test.

**Requirements:** R8, R11, R12, R14; origin §4.

**Dependencies:** Unit 2 (uses engine types).

**Files:**
- Create: `src/data/dataset.ts`
- Test: `src/data/dataset.test.ts`

**Approach:**
- Each item: `id, image (asset path), alt_text, label (0|1), features {ketchup,mustard,bun}, note?, challenge?`.
- Starter collection designed separable with `bun` as the discriminator, e.g. hot dogs have `bun=1` (plain/ketchup/mustard/both), non-hot-dogs have `bun=0` (pizza, pizza+ketchup, pizza+ketchup+mustard, fries). Separating params exist: `w_bun>0`, `bias<0` so `bun=1 ⇒ score≥0`.
- Challenge examples intentionally break 3-feature sufficiency: a **hamburger coded `(1,1,1)` labeled Not hot dog** collides with **hot-dog-with-both `(1,1,1)` labeled Hot dog** — identical vectors, opposite labels (origin §4 example). Flag `challenge: true`.
- Author an explicit feature/label matrix as a comment/table in the file.

**Patterns to follow:** None; this is the data source of truth.

**Test scenarios:**
- Happy path: every item has all required fields and features ∈ {0,1}; label ∈ {0,1}.
- Invariant (R12): the **starter collection is linearly separable** — a brute-force/finite search over integer params finds weights+bias classifying all starter items correctly (test fails loudly if authors break it).
- Invariant (R12): the **challenge set contains at least one identical-vector contradiction** — two items share a feature vector with opposite labels.
- Edge: starter + challenge combined is **not** perfectly separable (asserts the honest limitation exists).
- Edge: dataset size is ~20 and has both classes represented.

**Verification:** Tests prove separability of starter and existence of the contradiction; matrix documented in-file.

- [ ] **Unit 4: App state model, reducer, intents & undo**

**Goal:** Define the immutable `AppState` and a pure reducer covering every intent, step-phase, and the undo stack — the backbone the whole UI dispatches into.

**Requirements:** R5, R6, R7, R9, R10, R13, R16, R17.

**Dependencies:** Units 2, 3.

**Files:**
- Create: `src/engine/state.ts`
- Test: `src/engine/state.test.ts`

**Approach:**
- `AppState`: dataset assignments (train/test/unassigned), selectedExampleIndex, params {weights,bias}, seed, epoch, stepPhase, lastPrediction, lastTarget, lastError, history[], runComparisons[], mode (`select|baseline|train|test|reflect|sandbox`), undo stack (bounded).
- Intents: `assignCard`, `randomize(seed)`, `resetToSeed`, `predict`, `compareToLabel`, `applyUpdate`, `skipUpdate`, `nextExample`, `nextEpoch`, `runOneEpoch`, `enterTest`, `enterBaseline`, `undo`, `startOver`, plus sandbox param tweaks.
- Baseline/test intents evaluate via engine but **never** call `update` (enforced & tested).
- Prediction for the current training example uses pre-update params (R10).

**Execution note:** Test-first — the reducer encodes the §9 invariants at the application level; write invariant tests before the reducer.

**Technical design:** See app state machine in High-Level Technical Design.

**Patterns to follow:** Unit 2 engine functions (reducer composes them; holds no math of its own).

**Test scenarios:**
- Happy path: `predict` → `compareToLabel` → `applyUpdate` produces params matching `engine.update` and appends a history entry with before/after snapshot.
- Invariant (R10): in `baseline` and `test` modes, `applyUpdate`/any evaluation leaves params unchanged (dispatching an update intent is a no-op or rejected).
- Invariant (R10): correct prediction path records "No update" and leaves params identical.
- Invariant (R10): reproducibility — same seed + same assignment order + same intent sequence ⇒ identical final `AppState` params and history.
- Edge: `undo` after `applyUpdate` restores exact prior params and trims history; `undo` at start is a safe no-op.
- Edge: `runOneEpoch` iterates the full training set once, retaining params across examples, incrementing epoch at the end.
- Edge: `nextExample` past the last training example transitions to `EPOCH_END`, not out of bounds.
- Integration: `assignCard` moving a test item into training emits a "compromises held-out test" warning flag in state (R14, origin §9).

### Phase 3 — Core UI surfaces

- [ ] **Unit 5: Dataset shelf & train/test trays**

**Goal:** Build the playful labeled-card grid and the training/testing trays with drag/click assignment, reassignment, and warnings.

**Requirements:** R13, R14; origin §5A, §6 Scene 2.

**Dependencies:** Units 3, 4.

**Files:**
- Create: `src/components/DatasetShelf/*`
- Test: `src/components/DatasetShelf/DatasetShelf.test.tsx`

**Approach:**
- Card shows food illustration, **Hot dog / Not hot dog** label (always visible — supervised, not mystery), three feature chips (present/absent + 0/1).
- Click-to-assign (primary) and drag-to-assign (enhancement) into Training/Testing trays; easy reassignment; optional default balanced split offered, never mandatory.
- Warnings: empty tray, single-class training set, conflicting feature-label combos present in training (surface the limitation early), and moving a test item into training.

**Patterns to follow:** Unit 4 intents (`assignCard`); color-independent chips (icon+text, not color alone) per R18.

**Test scenarios:**
- Happy path: clicking a card into Training dispatches `assignCard` and the card appears in the Training tray with its label + chips.
- Happy path: reassigning a card between trays updates both trays.
- Edge/warning (R14): empty training or testing tray renders a visible warning.
- Edge/warning (R14): training set with only one class renders a single-class warning.
- Edge/warning (R14): a feature-label conflict in the training set surfaces a warning explaining identical features/opposite labels.
- Accessibility: cards and trays are keyboard-operable (assign without drag) and labels are not conveyed by color alone.

- [ ] **Unit 6: Live perceptron workbench**

**Goal:** The always-visible workbench that renders the full causal chain: inputs → weighted SVG connections → products → sum+bias → score track → binary output.

**Requirements:** R2, R3, R11, R15; origin §5B, §7.

**Dependencies:** Unit 4.

**Files:**
- Create: `src/components/Workbench/*` (Inputs, WeightBars, BiasBlock, Equation, ScoreTrack, OutputIndicator, Wiring SVG)
- Test: `src/components/Workbench/Workbench.test.tsx`

**Approach:**
- Current food image + label (label visible in training; see Unit 10 for test-mode reveal behavior).
- Three input chips feeding visibly-drawn weighted SVG connections; three signed weight bars where negative weights are visually distinct from positive (direction/shape + label, not just color — R18); separate **bias** block shown as a constant added to the sum (not a weight on a feature).
- Live equation showing each product, the sum, and the bias, with exact numbers.
- Score track with fixed zero threshold and a moving marker; large **HOT DOG / NOT HOT DOG** output.
- Label the score **"score / distance from decision line"** — never a probability/confidence. (R11)

**Patterns to follow:** Unit 2 `score`/`predict` consumed via state (workbench computes nothing itself); SVG per §10.

**Test scenarios:**
- Happy path: given params and a feature vector, the equation shows each product and the correct sum+bias; the output indicator matches `predict(score)`.
- Happy path: score marker position reflects sign/magnitude of score relative to the zero threshold.
- Edge (R11): the component tree contains no "%", "confidence", or "probability" strings for the score (guard test).
- Edge (R15): a negative weight is distinguishable from a positive one by a non-color cue (asserted via text/ARIA/shape attribute).
- Edge: at score exactly 0, output reads HOT DOG (threshold inclusive, matching engine).

### Phase 4 — Learning flow

- [ ] **Unit 7: Learning controls + contextual reveal + progress indicator**

**Goal:** Implement the control set, revealed contextually by mode/phase, plus the persistent progress indicator.

**Requirements:** R16; origin §5C.

**Dependencies:** Units 4, 6.

**Files:**
- Create: `src/components/Controls/*`
- Test: `src/components/Controls/Controls.test.tsx`

**Approach:**
- Controls: Randomize, Reset (to seed), Predict, Compare to label, Apply learning update, Next example, Next epoch, Run one epoch, Pause, Undo last step.
- Reveal contextually per step-phase (not all at once); map each control to the intent from Unit 4.
- Persistent indicator `Example N of M · Epoch K`.

**Patterns to follow:** Unit 4 intents; Unit 6 for shared layout.

**Test scenarios:**
- Happy path: each control dispatches its mapped intent.
- Edge (R16): controls not valid in the current phase are hidden/disabled (e.g. Apply update hidden before Compare; all update controls hidden in test mode).
- Edge: progress indicator reflects current example index, training-set size, and epoch.
- Edge: Undo is disabled when the undo stack is empty.
- Accessibility: all controls keyboard-focusable with accessible names (R18).

- [ ] **Unit 8: Step-by-step training flow (Scene 4) + learning pulse**

**Goal:** Orchestrate the per-example training choreography with its signature "visible learning pulse," honest "No update" display, and before/after history snapshot.

**Requirements:** R5, R10, R13; origin §6 Scene 4, §7.

**Dependencies:** Units 6, 7.

**Files:**
- Create: `src/components/Workbench/TrainingFlow.tsx` (+ motion helpers)
- Test: `src/components/Workbench/TrainingFlow.test.tsx`

**Approach:**
- Phase sequence: show image+features → animate inputs along weighted connections → reveal each product + sum+bias → place score marker + show prediction → compare with label, show `error = label − prediction` → invite learner to predict *which params will change* → on **Apply update** animate exact old→new weights/bias, highlighting only changed values → if correct, show **"No update: prediction matched label"** → snapshot before/after into history.
- Learning pulse: only **active-input** connections and the bias pulse when they change; inactive features stay still (origin §7).
- Do **not** auto-recompute a second prediction as another training example; offer an optional **See updated prediction** peek.
- Prediction uses pre-update params (R10).

**Patterns to follow:** Unit 4 intents for every transition (animation is pure presentation, never gates state correctness).

**Test scenarios:**
- Happy path (mistake): wrong prediction → error shown → Apply update changes exactly the active-input weights + bias; history gets a before/after snapshot.
- Happy path (correct): correct prediction → "No update: prediction matched label" shown; params unchanged; no pulse on any connection.
- Edge/invariant (R10): a zero-valued active feature's weight is not among the highlighted/changed values.
- Edge: "See updated prediction" peek does not advance the example counter or mutate params as a new training step.
- Integration: completing all examples transitions to the epoch-end summary (hands off to Unit 9).
- Accessibility: with reduced motion on, the same state transitions occur instantly with text equivalents (R18) — no information conveyed by animation alone.

- [ ] **Unit 9: Baseline eval, epochs & mistakes-per-epoch chart**

**Goal:** Implement Scene 3 baseline evaluation (no updates) and Scene 5 epochs with retained params, plus the honest mistakes-per-epoch chart.

**Requirements:** R6, R7, R17; origin §6 Scenes 3 & 5, §5D.

**Dependencies:** Units 4, 8.

**Files:**
- Create: `src/components/History/MistakesChart.tsx`, `src/components/Workbench/BaselineEval.tsx`, `src/components/Workbench/EpochSummary.tsx`
- Test: `src/components/History/MistakesChart.test.tsx`, `src/engine/state.test.ts` (extend epoch/baseline cases)

**Approach:**
- Baseline: freeze randomized start params, evaluate across selected training (and optionally held-out) examples **without updating**, show initial correct-count clearly marked "before learning."
- Epoch: end-of-set mistake count; offer another pass with params retained; define *epoch* = "one pass through the training set"; optional shuffle order with a visible indicator.
- Chart: mistakes per epoch, explicitly **not** implying monotonic decrease (caption + allow fluctuation; no smoothing that hides it).

**Patterns to follow:** Unit 4 `enterBaseline`/`nextEpoch`/`runOneEpoch`; Unit 3 data for separable vs challenge behavior.

**Test scenarios:**
- Happy path: baseline over the separable starter set reports a correct-count without mutating params (R6/R10).
- Happy path: after an epoch, mistake count equals the number of updates applied that pass.
- Edge (R17): chart renders non-monotonic data faithfully (e.g. [3,1,2]) — the "2" is not clamped/smoothed below the "1".
- Edge: shuffled order shows a visible shuffle indicator and still retains params across epochs.
- Edge: on a non-separable (challenge-inclusive) training set, mistakes do **not** reach zero and the UI does not imply more epochs will fix it (R8).

### Phase 5 — Testing, sandbox, reflection, delight

- [ ] **Unit 10: Test mode (Scene 6)**

**Goal:** Locked-parameter evaluation on the held-out test tray with prominent TEST MODE indicator and cumulative performance.

**Requirements:** R6, R10, R13; origin §6 Scene 6, §7.

**Dependencies:** Units 6, 9.

**Files:**
- Create: `src/components/TestMode/*`
- Test: `src/components/TestMode/TestMode.test.tsx`

**Approach:**
- Prominent **"TEST MODE — weights and bias locked"** banner; update controls disappear (ties to Unit 7 contextual reveal).
- Each test image flows through the same workbench computation and gets a prediction; reveal correct/incorrect **after** prediction; show cumulative test performance. Test-set labels remain visible in the dataset shelf (origin §14 default).
- Playful surprise animation allowed but must never obscure the computation.

**Patterns to follow:** Unit 6 workbench (reused verbatim); Unit 4 test-mode guard.

**Test scenarios:**
- Happy path: predicting across the test set produces per-item correct/incorrect and a cumulative tally.
- Invariant (R10): no params change anywhere in test mode across the whole test pass.
- Edge (R6): update controls are absent/disabled; the locked banner is present.
- Edge: correctness revealed only after the prediction is shown for each test item.

- [ ] **Unit 11: Opening sandbox (Scene 1) + Explain this / Show the math**

**Goal:** Scene 1 manual-exploration sandbox with live sliders, plus the always-available "Explain this" affordance and "Show the math" toggle.

**Requirements:** R1, R2, R3, R20; origin §6 Scene 1, §7 (threshold crossing), §8.

**Dependencies:** Unit 6.

**Files:**
- Create: `src/components/Sandbox/*`, `src/components/common/ExplainThis.tsx`, `src/components/common/ShowMathToggle.tsx`
- Test: `src/components/Sandbox/Sandbox.test.tsx`, `src/components/common/ExplainThis.test.tsx`

**Approach:**
- Sandbox: temporarily adjust a weight/bias slider and see score + prediction change instantly; copy makes clear this is manual exploration, **not learning**. Sliders exposed **only** here (origin §14 default).
- Signature "live threshold crossing": dragging a weight shifts the score marker and the output flips exactly at zero with a restrained transition.
- "Explain this" affordance for weight, bias, score, threshold, label, epoch, test set. "Show the math" toggle: visual pathway first, then symbolic notation.

**Patterns to follow:** Unit 6 workbench rendering; Unit 2 engine for live recompute.

**Test scenarios:**
- Happy path: moving the weight slider updates score and flips output exactly when score crosses 0.
- Edge: sandbox changes are isolated — they do not create history entries or affect the training run's params/seed.
- Happy path (R20): "Explain this" opens contextual explanation for each of the seven concepts.
- Happy path (R20): "Show the math" toggles between visual pathway and symbolic equation.
- Accessibility: slider is keyboard-operable; threshold-crossing conveyed with a text/ARIA cue, not color/motion alone.

- [ ] **Unit 12: Reflect & iterate (Scene 7) + counterexample / identical-vector reveals**

**Goal:** Scene 7 reflection with run comparison and the signature counterexample + identical-feature-vector reveals that make feature insufficiency honest.

**Requirements:** R8, R12; origin §6 Scene 7, §7.

**Dependencies:** Units 9, 10.

**Files:**
- Create: `src/components/Reflect/*` (RunComparison table, SurprisingMistake, IdenticalVectorReveal)
- Test: `src/components/Reflect/Reflect.test.tsx`

**Approach:**
- Actions: Try different training examples, Randomize and retrain, Inspect a surprising mistake.
- Run comparison: side-by-side or small history table — training set, starting seed, epochs, train errors, test correct. No competitive scoring.
- Counterexample reveal: e.g. pizza-with-mustard triggering "Hot dog!" → "What did the perceptron actually see?" highlighting the feature vector.
- Identical-vector reveal: when two foods share a feature vector, overlay their identical inputs and explain why the model cannot distinguish them (uses Unit 3 challenge contradiction).

**Patterns to follow:** Unit 4 `runComparisons` state; Unit 3 challenge items.

**Test scenarios:**
- Happy path: completing two runs populates the comparison table with seed, epochs, train errors, test correct for each.
- Happy path (R8/R12): selecting the hamburger/hot-dog `(1,1,1)` pair opens the identical-vector reveal overlaying matching feature chips and the explanation.
- Edge: "Inspect a surprising mistake" focuses the workbench on a misclassified item and shows its feature vector.
- Edge: no competitive score/ranking is rendered anywhere (guard).

- [ ] **Unit 13: Accessibility pass, persistence & Start over**

**Goal:** Cross-cutting accessibility hardening, `localStorage` persistence, and Start over.

**Requirements:** R18, R19; origin §7, §10.

**Dependencies:** Units 5–12.

**Files:**
- Create: `src/hooks/usePersistence.ts`, `src/hooks/useReducedMotion.ts`, `src/components/common/StartOver.tsx`
- Modify: workbench/controls/shelf components for ARIA + keyboard coverage
- Test: `src/hooks/usePersistence.test.ts`, `src/hooks/useReducedMotion.test.ts`

**Approach:**
- Persist versioned `AppState` to `localStorage` behind a serializer; restore on load; graceful fallback when unavailable. **Start over** clears storage and resets state.
- `prefers-reduced-motion` + a global motion/sound toggle (sound muted by default); all motion/audio has text/caption equivalents.
- Color-independent indicators everywhere (correct/incorrect, sign of weights, prediction) — icon/text/shape, not color alone. Keyboard operability for all interactive elements. Responsive for laptop/tablet/touch.

**Patterns to follow:** Unit 4 `startOver` intent; existing component ARIA from Units 5–12.

**Test scenarios:**
- Happy path (R19): state round-trips through `localStorage` (save → reload → identical restored state).
- Edge (R19): `localStorage` unavailable/throwing ⇒ app still runs (in-memory only), no crash.
- Happy path: **Start over** clears persisted state and resets to a fresh seed/selection.
- Edge (R18): with `prefers-reduced-motion`, animations are suppressed and equivalents remain.
- Edge: persistence serializer rejects/migrates an incompatible stored version instead of crashing.

- [ ] **Unit 14: Cohesive food illustration assets**

**Goal:** Produce ~20 consistent, playful food illustrations and wire them to dataset items. Functional SVG/emoji illustrations ship first; generated art is an optional swap.

**Requirements:** R12 (visual consistency), origin §4, §7.

**Dependencies:** Unit 3 (dataset ids/alt_text), Units 5/6 (card + workbench rendering).

**Files:**
- Create: `public/assets/food/*` (illustration assets), and a manifest mapping `id → asset`
- Modify: `src/data/dataset.ts` image paths if needed
- Test: `src/data/dataset.test.ts` (extend: every item resolves to an existing asset + non-empty alt_text)

**Approach:**
- v1 default: cohesive SVG/emoji-styled illustrations (consistent framing/style) so the app is fully self-contained with no external calls at runtime.
- Optional upgrade: generate a matched illustration set (e.g. via the `ce-gemini-imagegen` skill or `franklin-design` tokens) and drop assets into the manifest — no code change beyond asset files. Original art only; do not copy Victor/Case assets.
- Every item needs descriptive `alt_text`.

**Patterns to follow:** `franklin-design` skill for cohesive styling tokens (optional); Unit 3 dataset schema.

**Test scenarios:**
- Happy path: every dataset item maps to an existing asset file and has non-empty alt_text.
- Edge: hot dogs and non-hot-dogs are visually distinguishable while sharing consistent framing/style.
- Test expectation for generated-art swap: none (asset-only change) beyond the asset-existence assertion above.

## System-Wide Impact

- **Interaction graph:** All UI surfaces funnel through the Unit 4 reducer; no component mutates params directly. Mode transitions (select→baseline→train→test→reflect, plus sandbox) are the main cross-component handoffs.
- **Error propagation:** Engine functions are total (no throws for valid inputs); persistence and asset loading are the only fallible paths and must degrade gracefully (Units 13, 14).
- **State lifecycle risks:** Undo stack bounds (avoid unbounded memory); persistence version migration; ensuring sandbox tweaks never leak into the training run's params/history (Unit 11).
- **API surface parity:** The single workbench component is reused identically in training and test modes — the only difference is the contextual control set and the locked banner, guaranteeing the "same computation" message (origin §7).
- **Integration coverage:** Reducer-level reproducibility (same seed+order+actions ⇒ same run) is the keystone integration test (Unit 4); test-mode no-mutation is asserted both at reducer (Unit 4) and UI (Unit 10) levels.
- **Unchanged invariants:** The §9 invariants (R10) are fixed contracts — every unit that touches params must preserve them; guard tests live in Units 2, 4, 8, 10.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Dataset silently becomes non-separable when authors edit it, making the starter experience confusing | Unit 3 test brute-forces a separating param set and fails the build if the starter set stops being separable |
| UI implies "more epochs fixes everything," contradicting the core lesson | Unit 9 renders non-monotonic mistake data faithfully; Unit 12 surfaces the identical-vector contradiction explicitly; guard test for the no-monotonic-promise caption |
| Score misread as probability/confidence (R11 violation) | Unit 6 guard test bans "%/confidence/probability" strings in score components; copy standardized to "distance from decision line" |
| Animation timing races with state (prediction shown from stale params) | Engine/UI separation — state is correct at dispatch time; animations are pure presentation and never gate correctness; reduced-motion path renders transitions instantly (Units 8, 13) |
| Accessibility treated as an afterthought | Color-independent indicators and keyboard operability are per-unit test scenarios from Unit 5 onward, not just Unit 13 |
| Scope creep toward multilayer/gradient features | Scope Boundaries enumerated from origin §12; plan contains no units for excluded features |

## Documentation / Operational Notes

- No runtime ops (static site). A short `README.md` with run/build/test instructions should be produced during Unit 1 (dev: `npm run dev`, test: `npm test`, build: `npm run build`).
- Deploy target is any static host; no env vars, no secrets, no API keys (origin §10).

## Sources & References

- **Origin document:** `/Users/jdec/Downloads/hot_dog_perceptron_explorable_spec.md` (the full product & learning-experience spec; sections cited inline as origin §N).
- Parent project conventions: `/Users/jdec/Documents/CLAUDE.md` (npm + Tailwind for Node projects).
- Available skill: `franklin-design` (optional brand tokens), `ce-gemini-imagegen` (optional asset generation).
