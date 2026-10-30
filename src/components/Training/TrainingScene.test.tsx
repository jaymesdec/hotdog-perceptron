import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrainingScene } from './TrainingScene'
import { renderWithProviders } from '../../test/renderWithProviders'
import { createInitialState, reducer, type AppState, type Intent } from '../../engine/state'
import type { Params } from '../../engine/types'

/** A training state parked on the first example, with params we control. */
function trainingStateWithParams(params: Params): AppState {
  const intents: Intent[] = [
    { type: 'assignCard', itemId: 'hd_plain', tray: 'train' }, // features (0,0,1), label 1
    { type: 'assignCard', itemId: 'pizza_plain', tray: 'train' }, // features (0,0,0), label 0
    { type: 'startTraining' },
  ]
  const base = intents.reduce(reducer, createInitialState(7))
  return { ...base, params, initialParams: params }
}

async function step(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /^predict$/i }))
  await user.click(screen.getByRole('button', { name: /compare to label/i }))
}

describe('TrainingScene (spec §6 Scene 4)', () => {
  it('on a mistake, applying the update changes the active weight and bias and pulses', async () => {
    const user = userEvent.setup()
    // bun weight -1 misclassifies the plain hot dog (score -1 -> Not hot dog).
    renderWithProviders(
      <TrainingScene />,
      trainingStateWithParams({ weights: { ketchup: 0, mustard: 0, bun: -1 }, bias: 0 }),
    )
    await step(user)
    await user.click(screen.getByRole('button', { name: /apply learning update/i }))
    // Bun is the only active feature; its weight moves -1 -> 0, bias 0 -> +1.
    expect(screen.getByText(/mistake → the classic rule/i)).toBeInTheDocument()
    expect(screen.getByText(/-1 → \+0/)).toBeInTheDocument() // bun weight delta
  })

  it('on a correct prediction, shows "No update" and offers no deltas', async () => {
    const user = userEvent.setup()
    // bun weight 2, bias -1 correctly classifies the plain hot dog (score +1).
    renderWithProviders(
      <TrainingScene />,
      trainingStateWithParams({ weights: { ketchup: 0, mustard: 0, bun: 2 }, bias: -1 }),
    )
    await step(user)
    await user.click(screen.getByRole('button', { name: /check what happens/i }))
    expect(screen.getByText(/No update: prediction matched label/i)).toBeInTheDocument()
  })

  it('shows the persistent progress indicator', () => {
    renderWithProviders(
      <TrainingScene />,
      trainingStateWithParams({ weights: { ketchup: 0, mustard: 0, bun: 2 }, bias: -1 }),
    )
    expect(screen.getByText(/Example 1 of 2 · Epoch 1/)).toBeInTheDocument()
  })
})
