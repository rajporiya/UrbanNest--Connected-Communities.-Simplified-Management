import { ChevronRight, Ellipsis, Home } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/utils/cn"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppBreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

const DASHBOARD_PATH = "/dashboard"

export function AppBreadcrumb({
  items,
  showHome = true,
  className,
}: AppBreadcrumbProps) {
  const filteredItems = items.filter(
    (item) =>
      item.href !== DASHBOARD_PATH && item.label.trim().toLowerCase() !== "home"
  )
  const breadcrumbItems: BreadcrumbItem[] = showHome
    ? [{ label: "Dashboard", href: DASHBOARD_PATH }, ...filteredItems]
    : filteredItems
  const shouldCollapse = breadcrumbItems.length > 4

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const isHome = showHome && index === 0
          const hideOnMobile =
            shouldCollapse && index > 0 && index < breadcrumbItems.length - 2

          return (
            <li
              key={`${item.label}-${item.href ?? index}`}
              className={cn(
                "min-w-0 items-center gap-1.5",
                hideOnMobile ? "hidden sm:flex" : "flex"
              )}
            >
              {index > 0 ? (
                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
              ) : null}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate",
                    isLast && "font-medium text-foreground"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isHome ? (
                    <>
                      <Home aria-hidden="true" className="size-4 shrink-0" />
                      <span className="sr-only">Dashboard</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              )}

              {shouldCollapse && index === 0 ? (
                <span className="flex items-center gap-1.5 sm:hidden" aria-label="Collapsed breadcrumb items">
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                  <Ellipsis aria-hidden="true" className="size-4" />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
