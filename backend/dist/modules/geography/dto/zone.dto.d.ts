export declare class CreateZoneDto {
    name: string;
    isActive?: boolean;
}
export declare class UpdateZoneDto {
    name?: string;
    isActive?: boolean;
}
export declare class ZoneResponseDto {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
