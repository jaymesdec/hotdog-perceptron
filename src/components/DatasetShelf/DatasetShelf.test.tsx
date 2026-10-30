import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasetShelf } from './DatasetShelf'
import { renderWithProviders } from '../../test/renderWithProviders'

describe('DatasetShelf', () => {
  it('warns about empty trays on first load', () => {
    renderWithProviders(<DatasetShelf onReady={() => {}} />)
    const alert = screen.getByRole('alert')
    expect(within(alert).getByText(/training tray is empty/i)).toBeInTheDocument()
    expect(within(alert).getByText(/testing tray is empty/i)).toBeInTheDocument()
  })

  it('assigns a card to the training tray via keyboard-operable buttons', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatasetShelf onReady={() => {}} />)
    // The shelf starts with every card unassigned; the training tray header shows 0.
    expect(screen.getByText(/Training tray \(0\)/)).toBeInTheDocument()
    // Click the first "Train" button.
    const trainButtons = screen.getAllByRole('button', { name: 'Train' })
    await user.click(trainButtons[0])
    expect(screen.getByText(/Training tray \(1\)/)).toBeInTheDocument()
  })

  it('warns when the training set has only one class', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatasetShelf onReady={() => {}} />)
    // Use the default balanced split, then verify no single-class warning,
    // but a single hot-dog-only assignment does warn. Start fresh:
    const trainButtons = screen.getAllByRole('button', { name: 'Train' })
    await user.click(trainButtons[0]) // first card is a hot dog (label 1)
    // Only one class present -> single-class warning should surface.
    expect(screen.getByText(/only one class/i)).toBeInTheDocument()
  })

  it('offers a balanced split and enables proceeding once trays are valid', async () => {
    const user = userEvent.setup()
    const onReady = vi.fn()
    renderWithProviders(<DatasetShelf onReady={onReady} />)
    await user.click(screen.getByRole('button', { name: /balanced split/i }))
    const proceed = screen.getByRole('button', { name: /freeze parameters/i })
    expect(proceed).toBeEnabled()
    await user.click(proceed)
    expect(onReady).toHaveBeenCalled()
  })
})
