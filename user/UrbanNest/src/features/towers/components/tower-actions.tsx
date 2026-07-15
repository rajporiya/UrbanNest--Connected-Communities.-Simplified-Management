import { useState } from "react"
import { Menu } from "@base-ui/react/menu"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { deleteTower } from "@/features/towers/store/towers.slice"
import type { Tower } from "@/features/towers/types/tower.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export interface TowerActionsProps {
  tower: Tower
  variant?: "buttons" | "dropdown"
  showEditAction?: boolean
  onDeleted?: () => void
}

export function TowerActions({
  tower,
  variant = "buttons",
  showEditAction = true,
  onDeleted,
}: TowerActionsProps) {
  const dispatch = useAppDispatch()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const editPath = `${ROUTES.TOWERS}/${tower.id}/edit`

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)

    try {
      await dispatch(deleteTower(tower.id)).unwrap()
      toast.success(`${tower.name} was deleted successfully.`)
      onDeleted?.()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {variant === "buttons" ? (
        <div className="flex flex-wrap gap-2">
          {showEditAction ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<Link to={editPath} />}
            >
              <Pencil aria-hidden="true" />
              Edit tower
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={() => setConfirmationOpen(true)}
          >
            <Trash2 aria-hidden="true" />
            {isDeleting ? "Deleting..." : "Delete tower"}
          </Button>
        </div>
      ) : (
        <Menu.Root>
          <Menu.Trigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Manage ${tower.name}`}
                disabled={isDeleting}
              />
            }
          >
            Manage
            <ChevronDown aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align="end" className="z-50">
              <Menu.Popup className="min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                {showEditAction ? (
                  <Menu.Item
                    render={<Link to={editPath} />}
                    className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Edit details
                  </Menu.Item>
                ) : null}
                <Menu.Item
                  onClick={() => setConfirmationOpen(true)}
                  className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none data-highlighted:bg-destructive/10"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete tower
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}

      <ConfirmDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title={`Delete ${tower.name}?`}
        description="This removes the tower from the management workspace. Confirm that its flats have been reassigned or removed before continuing."
        confirmLabel="Delete tower"
        destructive
        loading={isDeleting}
        icon={<Trash2 />}
        onConfirm={handleDelete}
      />
    </>
  )
}
