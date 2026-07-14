import { LoaderCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TwoFactorCard({
  enabled,
  loading,
  onToggle,
}: {
  enabled: boolean
  loading: boolean
  onToggle: (enabled: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="font-medium">Two-factor authentication</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {enabled
              ? "Your account has an additional verification step."
              : "Add a second verification step to protect your account."}
          </p>
        </div>
      </div>
      <Button
        variant={enabled ? "outline" : "default"}
        disabled={loading}
        onClick={() => onToggle(!enabled)}
      >
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        {enabled ? "Disable 2FA" : "Enable 2FA"}
      </Button>
    </div>
  )
}
