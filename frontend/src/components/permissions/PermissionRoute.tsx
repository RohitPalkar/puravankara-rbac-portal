import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissionStore } from '@/stores/permission.store'

interface Props {
  module: string
  children: ReactNode
  fallback?: ReactNode
}

export default function PermissionRoute({ module, children, fallback }: Props) {
  const hasModule = usePermissionStore((s) => s.hasModule)
  const isBootstrapped = usePermissionStore((s) => s.tree !== null)

  if (!isBootstrapped) {
    return <>{children}</>
  }

  if (!hasModule(module)) {
    if (fallback) return <>{fallback}</>
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
