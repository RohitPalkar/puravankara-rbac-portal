# Table Framework Report

## Component Architecture

```
components/tables/
├── index.ts                          # Barrel exports
├── hooks/
│   ├── types.ts                      # Shared type definitions
│   ├── use-data-table.ts             # Standard table state hook
│   └── use-grouped-table.ts          # Grouped header table state hook
├── GroupedHeaderTable/
│   └── index.tsx                     # Two-level grouped header table
├── StandardDataTable/
│   └── index.tsx                     # Simple flat header table
├── TableToolbar/
│   └── index.tsx                     # Search + filters + actions bar
├── TableSearch/
│   └── index.tsx                     # Search input with icon
├── TableFilters/
│   └── index.tsx                     # Filter dropdown popover
├── TablePagination/
│   └── index.tsx                     # Page nav + rows-per-page selector
├── TableEmptyState/
│   └── index.tsx                     # Empty state placeholder
└── TableLoading/
    └── index.tsx                     # Loading progress bar
```

## Reusable APIs

### TableColumn Type

```typescript
type LeafColumn = {
  field: string;           // Data field key
  title: string;           // Column header text
  width?: number;          // Column width
  minWidth?: number;       // Minimum column width
  sortable?: boolean;      // Enable sorting (default: true)
  renderCell?: (row) => ReactNode;  // Custom cell renderer
  align?: 'left' | 'center' | 'right';
};

type GroupedColumn = {
  group: string;           // Group header text
  children: LeafColumn[];  // Child columns (span 1 each)
};

type TableColumn = LeafColumn | GroupedColumn;
```

### GroupedHeaderTable Props

```typescript
type Props = {
  columns: TableColumn[];       // Column config (grouped or flat)
  rows: any[];                  // Data rows
  getRowId: (row) => string;    // Row key extractor
  loading?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];      // Fields to search across
  defaultSortField?: string;
  filterOptions?: FilterOption[];
  emptyState?: ReactNode;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  pageSizeOptions?: number[];
};
```

### StandardDataTable Props

Same as GroupedHeaderTable but ignores `group` property on columns (treats all as flat).

### useDataTable() Hook

```typescript
type UseDataTableResult = {
  search, setSearch;
  sort, handleSort;
  filters, handleFilter, handleClearFilters;
  page, rowsPerPage, totalPages;
  handlePageChange, handleRowsPerPageChange;
  filteredRows, totalFilteredCount;
};
```

### useGroupedTable() Hook

```typescript
type UseGroupedTableResult = {
  search, setSearch;
  sort, handleSort;
  page, rowsPerPage, totalPages;
  handlePageChange, handleRowsPerPageChange;
  filteredRows, totalFilteredCount;
};
```

## Future Extensibility

The table framework supports these future features without refactoring:

| Feature | Readiness |
|---------|-----------|
| Export | Add `export` button to TableToolbar actions slot |
| Bulk Actions | Add row checkboxes + selection state |
| Column Visibility | Add column toggle popover in TableToolbar |
| Column Reordering | Add drag-and-drop to header cells |
| Virtual Scrolling | Swap TableContainer for virtuoso/react-window |
| Sticky Columns | Add `position: sticky` to leftmost columns |
| Server-side Filtering | Pass filter state to server API instead of client-side |
| Server-side Search | Pass search term to server API |
| Server-side Sorting | Pass sort field/order to server API |
| Server-side Pagination | Pass page/limit to server API |
| Permission-based Actions | Wrap actions buttons in `<Can>` component |

### How to enable server-side pagination

Replace `useDataTable()` / `useGroupedTable()` with a server-driven equivalent that:
- Calls API with `{ page, limit, search, sortBy, sortOrder, filters }`
- Returns `{ data, total }` from server
- Uses the same `TablePagination` component

### How to add column visibility

1. Add columns toggle popover in `TableToolbar`
2. Store visible columns in state
3. Filter `columns` prop before passing to table

## Modules Using StandardDataTable

Currently none migrated. Existing modules use the legacy `DataTable` component at `src/components/data-table/`.

**Target modules for StandardDataTable migration:**
- Zone
- Department
- Users (simple list)
- Roles
- Cities
- Modules / SubModules / Actions
- Project (simple list)

## Modules Using GroupedHeaderTable

| Module | Since |
|--------|-------|
| Brand | Module 1 (current) |

**Target modules for GroupedHeaderTable:**
- Incentive Matrix (future)
- Sales Matrix (future)
- Project (detailed)
- Reports with grouped columns

## Design Decisions

1. **Custom table, not DataGrid** — MUI X DataGrid does not natively support grouped column headers. A custom table built on MUI `Table` primitives was chosen for flexibility while maintaining the design system.

2. **Client-side operations by default** — All sorting, searching, filtering, and pagination happen client-side via `useDataTable`/`useGroupedTable` hooks. Server-side variants can be swapped in without changing the rendering layer.

3. **Composable sub-components** — `TableSearch`, `TableFilters`, `TablePagination`, etc. are standalone components usable outside the table containers for custom layouts.

4. **Config-driven columns** — Column definitions are plain objects (not JSX), making them easy to generate from API responses, permission filters, or user preferences.
