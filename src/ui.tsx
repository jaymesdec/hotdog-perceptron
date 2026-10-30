import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Ephemeral UI preferences that are not part of the learning domain state:
 *  - showMath: the "Show the math" toggle (spec §8) — symbolic notation vs. a
 *    plain visual pathway.
 *  - soundOn: gentle sound, muted by default (spec §7).
 */
interface UiPrefs {
  readonly showMath: boolean
  readonly toggleShowMath: () => void
  readonly soundOn: boolean
  readonly toggleSound: () => void
}

const UiContext = createContext<UiPrefs | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [showMath, setShowMath] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const value = useMemo<UiPrefs>(
    () => ({
      showMath,
      toggleShowMath: () => setShowMath((previous) => !previous),
      soundOn,
      toggleSound: () => setSoundOn((previous) => !previous),
    }),
    [showMath, soundOn],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi(): UiPrefs {
  const context = useContext(UiContext)
  if (!context) throw new Error('useUi must be used within a UiProvider')
  return context
}
