import { globalSearchMock } from "@/features/global-search/data/global-search.mock"
import { globalSearchQuerySchema } from "@/features/global-search/schemas/global-search.schema"
import type { GlobalSearchResult } from "@/features/global-search/types/global-search.types"

const normalize = (value: string) => value.trim().toLowerCase()
export const globalSearchService = {
  async search(query: string): Promise<GlobalSearchResult[]> {
    await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 100))
    const parsed = globalSearchQuerySchema.parse(query)
    const search = normalize(parsed)
    if (!search)
      return structuredClone(
        globalSearchMock
          .filter((item) => item.category === "Navigation")
          .slice(0, 6)
      )
    return structuredClone(
      globalSearchMock
        .filter((item) =>
          [item.title, item.subtitle, item.category, ...item.keywords].some(
            (value) => normalize(value).includes(search)
          )
        )
        .slice(0, 12)
    )
  },
}
