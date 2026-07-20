import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupStatus } from './dto/setup-status.dto';
import { Public } from '../../modules/auth/decorators/public.decorator';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get system setup status' })
  async getStatus(): Promise<SetupStatus> {
    return this.setupService.getStatus();
  }

  @Public()
  @Post('reset')
  @ApiOperation({ summary: 'Reset zones, cities, and non-admin users' })
  async reset(): Promise<{ message: string }> {
    await this.setupService.reset();
    return {
      message:
        'Reset complete: zones (4), cities seeded, non-admin users removed',
    };
  }
}
