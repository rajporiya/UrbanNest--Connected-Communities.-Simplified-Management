import { cn } from "@/lib/utils"

interface SettingToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function SettingToggle({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  )
}
