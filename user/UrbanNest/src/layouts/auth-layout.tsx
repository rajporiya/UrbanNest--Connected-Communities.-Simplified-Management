import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>
  )
}
