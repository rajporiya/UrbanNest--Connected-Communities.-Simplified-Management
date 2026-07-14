import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { FieldHint, RequiredLabel } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/schemas/auth.schema"
import { forgotPassword } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const successMessage = "If an account exists for this email, a password reset link has been sent."

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector((state) => state.auth.forgotPasswordLoading)
  const form = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } })
  const submit = async (values: ForgotPasswordFormValues) => { await dispatch(forgotPassword(values)); toast.success(successMessage); form.reset() }
  return <Card className="w-full max-w-md"><CardHeader><CardTitle className="text-2xl">Reset your password</CardTitle><p className="text-sm leading-6 text-muted-foreground">Enter your email and we’ll send reset instructions if an account is associated with it.</p></CardHeader><CardContent><form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate><div className="space-y-1.5"><RequiredLabel htmlFor="forgot-email" required>Email</RequiredLabel><div className="relative"><Mail aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-muted-foreground" /><input id="forgot-email" type="email" autoComplete="email" className="h-11 w-full rounded-lg border border-input bg-background px-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...form.register("email")} /></div>{form.formState.errors.email ? <FieldHint variant="error">{form.formState.errors.email.message}</FieldHint> : null}</div><Button type="submit" disabled={loading} className="w-full">{loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}{loading ? "Sending..." : "Send reset link"}</Button><Button variant="link" render={<Link to={ROUTES.LOGIN} />} className="w-full"><ArrowLeft aria-hidden="true" />Back to login</Button></form></CardContent></Card>
}
