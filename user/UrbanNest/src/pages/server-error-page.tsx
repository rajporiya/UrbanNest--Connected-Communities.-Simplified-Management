import { ServerCrash } from "lucide-react"
import { ErrorState } from "@/components/feedback/error-state"
export function ServerErrorPage() { return <ErrorState icon={ServerCrash} code="500" title="Something went wrong" description="We could not complete this request. Please wait a moment and try again." /> }
