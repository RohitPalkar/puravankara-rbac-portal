import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPasswordDto {
  @ApiProperty({ example: 'PPL00002' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'New@Pass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
