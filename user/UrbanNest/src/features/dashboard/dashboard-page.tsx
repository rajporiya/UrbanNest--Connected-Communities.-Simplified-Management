import { Activity, Building2, ShieldCheck, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  { label: "Residents", value: "1,248", icon: Users },
  { label: "Occupied homes", value: "486", icon: Building2 },
  { label: "Active services", value: "24", icon: Activity },
  { label: "Security status", value: "All clear", icon: ShieldCheck },
]

export function DashboardPage() {
  return <div className="space-y-6"><div><p className="text-sm font-medium text-primary">Workspace preview</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning, UrbanNest</h1><p className="mt-2 text-muted-foreground">Your production dashboard foundation is ready for business modules.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <Card key={label} className="rounded-2xl"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle><Icon className="size-4 text-primary" /></CardHeader><CardContent><p className="text-2xl font-semibold">{value}</p></CardContent></Card>)}</div></div>
}
