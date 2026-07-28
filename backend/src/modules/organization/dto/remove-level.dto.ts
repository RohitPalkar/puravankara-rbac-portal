import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, MinLength, Min, Max, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveLevelDto {
  @ApiProperty({
    enum: ['MERGE', 'REPLACE'],
    description: 'Migration mode when dependencies exist',
  })
  @IsString()
  mode: 'MERGE' | 'REPLACE';

  @ApiProperty({
    description: 'Destination hierarchy level number to merge/replace into',
  })
  @IsInt()
  destinationLevelNumber: number;
}

export class RenameLevelDto {
  @ApiProperty({ description: 'New role name for the hierarchy level' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  roleName: string;
}

export class ReorderLevelItemDto {
  @ApiProperty({ description: 'Current level number' })
  @IsInt()
  @Min(1)
  @Max(10)
  levelNumber: number;

  @ApiProperty({ description: 'New display order position' })
  @IsInt()
  @Min(1)
  @Max(10)
  displayOrder: number;
}

export class ReorderLevelsDto {
  @ApiProperty({ type: [ReorderLevelItemDto], description: 'Array of level reorder mappings' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderLevelItemDto)
  items: ReorderLevelItemDto[];
}
