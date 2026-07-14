import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"

export function ErrorState({ icon: Icon, code, title, description }: { icon: LucideIcon; code: string; title: string; description: string }) {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-12">
      <Card className="w-full max-w-lg rounded-3xl shadow-xl shadow-primary/5">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
          <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-8" /></div>
          <div><p className="text-sm font-semibold text-primary">Error {code}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p></div>
          <Button render={<Link to={ROUTES.HOME} />}>Return home</Button>
        </CardContent>
      </Card>
    </main>
  )
}
