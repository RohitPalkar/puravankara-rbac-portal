import { usePermissionStore } from '@/stores/permission.store'

export function usePermission() {
  const store = usePermissionStore()

  const canView = (module: string) => store.hasModule(module)
  const canCreate = (module: string) => store.hasAction(`${module}_CREATE`) || store.hasAction('CREATE')
  const canEdit = (module: string) => store.hasAction(`${module}_EDIT`) || store.hasAction('EDIT')
  const canDelete = (module: string) => store.hasAction(`${module}_DELETE`) || store.hasAction('DELETE')
  const canApprove = (module: string) => store.hasAction(`${module}_APPROVE`) || store.hasAction('APPROVE')

  return {
    ...store,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
  }
}
