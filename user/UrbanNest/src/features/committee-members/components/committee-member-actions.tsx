import { useState } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckCircle2,
  ChevronDown,
  CircleOff,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROLES, type UserRole } from "@/constants/roles.constants"
import {
  activateCommitteeMember,
  deactivateCommitteeMember,
  deleteCommitteeMember,
} from "@/features/committee-members/store/committee-members.slice"
import type { CommitteeMember } from "@/features/committee-members/types/committee-member.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

type CommitteeMemberAction = "activate" | "deactivate" | "remove"

const actionDetails = {
  activate: {
    label: "Activate",
    icon: CheckCircle2,
    destructive: false,
    description:
      "Activate this committee member and restore their committee access.",
  },
  deactivate: {
    label: "Deactivate",
    icon: CircleOff,
    destructive: true,
    description:
      "Deactivate this committee member. They will temporarily lose committee access.",
  },
  remove: {
    label: "Remove",
    icon: Trash2,
    destructive: true,
    description:
      "Remove this member from the committee roster. Their historical activity will be retained.",
  },
} as const

function getAvailableActions(member: CommitteeMember): CommitteeMemberAction[] {
  return member.status === "active"
    ? ["deactivate", "remove"]
    : ["activate", "remove"]
}

export interface CommitteeMemberActionsProps {
  member: CommitteeMember
  currentUserRole?: UserRole
  variant?: "buttons" | "dropdown"
  onActionComplete?: (action: CommitteeMemberAction) => void
}

export function CommitteeMemberActions({
  member,
  currentUserRole,
  variant = "buttons",
  onActionComplete,
}: CommitteeMemberActionsProps) {
  const dispatch = useAppDispatch()
  const [pendingAction, setPendingAction] =
    useState<CommitteeMemberAction | null>(null)
  const [confirmation, setConfirmation] =
    useState<CommitteeMemberAction | null>(null)

  if (currentUserRole !== ROLES.COMMITTEE_HEAD) return null

  const actions = getAvailableActions(member)

  const executeAction = async (action: CommitteeMemberAction) => {
    if (pendingAction) return
    setPendingAction(action)

    try {
      const actionThunks = {
        activate: activateCommitteeMember,
        deactivate: deactivateCommitteeMember,
        remove: deleteCommitteeMember,
      }
      await dispatch(actionThunks[action](member.id)).unwrap()
      toast.success(
        action === "remove"
          ? "Committee member removed successfully."
          : `Committee member ${action}d successfully.`,
      )
      onActionComplete?.(action)
    } finally {
      setPendingAction(null)
    }
  }

  const requestAction = (action: CommitteeMemberAction) => {
    if (!pendingAction) setConfirmation(action)
  }

  return (
    <>
      {variant === "buttons" ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const details = actionDetails[action]
            const Icon = details.icon
            return (
              <Button
                key={action}
                type="button"
                variant={details.destructive ? "destructive" : "outline"}
                size="sm"
                disabled={Boolean(pendingAction)}
                onClick={() => requestAction(action)}
              >
                <Icon aria-hidden="true" />
                {pendingAction === action ? "Working..." : details.label}
              </Button>
            )
          })}
        </div>
      ) : (
        <Menu.Root>
          <Menu.Trigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={Boolean(pendingAction)}
              />
            }
          >
            Manage
            <ChevronDown aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align="end" className="z-50">
              <Menu.Popup className="min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                {actions.map((action) => {
                  const details = actionDetails[action]
                  const Icon = details.icon
                  return (
                    <Menu.Item
                      key={action}
                      onClick={() => requestAction(action)}
                      className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {details.label}
                    </Menu.Item>
                  )
                })}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}

      {confirmation ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setConfirmation(null)
          }}
          title={`${actionDetails[confirmation].label} committee member?`}
          description={actionDetails[confirmation].description}
          confirmLabel={actionDetails[confirmation].label}
          destructive={actionDetails[confirmation].destructive}
          loading={pendingAction === confirmation}
          icon={(() => {
            const Icon = actionDetails[confirmation].icon
            return <Icon />
          })()}
          onConfirm={() => executeAction(confirmation)}
        />
      ) : null}
    </>
  )
}

