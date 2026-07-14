import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription>The page you are looking for does not exist in this setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="gap-2" onClick={() => navigate("/dashboard") }>
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}