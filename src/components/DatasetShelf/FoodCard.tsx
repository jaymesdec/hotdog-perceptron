import { FEATURE_KEYS } from '../../engine/types'
import type { Tray } from '../../engine/state'
import type { FoodItem } from '../../data/dataset'
import { FoodArt } from '../FoodArt'
import { FeatureChip } from '../common/FeatureChip'
import { Verdict } from '../common/Verdict'

/**
 * One labeled example in the dataset shelf (spec §5A). Shows the picture, its
 * true label (always visible — these are supervised examples), and the three
 * feature chips. Assignment buttons are plain buttons so the whole card is
 * keyboard-operable without drag (spec §10).
 */
export function FoodCard({
  item,
  tray,
  onAssign,
}: {
  item: FoodItem
  tray: Tray
  onAssign: (tray: Tray) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <FoodArt item={item} className="h-20 w-20 shrink-0" />
        <Verdict label={item.label} size="sm" />
      </div>
      <div className="font-display text-sm font-semibold text-ink">
        {item.name}
        {item.group === 'challenge' && (
          <span className="ml-1 rounded bg-mustard/30 px-1 text-[10px] font-bold uppercase tracking-wide text-ink/70">
            challenge
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {FEATURE_KEYS.map((featureKey) => (
          <FeatureChip key={featureKey} feature={featureKey} value={item.features[featureKey]} size="sm" />
        ))}
      </div>
      <div className="mt-1 flex gap-1" role="group" aria-label={`Assign ${item.name}`}>
        <AssignButton active={tray === 'train'} onClick={() => onAssign('train')}>
          Train
        </AssignButton>
        <AssignButton active={tray === 'test'} onClick={() => onAssign('test')}>
          Test
        </AssignButton>
        {tray !== 'unassigned' && (
          <AssignButton active={false} onClick={() => onAssign('unassigned')}>
            Remove
          </AssignButton>
        )}
      </div>
    </div>
  )
}

function AssignButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
        active ? 'bg-ink text-paper' : 'bg-ink/5 text-ink hover:bg-ink/15'
      }`}
    >
      {children}
    </button>
  )
}
