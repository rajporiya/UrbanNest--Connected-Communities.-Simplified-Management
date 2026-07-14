import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { FieldHint, RequiredLabel } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { login } from "@/features/auth/store/auth.slice"
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const inputClass = "h-11 w-full rounded-lg border border-input bg-background px-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loginLoading, error } = useAppSelector((state) => state.auth)
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", rememberMe: false } })
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD

  const submit = async (values: LoginFormValues) => {
    try { await dispatch(login(values)).unwrap(); toast.success("Welcome back to UrbanNest"); navigate(from, { replace: true }) }
    catch { toast.error("Sign in failed. Check your credentials and try again.") }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle className="text-2xl">Welcome back</CardTitle><p className="text-sm text-muted-foreground">Sign in to manage your UrbanNest community.</p></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>
          {error ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
          <div className="space-y-1.5"><RequiredLabel htmlFor="email" required>Email</RequiredLabel><div className="relative"><Mail aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-muted-foreground" /><input id="email" type="email" autoComplete="email" className={inputClass} {...form.register("email")} /></div>{form.formState.errors.email ? <FieldHint variant="error">{form.formState.errors.email.message}</FieldHint> : null}</div>
          <div className="space-y-1.5"><div className="flex justify-between gap-3"><RequiredLabel htmlFor="password" required>Password</RequiredLabel><Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-medium text-primary hover:underline">Forgot password?</Link></div><div className="relative"><LockKeyhole aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-muted-foreground" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" className={`${inputClass} pr-10`} {...form.register("password")} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring">{showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button></div>{form.formState.errors.password ? <FieldHint variant="error">{form.formState.errors.password.message}</FieldHint> : null}</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 rounded border-input accent-primary" {...form.register("rememberMe")} />Remember me on this device</label>
          <Button type="submit" disabled={loginLoading} className="w-full">{loginLoading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}{loginLoading ? "Signing in..." : "Sign in"}</Button>
          <p className="text-center text-sm text-muted-foreground">New resident? <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">Create an account</Link></p>
        </form>
      </CardContent>
    </Card>
  )
}
