import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { RawStringPipe } from '../../../common/pipes/raw-string.pipe';
import { AuditAction } from '../../audit/decorators/audit-action.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { UserZoneService } from '../services/user-zone.service';
import { UserZone } from '../entities/user-zone.entity';

class AssignZoneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  zoneId: number;
}

@ApiTags('Users - Zones')
@ApiBearerAuth()
@Controller('user-zones')
export class UserZoneController {
  constructor(private readonly zoneService: UserZoneService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get zones for a user' })
  async findByUser(
    @Param('userId', RawStringPipe) userId: string,
  ): Promise<UserZone[]> {
    return this.zoneService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Assign zone to user' })
  @AuditAction({ entity: 'USERS', action: 'ZONE_ASSIGNED' })
  async assign(@Body() dto: AssignZoneDto): Promise<UserZone> {
    return this.zoneService.assign(dto.userId, dto.zoneId);
  }

  @Delete(':userId/zone/:zoneId')
  @ApiOperation({ summary: 'Revoke zone from user' })
  @AuditAction({ entity: 'USERS', action: 'ZONE_REVOKED' })
  async revoke(
    @Param('userId', RawStringPipe) userId: string,
    @Param('zoneId', ParseIntPipe) zoneId: number,
  ) {
    await this.zoneService.revoke(userId, zoneId);
    return { message: 'Zone revoked from user' };
  }
}
