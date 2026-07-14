import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/common/brand-mark"
import { ROUTES } from "@/constants/routes.constants"

export function AuthPlaceholderPage({ title, description }: { title: string; description: string }) {
  return <Card className="w-full max-w-md rounded-3xl"><CardHeader className="items-center text-center"><BrandMark /><CardTitle className="mt-4 text-2xl">{title}</CardTitle></CardHeader><CardContent className="space-y-5 text-center"><p className="text-sm leading-6 text-muted-foreground">{description}</p><Button variant="outline" render={<Link to={ROUTES.HOME} />}>Return home</Button></CardContent></Card>
}
