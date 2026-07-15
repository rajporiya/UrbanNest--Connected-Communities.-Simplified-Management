import { Building2, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Outlet } from "react-router-dom"

import { AppBrand } from "@/components/common/app-brand"
import { ThemeModeDropdown } from "@/components/common/theme-mode-dropdown"

const benefits = [
  { icon: ShieldCheck, text: "Secure role-based access" },
  { icon: Building2, text: "Easy society operations" },
  { icon: Users, text: "Simplified resident services" },
  { icon: Sparkles, text: "Centralized community management" },
]

export function AuthLayout() {
  return <main className="grid min-h-svh overflow-hidden bg-background lg:grid-cols-[minmax(0,1fr)_minmax(32rem,1fr)]"><aside className="relative hidden overflow-hidden border-r border-border bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary-foreground/10 blur-3xl" /><AppBrand showTagline logoSize="lg" className="relative [&_*]:text-primary-foreground" /><div className="relative max-w-xl"><p className="font-heading text-4xl leading-tight font-semibold">Everything your community needs, connected in one place.</p><div className="mt-10 grid gap-4 sm:grid-cols-2">{benefits.map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 p-4"><Icon aria-hidden="true" className="size-5 shrink-0" /><span className="text-sm font-medium">{text}</span></div>)}</div></div><p className="relative text-sm text-primary-foreground/70">Connected Communities. Simplified Management.</p></aside><section className="relative flex min-w-0 flex-col"><div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:justify-end"><AppBrand showTagline={false} logoSize="sm" className="lg:hidden" /><ThemeModeDropdown /></div><div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8 sm:py-10"><Outlet /></div></section></main>
}
