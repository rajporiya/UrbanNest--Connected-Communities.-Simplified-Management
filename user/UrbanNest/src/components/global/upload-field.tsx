import { useId, useRef, useState, type ChangeEvent } from "react"
import { FileUp, ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface UploadFieldProps {
  label: string
  description?: string
  files?: File[]
  onFilesChange?: (files: File[]) => void
  /** Alias for onFilesChange for simple uncontrolled consumers. */
  onChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeMb?: number
  imageOnly?: boolean
  disabled?: boolean
  className?: string
}

const fileIdentity = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`

export function UploadField({
  label,
  description,
  files,
  onFilesChange,
  onChange,
  accept,
  multiple = false,
  maxFiles = 1,
  maxSizeMb = 5,
  imageOnly = false,
  disabled = false,
  className,
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalFiles, setInternalFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const descriptionId = useId()
  const errorId = useId()
  const currentFiles = files ?? internalFiles
  const safeMaxFiles = Math.max(1, Math.floor(maxFiles))
  const safeMaxSizeMb = Math.max(0.1, maxSizeMb)

  const updateFiles = (nextFiles: File[]) => {
    if (files === undefined) setInternalFiles(nextFiles)
    onFilesChange?.(nextFiles)
    onChange?.(nextFiles)
  }

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    const oversized = selected.some(
      (file) => file.size > safeMaxSizeMb * 1024 * 1024
    )
    const invalidType = imageOnly && selected.some((file) => !file.type.startsWith("image/"))

    if (oversized) {
      setError(`Each file must be ${safeMaxSizeMb} MB or smaller.`)
    } else if (invalidType) {
      setError("Select a supported image file.")
    } else {
      const accepted = selected.filter(
        (file) =>
          file.size <= safeMaxSizeMb * 1024 * 1024 &&
          (!imageOnly || file.type.startsWith("image/"))
      )
      const merged = multiple ? [...currentFiles, ...accepted] : accepted
      const unique = merged.filter(
        (file, index, allFiles) =>
          allFiles.findIndex(
            (candidate) => fileIdentity(candidate) === fileIdentity(file)
          ) === index
      )
      const nextFiles = unique.slice(0, safeMaxFiles)
      setError(
        unique.length > safeMaxFiles
          ? `You can upload up to ${safeMaxFiles} ${safeMaxFiles === 1 ? "file" : "files"}.`
          : null
      )
      updateFiles(nextFiles)
    }

    event.target.value = ""
  }

  const Icon = imageOnly ? ImagePlus : FileUp
  const hint =
    description ??
    `Up to ${safeMaxFiles} ${safeMaxFiles === 1 ? "file" : "files"}, ${safeMaxSizeMb} MB each.`

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={addFiles}
        className="sr-only"
        aria-label={label}
        aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <Icon aria-hidden="true" className="size-6 text-primary" />
        <span className="text-sm font-medium">{label}</span>
        <span id={descriptionId} className="text-xs text-muted-foreground">
          {hint}
        </span>
      </button>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {currentFiles.length ? (
        <ul className="space-y-2" aria-label={`${label} selected files`}>
          {currentFiles.map((file, index) => (
            <li
              key={`${fileIdentity(file)}-${index}`}
              className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  updateFiles(
                    currentFiles.filter(
                      (_, itemIndex) => itemIndex !== index
                    )
                  )
                }
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function ImageUpload(
  props: Omit<UploadFieldProps, "imageOnly">
) {
  return (
    <UploadField
      {...props}
      imageOnly
      accept={props.accept ?? "image/png,image/jpeg,image/webp"}
    />
  )
}

export function FileUpload(props: UploadFieldProps) {
  return <UploadField {...props} />
}
