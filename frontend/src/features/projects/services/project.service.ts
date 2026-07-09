import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api/axios'
import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListFilters,
} from '@/features/projects/types/project.types'

const fetchProjects = async (filters: ProjectListFilters) => {
  const res = await api.get('/projects', { params: filters })
  return res.data.data as { items: Project[]; total: number }
}

const fetchProject = async (id: string) => {
  const res = await api.get(`/projects/${id}`)
  return res.data.data as Project
}

const createProject = async (payload: CreateProjectPayload) => {
  const res = await api.post('/projects', payload)
  return res.data.data as Project
}

const updateProject = async ({ id, payload }: { id: string; payload: UpdateProjectPayload }) => {
  const res = await api.patch(`/projects/${id}`, payload)
  return res.data.data as Project
}

const deleteProject = async (id: string) => {
  await api.delete(`/projects/${id}`)
}

export function useProjects(filters: ProjectListFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
