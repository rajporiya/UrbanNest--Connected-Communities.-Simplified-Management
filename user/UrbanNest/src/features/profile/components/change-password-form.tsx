import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/profile/schemas/profile.schema"

const control =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
export function ChangePasswordForm({
  loading,
  onSubmit,
}: {
  loading: boolean
  onSubmit: (
    values: ChangePasswordFormValues,
    reset: () => void
  ) => void | Promise<void>
}) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
  const fields: Array<{
    name: keyof ChangePasswordFormValues
    label: string
    autoComplete: string
  }> = [
    {
      name: "currentPassword",
      label: "Current password",
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: "New password",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      autoComplete: "new-password",
    },
  ]
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => onSubmit(values, form.reset))}
      noValidate
    >
      {fields.map((field) => (
        <label key={field.name} className="block space-y-1.5">
          <span className="text-sm font-medium">{field.label}</span>
          <input
            type="password"
            autoComplete={field.autoComplete}
            className={control}
            {...form.register(field.name)}
          />
          {form.formState.errors[field.name]?.message ? (
            <p className="text-xs text-destructive">
              {form.formState.errors[field.name]?.message}
            </p>
          ) : null}
        </label>
      ))}
      <Button type="submit" disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
        {loading ? "Updating..." : "Change password"}
      </Button>
    </form>
  )
}
