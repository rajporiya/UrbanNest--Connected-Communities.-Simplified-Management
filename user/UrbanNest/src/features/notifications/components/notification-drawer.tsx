import { Bell, CheckCheck, ExternalLink, X } from "lucide-react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import type { RootState } from "@/app/root-reducer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ROUTES } from "@/constants/routes.constants"
import { NotificationList } from "@/features/notifications/components/notification-list"
import { fetchNotifications, markAllNotificationsRead, type NotificationsState } from "@/features/notifications/store/notifications.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { notifications: NotificationsState }
export interface NotificationDrawerProps { open: boolean; onOpenChange: (open: boolean) => void }

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const dispatch = useAppDispatch(); const state = useAppSelector((root) => (root as State).notifications)
  useEffect(() => { if (open) void dispatch(fetchNotifications({ page: 1, limit: 8 })) }, [dispatch, open])
  const markAll = async () => { try { await dispatch(markAllNotificationsRead()).unwrap(); toast.success("All notifications marked as read.") } catch (error) { toast.error(typeof error === "string" ? error : "Notifications could not be updated.") } }
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="flex w-full max-w-md flex-col" aria-label="Notification center">
    <SheetHeader className="border-b border-border p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><SheetTitle className="flex items-center gap-2"><Bell className="size-5" />Notifications {state.unreadCount ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{state.unreadCount}</span> : null}</SheetTitle><SheetDescription className="mt-1">Recent UrbanNest updates and actions.</SheetDescription></div><SheetClose className="size-9 hover:bg-muted" aria-label="Close notifications"><X className="size-4" /></SheetClose></div><Button className="mt-3 w-fit" type="button" size="sm" variant="outline" disabled={!state.unreadCount || state.mutationLoading} onClick={() => void markAll()}><CheckCheck />Mark all read</Button></SheetHeader>
    <ScrollArea className="min-h-0 flex-1 p-3"><NotificationList notifications={state.items} compact /></ScrollArea>
    <div className="border-t border-border p-4"><Button className="w-full" variant="outline" render={<Link to={ROUTES.NOTIFICATIONS} onClick={() => onOpenChange(false)} />}>View all notifications<ExternalLink /></Button></div>
  </SheetContent></Sheet>
}
