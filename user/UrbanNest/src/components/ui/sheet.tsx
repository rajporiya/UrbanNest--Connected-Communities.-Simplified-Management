import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

type SheetContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

type SheetProps = SheetContextValue & {
  children: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>
}

type SheetTriggerProps = {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>
  }>
}

export function SheetTrigger({ children }: SheetTriggerProps) {
  const context = React.useContext(SheetContext)

  if (!context) {
    return children
  }

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      children.props.onClick?.(event)
      context.onOpenChange(true)
    },
  })
}

type SheetContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right"
}

export function SheetContent({ className, side = "right", children, ...props }: SheetContentProps) {
  const context = React.useContext(SheetContext)

  if (!context?.open || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/40"
        onClick={() => context.onOpenChange(false)}
      />
      <div
        className={cn(
          "absolute top-0 h-full border bg-background shadow-2xl",
          side === "left" ? "left-0" : "right-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function SheetClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SheetContext)

  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium", className)}
      onClick={(event) => {
        props.onClick?.(event)
        context?.onOpenChange(false)
      }}
      {...props}
    />
  )
}