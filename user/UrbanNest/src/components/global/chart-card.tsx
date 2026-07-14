import type { ReactNode } from "react"
import { ContentCard } from "@/components/common/content-card"
export function ChartCard({
  title,
  description,
  children,
  loading = false,
}: {
  title: string
  description?: string
  children: ReactNode
  loading?: boolean
}) {
  return (
    <ContentCard title={title} description={description} loading={loading}>
      <div
        className="h-72 min-w-0"
        role="img"
        aria-label={description ? `${title}: ${description}` : title}
      >
        {children}
      </div>
    </ContentCard>
  )
}
