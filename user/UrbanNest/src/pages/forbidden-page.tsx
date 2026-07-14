import { ShieldX } from "lucide-react"
import { ErrorState } from "@/components/feedback/error-state"
export function ForbiddenPage() { return <ErrorState icon={ShieldX} code="403" title="Access restricted" description="Your account does not have permission to view this area. Contact your society administrator if this seems incorrect." /> }
