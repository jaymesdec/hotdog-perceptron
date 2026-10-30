import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Workbench } from './Workbench'
import { renderWithUi } from '../../test/renderWithProviders'
import { getItem } from '../../data/dataset'
import type { Params } from '../../engine/types'

const item = getItem('hd_ketchup')! // features (1,0,1)

function params(ketchup: number, mustard: number, bun: number, bias: number): Params {
  return { weights: { ketchup, mustard, bun }, bias }
}

describe('Workbench', () => {
  it('shows a prediction that matches the computed score', () => {
    // 1·2 + 0·1 + 1·2 + (-1) = 3 >= 0 -> Hot dog
    renderWithUi(<Workbench item={item} params={params(2, 1, 2, -1)} showLabel />)
    expect(screen.getByText(/at or above the line → Hot dog/i)).toBeInTheDocument()
  })

  it('predicts Not hot dog when the score is negative', () => {
    // 1·0 + 0 + 1·0 + (-1) = -1 < 0
    renderWithUi(<Workbench item={item} params={params(0, 0, 0, -1)} showLabel />)
    expect(screen.getByText(/below the line → Not hot dog/i)).toBeInTheDocument()
  })

  it('R11 GUARD: never presents the score as a percentage, confidence, or probability', () => {
    const { container } = renderWithUi(<Workbench item={item} params={params(2, 1, 2, -1)} showLabel />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/%/)
    expect(text.toLowerCase()).not.toMatch(/confiden/)
    expect(text.toLowerCase()).not.toMatch(/probab/)
    // It DOES frame the score as a distance from the decision line.
    expect(text.toLowerCase()).toMatch(/distance from/)
  })

  it('distinguishes negative weights without relying on color (dashed wire)', () => {
    const { container } = renderWithUi(<Workbench item={item} params={params(-2, 1, 2, 0)} showLabel />)
    // The ketchup wire (active, negative weight) should be dashed.
    const dashedWires = container.querySelectorAll('path[stroke-dasharray]')
    expect(dashedWires.length).toBeGreaterThan(0)
  })

  it('hides the true label when showLabel is false (test mode)', () => {
    renderWithUi(<Workbench item={item} params={params(2, 1, 2, -1)} showLabel={false} />)
    expect(screen.getByText(/label hidden in test/i)).toBeInTheDocument()
  })
})
