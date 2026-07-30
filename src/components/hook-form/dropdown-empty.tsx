import type { ReactNode } from 'react';

import MenuItem from '@mui/material/MenuItem';

export function renderDropdownItems<T>(
  items: T[] | null | undefined,
  renderItem: (item: T, index: number) => ReactNode,
  emptyText = 'No data available'
): ReactNode[] {
  if (!items || items.length === 0) {
    return [<MenuItem disabled value="">{emptyText}</MenuItem>];
  }
  return items.map((item, index) => renderItem(item, index));
}
