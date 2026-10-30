import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { WiringDiagram } from './WiringDiagram'
import type { FeatureVector, Params } from '../../engine/types'

const features: FeatureVector = { ketchup: 1, mustard: 0, bun: 1 }
const params: Params = { weights: { ketchup: 1, mustard: 1, bun: 1 }, bias: 0 }
const changed = new Set<'ketchup' | 'mustard' | 'bun' | 'bias'>(['ketchup', 'bias'])

describe('WiringDiagram learning pulse (spec §7, §10)', () => {
  it('pulses changed active connections when motion is allowed', () => {
    const { container } = render(
      <WiringDiagram features={features} params={params} pulse changedKeys={changed} reducedMotion={false} />,
    )
    expect(container.querySelectorAll('.animate-pulseWire').length).toBeGreaterThan(0)
  })

  it('suppresses all motion when reducedMotion is set (no info conveyed by animation alone)', () => {
    const { container } = render(
      <WiringDiagram features={features} params={params} pulse changedKeys={changed} reducedMotion />,
    )
    expect(container.querySelectorAll('.animate-pulseWire').length).toBe(0)
  })

  it('does not pulse inactive features even when they are flagged changed', () => {
    // mustard is inactive (value 0); even if marked changed it must not pulse.
    const { container } = render(
      <WiringDiagram
        features={features}
        params={params}
        pulse
        changedKeys={new Set(['mustard'])}
        reducedMotion={false}
      />,
    )
    expect(container.querySelectorAll('.animate-pulseWire').length).toBe(0)
  })
})
