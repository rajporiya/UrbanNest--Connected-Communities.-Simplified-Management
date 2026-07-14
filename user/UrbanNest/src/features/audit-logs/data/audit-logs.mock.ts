import type {
  AuditAction,
  AuditLog,
  AuditModule,
  AuditSeverity,
} from "@/features/audit-logs/types/audit-log.types"

const actions: AuditAction[] = [
  "login",
  "update",
  "create",
  "payment",
  "approve",
  "delete",
  "logout",
]
const modules: AuditModule[] = [
  "auth",
  "residents",
  "visitors",
  "payments",
  "complaints",
  "settings",
]
const names = [
  "Aarav Mehta",
  "Meera Shah",
  "Riya Desai",
  "Kabir Patel",
  "Anaya Rao",
]

export const auditLogsMock: AuditLog[] = Array.from(
  { length: 36 },
  (_, index) => {
    const action = actions[index % actions.length]
    const module = modules[index % modules.length]
    const severity: AuditSeverity =
      action === "delete"
        ? "critical"
        : action === "update"
          ? "warning"
          : "info"
    return {
      id: `audit-${String(index + 1).padStart(3, "0")}`,
      action,
      module,
      severity,
      userId: `user-${(index % names.length) + 1}`,
      userName: names[index % names.length],
      userRole:
        index % 4 === 0
          ? "Committee Head"
          : index % 3 === 0
            ? "Security Guard"
            : "Committee Member",
      summary: `${action[0].toUpperCase()}${action.slice(1)} action in ${module}`,
      details: `${names[index % names.length]} performed a ${action} action in the ${module} module. The event was recorded automatically for accountability.`,
      ipAddress: `192.168.1.${20 + index}`,
      userAgent: index % 2 ? "Chrome on Android" : "Chrome on Windows",
      timestamp: new Date(
        Date.UTC(
          2026,
          6,
          15 - Math.floor(index / 4),
          10 - (index % 8),
          index % 60
        )
      ).toISOString(),
      changes:
        action === "update"
          ? [{ field: "status", before: "Pending", after: "Approved" }]
          : [],
    }
  }
)
