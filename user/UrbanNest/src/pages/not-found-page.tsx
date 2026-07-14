import { MapPinOff } from "lucide-react"
import { ErrorState } from "@/components/feedback/error-state"
export function NotFoundPage() { return <ErrorState icon={MapPinOff} code="404" title="Page not found" description="The page may have moved, or the address may be incorrect. Return home and continue from there." /> }
