import { useState, type ReactNode } from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  icon?: ReactNode
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLoading = loading || isSubmitting

  const handleConfirm = async () => {
    if (isLoading) return
    setIsSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      toast.error("The action could not be completed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoading) onOpenChange(nextOpen)
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity" />
        <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <AlertDialogPrimitive.Popup className="w-full max-w-md rounded-xl border border-border bg-background p-5 text-foreground shadow-xl outline-none sm:p-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              {icon ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5",
                    destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                  )}
                >
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <AlertDialogPrimitive.Title className="text-lg font-semibold leading-6 text-foreground">
                  {title}
                </AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </AlertDialogPrimitive.Description>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogPrimitive.Close
                render={<Button type="button" variant="outline" disabled={isLoading} className="w-full sm:w-auto" />}
              >
                {cancelLabel}
              </AlertDialogPrimitive.Close>
              <Button
                type="button"
                variant={destructive ? "destructive" : "default"}
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full sm:w-auto"
                onClick={() => void handleConfirm()}
              >
                {isLoading ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                {isLoading ? "Please wait..." : confirmLabel}
              </Button>
            </div>
          </AlertDialogPrimitive.Popup>
        </AlertDialogPrimitive.Viewport>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
