import { appConfig } from "@/lib/app-config"

export function Footer() {
  return (
    <footer className="border-t bg-card/80 px-4 py-4 text-xs text-muted-foreground backdrop-blur md:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>{appConfig.name} initial setup ready for expansion.</p>
        <p>React 19 · Vite · Express · MongoDB</p>
      </div>
    </footer>
  )
}