import { ArrowRight, Layers3, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BrandMark } from "@/components/common/brand-mark"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { appConfig } from "@/config/app.config"
import { ROUTES } from "@/constants/routes.constants"

const technologies = ["React 19", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Redux Toolkit", "React Router", "Axios", "Zod", "Recharts"]

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full">
        <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/85 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          <CardContent className="p-0"><div className="grid lg:grid-cols-[1.2fr_.8fr]">
            <section className="p-7 sm:p-10 lg:p-14"><div className="flex items-center justify-between"><BrandMark /><TooltipProvider><Tooltip><TooltipTrigger render={<span><ThemeToggle /></span>} /><TooltipContent>Switch color theme</TooltipContent></Tooltip></TooltipProvider></div>
              <div className="mt-12 max-w-2xl"><Badge variant="secondary" className="gap-1.5"><Sparkles className="size-3" />Frontend foundation ready</Badge><h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{appConfig.name}</h1><p className="mt-3 text-lg font-medium text-primary">{appConfig.tagline}</p><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{appConfig.description} Built as a scalable, accessible foundation for every UrbanNest module.</p></div>
              <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" render={<Link to={ROUTES.DASHBOARD} />}>Open dashboard <ArrowRight className="size-4" /></Button><Badge variant="outline" className="px-4 py-2">Environment: {appConfig.environment}</Badge></div>
            </section>
            <aside className="border-t bg-muted/35 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Layers3 className="size-5" /></div><div><p className="font-semibold">Production stack</p><p className="text-sm text-muted-foreground">Configured and type-safe</p></div></div><Separator className="my-6" /><div className="flex flex-wrap gap-2">{technologies.map((technology) => <Badge key={technology} variant="outline" className="bg-background/70">{technology}</Badge>)}</div><p className="mt-8 text-sm leading-6 text-muted-foreground">Routing, persisted UI preferences, guarded roles, API interceptors, responsive layouts, semantic tokens, and global feedback are ready.</p></aside>
          </div></CardContent>
        </Card>
      </div>
    </main>
  )
}
