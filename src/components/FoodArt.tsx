import type { FoodItem } from '../data/dataset'

/**
 * Cohesive, original food illustrations drawn as inline SVG (spec §4, §10).
 *
 * Every item shares the same round-plate framing and flat style so the set
 * reads as one collection. Condiment features are drawn as ketchup (red) and
 * mustard (gold) stripes where the food would carry them, which quietly ties
 * the picture to the feature vector the perceptron actually sees.
 *
 * Assets are bundled locally in the JS — no network request at runtime.
 */

const KETCHUP = '#D64527'
const MUSTARD = '#E8B81E'
const BUN = '#E6A866'
const BUN_DARK = '#C27F3C'
const SAUSAGE = '#C85C4E'
const PLATE = '#FBEFDD'
const PLATE_RING = '#EBD9BF'

function Plate() {
  return (
    <>
      <circle cx="80" cy="80" r="64" fill={PLATE} stroke={PLATE_RING} strokeWidth="4" />
    </>
  )
}

function KetchupStripe() {
  return (
    <path
      d="M44 78 q9 -8 18 0 q9 8 18 0 q9 -8 18 0 q9 8 18 0"
      fill="none"
      stroke={KETCHUP}
      strokeWidth="4"
      strokeLinecap="round"
    />
  )
}

function MustardStripe() {
  return (
    <path
      d="M44 86 q9 8 18 0 q9 -8 18 0 q9 8 18 0 q9 -8 18 0"
      fill="none"
      stroke={MUSTARD}
      strokeWidth="4"
      strokeLinecap="round"
    />
  )
}

function HotDog({ item, bun }: { item: FoodItem; bun: boolean }) {
  return (
    <>
      <Plate />
      {bun && <rect x="36" y="66" width="88" height="34" rx="17" fill={BUN} stroke={BUN_DARK} strokeWidth="3" />}
      <rect x="42" y={bun ? 72 : 74} width="76" height="16" rx="8" fill={SAUSAGE} />
      {item.features.ketchup === 1 && <KetchupStripe />}
      {item.features.mustard === 1 && <MustardStripe />}
      {bun && <rect x="36" y="94" width="88" height="10" rx="5" fill={BUN_DARK} opacity="0.5" />}
    </>
  )
}

function EmptyBun() {
  return (
    <>
      <Plate />
      <rect x="36" y="66" width="88" height="34" rx="17" fill={BUN} stroke={BUN_DARK} strokeWidth="3" />
      <rect x="48" y="78" width="64" height="10" rx="5" fill={BUN_DARK} opacity="0.35" />
    </>
  )
}

function CornDog() {
  return (
    <>
      <Plate />
      <rect x="70" y="96" width="6" height="36" rx="3" fill={BUN_DARK} />
      <rect x="52" y="40" width="40" height="64" rx="20" fill="#D79A3E" stroke={BUN_DARK} strokeWidth="3" />
    </>
  )
}

function Burger({ item }: { item: FoodItem }) {
  return (
    <>
      <Plate />
      <path d="M40 60 q40 -30 80 0 Z" fill={BUN} stroke={BUN_DARK} strokeWidth="3" />
      <rect x="40" y="60" width="80" height="8" fill="#6DB33F" />
      <rect x="40" y="68" width="80" height="12" rx="4" fill="#7A4A2B" />
      {item.features.ketchup === 1 && <rect x="40" y="80" width="80" height="5" fill={KETCHUP} />}
      {item.features.mustard === 1 && <rect x="40" y="85" width="80" height="5" fill={MUSTARD} />}
      <path d="M40 92 q40 24 80 0 Z" fill={BUN} stroke={BUN_DARK} strokeWidth="3" />
    </>
  )
}

function Pizza({ item }: { item: FoodItem }) {
  return (
    <>
      <Plate />
      <path d="M80 36 L116 110 L44 110 Z" fill="#F2C14E" stroke={BUN_DARK} strokeWidth="3" />
      <circle cx="72" cy="86" r="6" fill="#C0392B" />
      <circle cx="92" cy="94" r="6" fill="#C0392B" />
      <circle cx="80" cy="66" r="5" fill="#C0392B" />
      {item.features.ketchup === 1 && (
        <path d="M58 100 q11 -8 22 0 q11 8 22 0" fill="none" stroke={KETCHUP} strokeWidth="3.5" strokeLinecap="round" />
      )}
      {item.features.mustard === 1 && (
        <path d="M58 106 q11 8 22 0 q11 -8 22 0" fill="none" stroke={MUSTARD} strokeWidth="3.5" strokeLinecap="round" />
      )}
    </>
  )
}

function Fries() {
  return (
    <>
      <Plate />
      {[56, 66, 76, 86, 96].map((x, index) => (
        <rect key={x} x={x} y={42 + (index % 2) * 6} width="7" height="54" rx="3" fill={MUSTARD} stroke={BUN_DARK} strokeWidth="1.5" />
      ))}
      <path d="M48 86 L112 86 L106 120 L54 120 Z" fill={KETCHUP} />
    </>
  )
}

function Pretzel() {
  return (
    <>
      <Plate />
      <path
        d="M58 108 C40 78 64 48 80 70 C96 48 120 78 102 108 M80 70 L70 108 M80 70 L90 108"
        fill="none"
        stroke="#8A5A2B"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )
}

function Sushi() {
  return (
    <>
      <Plate />
      <rect x="50" y="74" width="60" height="30" rx="8" fill="#FFFDF5" stroke={PLATE_RING} strokeWidth="2" />
      <rect x="64" y="74" width="12" height="30" fill="#2E7D32" />
      <ellipse cx="80" cy="70" rx="34" ry="12" fill="#E8795A" />
    </>
  )
}

function Taco() {
  return (
    <>
      <Plate />
      <path d="M44 100 a36 36 0 0 1 72 0 Z" fill={MUSTARD} stroke={BUN_DARK} strokeWidth="3" />
      <path d="M52 94 h56" stroke="#6DB33F" strokeWidth="6" strokeLinecap="round" />
      <path d="M56 100 h48" stroke="#C0392B" strokeWidth="6" strokeLinecap="round" />
    </>
  )
}

function Donut() {
  return (
    <>
      <Plate />
      <circle cx="80" cy="80" r="36" fill="#E89BB0" stroke="#C97089" strokeWidth="3" />
      <circle cx="80" cy="80" r="13" fill={PLATE} />
      {([
        [62, 66, '#5AB1E8'],
        [98, 70, '#F2C14E'],
        [70, 98, '#6DB33F'],
        [100, 96, '#C0392B'],
      ] as const).map(([cx, cy, color], index) => (
        <rect
          key={index}
          x={cx}
          y={cy}
          width="8"
          height="3"
          rx="1.5"
          fill={color}
          transform={`rotate(${index * 40} ${cx} ${cy})`}
        />
      ))}
    </>
  )
}

function OnionRings() {
  return (
    <>
      <Plate />
      {[[66, 72], [96, 76], [80, 98]].map(([cx, cy], index) => (
        <g key={index}>
          <circle cx={cx} cy={cy} r="20" fill="#E0A85A" stroke={BUN_DARK} strokeWidth="3" />
          <circle cx={cx} cy={cy} r="10" fill={PLATE} />
        </g>
      ))}
    </>
  )
}

const HOT_DOG_IDS = new Set(['hd_plain', 'hd_ketchup', 'hd_mustard', 'hd_both'])
const BURGER_IDS = new Set(['hamburger', 'cheeseburger', 'mustard_burger'])
const PIZZA_IDS = new Set(['pizza_plain', 'pizza_ketchup', 'pizza_mustard', 'pizza_km'])

function renderFood(item: FoodItem) {
  if (HOT_DOG_IDS.has(item.id)) return <HotDog item={item} bun />
  if (BURGER_IDS.has(item.id)) return <Burger item={item} />
  if (PIZZA_IDS.has(item.id)) return <Pizza item={item} />
  switch (item.id) {
    case 'empty_bun':
      return <EmptyBun />
    case 'corndog':
      return <CornDog />
    case 'bunless_hotdog':
      return <HotDog item={item} bun={false} />
    case 'fries':
      return <Fries />
    case 'pretzel':
      return <Pretzel />
    case 'sushi':
      return <Sushi />
    case 'taco':
      return <Taco />
    case 'donut':
      return <Donut />
    case 'onion_rings':
      return <OnionRings />
    default:
      return <Plate />
  }
}

export function FoodArt({ item, className }: { item: FoodItem; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      role="img"
      aria-label={item.alt_text}
      data-food-id={item.id}
    >
      {renderFood(item)}
    </svg>
  )
}
