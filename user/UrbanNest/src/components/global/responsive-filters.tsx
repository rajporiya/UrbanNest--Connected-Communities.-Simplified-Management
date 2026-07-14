import type { ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DrawerForm } from "./drawer-form"

export function ResponsiveFilters({
  open,
  onOpenChange,
  children,
  activeCount = 0,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  activeCount?: number
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onOpenChange(true)}
      >
        <SlidersHorizontal aria-hidden="true" />
        Filters{activeCount ? ` (${activeCount})` : ""}
      </Button>
      <DrawerForm
        open={open}
        onOpenChange={onOpenChange}
        title="Filters"
        description="Refine the visible results."
      >
        <div className="space-y-4">{children}</div>
      </DrawerForm>
    </>
  )
}
