import { useState, useMemo, useCallback } from 'react';
import type { TableColumn, SortState, SortDirection } from './types';

type UseGroupedTableOptions = {
  columns: TableColumn[];
  rows: any[];
  defaultSortField?: string;
  defaultSortDirection?: SortDirection;
  searchFields?: string[];
};

export function useGroupedTable({
  columns,
  rows,
  defaultSortField,
  defaultSortDirection = 'asc',
  searchFields,
}: UseGroupedTableOptions) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>(
    defaultSortField ? { field: defaultSortField, direction: defaultSortDirection } : null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const leafFields = useMemo(() => {
    const fields: string[] = [];
    columns.forEach((col) => {
      if ('field' in col) {
        fields.push(col.field);
      } else if ('group' in col && col.children) {
        fields.push(...col.children.map((c) => c.field));
      }
    });
    return fields;
  }, [columns]);

  const filteredRows = useMemo(() => {
    let data = rows;

    if (search) {
      const lower = search.toLowerCase();
      const fields = searchFields ?? leafFields;
      data = data.filter((row) =>
        fields.some((field) => {
          const val = row[field];
          return val != null && String(val).toLowerCase().includes(lower);
        })
      );
    }

    if (sort) {
      data = [...data].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    return data;
  }, [rows, search, sort, leafFields, searchFields]);

  const paginatedRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  return {
    search,
    setSearch,
    sort,
    handleSort,
    page,
    rowsPerPage,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    filteredRows: paginatedRows,
    totalFilteredCount: filteredRows.length,
  };
}