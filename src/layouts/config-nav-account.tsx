import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

export const _account = [
  {
    label: 'My Profile',
    href: paths.dashboard.myProfile,
    icon: <Iconify icon="solar:user-id-bold-duotone" />,
  },
  {
    label: 'Settings',
    href: paths.dashboard.settings,
    icon: <Iconify icon="solar:tuning-2-bold-duotone" />,
  },
  {
    label: 'Change Password',
    href: paths.dashboard.changePassword,
    icon: <Iconify icon="solar:lock-keyhole-bold-duotone" />,
  },
];
