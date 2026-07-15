import { zodResolver } from "@hookform/resolvers/zod"
import { Bold, Eye, FileText, Italic, List, LoaderCircle, Megaphone, Send } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { CharacterCounter } from "@/components/forms/character-counter"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { announcementFormSchema, type AnnouncementFormValues } from "@/features/announcements/schemas/announcement.schema"
import { cn } from "@/utils/cn"

export interface AnnouncementFormProps {
  mode: "create" | "edit"
  initialValues: AnnouncementFormValues
  submitting?: boolean
  onSubmit: (values: AnnouncementFormValues) => void | Promise<void>
  onCancel: () => void
}

const control = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="text-xs font-medium text-destructive">{message}</p> : null
}

export function AnnouncementForm({ mode, initialValues, submitting = false, onSubmit, onCancel }: AnnouncementFormProps) {
  const [preview, setPreview] = useState(false)
  const form = useForm<AnnouncementFormValues>({ resolver: zodResolver(announcementFormSchema), defaultValues: initialValues })
  const content = useWatch({ control: form.control, name: "content" })
  const summary = useWatch({ control: form.control, name: "summary" })
  const errors = form.formState.errors

  const insert = (value: string) => {
    const current = form.getValues("content")
    form.setValue("content", `${current}${current ? "\n" : ""}${value}`, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <form className="space-y-8" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection title="Announcement information" description="Choose who should see this message and how it is published." icon={<Megaphone />} columns={2} divider>
        <div className="space-y-1.5 sm:col-span-2">
          <RequiredLabel htmlFor="announcement-title" required>Title</RequiredLabel>
          <input id="announcement-title" className={control} maxLength={120} placeholder="A clear, action-oriented headline" aria-invalid={Boolean(errors.title)} {...form.register("title")} />
          <FieldError message={errors.title?.message} />
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="announcement-category" required>Category</RequiredLabel>
          <select id="announcement-category" className={control} {...form.register("category")}>
            <option value="general">General</option><option value="maintenance">Maintenance</option><option value="event">Event</option><option value="emergency">Emergency</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="announcement-audience" required>Audience</RequiredLabel>
          <select id="announcement-audience" className={control} {...form.register("audience")}>
            <option value="all">Everyone</option><option value="residents">Residents</option><option value="committee">Committee</option><option value="security">Security team</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="announcement-status" required>Publishing status</RequiredLabel>
          <select id="announcement-status" className={control} {...form.register("status")}>
            <option value="draft">Save as draft</option><option value="published">Publish now</option><option value="archived">Archive</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="announcement-expiry">Expiry date</RequiredLabel>
          <input id="announcement-expiry" type="date" className={control} {...form.register("expiresAt")} />
        </div>
      </FormSection>

      <FormSection title="Message" description="Write concise content. Formatting markers are shown as plain text for a safe preview." icon={<FileText />}>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="announcement-summary" required>Summary</RequiredLabel>
          <textarea id="announcement-summary" rows={3} maxLength={240} className={cn(control, "h-auto resize-y py-3")} placeholder="One or two sentences shown in lists" aria-invalid={Boolean(errors.summary)} {...form.register("summary")} />
          <div className="flex justify-between gap-3"><FieldError message={errors.summary?.message} /><CharacterCounter current={summary.length} max={240} /></div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <RequiredLabel htmlFor="announcement-content" required>Content</RequiredLabel>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPreview((value) => !value)}><Eye aria-hidden="true" />{preview ? "Edit" : "Preview"}</Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-input bg-background">
            <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2" aria-label="Formatting toolbar">
              <Button type="button" size="icon-xs" variant="ghost" aria-label="Insert bold text" onClick={() => insert("**Bold text**")}><Bold /></Button>
              <Button type="button" size="icon-xs" variant="ghost" aria-label="Insert italic text" onClick={() => insert("_Italic text_")}><Italic /></Button>
              <Button type="button" size="icon-xs" variant="ghost" aria-label="Insert bullet" onClick={() => insert("• List item")}><List /></Button>
              <Badge variant="outline" className="ml-auto">Safe text editor</Badge>
            </div>
            {preview ? (
              <article className="min-h-64 whitespace-pre-wrap break-words p-4 text-sm leading-7" aria-label="Announcement preview">{content || <span className="text-muted-foreground">Start writing to preview your announcement.</span>}</article>
            ) : (
              <textarea id="announcement-content" rows={12} maxLength={8000} className="min-h-64 w-full resize-y bg-transparent p-4 text-sm leading-7 outline-none" placeholder="Write the complete announcement..." aria-invalid={Boolean(errors.content)} {...form.register("content")} />
            )}
          </div>
          <div className="flex justify-between gap-3"><FieldError message={errors.content?.message} /><CharacterCounter current={content.length} max={8000} /></div>
        </div>
      </FormSection>

      <FormActions className="border-t border-border pt-5">
        <Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? <LoaderCircle className="animate-spin" /> : <Send />}
          {submitting ? "Saving..." : mode === "create" ? "Create announcement" : "Save changes"}
        </Button>
      </FormActions>
    </form>
  )
}
