import { useState } from "react"
import { Menu } from "@base-ui/react/menu"
import { Ban, CheckCircle2, ChevronDown, CircleOff, RotateCcw, XCircle } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROLES, type UserRole } from "@/constants/roles.constants"
import { activateResident, approveResident, blockResident, deactivateResident, rejectResident, unblockResident } from "@/features/residents/store/residents.slice"
import type { Resident } from "@/features/residents/types/resident.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

type ResidentAction = "approve" | "reject" | "activate" | "deactivate" | "block" | "unblock"
const details = {
  approve: { label: "Approve", icon: CheckCircle2, sensitive: false, description: "Approve this resident account and allow committee-managed activation." },
  reject: { label: "Reject", icon: XCircle, sensitive: true, description: "Reject this registration request. The resident will not receive account access." },
  activate: { label: "Activate", icon: CheckCircle2, sensitive: false, description: "Activate this resident account and restore access." },
  deactivate: { label: "Deactivate", icon: CircleOff, sensitive: true, description: "Deactivate this resident account. The resident will temporarily lose access." },
  block: { label: "Block", icon: Ban, sensitive: true, description: "Block this resident account immediately and prevent all account access." },
  unblock: { label: "Unblock", icon: RotateCcw, sensitive: false, description: "Unblock this resident account and return it to inactive status." },
} as const

function validActions(resident: Resident): ResidentAction[] {
  if (resident.approvalStatus === "pending") return ["approve", "reject"]
  if (resident.accountStatus === "blocked") return ["unblock"]
  if (resident.accountStatus === "inactive") return ["activate", "block"]
  if (resident.approvalStatus === "approved" && resident.accountStatus === "active") return ["deactivate", "block"]
  return []
}

export interface ResidentStatusActionsProps { resident: Resident; currentUserRole: UserRole; variant?: "buttons" | "dropdown"; onActionComplete?: () => void }
export function ResidentStatusActions({ resident, currentUserRole, variant = "buttons", onActionComplete }: ResidentStatusActionsProps) {
  const dispatch = useAppDispatch()
  const [pending, setPending] = useState<ResidentAction | null>(null)
  const [confirmation, setConfirmation] = useState<ResidentAction | null>(null)
  if (currentUserRole !== ROLES.COMMITTEE_HEAD) return null
  const actions = validActions(resident)
  if (!actions.length) return null

  const execute = async (action: ResidentAction) => {
    if (pending) return
    setPending(action)
    try {
      const thunks = { approve: approveResident, reject: rejectResident, activate: activateResident, deactivate: deactivateResident, block: blockResident, unblock: unblockResident }
      await dispatch(thunks[action](resident.id)).unwrap()
      toast.success(`Resident ${details[action].label.toLowerCase()} action completed.`)
      onActionComplete?.()
    } finally { setPending(null) }
  }
  const choose = (action: ResidentAction) => { if (details[action].sensitive) setConfirmation(action); else void execute(action).catch(() => toast.error("The resident status could not be updated.")) }
  const actionButton = (action: ResidentAction) => { const Icon = details[action].icon; return <Button key={action} type="button" variant={details[action].sensitive ? "destructive" : "outline"} size="sm" disabled={Boolean(pending)} onClick={() => choose(action)}><Icon aria-hidden="true" />{pending === action ? "Working..." : details[action].label}</Button> }

  return <>{variant === "buttons" ? <div className="flex flex-wrap gap-2">{actions.map(actionButton)}</div> : <Menu.Root><Menu.Trigger render={<Button type="button" variant="outline" size="sm" disabled={Boolean(pending)} />}>Manage <ChevronDown aria-hidden="true" /></Menu.Trigger><Menu.Portal><Menu.Positioner sideOffset={6} align="end" className="z-50"><Menu.Popup className="min-w-44 rounded-lg border border-border bg-popover p-1 shadow-xl">{actions.map((action) => { const Icon = details[action].icon; return <Menu.Item key={action} onClick={() => choose(action)} className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-accent"><Icon aria-hidden="true" className="size-4" />{details[action].label}</Menu.Item> })}</Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>}{confirmation ? <ConfirmDialog open onOpenChange={(open) => { if (!open) setConfirmation(null) }} title={`${details[confirmation].label} resident?`} description={details[confirmation].description} confirmLabel={details[confirmation].label} destructive loading={pending === confirmation} onConfirm={() => execute(confirmation)} /> : null}</>
}
