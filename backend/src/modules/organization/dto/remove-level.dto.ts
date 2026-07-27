import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

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
