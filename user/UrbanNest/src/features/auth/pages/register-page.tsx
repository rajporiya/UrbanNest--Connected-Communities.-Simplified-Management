import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { FieldHint, RequiredLabel } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { PasswordStrength } from "@/features/auth/components/password-strength"
import { mockTowers } from "@/features/auth/data/mock-towers"
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas/auth.schema"
import { registerResident } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const control = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch(), navigate = useNavigate()
  const loading = useAppSelector((state) => state.auth.registerLoading)
  const form = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", email: "", mobile: "", password: "", confirmPassword: "", tower: "", flatNumber: "", termsAccepted: false } })
  const password = useWatch({ control: form.control, name: "password" })
  const submit = async (values: RegisterFormValues) => { try { await dispatch(registerResident(values)).unwrap(); toast.success("Registration submitted. Your account requires committee approval."); navigate(ROUTES.LOGIN, { replace: true }) } catch { toast.error("Registration could not be submitted. Please try again.") } }
  const field = (name: "fullName" | "email" | "mobile" | "flatNumber", label: string, type = "text", autoComplete?: string) => {
    const placeholder = {
      fullName: "Enter your full name",
      email: "Enter your email",
      mobile: "Enter your mobile number",
      flatNumber: "Enter your flat number",
    }[name]

    return (
      <div className="space-y-1.5">
        <RequiredLabel htmlFor={name} required>{label}</RequiredLabel>
        <input id={name} type={type} autoComplete={autoComplete} placeholder={placeholder} className={control} {...form.register(name)} />
        {form.formState.errors[name] ? <FieldHint variant="error">{form.formState.errors[name]?.message}</FieldHint> : null}
      </div>
    )
  }
  return <Card className="w-full max-w-2xl"><CardHeader><CardTitle className="text-2xl">Resident registration</CardTitle><p className="text-sm text-muted-foreground">Create a resident request. A committee member must approve the account before access is enabled.</p></CardHeader><CardContent><form onSubmit={form.handleSubmit(submit)} className="grid gap-5 sm:grid-cols-2" noValidate>{field("fullName", "Full name", "text", "name")}{field("email", "Email", "email", "email")}{field("mobile", "Mobile number", "tel", "tel")}<div className="space-y-1.5"><RequiredLabel htmlFor="tower" required>Tower</RequiredLabel><select id="tower" className={control} {...form.register("tower")}><option value="">Select a tower</option>{mockTowers.map((tower) => <option key={tower.id} value={tower.id}>{tower.label}</option>)}</select>{form.formState.errors.tower ? <FieldHint variant="error">{form.formState.errors.tower.message}</FieldHint> : null}</div>{field("flatNumber", "Flat number")}<div className="space-y-1.5"><RequiredLabel htmlFor="register-password" required>Password</RequiredLabel><div className="relative"><input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" className={`${control} pr-10`} {...form.register("password")} /><button type="button" aria-label={showPassword ? "Hide passwords" : "Show passwords"} onClick={() => setShowPassword((value) => !value)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-md focus-visible:ring-2 focus-visible:ring-ring">{showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button></div>{form.formState.errors.password ? <FieldHint variant="error">{form.formState.errors.password.message}</FieldHint> : null}<PasswordStrength password={password} /></div><div className="space-y-1.5"><RequiredLabel htmlFor="confirm-password" required>Confirm password</RequiredLabel><input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" className={control} {...form.register("confirmPassword")} />{form.formState.errors.confirmPassword ? <FieldHint variant="error">{form.formState.errors.confirmPassword.message}</FieldHint> : null}</div><div className="space-y-1 sm:col-span-2"><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 size-4 accent-primary" {...form.register("termsAccepted")} /><span>I accept the Terms and Conditions and Privacy Policy.</span></label>{form.formState.errors.termsAccepted ? <FieldHint variant="error">{form.formState.errors.termsAccepted.message}</FieldHint> : null}</div><div className="space-y-3 sm:col-span-2"><Button type="submit" disabled={loading} className="w-full">{loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}{loading ? "Submitting..." : "Submit registration"}</Button><p className="text-center text-sm text-muted-foreground">Already registered? <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">Sign in</Link></p></div></form></CardContent></Card>
}
