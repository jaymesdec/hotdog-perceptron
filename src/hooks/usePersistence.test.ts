import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearState, loadState, saveState } from './usePersistence'
import { createInitialState, reducer } from '../engine/state'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('persistence (spec §19)', () => {
  it('round-trips app state through localStorage', () => {
    let state = createInitialState(42)
    state = reducer(state, { type: 'assignCard', itemId: 'hd_plain', tray: 'train' })
    saveState(state)
    const restored = loadState()
    expect(restored).not.toBeNull()
    expect(restored!.seed).toBe(42)
    expect(restored!.assignments.hd_plain).toBe('train')
    // The undo stack is intentionally not restored.
    expect(restored!.undoStack).toEqual([])
  })

  it('clearState removes the persisted run', () => {
    saveState(createInitialState(1))
    clearState()
    expect(loadState()).toBeNull()
  })

  it('returns null for an empty store', () => {
    expect(loadState()).toBeNull()
  })

  it('does not crash when localStorage is unavailable', () => {
    const throwing = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    // Should swallow the error rather than propagate.
    expect(() => saveState(createInitialState(1))).not.toThrow()
    throwing.mockRestore()
  })

  it('ignores a stored payload with an incompatible version', () => {
    window.localStorage.setItem('hot-dog-perceptron:v1', JSON.stringify({ version: 999, state: {} }))
    expect(loadState()).toBeNull()
  })
})
