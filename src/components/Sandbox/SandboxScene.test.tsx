import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { SandboxScene } from './SandboxScene'
import { renderWithProviders } from '../../test/renderWithProviders'
import { createInitialState, reducer, type AppState } from '../../engine/state'

/** A sandbox state with known params so the threshold crossing is deterministic. */
function sandboxState(): AppState {
  const base = reducer(createInitialState(7), { type: 'enterSandbox' })
  const params = { weights: { ketchup: 0, mustard: 0, bun: 0 } }
  return { ...base, params, sandboxParams: params }
}

describe('SandboxScene (spec §6 Scene 1)', () => {
  it('flips the output as a weight slider pushes the score across zero', () => {
    renderWithProviders(<SandboxScene onDone={() => {}} />, sandboxState())
    // First sample food is the plain hot dog (bun only). With all-zero weights the
    // score is 0 -> not above the line -> Not hot dog (strict threshold).
    expect(screen.getByText(/not above the line/i)).toBeInTheDocument()
    // Raise the bun weight; the score crosses above zero -> Hot dog.
    const bunSlider = screen.getByRole('slider', { name: /Bun weight/i })
    fireEvent.change(bunSlider, { target: { value: '3' } })
    expect(screen.getByText(/above the line → Hot dog/i)).toBeInTheDocument()
  })

  it('labels this as manual exploration, not learning', () => {
    renderWithProviders(<SandboxScene onDone={() => {}} />, sandboxState())
    expect(screen.getByText(/manual exploration — not learning/i)).toBeInTheDocument()
  })

  it('exposes one slider per input weight and no bias slider', () => {
    renderWithProviders(<SandboxScene onDone={() => {}} />, sandboxState())
    expect(screen.getAllByRole('slider')).toHaveLength(3) // ketchup, mustard, bun
    expect(screen.getByRole('slider', { name: /Ketchup weight/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Bun weight/i })).toBeInTheDocument()
    expect(screen.queryByRole('slider', { name: /^bias$/i })).toBeNull()
  })
})
