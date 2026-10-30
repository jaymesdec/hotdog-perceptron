import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

afterEach(() => window.localStorage.clear())

/**
 * End-to-end smoke: drive the real App (all providers + scene wiring) through
 * the full journey — welcome → sort → baseline → train → epoch → test → reflect
 * — actually reaching test and reflect modes, to catch runtime wiring errors a
 * unit test would miss.
 */
describe('App journey', () => {
  it('walks from welcome through training, testing, and reflection without crashing', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    render(<App />)

    // Welcome
    expect(screen.getByRole('heading', { name: /Be an AI researcher/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /skip to sorting/i }))

    // Dataset shelf → balanced split → proceed
    expect(screen.getByRole('heading', { name: /Be the researcher/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /balanced split/i }))
    await user.click(screen.getByRole('button', { name: /freeze parameters/i }))

    // Baseline (ran on entry) → start training
    expect(screen.getByRole('heading', { name: /before training/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /start training/i }))

    // Train: step through every example interactively (Scene 4 controls) until
    // the epoch-end summary appears.
    expect(screen.getByRole('heading', { name: /Train, one example/i })).toBeInTheDocument()
    for (let step = 0; step < 10; step++) {
      const predictButton = screen.queryByRole('button', { name: /^predict$/i })
      if (!predictButton) break // reached epoch end
      await user.click(predictButton)
      await user.click(screen.getByRole('button', { name: /compare to label/i }))
      const resolveButton =
        screen.queryByRole('button', { name: /apply learning update/i }) ??
        screen.getByRole('button', { name: /check what happens/i })
      await user.click(resolveButton)
      await user.click(screen.getByRole('button', { name: /next example/i }))
    }

    // Epoch end → go to testing.
    const goToTest = await screen.findByRole('button', { name: /go to testing/i })
    await user.click(goToTest)

    // Test mode: locked banner is shown; predict through every held-out image.
    expect(screen.getByText(/TEST MODE — weights and bias locked/i)).toBeInTheDocument()
    for (let step = 0; step < 12; step++) {
      await user.click(screen.getByRole('button', { name: /predict \(locked\)/i }))
      const next = screen.queryByRole('button', { name: /next image/i })
      if (!next) break // last image — the reflect button is shown instead
      await user.click(next)
    }
    await user.click(screen.getByRole('button', { name: /reflect on the results/i }))

    // Reflect mode: the identical-vector reveal is present.
    expect(screen.getByRole('heading', { name: /reflect & iterate/i })).toBeInTheDocument()
  })

  it('renders the top bar with Start over and the Show the math toggle', () => {
    window.localStorage.clear()
    render(<App />)
    expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /show the math/i })).toBeInTheDocument()
  })
})
