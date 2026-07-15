import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import {
  Building2,
  CalendarDays,
  FileText,
  LoaderCircle,
  ReceiptIndianRupee,
  Search,
  UsersRound,
  Wrench,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROLES, type UserRole } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import {
  closeGlobalSearch,
  openGlobalSearch,
  recordGlobalSearchSelection,
  searchGlobally,
  setGlobalSearchQuery,
} from "@/features/global-search/store/global-search.slice"
import type {
  GlobalSearchCategory,
  GlobalSearchResult,
} from "@/features/global-search/types/global-search.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const icons: Record<GlobalSearchCategory, typeof Search> = {
  Residents: UsersRound,
  Complaints: Wrench,
  Bills: ReceiptIndianRupee,
  Visitors: Building2,
  Events: CalendarDays,
  Documents: FileText,
  Navigation: Search,
}

const accessRules: ReadonlyArray<{
  route: string
  roles: readonly UserRole[]
}> = [
  { route: ROUTES.REPORTS, roles: [ROLES.COMMITTEE_HEAD] },
  {
    route: ROUTES.RESIDENTS,
    roles: [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER],
  },
  {
    route: ROUTES.COMPLAINTS,
    roles: [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT],
  },
  {
    route: ROUTES.MAINTENANCE,
    roles: [ROLES.COMMITTEE_HEAD, ROLES.RESIDENT],
  },
  {
    route: ROUTES.PAYMENTS,
    roles: [ROLES.COMMITTEE_HEAD, ROLES.RESIDENT],
  },
]

function canAccessGlobalSearchResult(
  result: GlobalSearchResult,
  role: UserRole | undefined
) {
  if (!role) return false
  const rule = accessRules.find(
    ({ route }) => result.href === route || result.href.startsWith(`${route}/`)
  )
  return !rule || rule.roles.includes(role)
}

export function GlobalSearchCommand() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const role = useAppSelector((state) => state.auth.user?.role)
  const { open, query, results, recent, loading, error } = useAppSelector(
    (state) => state.globalSearch
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !event.repeat &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault()
        dispatch(open ? closeGlobalSearch() : openGlobalSearch())
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [dispatch, open])

  useEffect(() => {
    if (!open) return
    const request = dispatch(searchGlobally(query))
    return () => request.abort()
  }, [dispatch, open, query])

  useEffect(() => {
    if (!open) return
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open])

  const accessibleResults = useMemo(
    () => results.filter((result) => canAccessGlobalSearchResult(result, role)),
    [results, role]
  )
  const accessibleRecent = useMemo(
    () => recent.filter((result) => canAccessGlobalSearchResult(result, role)),
    [recent, role]
  )
  const visible = query.trim()
    ? accessibleResults
    : accessibleRecent.length
      ? accessibleRecent
      : accessibleResults
  const selectedIndex = Math.min(
    activeIndex,
    Math.max(0, visible.length - 1)
  )

  if (!open) return null

  const select = (result: GlobalSearchResult) => {
    if (!canAccessGlobalSearchResult(result, role)) return
    dispatch(recordGlobalSearchSelection(result))
    dispatch(closeGlobalSearch())
    navigate(result.href)
  }

  const handleInputKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((value) =>
        Math.min(value + 1, Math.max(0, visible.length - 1))
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((value) => Math.max(0, value - 1))
    } else if (event.key === "Enter" && visible[selectedIndex]) {
      event.preventDefault()
      select(visible[selectedIndex])
    }
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      dispatch(closeGlobalSearch())
      return
    }

    if (event.key !== "Tab") return
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"
      ) ?? []
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-foreground/35 p-3 pt-[10vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dispatch(closeGlobalSearch())
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl"
        onKeyDown={handleDialogKeyDown}
      >
        <h2 id="global-search-title" className="sr-only">
          Search UrbanNest
        </h2>
        <div className="flex items-center gap-3 border-b px-4">
          <Search aria-hidden="true" className="size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Search UrbanNest"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="global-search-results"
            aria-activedescendant={
              visible[selectedIndex]
                ? `global-search-${visible[selectedIndex].id}`
                : undefined
            }
            value={query}
            onChange={(event) => {
              setActiveIndex(0)
              dispatch(setGlobalSearchQuery(event.target.value))
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search residents, complaints, bills, visitors..."
            className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            Esc
          </kbd>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Close search"
            onClick={() => dispatch(closeGlobalSearch())}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          aria-busy={loading}
          className="max-h-[min(60vh,30rem)] overflow-y-auto p-2"
        >
          {!query.trim() && accessibleRecent.length ? (
            <p className="px-2 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Recent searches
            </p>
          ) : null}
          {loading && !visible.length ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Searching UrbanNest...
            </div>
          ) : null}
          {!loading && !visible.length ? (
            <div role="status" className="py-12 text-center">
              <Search
                aria-hidden="true"
                className="mx-auto size-8 text-muted-foreground"
              />
              <p className="mt-3 font-medium">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a resident name, flat number, complaint, or document.
              </p>
            </div>
          ) : null}
          {visible.map((result, index) => {
            const Icon = icons[result.category]
            return (
              <button
                id={`global-search-${result.id}`}
                key={result.id}
                role="option"
                aria-selected={selectedIndex === index}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => select(result)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"}`}
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {result.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {result.category}
                </Badge>
              </button>
            )
          })}
          {error ? (
            <p
              role="alert"
              className="p-3 text-center text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ Navigate · Enter Open</span>
          <span>Ctrl/⌘ K</span>
        </div>
      </div>
    </div>
  )
}
