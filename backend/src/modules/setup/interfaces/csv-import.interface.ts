/**
 * CSV Import Structure
 *
 * Prepared for future CSV-bulk-import feature.
 * Enable endpoints when UI requires:
 *
 * POST /api/v1/import/users
 * POST /api/v1/import/projects
 * POST /api/v1/import/roles
 * POST /api/v1/import/modules
 */

export interface CsvImportRow {
  data: Record<string, string>;
  errors: string[];
  isValid: boolean;
}

export interface CsvImportResult {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: CsvImportRow[];
}

export const CSV_IMPORT_REQUIRED_FIELDS: Record<string, string[]> = {
  users: ['name', 'email', 'department'],
  projects: ['name'],
  roles: ['name', 'hierarchyLevelRank'],
  modules: ['name'],
};
