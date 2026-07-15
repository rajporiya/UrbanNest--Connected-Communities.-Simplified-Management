import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, ScanLine } from "lucide-react"
import { useSelector } from "react-redux"

import { ContentCard } from "@/components/common/content-card"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { QrPreview } from "@/features/visitors/components/qr-preview"
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge"
import {
  verifyVisitorPass,
  type VisitorsState,
} from "@/features/visitors/store/visitors.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

interface State {
  visitors: VisitorsState
}

interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorConstructor = new (options: {
  formats: string[]
}) => BarcodeDetectorInstance

function getBarcodeDetector() {
  return (
    window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }
  ).BarcodeDetector
}

export function VerifyVisitorPage() {
  const dispatch = useAppDispatch()
  const { selected, mutating, error } = useSelector(
    (state: State) => state.visitors
  )
  const [code, setCode] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const scanningRef = useRef(false)

  const stopCamera = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  const startCamera = async () => {
    const BarcodeDetector = getBarcodeDetector()
    if (!BarcodeDetector) {
      setCameraError(
        "Camera QR scanning is supported in Chrome or Edge. You can still enter the pass code manually."
      )
      return
    }

    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setCameraActive(true)

      const detector = new BarcodeDetector({ formats: ["qr_code"] })
      timerRef.current = window.setInterval(() => {
        if (
          scanningRef.current ||
          video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA
        )
          return
        scanningRef.current = true
        void detector
          .detect(video)
          .then((codes) => {
            const scannedCode = codes[0]?.rawValue.trim()
            if (!scannedCode) return
            setCode(scannedCode)
            void dispatch(verifyVisitorPass(scannedCode))
            stopCamera()
          })
          .catch(() => {
            // A frame without a readable code is expected while the camera is active.
          })
          .finally(() => {
            scanningRef.current = false
          })
      }, 250)
    } catch {
      stopCamera()
      setCameraError(
        "Camera access was not available. Allow camera permission and try again."
      )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verify visitor"
        description="Scan a QR code with the camera or enter the pass code manually."
        icon={<ScanLine className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard title="Pass verification">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl bg-slate-950">
              <video
                ref={videoRef}
                className={
                  cameraActive ? "aspect-video w-full object-cover" : "hidden"
                }
                muted
                playsInline
              />
              {!cameraActive ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 px-5 text-center text-slate-300">
                  <Camera className="size-8" />
                  <p className="text-sm">
                    Use your device camera to scan a visitor QR code.
                  </p>
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void (cameraActive ? stopCamera() : startCamera())}
            >
              <Camera />
              {cameraActive ? "Stop camera" : "Scan with camera"}
            </Button>
            {cameraError ? (
              <p role="alert" className="text-sm text-destructive">
                {cameraError}
              </p>
            ) : null}
          </div>

          <form
            className="mt-6 space-y-4 border-t pt-6"
            onSubmit={(event) => {
              event.preventDefault()
              void dispatch(verifyVisitorPass(code))
            }}
          >
            <label className="space-y-2 text-sm font-medium">
              QR or pass code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="UN-VP-1001"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={!code.trim() || mutating}
              className="w-full"
            >
              <ScanLine />
              {mutating ? "Verifying..." : "Verify pass"}
            </Button>
          </form>
        </ContentCard>
        {selected ? (
          <ContentCard
            title={selected.visitorName}
            description={`${selected.tower} · ${selected.flatNumber}`}
            headerAction={<VisitorStatusBadge status={selected.status} />}
          >
            <QrPreview value={selected.qrCode} />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {selected.purposeNote}
            </p>
          </ContentCard>
        ) : null}
      </div>
    </div>
  )
}
