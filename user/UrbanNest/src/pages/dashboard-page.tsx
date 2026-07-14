import { motion } from "framer-motion"
import { ArrowRight, LayoutGrid, Layers3, Sparkles, SquareDashedBottomCode } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { appConfig, sidebarNavigation } from "@/lib/app-config"

const featureCards = [
  {
    title: "Frontend shell",
    description: "React 19, Vite, Redux Toolkit, persistence, routing, and reusable UI primitives.",
    icon: LayoutGrid,
  },
  {
    title: "Backend foundation",
    description: "Express app, security middleware, rate limiting, and MongoDB connection scaffolding.",
    icon: Layers3,
  },
  {
    title: "Expandable structure",
    description: "Feature-based frontend folders and MVC backend folders are ready for future modules.",
    icon: SquareDashedBottomCode,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.section variants={itemVariants} className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Initial production setup</Badge>
              <Badge variant="outline">Light / Dark ready</Badge>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {appConfig.subtitle}
              </p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                A solid foundation for the {appConfig.name} dashboard.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                The workspace is initialized with routing, Redux persistence, theme support, API wiring,
                and a production-friendly Express backend. Add modules when the product scope is ready.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" className="gap-2">
                Review structure
                <ArrowRight className="size-4" />
              </Button>
              <Button type="button" variant="outline">
                Backend health route ready
              </Button>
            </div>
          </div>

          <Card className="border-border/70 bg-background/80">
            <CardHeader>
              <CardTitle>Included routes</CardTitle>
              <CardDescription>Placeholder navigation surface for the first implementation pass.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sidebarNavigation.map((item) => (
                <div key={item.href} className="flex items-center justify-between rounded-xl border px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <item.icon className="size-4 text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <Separator />

      <motion.section variants={itemVariants} className="grid gap-4 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <card.icon className="size-5" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </motion.section>
    </motion.div>
  )
}