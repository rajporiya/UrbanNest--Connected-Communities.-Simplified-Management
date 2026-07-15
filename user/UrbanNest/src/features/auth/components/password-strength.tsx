import { cn } from "@/lib/utils"

export function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"]
  return (
    <div aria-live="polite" className="space-y-1.5">
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">{[1, 2, 3, 4].map((level) => <span key={level} className={cn("h-1 rounded-full", score >= level ? (score >= 3 ? "bg-emerald-500" : "bg-amber-500") : "bg-muted")} />)}</div>
      <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium text-foreground">{labels[score]}</span></p>
    </div>
  )
}
