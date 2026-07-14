import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, LoaderCircle, TriangleAlert, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import {
  complaintFormSchema,
  type ComplaintFormValues,
} from "@/features/complaints/schemas/complaint.schema"
import type { ComplaintImage } from "@/features/complaints/types/complaint.types"
import { cn } from "@/utils/cn"
const control =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
export interface ComplaintFormProps {
  initialValues: ComplaintFormValues
  submitting?: boolean
  onSubmit: (
    values: ComplaintFormValues,
    images: ComplaintImage[]
  ) => void | Promise<void>
  onCancel: () => void
}
export function ComplaintForm({
  initialValues,
  submitting = false,
  onSubmit,
  onCancel,
}: ComplaintFormProps) {
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: initialValues,
  })
  const [images, setImages] = useState<ComplaintImage[]>([])
  const errors = form.formState.errors
  useEffect(
    () => () => images.forEach((image) => URL.revokeObjectURL(image.url)),
    [images]
  )
  const add = (files: FileList | null) => {
    if (!files) return
    const accepted = Array.from(files)
      .filter(
        (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
      )
      .slice(0, Math.max(0, 5 - images.length))
    setImages((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ])
  }
  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={form.handleSubmit((values) => onSubmit(values, images))}
    >
      <FormSection
        title="Complaint details"
        description="Provide clear information so the committee can respond quickly."
        icon={<TriangleAlert />}
        columns={2}
        divider
      >
        <label className="space-y-1.5 sm:col-span-2">
          <RequiredLabel required>Title</RequiredLabel>
          <input
            className={control}
            placeholder="Briefly describe the issue"
            {...form.register("title")}
          />
          {errors.title && (
            <p role="alert" className="text-xs text-destructive">
              {errors.title.message}
            </p>
          )}
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Category</RequiredLabel>
          <select className={control} {...form.register("category")}>
            <option value="maintenance">Maintenance</option>
            <option value="security">Security</option>
            <option value="noise">Noise</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="parking">Parking</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Priority</RequiredLabel>
          <select className={control} {...form.register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label className="space-y-1.5 sm:col-span-2">
          <RequiredLabel required>Description</RequiredLabel>
          <textarea
            rows={6}
            className={cn(control, "h-auto py-3")}
            placeholder="Include location, timing, and what you have observed."
            {...form.register("description")}
          />
          {errors.description && (
            <p role="alert" className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </label>
      </FormSection>
      <FormSection
        title="Supporting images"
        description="Upload up to five JPG, PNG or WebP images (5 MB each)."
        icon={<ImagePlus />}
      >
        <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed p-6 text-center transition-colors hover:bg-muted/50">
          <ImagePlus className="mb-2 size-6 text-primary" />
          <span className="font-medium">Add complaint images</span>
          <span className="text-xs text-muted-foreground">
            {images.length}/5 uploaded
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              add(event.target.files)
              event.currentTarget.value = ""
            }}
            disabled={images.length >= 5}
          />
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {images.map((image) => (
              <figure
                key={image.id}
                className="relative overflow-hidden rounded-lg border"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="aspect-square w-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  className="absolute top-1 right-1"
                  aria-label={`Remove ${image.name}`}
                  onClick={() =>
                    setImages((current) =>
                      current.filter((item) => item.id !== image.id)
                    )
                  }
                >
                  <X />
                </Button>
              </figure>
            ))}
          </div>
        )}
      </FormSection>
      <FormActions>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <LoaderCircle className="animate-spin" />}Raise
          complaint
        </Button>
      </FormActions>
    </form>
  )
}
