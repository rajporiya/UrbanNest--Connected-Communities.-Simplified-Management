import { FileQuestion } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { ErrorState } from "@/components/feedback/error-state"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-10">
      <ErrorState
        className="max-w-lg"
        icon={FileQuestion}
        errorCode="404"
        title="Page not found"
        description="The requested page does not exist or may have been moved. Return to your dashboard or go back."
        retryLabel="Go to Dashboard"
        onRetry={() => navigate(ROUTES.DASHBOARD)}
        backAction={<Button type="button" variant="outline" onClick={() => navigate(-1)}>Go Back</Button>}
      />
    </main>
  )
}
