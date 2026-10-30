import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestScene } from './TestScene'
import { renderWithProviders } from '../../test/renderWithProviders'
import { createInitialState, reducer, type AppState, type Intent } from '../../engine/state'

/** Build a state with a trained-ish run and one test item, parked in test mode. */
function testModeState(): AppState {
  const intents: Intent[] = [
    { type: 'assignCard', itemId: 'hd_plain', tray: 'train' },
    { type: 'assignCard', itemId: 'pizza_plain', tray: 'train' },
    { type: 'assignCard', itemId: 'hd_mustard', tray: 'test' },
    { type: 'startTraining' },
    { type: 'runOneEpoch' },
    { type: 'enterTest' },
  ]
  return intents.reduce(reducer, createInitialState(7))
}

describe('TestScene (spec §6 Scene 6)', () => {
  it('shows a prominent locked banner and no update controls', () => {
    renderWithProviders(<TestScene onReflect={() => {}} />, testModeState())
    expect(screen.getByText(/TEST MODE — weights and bias locked/i)).toBeInTheDocument()
    // None of the training update controls are present.
    expect(screen.queryByRole('button', { name: /apply learning update/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /^predict$/i })).toBeNull()
  })

  it('reveals correctness only after predicting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestScene onReflect={() => {}} />, testModeState())
    // Before predicting, no correctness marker.
    expect(screen.queryByText(/correct|wrong/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: /predict \(locked\)/i }))
    // After predicting, a correctness marker appears.
    expect(screen.getByText(/correct|wrong/i)).toBeInTheDocument()
  })
})
