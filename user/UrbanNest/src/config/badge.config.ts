import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  CheckCheck,
  CheckCircle2,
  CircleDollarSign,
  CircleOff,
  CircleX,
  Clock3,
  Crown,
  House,
  LockKeyhole,
  LogIn,
  LogOut,
  Minus,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@/constants/roles.constants"

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "failed"
  | "refunded"
  | "resolved"
  | "closed"
  | "checked-in"
  | "checked-out"

export type PriorityType = "low" | "medium" | "high" | "emergency"

type BadgeConfiguration = Readonly<{
  label: string
  icon: LucideIcon
  className: string
}>

export const statusBadgeConfig = {
  active: { label: "Active", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" },
  inactive: { label: "Inactive", icon: CircleOff, className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" },
  pending: { label: "Pending", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300" },
  approved: { label: "Approved", icon: BadgeCheck, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" },
  rejected: { label: "Rejected", icon: XCircle, className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300" },
  paid: { label: "Paid", icon: CircleDollarSign, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" },
  failed: { label: "Failed", icon: CircleX, className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300" },
  refunded: { label: "Refunded", icon: RotateCcw, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300" },
  resolved: { label: "Resolved", icon: CheckCheck, className: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300" },
  closed: { label: "Closed", icon: LockKeyhole, className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" },
  "checked-in": { label: "Checked In", icon: LogIn, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300" },
  "checked-out": { label: "Checked Out", icon: LogOut, className: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300" },
} as const satisfies Record<StatusType, BadgeConfiguration>

export const priorityBadgeConfig = {
  low: { label: "Low", icon: ArrowDown, className: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300" },
  medium: { label: "Medium", icon: Minus, className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300" },
  high: { label: "High", icon: ArrowUp, className: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-300" },
  emergency: { label: "Emergency", icon: TriangleAlert, className: "border-red-300 bg-red-100 font-semibold text-red-800 shadow-sm dark:border-red-800 dark:bg-red-950 dark:text-red-200" },
} as const satisfies Record<PriorityType, BadgeConfiguration>

export const roleBadgeConfig = {
  committee_head: { label: "Committee Head", icon: Crown, className: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300" },
  committee_member: { label: "Committee Member", icon: Users, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300" },
  resident: { label: "Resident", icon: House, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" },
  security_guard: { label: "Security Guard", icon: ShieldCheck, className: "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" },
} as const satisfies Record<UserRole, BadgeConfiguration>
