import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import {
  createInitialState,
  reducer,
  type AppState,
  type Intent,
} from './engine/state'
import { clearState, loadState, saveState } from './hooks/usePersistence'

interface Store {
  readonly state: AppState
  readonly dispatch: (intent: Intent) => void
}

const StoreContext = createContext<Store | null>(null)

/** Initialize from persisted state when available, else a fresh run. */
function init(): AppState {
  return loadState() ?? createInitialState()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, init)

  // `startOver` clears persistence so a reload does not resurrect the old run.
  const dispatch = useCallback((intent: Intent) => {
    if (intent.type === 'startOver') clearState()
    rawDispatch(intent)
  }, [])

  // Persist on every state change (best-effort; no-op when storage is absent).
  useEffect(() => {
    saveState(state)
  }, [state])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within a StoreProvider')
  return store
}
