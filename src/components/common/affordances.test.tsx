import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExplainThis } from './ExplainThis'
import { ShowMathToggle } from './ShowMathToggle'
import { renderWithUi } from '../../test/renderWithProviders'

describe('ExplainThis (spec §8)', () => {
  it('opens and closes a plain-language explanation for a concept', async () => {
    const user = userEvent.setup()
    renderWithUi(<ExplainThis concept="bias" />)
    const button = screen.getByRole('button', { name: /explain bias/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('note')).toHaveTextContent(/added to every score/i)
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('ShowMathToggle (spec §8)', () => {
  it('toggles aria-checked when flipped', async () => {
    const user = userEvent.setup()
    renderWithUi(<ShowMathToggle />)
    const toggle = screen.getByRole('switch', { name: /show the math/i })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
