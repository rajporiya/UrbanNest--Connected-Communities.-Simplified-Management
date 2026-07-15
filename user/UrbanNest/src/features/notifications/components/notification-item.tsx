import { Bell, CalendarDays, CircleDollarSign, Megaphone, ShieldCheck, Trash2, UserRoundCheck } from "lucide-react"
import { useState, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { deleteNotification, markNotificationRead } from "@/features/notifications/store/notifications.slice"
import type { AppNotification, NotificationCategory } from "@/features/notifications/types/notification.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { cn } from "@/utils/cn"

const icons: Record<NotificationCategory, ComponentType<{ className?: string }>> = {
  announcement: Megaphone, billing: CircleDollarSign, visitor: UserRoundCheck, event: CalendarDays, security: ShieldCheck, system: Bell,
}
const formatTime = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))

export interface NotificationItemProps { notification: AppNotification; compact?: boolean }

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const dispatch = useAppDispatch(); const [confirming, setConfirming] = useState(false); const Icon = icons[notification.category]
  const read = async () => { if (!notification.read) await dispatch(markNotificationRead(notification.id)).unwrap() }
  const remove = async () => { await dispatch(deleteNotification(notification.id)).unwrap(); toast.success("Notification deleted.") }
  return <>
    <article className={cn("group relative flex gap-3 border-b border-border/70 transition-colors last:border-0 hover:bg-muted/30", compact ? "p-3" : "p-4 sm:p-5", !notification.read && "bg-primary/[0.04]")} aria-label={`${notification.read ? "Read" : "Unread"} notification: ${notification.title}`}>
      <div className={cn("mt-0.5 grid shrink-0 place-items-center rounded-xl", compact ? "size-9" : "size-10", notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}><Icon className="size-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2"><h3 className={cn("text-sm leading-5", notification.read ? "font-medium" : "font-semibold")}>{notification.title}</h3>{!notification.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}</div>
        <p className={cn("mt-1 text-sm leading-5 text-muted-foreground", compact && "line-clamp-2")}>{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"><time dateTime={notification.createdAt} className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</time>{notification.actionHref ? <Link className="text-xs font-semibold text-primary hover:underline" to={notification.actionHref} onClick={() => void read()}>{notification.actionLabel ?? "View"}</Link> : null}{!notification.read ? <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => void read()}>Mark as read</button> : null}</div>
      </div>
      <Button type="button" variant="ghost" size="icon-xs" className="shrink-0 text-muted-foreground hover:text-destructive" aria-label={`Delete ${notification.title}`} onClick={() => setConfirming(true)}><Trash2 /></Button>
    </article>
    <ConfirmDialog open={confirming} onOpenChange={setConfirming} destructive title="Delete notification?" description="This notification will be removed from your notification center." confirmLabel="Delete" icon={<Trash2 />} onConfirm={remove} />
  </>
}
