import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { UpdatePreferenceDto } from '../dto/notification-preference.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications (paginated, filterable)' })
  async findMy(@Req() req: any, @Query() query: NotificationQueryDto) {
    const userId = req.user.empId || req.user.userId;
    return this.notifService.findMyNotifications(userId, query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async countUnread(@Req() req: any) {
    const userId = req.user.empId || req.user.userId;
    const count = await this.notifService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get my notification preferences' })
  async getPreferences(@Req() req: any) {
    const userId = req.user.empId || req.user.userId;
    return this.notifService.getPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update my notification preferences' })
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferenceDto) {
    const userId = req.user.empId || req.user.userId;
    return this.notifService.updatePreferences(userId, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.empId || req.user.userId;
    const notif = await this.notifService.markAsRead(+id, userId);
    if (!notif) return { message: 'Notification not found' };
    return notif;
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: any) {
    const userId = req.user.empId || req.user.userId;
    await this.notifService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }
}
