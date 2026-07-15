import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/error-state"
import { FieldHint, RequiredLabel } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { PasswordStrength } from "@/features/auth/components/password-strength"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/schemas/auth.schema"
import { resetPassword } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const [showPassword, setShowPassword] = useState(false), [tokenError, setTokenError] = useState(false)
  const dispatch = useAppDispatch(), navigate = useNavigate()
  const loading = useAppSelector((state) => state.auth.resetPasswordLoading)
  const form = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirmPassword: "" } })
  const password = useWatch({ control: form.control, name: "password" })
  const submit = async (values: ResetPasswordFormValues) => { if (!token) return; try { await dispatch(resetPassword({ token, ...values })).unwrap(); toast.success("Password reset successfully. You can now sign in."); navigate(ROUTES.LOGIN, { replace: true }) } catch { setTokenError(true); toast.error("This reset link is invalid or has expired.") } }
  if (!token || tokenError) return <ErrorState compact title="Reset link unavailable" description="This password reset link is missing, invalid, or expired. Request a new link to continue." backAction={<Button render={<Link to={ROUTES.FORGOT_PASSWORD} />}>Request a new link</Button>} />
  const control = "h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
  return <Card className="w-full max-w-md"><CardHeader><CardTitle className="text-2xl">Create a new password</CardTitle><p className="text-sm text-muted-foreground">Use at least 8 characters and combine uppercase, lowercase, numbers, and symbols.</p></CardHeader><CardContent><form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate><div className="space-y-1.5"><RequiredLabel htmlFor="new-password" required>New password</RequiredLabel><div className="relative"><input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className={control} {...form.register("password")} /><button type="button" aria-label={showPassword ? "Hide passwords" : "Show passwords"} onClick={() => setShowPassword((value) => !value)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-md focus-visible:ring-2 focus-visible:ring-ring">{showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button></div>{form.formState.errors.password ? <FieldHint variant="error">{form.formState.errors.password.message}</FieldHint> : null}<PasswordStrength password={password} /></div><div className="space-y-1.5"><RequiredLabel htmlFor="confirm-new-password" required>Confirm new password</RequiredLabel><input id="confirm-new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className={control} {...form.register("confirmPassword")} />{form.formState.errors.confirmPassword ? <FieldHint variant="error">{form.formState.errors.confirmPassword.message}</FieldHint> : null}</div><Button type="submit" disabled={loading} className="w-full">{loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}{loading ? "Resetting..." : "Reset password"}</Button></form></CardContent></Card>
}
