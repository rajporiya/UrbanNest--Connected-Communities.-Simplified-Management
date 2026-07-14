import type { KeyboardEvent, MouseEvent, ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { TableEmptyState } from "./table-empty-state"
import { TableLoadingSkeleton } from "./table-loading-skeleton"

export interface DataTableColumn<TData> {
  id: string
  header: ReactNode
  cell: (row: TData) => ReactNode
  className?: string
  headerClassName?: string
  hideOnMobile?: boolean
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData) => string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  onRowClick?: (row: TData) => void
  className?: string
}

const interactiveSelector =
  "a, button, input, select, textarea, summary, [role='button'], [role='link'], [data-row-click-ignore]"

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(interactiveSelector))
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, row: TData) => {
    if (!isInteractiveTarget(event.target)) onRowClick?.(row)
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: TData) => {
    if (isInteractiveTarget(event.target) || (event.key !== "Enter" && event.key !== " ")) return
    event.preventDefault()
    onRowClick?.(row)
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-card", className)}>
      <ScrollArea className="w-full">
        <table className="w-full min-w-max border-collapse text-left text-sm" aria-busy={loading}>
          <thead className="bg-muted/60 text-muted-foreground">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "h-11 px-4 text-xs font-semibold tracking-wide whitespace-nowrap",
                    column.hideOnMobile && "hidden sm:table-cell",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableLoadingSkeleton columns={columns.length} />
            ) : data.length === 0 ? (
              <TableEmptyState
                colSpan={columns.length}
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
              />
            ) : (
              data.map((row) => (
                <tr
                  key={getRowId(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
                  onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
                  className={cn(
                    "border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/40",
                    onRowClick &&
                      "cursor-pointer outline-none focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "h-14 px-4 py-3 align-middle text-foreground",
                        column.hideOnMobile && "hidden sm:table-cell",
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  )
}
