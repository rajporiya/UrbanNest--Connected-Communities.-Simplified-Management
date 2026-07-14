import { Clock3, Globe2, Laptop, ShieldCheck, UserRound } from "lucide-react"
import { DrawerForm } from "@/components/global"
import { Badge } from "@/components/ui/badge"
import type { AuditLog } from "@/features/audit-logs/types/audit-log.types"

export function AuditLogDetailsDrawer({
  log,
  open,
  onOpenChange,
}: {
  log: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!log) return null
  const details = [
    {
      icon: UserRound,
      label: "Actor",
      value: `${log.userName} · ${log.userRole}`,
    },
    {
      icon: Clock3,
      label: "Timestamp",
      value: new Intl.DateTimeFormat("en-IN", {
        dateStyle: "full",
        timeStyle: "medium",
      }).format(new Date(log.timestamp)),
    },
    { icon: Globe2, label: "IP address", value: log.ipAddress },
    { icon: Laptop, label: "Device", value: log.userAgent },
  ]
  return (
    <DrawerForm
      open={open}
      onOpenChange={onOpenChange}
      title="Audit event details"
      description={log.id}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{log.action}</Badge>
          <Badge variant="outline">{log.module}</Badge>
          <Badge
            variant={log.severity === "critical" ? "destructive" : "secondary"}
          >
            {log.severity}
          </Badge>
        </div>
        <div>
          <h3 className="font-semibold">{log.summary}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {log.details}
          </p>
        </div>
        <dl className="space-y-3">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3 rounded-lg bg-muted/60 p-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm break-all">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
        {log.changes.length ? (
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4" />
              Recorded changes
            </h3>
            {log.changes.map((change) => (
              <div
                key={change.field}
                className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-sm"
              >
                <span className="font-medium">{change.field}</span>
                <span className="text-destructive line-through">
                  {change.before}
                </span>
                <span className="text-emerald-700 dark:text-emerald-300">
                  {change.after}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DrawerForm>
  )
}
