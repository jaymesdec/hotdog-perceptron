import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { StoreProvider } from '../store'
import { UiProvider } from '../ui'
import { saveState } from '../hooks/usePersistence'
import type { AppState } from '../engine/state'

/**
 * Render a component inside the app's Ui + Store providers, with a clean
 * localStorage. Optionally preload a crafted AppState so a component can be
 * tested in a specific scene (the store hydrates from persistence on mount).
 */
export function renderWithProviders(ui: ReactElement, preloadState?: AppState) {
  window.localStorage.clear()
  if (preloadState) saveState(preloadState)
  return render(
    <UiProvider>
      <StoreProvider>{ui}</StoreProvider>
    </UiProvider>,
  )
}

/** Render inside only the Ui provider (for presentational components). */
export function renderWithUi(ui: ReactElement) {
  return render(<UiProvider>{ui}</UiProvider>)
}
