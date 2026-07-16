import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export interface RequirePermissionOptions {
  module: string;
  action: string;
}

export const RequirePermission = (options: RequirePermissionOptions) =>
  SetMetadata(PERMISSION_KEY, options);
