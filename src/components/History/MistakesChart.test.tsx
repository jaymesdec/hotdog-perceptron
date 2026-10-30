import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MistakesChart } from './MistakesChart'

describe('MistakesChart', () => {
  it('renders non-monotonic data faithfully (no smoothing)', () => {
    render(<MistakesChart mistakes={[3, 1, 2]} />)
    // All three raw counts appear as labels, including the rise from 1 back to 2.
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    const figure = screen.getByRole('img')
    expect(figure.getAttribute('aria-label')).toContain('3, 1, 2')
  })

  it('does not promise monotonic decrease in its caption', () => {
    const { container } = render(<MistakesChart mistakes={[2, 2, 2]} />)
    expect((container.textContent ?? '').toLowerCase()).toMatch(/rise or fall|never reach zero/)
  })

  it('prompts to run an epoch when there is no data', () => {
    render(<MistakesChart mistakes={[]} />)
    expect(screen.getByText(/run an epoch/i)).toBeInTheDocument()
  })
})
