import { Navigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"

export default function GuestOnly({
  children,
}: {
  children: JSX.Element
}) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        Checking session…
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
