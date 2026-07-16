import type { ReactNode } from 'react';

export type LeafColumn = {
  field: string;
  title: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  renderCell?: (row: any) => ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type GroupedColumn = {
  group: string;
  children: LeafColumn[];
};

export type TableColumn = LeafColumn | GroupedColumn;

export type SortDirection = 'asc' | 'desc';

export type SortState = {
  field: string;
  direction: SortDirection;
} | null;

export type TableFilter = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export type TableConfig = {
  columns: TableColumn[];
  rows: any[];
  getRowId: (row: any) => string;
  loading?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterOptions?: TableFilter[];
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyState?: ReactNode;
  onRowClick?: (row: any) => void;
  stickyHeader?: boolean;
};

export function isGroupedColumn(col: TableColumn): col is GroupedColumn {
  return 'group' in col && 'children' in col;
}

export function isLeafColumn(col: TableColumn): col is LeafColumn {
  return 'field' in col;
}

export function getLeafColumns(columns: TableColumn[]): LeafColumn[] {
  const result: LeafColumn[] = [];
  columns.forEach((col) => {
    if (isLeafColumn(col)) {
      result.push(col);
    } else if (isGroupedColumn(col)) {
      result.push(...col.children);
    }
  });
  return result;
}

export function getHeaderRowCount(columns: TableColumn[]): number {
  return columns.some((col) => isGroupedColumn(col)) ? 2 : 1;
}