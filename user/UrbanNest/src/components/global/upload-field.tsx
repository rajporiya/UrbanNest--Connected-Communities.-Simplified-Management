import { useRef, type ChangeEvent } from "react"
import { FileUp, ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface UploadFieldProps {
  label: string
  files: File[]
  onFilesChange: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeMb?: number
  imageOnly?: boolean
  disabled?: boolean
  className?: string
}

export function UploadField({
  label,
  files,
  onFilesChange,
  accept,
  multiple = false,
  maxFiles = 1,
  maxSizeMb = 5,
  imageOnly = false,
  disabled = false,
  className,
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []).filter(
      (file) => file.size <= maxSizeMb * 1024 * 1024
    )
    onFilesChange(
      (multiple ? [...files, ...incoming] : incoming).slice(0, maxFiles)
    )
    event.target.value = ""
  }
  const Icon = imageOnly ? ImagePlus : FileUp
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
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <Icon aria-hidden="true" className="size-6 text-primary" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          Up to {maxFiles} {maxFiles === 1 ? "file" : "files"}, {maxSizeMb}MB
          each
        </span>
      </button>
      {files.length ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}`}
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
                  onFilesChange(
                    files.filter((_, itemIndex) => itemIndex !== index)
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

export function ImageUpload(props: Omit<UploadFieldProps, "imageOnly">) {
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
