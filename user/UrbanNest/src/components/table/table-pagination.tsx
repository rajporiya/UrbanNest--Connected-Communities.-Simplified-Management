import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TablePaginationProps {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  disabled?: boolean
  className?: string
}

type PageItem = number | "ellipsis-start" | "ellipsis-end"

function createPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
  const items: PageItem[] = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]
    if (previousPage && page - previousPage > 1) {
      items.push(previousPage === 1 ? "ellipsis-start" : "ellipsis-end")
    }
    items.push(page)
  })

  return items
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  className,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, Math.floor(totalPages))
  const currentPage = Math.min(Math.max(1, Math.floor(page)), safeTotalPages)
  const hasPageSizeControl = pageSize !== undefined && Boolean(onPageSizeChange)
  const options = [...new Set(pageSizeOptions.filter((option) => Number.isInteger(option) && option > 0))]
  if (pageSize !== undefined && !options.includes(pageSize)) options.push(pageSize)
  options.sort((a, b) => a - b)

  if (totalPages <= 1 && !hasPageSizeControl) return null

  const changePage = (nextPage: number) => {
    const clampedPage = Math.min(Math.max(1, nextPage), safeTotalPages)
    if (!disabled && clampedPage !== currentPage) onPageChange(clampedPage)
  }

  return (
    <nav
      aria-label="Table pagination"
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {totalItems !== undefined ? (
          <span>{totalItems.toLocaleString()} {totalItems === 1 ? "item" : "items"}</span>
        ) : null}
        {hasPageSizeControl ? (
          <label className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Go to first page"
          disabled={disabled || currentPage === 1}
          onClick={() => changePage(1)}
        >
          <ChevronsLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Go to previous page"
          disabled={disabled || currentPage === 1}
          onClick={() => changePage(currentPage - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        <span className="px-2 text-sm text-muted-foreground sm:hidden">
          Page {currentPage} of {safeTotalPages}
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {createPageItems(currentPage, safeTotalPages).map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                type="button"
                variant={item === currentPage ? "default" : "outline"}
                size="icon-sm"
                aria-label={`Go to page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
                disabled={disabled}
                onClick={() => changePage(item)}
              >
                {item}
              </Button>
            ) : (
              <span key={item} aria-hidden="true" className="px-1 text-muted-foreground">…</span>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Go to next page"
          disabled={disabled || currentPage === safeTotalPages}
          onClick={() => changePage(currentPage + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Go to last page"
          disabled={disabled || currentPage === safeTotalPages}
          onClick={() => changePage(safeTotalPages)}
        >
          <ChevronsRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
