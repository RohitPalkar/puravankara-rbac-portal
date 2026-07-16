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
export declare const CSV_IMPORT_REQUIRED_FIELDS: Record<string, string[]>;
