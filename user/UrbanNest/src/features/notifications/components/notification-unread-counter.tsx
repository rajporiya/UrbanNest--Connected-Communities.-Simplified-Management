import { cn } from "@/utils/cn"

export function NotificationUnreadCounter({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null
  return <span className={cn("inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-white", className)} aria-label={`${count} unread notifications`}>{count > 99 ? "99+" : count}</span>
}
