export interface EntityStatus {
    exists: boolean;
    count: number;
}
export interface SetupStatus {
    setupCompleted: boolean;
    required: string[];
    status: Record<string, EntityStatus>;
}
