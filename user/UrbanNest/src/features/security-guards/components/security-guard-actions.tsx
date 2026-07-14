import { useState } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckCircle2,
  ChevronDown,
  CircleOff,
  Clock3,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import {
  activateSecurityGuard,
  deactivateSecurityGuard,
  deleteSecurityGuard,
} from "@/features/security-guards/store/security-guards.slice"
import type { SecurityGuard } from "@/features/security-guards/types/security-guard.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

type GuardAction = "activate" | "deactivate" | "delete"

const actionDetails = {
  activate: {
    label: "Activate",
    progressLabel: "Activating...",
    icon: CheckCircle2,
    description: "Activate this security guard and restore their access to assigned guard workflows.",
    destructive: false,
  },
  deactivate: {
    label: "Deactivate",
    progressLabel: "Deactivating...",
    icon: CircleOff,
    description: "Deactivate this security guard. They will temporarily lose access to guard workflows.",
    destructive: true,
  },
  delete: {
    label: "Remove",
    progressLabel: "Removing...",
    icon: Trash2,
    description: "Remove this security guard record. This action cannot be undone in the mock workspace.",
    destructive: true,
  },
} as const

export interface SecurityGuardActionsProps {
  guard: SecurityGuard
  variant?: "buttons" | "dropdown"
  showAssignmentActions?: boolean
  showEditAction?: boolean
  onActionComplete?: () => void
  onDeleted?: () => void
}

export function SecurityGuardActions({
  guard,
  variant = "buttons",
  showAssignmentActions = false,
  showEditAction = true,
  onActionComplete,
  onDeleted,
}: SecurityGuardActionsProps) {
  const dispatch = useAppDispatch()
  const [confirmation, setConfirmation] = useState<GuardAction | null>(null)
  const [pendingAction, setPendingAction] = useState<GuardAction | null>(null)
  const editPath = `${ROUTES.SECURITY_GUARDS}/${guard.id}/edit`
  const statusAction: GuardAction = guard.status === "active" ? "deactivate" : "activate"

  const execute = async (action: GuardAction) => {
    if (pendingAction) return
    setPendingAction(action)
    try {
      if (action === "delete") {
        await dispatch(deleteSecurityGuard(guard.id)).unwrap()
        toast.success(`${guard.fullName} was removed from security staff.`)
        onDeleted?.()
      } else if (action === "activate") {
        await dispatch(activateSecurityGuard(guard.id)).unwrap()
        toast.success(`${guard.fullName} is now active.`)
        onActionComplete?.()
      } else {
        await dispatch(deactivateSecurityGuard(guard.id)).unwrap()
        toast.success(`${guard.fullName} was deactivated.`)
        onActionComplete?.()
      }
    } finally {
      setPendingAction(null)
    }
  }

  const editItems = (
    <>
      {showEditAction ? (
        <Button type="button" variant="outline" size="sm" render={<Link to={editPath} />}>
          <Pencil aria-hidden="true" />Edit
        </Button>
      ) : null}
      {showAssignmentActions ? (
        <>
          <Button type="button" variant="outline" size="sm" render={<Link to={`${editPath}?focus=gate`} />}>
            <MapPin aria-hidden="true" />Assign gate
          </Button>
          <Button type="button" variant="outline" size="sm" render={<Link to={`${editPath}?focus=shift`} />}>
            <Clock3 aria-hidden="true" />Assign shift
          </Button>
        </>
      ) : null}
    </>
  )

  const statusDetail = actionDetails[statusAction]
  const StatusIcon = statusDetail.icon

  return (
    <>
      {variant === "buttons" ? (
        <div className="flex flex-wrap gap-2">
          {editItems}
          <Button
            type="button"
            variant={statusDetail.destructive ? "destructive" : "outline"}
            size="sm"
            disabled={Boolean(pendingAction)}
            onClick={() => setConfirmation(statusAction)}
          >
            <StatusIcon aria-hidden="true" />
            {pendingAction === statusAction ? statusDetail.progressLabel : statusDetail.label}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={Boolean(pendingAction)}
            onClick={() => setConfirmation("delete")}
          >
            <Trash2 aria-hidden="true" />
            {pendingAction === "delete" ? actionDetails.delete.progressLabel : actionDetails.delete.label}
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
                aria-label={`Manage ${guard.fullName}`}
                disabled={Boolean(pendingAction)}
              />
            }
          >
            Manage <ChevronDown aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align="end" className="z-50">
              <Menu.Popup className="min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                {showEditAction ? (
                  <Menu.Item
                    render={<Link to={editPath} />}
                    className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent"
                  >
                    <Pencil aria-hidden="true" className="size-4" />Edit details
                  </Menu.Item>
                ) : null}
                {showAssignmentActions ? (
                  <>
                    <Menu.Item
                      render={<Link to={`${editPath}?focus=gate`} />}
                      className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent"
                    >
                      <MapPin aria-hidden="true" className="size-4" />Assign gate
                    </Menu.Item>
                    <Menu.Item
                      render={<Link to={`${editPath}?focus=shift`} />}
                      className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent"
                    >
                      <Clock3 aria-hidden="true" className="size-4" />Assign shift
                    </Menu.Item>
                  </>
                ) : null}
                <Menu.Separator className="my-1 h-px bg-border" />
                <Menu.Item
                  onClick={() => setConfirmation(statusAction)}
                  className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent"
                >
                  <StatusIcon aria-hidden="true" className="size-4" />{statusDetail.label}
                </Menu.Item>
                <Menu.Item
                  onClick={() => setConfirmation("delete")}
                  className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none data-highlighted:bg-destructive/10"
                >
                  <Trash2 aria-hidden="true" className="size-4" />Remove
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}

      {confirmation ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => { if (!open) setConfirmation(null) }}
          title={`${actionDetails[confirmation].label} security guard?`}
          description={actionDetails[confirmation].description}
          confirmLabel={actionDetails[confirmation].label}
          destructive={actionDetails[confirmation].destructive}
          loading={pendingAction === confirmation}
          icon={(() => {
            const Icon = actionDetails[confirmation].icon
            return <Icon />
          })()}
          onConfirm={() => execute(confirmation)}
        />
      ) : null}
    </>
  )
}
