import { CopyableText } from "@/components/common/copyable-text"
import { cn } from "@/lib/utils"

const GRID_SIZE = 21

function createSeed(value: string) {
  let seed = 2166136261

  for (const character of value || "UrbanNest") {
    seed ^= character.charCodeAt(0)
    seed = Math.imul(seed, 16777619)
  }

  return seed >>> 0
}

function isFinderCell(row: number, column: number) {
  const origins = [
    [0, 0],
    [0, GRID_SIZE - 7],
    [GRID_SIZE - 7, 0],
  ] as const

  return origins.some(([top, left]) => {
    const localRow = row - top
    const localColumn = column - left
    if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) {
      return false
    }

    return (
      localRow === 0 ||
      localRow === 6 ||
      localColumn === 0 ||
      localColumn === 6 ||
      (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4)
    )
  })
}

function createQrCells(value: string) {
  let state = createSeed(value)

  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
    const row = Math.floor(index / GRID_SIZE)
    const column = index % GRID_SIZE

    if (isFinderCell(row, column)) return true

    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) % 2 === 0
  })
}

export interface QrPreviewProps {
  value: string
  label?: string
  className?: string
}

export function QrPreview({
  value,
  label = "Visitor QR code",
  className,
}: QrPreviewProps) {
  const cells = createQrCells(value)

  return (
    <figure
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border bg-card p-5 text-center",
        className
      )}
    >
      <div
        role="img"
        aria-label={`${label} preview`}
        className="grid size-44 grid-cols-[repeat(21,minmax(0,1fr))] overflow-hidden border-8 border-white bg-white shadow-sm"
      >
        {cells.map((filled, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={filled ? "bg-slate-950" : "bg-white"}
          />
        ))}
      </div>
      <figcaption className="max-w-full min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <CopyableText
          value={value}
          displayValue={value}
          className="mt-1 max-w-full font-mono text-xs text-muted-foreground"
        />
      </figcaption>
    </figure>
  )
}
