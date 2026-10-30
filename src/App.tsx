import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import { UiProvider } from './ui'
import { DatasetShelf } from './components/DatasetShelf/DatasetShelf'
import { SandboxScene } from './components/Sandbox/SandboxScene'
import { BaselineScene } from './components/Training/BaselineScene'
import { TrainingScene } from './components/Training/TrainingScene'
import { EpochEndScene } from './components/Training/EpochEndScene'
import { TestScene } from './components/TestMode/TestScene'
import { ReflectScene } from './components/Reflect/ReflectScene'
import { TopBar } from './components/TopBar'
import { Welcome } from './components/Welcome'

export default function App() {
  return (
    <UiProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </UiProvider>
  )
}

function Shell() {
  const { state } = useStore()
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  const isFresh =
    state.mode === 'select' &&
    state.history.length === 0 &&
    state.baselineCorrect === null &&
    Object.values(state.assignments).every((tray) => tray === 'unassigned')

  const showWelcome = isFresh && !welcomeDismissed

  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {showWelcome ? <Welcome onDismiss={() => setWelcomeDismissed(true)} /> : <Scene />}
      </main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-ink/40">
        A single perceptron with three features. The score is a distance from the decision line — not a
        probability.
      </footer>
    </div>
  )
}

function Scene() {
  const { state, dispatch } = useStore()

  switch (state.mode) {
    case 'sandbox':
      return <SandboxScene onDone={() => dispatch({ type: 'exitSandbox' })} />
    case 'select':
      return <DatasetShelf onReady={() => dispatch({ type: 'enterBaseline' })} />
    case 'baseline':
      return <BaselineScene onStartTraining={() => dispatch({ type: 'startTraining' })} />
    case 'train':
      return <TrainingScene />
    case 'epochEnd':
      return <EpochEndScene onGoToTest={() => dispatch({ type: 'enterTest' })} />
    case 'test':
      return <TestScene onReflect={() => dispatch({ type: 'enterReflect' })} />
    case 'reflect':
      return (
        <ReflectScene
          onTryDifferent={() => dispatch({ type: 'goToSelect' })}
          onRandomizeRetrain={() => {
            dispatch({ type: 'randomize' })
            dispatch({ type: 'enterBaseline' })
          }}
        />
      )
    default:
      return null
  }
}
