import { useId, useState } from 'react'
import { EXPLANATIONS, type Concept } from './explanations'

/**
 * A small "?" affordance that reveals a plain-language explanation of a concept
 * (spec §8). Keyboard-operable and announced to assistive tech.
 */
export function ExplainThis({ concept }: { concept: Concept }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const explanation = EXPLANATIONS[concept]

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((previous) => !previous)}
        className="grid h-5 w-5 place-items-center rounded-full bg-ink/10 text-xs font-bold text-ink hover:bg-ink/20"
        title={`Explain: ${explanation.title}`}
      >
        ?<span className="sr-only">Explain {explanation.title}</span>
      </button>
      {open && (
        <span
          id={panelId}
          role="note"
          className="absolute left-0 top-7 z-20 w-64 rounded-xl border border-ink/15 bg-white p-3 text-left text-sm shadow-lg"
        >
          <span className="mb-1 block font-display font-semibold text-ink">{explanation.title}</span>
          <span className="block leading-snug text-ink/80">{explanation.body}</span>
        </span>
      )}
    </span>
  )
}
