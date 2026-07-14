import { useState } from "react"
import { ScanLine } from "lucide-react"
import { useSelector } from "react-redux"
import { PageHeader } from "@/components/layout/page-header"
import { ContentCard } from "@/components/common/content-card"
import { Button } from "@/components/ui/button"
import { QrPreview } from "@/features/visitors/components/qr-preview"
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge"
import { verifyVisitorPass } from "@/features/visitors/store/visitors.slice"
import type { VisitorsState } from "@/features/visitors/store/visitors.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  visitors: VisitorsState
}
export function VerifyVisitorPage() {
  const dispatch = useAppDispatch()
  const { selected, mutating, error } = useSelector(
    (state: State) => state.visitors
  )
  const [code, setCode] = useState("")
  return (
    <div className="space-y-6">
      <PageHeader
        title="Verify visitor"
        description="Scan a QR code or enter the pass code manually."
        icon={<ScanLine className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard title="Pass verification">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void dispatch(verifyVisitorPass(code))
            }}
          >
            <label className="space-y-2 text-sm font-medium">
              QR or pass code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="UN-VP-1001"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={!code.trim() || mutating}
              className="w-full"
            >
              <ScanLine />
              {mutating ? "Verifying..." : "Verify pass"}
            </Button>
          </form>
        </ContentCard>
        {selected && (
          <ContentCard
            title={selected.visitorName}
            description={`${selected.tower} · ${selected.flatNumber}`}
            headerAction={<VisitorStatusBadge status={selected.status} />}
          >
            <QrPreview value={selected.qrCode} />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {selected.purposeNote}
            </p>
          </ContentCard>
        )}
      </div>
    </div>
  )
}
