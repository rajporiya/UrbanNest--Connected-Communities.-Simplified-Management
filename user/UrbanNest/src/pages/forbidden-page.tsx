import { ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { ErrorState } from "@/components/feedback/error-state"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"

export function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-10">
      <ErrorState
        className="max-w-lg"
        icon={ShieldAlert}
        errorCode="403"
        title="Access denied"
        description="You do not have permission to open this page. Return to your dashboard or go back to the previous page."
        retryLabel="Go to Dashboard"
        onRetry={() => navigate(ROUTES.DASHBOARD)}
        backAction={<Button type="button" variant="outline" onClick={() => navigate(-1)}>Go Back</Button>}
      />
    </main>
  )
}
