import { Building2 } from "lucide-react"
import { cn } from "@/utils/cn"

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/15", className)} aria-hidden="true">
      <Building2 className="size-6" />
    </div>
  )
}
