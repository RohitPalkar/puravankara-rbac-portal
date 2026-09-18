import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SwitchRoleDto {
  @ApiProperty({ description: 'Target roleId to switch active role context to', example: 12 })
  @IsInt()
  @IsNotEmpty()
  roleId: number;
}
