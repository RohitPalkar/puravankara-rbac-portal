import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  zone: icon('ic-map'),
  project: icon('ic-folder'),
  department: icon('ic-building'),
  role: icon('ic-user'),
  user: icon('ic-user'),
  mapping: icon('ic-parameter'),
  permission: icon('ic-lock'),
  approval: icon('ic-booking'),
  inbox: icon('ic-mail'),
  delegation: icon('ic-parameter'),
  audit: icon('ic-analytics'),
  notification: icon('ic-calendar'),
};

export const navData = [
  {
    subheader: 'Masters',
    items: [
      { title: 'Zone Master', path: paths.dashboard.zoneMaster, icon: ICONS.zone },
      { title: 'Department Master', path: paths.dashboard.departmentMaster, icon: ICONS.department },
      { title: 'Brand Master', path: paths.dashboard.brandMaster, icon: ICONS.zone },
      { title: 'Phase Master', path: paths.dashboard.phaseMaster, icon: ICONS.project },
      { title: 'Project Master', path: paths.dashboard.projectMaster, icon: ICONS.project },
      { title: 'Channel Partner', path: paths.dashboard.channelPartnerMaster, icon: ICONS.role },
    ],
  },
  {
    subheader: 'Access Management',
    items: [
      { title: 'User Management', path: paths.dashboard.userManagement, icon: ICONS.user },
      { title: 'Role Assignment', path: paths.dashboard.userRoleMapping, icon: ICONS.mapping },
      { title: 'Project Assignment', path: paths.dashboard.projectAssignment, icon: ICONS.project },
      { title: 'Permission Matrix', path: paths.dashboard.permissionMatrix, icon: ICONS.permission },
    ],
  },
  {
    subheader: 'Workflow',
    items: [
      { title: 'Approval Configuration', path: paths.dashboard.approvalConfig, icon: ICONS.approval },
      { title: 'Approval Inbox', path: paths.dashboard.approvalInbox, icon: ICONS.inbox },
      { title: 'Delegations', path: paths.dashboard.delegations, icon: ICONS.delegation },
    ],
  },
  {
    subheader: 'System',
    items: [
      { title: 'Audit Logs', path: paths.dashboard.auditLogs, icon: ICONS.audit },
      { title: 'Notifications', path: paths.dashboard.notifications, icon: ICONS.notification },
    ],
  },
];
