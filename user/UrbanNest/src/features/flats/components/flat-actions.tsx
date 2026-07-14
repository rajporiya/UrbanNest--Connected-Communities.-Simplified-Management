import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { deleteFlat } from "@/features/flats/store/flats.slice"
import type { Flat } from "@/features/flats/types/flat.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export interface FlatActionsProps {
  flat: Flat
  variant?: "buttons" | "icons"
  onDeleted?: () => void
}

export function FlatActions({ flat, variant = "buttons", onDeleted }: FlatActionsProps) {
  const dispatch = useAppDispatch()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const editPath = `${ROUTES.FLATS}/${flat.id}/edit`

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await dispatch(deleteFlat(flat.id)).unwrap()
      toast.success(`${flat.flatNumber} was deleted successfully.`)
      onDeleted?.()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size={variant === "icons" ? "icon-xs" : "sm"}
          aria-label={variant === "icons" ? `Edit flat ${flat.flatNumber}` : undefined}
          render={<Link to={editPath} />}
        >
          <Pencil aria-hidden="true" />
          {variant === "buttons" ? "Edit" : null}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size={variant === "icons" ? "icon-xs" : "sm"}
          disabled={isDeleting}
          aria-label={variant === "icons" ? `Delete flat ${flat.flatNumber}` : undefined}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 aria-hidden="true" />
          {variant === "buttons" ? "Delete" : null}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete flat ${flat.flatNumber}?`}
        description={`This will remove ${flat.flatNumber} from ${flat.tower.name}. This action cannot be undone in the mock workspace.`}
        confirmLabel="Delete flat"
        destructive
        loading={isDeleting}
        icon={<Trash2 />}
        onConfirm={handleDelete}
      />
    </>
  )
}
