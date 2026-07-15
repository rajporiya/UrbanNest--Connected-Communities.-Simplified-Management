import { useEffect, useState } from "react"
import QRCode from "qrcode"

import { CopyableText } from "@/components/common/copyable-text"
import { cn } from "@/lib/utils"

export interface QrPreviewProps {
  value: string
  label?: string
  className?: string
}

export function QrPreview({
  value,
  label = "Visitor QR code",
  className,
}: QrPreviewProps) {
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    let active = true

    void QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 352,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then((url) => {
      if (active) setImageUrl(url)
    })

    return () => {
      active = false
    }
  }, [value])

  return (
    <figure
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border bg-card p-5 text-center",
        className
      )}
    >
      <div className="grid size-44 place-items-center bg-white p-2 shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${label}: ${value}`}
            className="size-full object-contain [image-rendering:pixelated]"
          />
        ) : (
          <div
            className="size-full animate-pulse bg-muted"
            aria-label="Generating QR code"
          />
        )}
      </div>
      <figcaption className="max-w-full min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <CopyableText
          value={value}
          displayValue={value}
          className="mt-1 max-w-full font-mono text-xs text-muted-foreground"
        />
      </figcaption>
    </figure>
  )
}
