import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AppBrand } from "@/components/common/app-brand"
import { FieldHint, RequiredLabel } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { login } from "@/features/auth/store/auth.slice"
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const inputClass = "h-11 w-full rounded-xl border border-input bg-background/90 px-10 text-sm shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loginLoading, error } = useAppSelector((state) => state.auth)
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", rememberMe: false } })
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD

  const submit = async (values: LoginFormValues) => {
    try {
      const response = await dispatch(login(values)).unwrap()
      toast.success(`Welcome Back ${response.user.firstName} ${response.user.lastName}`)
      navigate(from, { replace: true })
    } catch {
      toast.error("Sign in failed. Check your credentials and try again.")
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full border border-primary/20 bg-primary/10 p-3 text-primary shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-6" />
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
        <CardHeader className="border-b border-border/70 bg-gradient-to-br from-primary/5 via-background to-background px-6 pb-6 pt-6">
          <div className="flex justify-center">
            <AppBrand showTagline={false} logoSize="md" />
          </div>
          <div className="mt-4 space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Securely access residents, visitors, notices, payments, and community operations from one portal.</p>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-6 sm:px-8">
          <form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>
            {error ? <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

            <div className="space-y-1.5">
              <RequiredLabel htmlFor="email" required>Email</RequiredLabel>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
                <input id="email" type="email" autoComplete="email" placeholder="Enter your email" className={inputClass} {...form.register("email")} />
              </div>
              {form.formState.errors.email ? <FieldHint variant="error">{form.formState.errors.email.message}</FieldHint> : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between gap-3">
                <RequiredLabel htmlFor="password" required>Password</RequiredLabel>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className={`${inputClass} pr-10`} {...form.register("password")} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                  {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                </button>
              </div>
              {form.formState.errors.password ? <FieldHint variant="error">{form.formState.errors.password.message}</FieldHint> : null}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="size-4 rounded border-input accent-primary" {...form.register("rememberMe")} />
              Remember me on this device
            </label>

            <Button type="submit" disabled={loginLoading} className="h-11 w-full rounded-xl font-medium shadow-sm">
              {loginLoading ? <LoaderCircle aria-hidden="true" className="mr-2 animate-spin" /> : null}
              {loginLoading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New resident? <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">Create an account</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
