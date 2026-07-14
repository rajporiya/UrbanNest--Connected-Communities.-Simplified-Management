import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Save } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { ImageUpload } from "@/components/global"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas/profile.schema"
import { cn } from "@/lib/utils"

const control = cn(
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
  "disabled:bg-muted disabled:opacity-70"
)
const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export function ProfileForm({
  values,
  saving,
  onSubmit,
}: {
  values: ProfileFormValues
  saving: boolean
  onSubmit: (values: ProfileFormValues) => void | Promise<void>
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: values,
  })
  useEffect(() => form.reset(values), [form, values])
  const field = (
    name: "firstName" | "lastName" | "phone" | "emergencyContact",
    label: string,
    type = "text"
  ) => (
    <label className="space-y-1.5">
      <RequiredLabel htmlFor={`profile-${name}`} required>
        {label}
      </RequiredLabel>
      <input
        id={`profile-${name}`}
        type={type}
        className={control}
        {...form.register(name)}
      />
      {form.formState.errors[name]?.message ? (
        <p className="text-xs text-destructive">
          {form.formState.errors[name]?.message}
        </p>
      ) : null}
    </label>
  )
  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Controller
        name="avatar"
        control={form.control}
        render={({ field: avatarField }) => (
          <div className="space-y-3">
            {avatarField.value ? (
              <img
                src={avatarField.value}
                alt="Current profile"
                className="size-20 rounded-full border object-cover"
              />
            ) : null}
            <ImageUpload
              label="Profile photo"
              description="JPG, PNG, or WebP up to 5 MB."
              maxSizeMb={5}
              onChange={(files) => {
                const file = files[0]
                if (file) {
                  void fileToDataUrl(file).then(avatarField.onChange)
                } else {
                  avatarField.onChange(null)
                }
              }}
            />
          </div>
        )}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {field("firstName", "First name")}
        {field("lastName", "Last name")}
        {field("phone", "Mobile number", "tel")}
        {field("emergencyContact", "Emergency contact", "tel")}
      </div>
      <label className="space-y-1.5">
        <RequiredLabel htmlFor="profile-address">Address</RequiredLabel>
        <textarea
          id="profile-address"
          rows={3}
          className={cn(control, "h-auto py-3")}
          {...form.register("address")}
        />
      </label>
      <label className="space-y-1.5">
        <RequiredLabel htmlFor="profile-bio">About</RequiredLabel>
        <textarea
          id="profile-bio"
          rows={4}
          maxLength={280}
          className={cn(control, "h-auto py-3")}
          {...form.register("bio")}
        />
        <p className="text-xs text-muted-foreground">Up to 280 characters.</p>
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
