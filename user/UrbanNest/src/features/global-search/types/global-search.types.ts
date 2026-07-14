export type GlobalSearchCategory =
  | "Residents"
  | "Complaints"
  | "Bills"
  | "Visitors"
  | "Events"
  | "Documents"
  | "Navigation"

export interface GlobalSearchResult {
  id: string
  title: string
  subtitle: string
  category: GlobalSearchCategory
  href: string
  keywords: string[]
}
