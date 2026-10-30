import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { SandboxScene } from './SandboxScene'
import { renderWithProviders } from '../../test/renderWithProviders'
import { createInitialState, reducer, type AppState } from '../../engine/state'

/** A sandbox state with known params so the threshold crossing is deterministic. */
function sandboxState(): AppState {
  const base = reducer(createInitialState(7), { type: 'enterSandbox' })
  const params = { weights: { ketchup: 0, mustard: 0, bun: 0 }, bias: 0 }
  return { ...base, params, sandboxParams: params }
}

describe('SandboxScene (spec §6 Scene 1)', () => {
  it('flips the output as a weight slider pushes the score across zero', () => {
    renderWithProviders(<SandboxScene onDone={() => {}} />, sandboxState())
    // First sample food is the plain hot dog (bun only). With all-zero params the
    // score is 0 -> at or above the line -> Hot dog (threshold inclusive).
    expect(screen.getByText(/at or above the line/i)).toBeInTheDocument()
    // Drop the bun weight negative; the score crosses below zero.
    const bunSlider = screen.getByRole('slider', { name: /Bun weight/i })
    fireEvent.change(bunSlider, { target: { value: '-3' } })
    expect(screen.getByText(/below the line/i)).toBeInTheDocument()
  })

  it('labels this as manual exploration, not learning', () => {
    renderWithProviders(<SandboxScene onDone={() => {}} />, sandboxState())
    expect(screen.getByText(/manual exploration — not learning/i)).toBeInTheDocument()
  })

  it('exposes weight and bias sliders (the only place sliders appear)', () => {
    renderWithProviders(<SandboxScene onDone={() => {}} />, sandboxState())
    expect(screen.getAllByRole('slider')).toHaveLength(4) // 3 weights + bias
    expect(screen.getByRole('slider', { name: /Ketchup weight/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /^bias$/i })).toBeInTheDocument()
  })
})
