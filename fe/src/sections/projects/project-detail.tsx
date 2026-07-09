import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { useProjects } from 'src/services/api-adapters';
import { mockZones, mockCities, mockUsers, mockRoles, mockDepartments } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const TABS = ['Overview', 'Users', 'Permissions'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { data: projects, loading, error } = useProjects();

  const [project, setProject] = useState(() => projects.find((p) => p.id === id));
  useEffect(() => {
    if (!project && projects.length > 0) {
      setProject(projects.find((p) => p.id === id));
    }
  }, [projects, id, project]);

  if (!project) {
    return (
      <PageContainer>
        <PageHeader title="Project Not Found" description="The requested project does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Project with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.projectMaster)} sx={{ mt: 2 }}>Back to Projects</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{project.name} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={project.name}
          description={`${project.code} · ${project.brand}`}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Iconify icon="solar:pen-bold" />} onClick={() => navigate(paths.dashboard.projectEdit(project.id))}>
                Edit
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => navigate(paths.dashboard.projectMaster)}>
                Back
              </Button>
            </Stack>
          }
        />

        {/* Header Card */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            {project.projectImage && (
              <Avatar src={project.projectImage} variant="rounded" sx={{ width: 80, height: 80 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{project.name}</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">Code: {project.code}</Typography>
                <Typography variant="body2" color="text.secondary">Brand: {project.brand}</Typography>
                <Label color={project.status === 'active' ? 'success' : 'default'}>{project.status}</Label>
              </Stack>
            </Box>
          </Stack>
        </Card>

        {/* Tabs */}
        <Card sx={{ overflow: 'hidden' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 2, pt: 1 }}>
            {TABS.map((tab) => <Tab key={tab} label={tab} />)}
          </Tabs>
          <Divider />

          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Basic Information</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Project Name', value: project.name },
                  { label: 'Project Code', value: project.code },
                  { label: 'Brand', value: project.brand },
                  { label: 'Phase', value: project.phase },
                  { label: 'Status', value: <Label color={project.status === 'active' ? 'success' : 'default'}>{project.status}</Label> },
                ].map((f) => (
                  <Box key={f.label}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2">{f.value}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2 }}>Location</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Zone', value: project.zoneName ?? mockZones.find((z) => z.id === project.zoneId)?.name },
                  { label: 'City', value: project.cityName ?? mockCities.find((c) => c.id === project.cityId)?.name },
                ].map((f) => (
                  <Box key={f.label}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2">{f.value ?? '—'}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2 }}>Finance</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Billing Entity', value: project.billingEntity },
                  { label: 'GSTIN', value: project.gstin },
                  { label: 'Billing Address', value: project.billingAddress, span: 2 },
                ].map((f) => (
                  <Box key={f.label} sx={{ gridColumn: f.span ? 'span 2' : undefined } as any}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2">{f.value || '—'}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2 }}>Configuration</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                {[
                  { label: 'Payment Gateway', value: project.paymentGateway },
                  { label: 'Incentive Criteria', value: project.incentiveCriteria },
                  { label: 'Start Date', value: project.startDate ? dayjs(project.startDate).format('DD MMM YYYY') : '—' },
                  { label: 'End Date', value: project.endDate ? dayjs(project.endDate).format('DD MMM YYYY') : '—' },
                ].map((f) => (
                  <Box key={f.label}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2">{f.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Users Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Assigned Users</Typography>
              {(() => {
                const projectUsers = mockUsers.filter((u) => u.projects?.some((p) => p.projectId === project.id));
                if (projectUsers.length === 0) {
                  return (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Iconify icon="solar:users-group-rounded-bold" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.disabled">No Assigned Users</Typography>
                      <Typography variant="caption" color="text.disabled">Users will appear after access assignment.</Typography>
                    </Box>
                  );
                }
                return (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Access Type</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projectUsers.map((u) => {
                          const dept = mockDepartments.find((d) => d.id === u.departmentId);
                          const role = mockRoles.find((r) => r.id === u.roleId);
                          return (
                            <TableRow key={u.id}>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{u.name.charAt(0)}</Avatar>
                                  <Box>
                                    <Typography variant="body2">{u.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{u.employeeId}</Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>{dept?.name ?? u.departmentName}</TableCell>
                              <TableCell>{role?.name ?? u.roleName}</TableCell>
                              <TableCell><Chip label="Full Access" size="small" color="primary" variant="soft" sx={{ height: 22 }} /></TableCell>
                              <TableCell><Label color={u.status === 'active' ? 'success' : 'default'}>{u.status}</Label></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })()}
            </Box>
          )}

          {/* Permissions Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Module Permissions</Typography>
              {(() => {
                const modules = [
                  { name: 'CRM', actions: ['View', 'Create', 'Edit', 'Delete'] },
                  { name: 'EOI', actions: ['View', 'Create', 'Edit'] },
                  { name: 'IOM', actions: ['Generate', 'View'] },
                  { name: 'Inventory', actions: ['View', 'Update'] },
                  { name: 'Reports', actions: ['View', 'Export'] },
                ];
                return (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Module</TableCell>
                          <TableCell>Allowed Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {modules.map((m) => (
                          <TableRow key={m.name}>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{m.name}</Typography></TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {m.actions.map((a) => (
                                  <Chip key={a} label={a} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                                ))}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })()}
            </Box>
          )}
        </Card>
      </PageContainer>
    </>
  );
}
