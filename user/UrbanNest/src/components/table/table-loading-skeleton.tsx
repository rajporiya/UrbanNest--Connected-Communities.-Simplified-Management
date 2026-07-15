import { cn } from "@/lib/utils"

export interface TableLoadingSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

const skeletonWidths = ["w-24", "w-36", "w-20", "w-32", "w-28"] as const

export function TableLoadingSkeleton({
  rows = 6,
  columns = 5,
  className,
}: TableLoadingSkeletonProps) {
  const safeRows = Math.max(1, rows)
  const safeColumns = Math.max(1, columns)

  return (
    <>
      {Array.from({ length: safeRows }, (_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border/70 last:border-b-0">
          {Array.from({ length: safeColumns }, (_, columnIndex) => (
            <td key={columnIndex} className="h-14 px-4 py-3">
              {rowIndex === 0 && columnIndex === 0 ? (
                <span className="sr-only" role="status">
                  Loading table data
                </span>
              ) : null}
              <div
                aria-hidden="true"
                className={cn(
                  "h-4 max-w-full animate-pulse rounded-md bg-muted",
                  skeletonWidths[(rowIndex + columnIndex) % skeletonWidths.length],
                  className,
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
