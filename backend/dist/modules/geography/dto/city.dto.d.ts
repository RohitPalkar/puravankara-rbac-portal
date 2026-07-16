export declare class CreateCityDto {
    name: string;
    isActive?: boolean;
}
export declare class UpdateCityDto {
    name?: string;
    isActive?: boolean;
}
export declare class CityResponseDto {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
