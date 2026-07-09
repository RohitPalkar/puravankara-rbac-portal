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
  permission: icon('ic-lock'),
  audit: icon('ic-analytics'),
  crm: icon('ic-user'),
  eoi: icon('ic-file'),
  iom: icon('ic-file'),
  bookings: icon('ic-booking'),
  inventory: icon('ic-folder'),
  finance: icon('ic-analytics'),
  reports: icon('ic-analytics'),
  documents: icon('ic-folder'),
  esignature: icon('ic-lock'),
};

export const navData = [
  {
    subheader: 'Administration',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      {
        title: 'Masters',
        path: '#',
        icon: ICONS.dashboard,
        children: [
          { title: 'Zone Management', path: paths.dashboard.zoneMaster, icon: ICONS.zone },
          { title: 'Departments', path: paths.dashboard.departmentMaster, icon: ICONS.department },
        ],
      },
      { title: 'Projects', path: paths.dashboard.projectMaster, icon: ICONS.project },
      { title: 'Permission Mapping', path: paths.dashboard.permissionMatrix, icon: ICONS.permission },
      { title: 'Users', path: paths.dashboard.userManagement, icon: ICONS.user },
      { title: 'Activity Logs', path: paths.dashboard.auditLogs, icon: ICONS.audit },
    ],
  },
  {
    subheader: 'Applications',
    items: [
      { title: 'CRM', path: paths.apps.crm, icon: ICONS.crm },
      { title: 'EOI', path: paths.apps.eoi, icon: ICONS.eoi },
      { title: 'IOM', path: paths.apps.iom, icon: ICONS.iom },
      { title: 'Bookings', path: paths.apps.bookings, icon: ICONS.bookings },
      { title: 'Inventory', path: paths.apps.inventory, icon: ICONS.inventory },
      { title: 'Finance', path: paths.apps.finance, icon: ICONS.finance },
      { title: 'Reports', path: paths.apps.reports, icon: ICONS.reports },
      { title: 'Documents', path: paths.apps.documents, icon: ICONS.documents },
      { title: 'eSignature', path: paths.apps.esignature, icon: ICONS.esignature },
    ],
  },
];
