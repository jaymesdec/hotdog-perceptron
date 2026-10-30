import { useStore } from '../../store'
import {
  datasetWarnings,
  itemsInTray,
  trainingItems,
  testingItems,
  type Tray,
} from '../../engine/state'
import { DATASET } from '../../data/dataset'
import { FoodCard } from './FoodCard'
import { Warnings } from './Warnings'

/**
 * The dataset shelf (spec §5A, §6 Scene 2): a grid of labeled cards the learner
 * sorts into Training and Testing trays, with warnings and a default split.
 */
export function DatasetShelf({ onReady }: { onReady: () => void }) {
  const { state, dispatch } = useStore()
  const warnings = datasetWarnings(state)
  const unassigned = itemsInTray(state, 'unassigned')
  const training = trainingItems(state)
  const testing = testingItems(state)

  const canProceed = training.length > 0 && testing.length > 0 && !warnings.trainingSingleClass

  const assign = (itemId: string, tray: Tray) => dispatch({ type: 'assignCard', itemId, tray })

  return (
    <section aria-labelledby="shelf-heading" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="shelf-heading" className="font-display text-xl font-bold text-ink">
            Be the researcher
          </h2>
          <p className="text-sm text-ink/70">
            Which examples will teach your detector what matters? Sort cards into Training and Testing.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'applyDefaultSplit' })}
            className="rounded-lg bg-ink/5 px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/15"
          >
            Suggest a balanced split
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'clearAssignments' })}
            className="rounded-lg bg-ink/5 px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/15"
          >
            Clear
          </button>
        </div>
      </header>

      <Warnings warnings={warnings} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Tray title={`Training tray (${training.length})`} hint="The detector learns from these.">
          {training.map((item) => (
            <FoodCard key={item.id} item={item} tray="train" onAssign={(tray) => assign(item.id, tray)} />
          ))}
          {training.length === 0 && <EmptyHint>Add examples to teach the detector.</EmptyHint>}
        </Tray>
        <Tray title={`Testing tray (${testing.length})`} hint="Held out — used only to check learning.">
          {testing.map((item) => (
            <FoodCard key={item.id} item={item} tray="test" onAssign={(tray) => assign(item.id, tray)} />
          ))}
          {testing.length === 0 && <EmptyHint>Hold out a few examples for testing.</EmptyHint>}
        </Tray>
      </div>

      <div>
        <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-ink/60">
          Shelf ({unassigned.length} unsorted of {DATASET.length})
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {unassigned.map((item) => (
            <FoodCard key={item.id} item={item} tray="unassigned" onAssign={(tray) => assign(item.id, tray)} />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onReady}
          className="rounded-xl bg-yes px-5 py-3 font-display font-bold text-white shadow disabled:cursor-not-allowed disabled:bg-ink/20"
        >
          Freeze parameters &amp; see the baseline →
        </button>
      </div>
    </section>
  )
}

function Tray({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink/15 bg-shelf/40 p-3">
      <div className="mb-2">
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        <p className="text-xs text-ink/60">{hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="col-span-full py-6 text-center text-sm text-ink/40">{children}</p>
}
