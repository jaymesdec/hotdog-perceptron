import type { AppState } from '../engine/state'

/**
 * Local-storage persistence (spec §10, §19). Versioned and defensive: if storage
 * is unavailable (private mode, quota, SSR) or the stored shape is incompatible,
 * we silently fall back to in-memory state rather than crashing.
 *
 * The undo stack is intentionally dropped from the persisted snapshot — it can
 * grow large and is not worth restoring across reloads.
 */

const STORAGE_KEY = 'hot-dog-perceptron:v1'
const STORAGE_VERSION = 1

interface PersistedEnvelope {
  readonly version: number
  readonly state: Omit<AppState, 'undoStack'>
}

function storageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const probe = '__hdp_probe__'
    window.localStorage.setItem(probe, probe)
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/**
 * Minimal runtime shape check. A same-version but malformed payload (schema
 * drift, hand-edited storage) must not flow unchecked into the reducer's initial
 * state, so we confirm the handful of fields the app reads before trusting it.
 */
function looksLikeAppState(candidate: unknown): candidate is Omit<AppState, 'undoStack'> {
  if (typeof candidate !== 'object' || candidate === null) return false
  const value = candidate as Record<string, unknown>
  const params = value.params as { weights?: unknown; bias?: unknown } | undefined
  return (
    typeof value.assignments === 'object' &&
    value.assignments !== null &&
    typeof value.seed === 'number' &&
    typeof value.mode === 'string' &&
    typeof params === 'object' &&
    params !== null &&
    typeof params.weights === 'object' &&
    typeof params.bias === 'number'
  )
}

export function loadState(): AppState | null {
  if (!storageAvailable()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedEnvelope
    if (!parsed || parsed.version !== STORAGE_VERSION || !looksLikeAppState(parsed.state)) return null
    return { ...parsed.state, undoStack: [] }
  } catch {
    return null
  }
}

export function saveState(state: AppState): void {
  if (!storageAvailable()) return
  try {
    const { undoStack: _undoStack, ...withoutUndo } = state
    const envelope: PersistedEnvelope = { version: STORAGE_VERSION, state: withoutUndo }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Quota or serialization failure — persistence is best-effort.
  }
}

export function clearState(): void {
  if (!storageAvailable()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
