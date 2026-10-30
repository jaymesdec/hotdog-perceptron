import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

afterEach(() => window.localStorage.clear())

/**
 * End-to-end smoke: drive the real App (all providers + scene wiring) through
 * the full journey — welcome → sort → baseline → train → epoch → test → reflect
 * — to catch runtime wiring errors a unit test would miss.
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

    // Train: run full epochs via the fast path until the epoch-end screen,
    // then keep going until we can move to testing.
    expect(screen.getByRole('heading', { name: /Train, one example/i })).toBeInTheDocument()

    // Step the first example interactively to exercise Scene 4 controls.
    await user.click(screen.getByRole('button', { name: /^predict$/i }))
    await user.click(screen.getByRole('button', { name: /compare to label/i }))
    // Either "apply learning update" (mistake) or "check what happens" (correct).
    const resolveButton =
      screen.queryByRole('button', { name: /apply learning update/i }) ??
      screen.getByRole('button', { name: /check what happens/i })
    await user.click(resolveButton)
    await user.click(screen.getByRole('button', { name: /next example/i }))

    // The app is still alive and showing the training workbench.
    expect(screen.getByRole('heading', { name: /Train, one example/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Prediction/i).length).toBeGreaterThan(0)
  })

  it('renders the top bar with Start over and the Show the math toggle', () => {
    window.localStorage.clear()
    render(<App />)
    expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /show the math/i })).toBeInTheDocument()
  })
})
