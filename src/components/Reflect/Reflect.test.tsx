import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectScene } from './ReflectScene'
import { renderWithProviders } from '../../test/renderWithProviders'
import { createInitialState, reducer, type AppState, type Intent } from '../../engine/state'

/** A completed run parked in reflect mode with one misclassified test item. */
function reflectState(): AppState {
  const intents: Intent[] = [
    { type: 'assignCard', itemId: 'hd_plain', tray: 'train' }, // (0,0,1) hot dog
    { type: 'assignCard', itemId: 'pizza_plain', tray: 'train' }, // (0,0,0) not
    { type: 'assignCard', itemId: 'hamburger', tray: 'test' }, // (1,1,1) not — but bun present
    { type: 'startTraining' },
    { type: 'runOneEpoch' },
    { type: 'enterTest' },
    { type: 'predictTestItem', itemId: 'hamburger' },
    { type: 'enterReflect' },
  ]
  const state = intents.reduce(reducer, createInitialState(7))
  // Force a deterministic misclassification of the held-out hamburger so the
  // surprising-mistake panel is exercised regardless of the random init.
  return {
    ...state,
    testResults: {
      hamburger: { itemId: 'hamburger', prediction: 1, correct: false, revealed: true },
    },
  }
}

describe('ReflectScene (spec §6 Scene 7)', () => {
  it('populates the run comparison table after saving a run', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReflectScene onTryDifferent={() => {}} onRandomizeRetrain={() => {}} />, reflectState())
    expect(screen.getByText(/save a run to start comparing/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /save this run/i }))
    // The table now has a row with the seed.
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows a surprising mistake with its feature vector', () => {
    renderWithProviders(<ReflectScene onTryDifferent={() => {}} onRandomizeRetrain={() => {}} />, reflectState())
    expect(screen.getByRole('heading', { name: /inspect a surprising mistake/i })).toBeInTheDocument()
    expect(screen.getByText('Hamburger')).toBeInTheDocument()
  })

  it('reveals the identical-vector contradiction and explains it', () => {
    renderWithProviders(<ReflectScene onTryDifferent={() => {}} onRandomizeRetrain={() => {}} />, reflectState())
    expect(screen.getByRole('heading', { name: /why can't it tell these apart/i })).toBeInTheDocument()
    expect(screen.getByText(/what the perceptron actually sees/i)).toBeInTheDocument()
  })

  it('renders no competitive score or ranking', () => {
    const { container } = renderWithProviders(
      <ReflectScene onTryDifferent={() => {}} onRandomizeRetrain={() => {}} />,
      reflectState(),
    )
    expect((container.textContent ?? '').toLowerCase()).not.toMatch(/\bscore:|ranking|leaderboard|you win|you lose/)
  })

  it('wires the try-different and randomize-retrain affordances', async () => {
    const user = userEvent.setup()
    let tried = false
    renderWithProviders(
      <ReflectScene onTryDifferent={() => (tried = true)} onRandomizeRetrain={() => {}} />,
      reflectState(),
    )
    await user.click(screen.getByRole('button', { name: /try different training examples/i }))
    expect(tried).toBe(true)
  })
})
