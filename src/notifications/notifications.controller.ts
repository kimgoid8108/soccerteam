import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateClubNotificationDto } from './dto/create-club-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 구체적인 경로를 먼저 선언 (파라미터 경로보다 우선)
  @Post('club')
  createClubNotification(
    @Body() createClubNotificationDto: CreateClubNotificationDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return this.notificationsService.createClubNotification(
      createClubNotificationDto,
      userId,
    );
  }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('unread') unread?: string, @Req() req?: any) {
    // JWT에서 userId 가져오기 (쿼리 파라미터가 없으면)
    const currentUserId = req?.user?.userId || req?.user?.id;
    const targetUserId = userId ? +userId : currentUserId ? Number(currentUserId) : undefined;

    if (targetUserId) {
      if (unread === 'true') {
        return this.notificationsService.findUnreadByUserId(targetUserId);
      }
      return this.notificationsService.findByUserId(targetUserId);
    }
    return this.notificationsService.findAll();
  }

  // 구체적인 경로를 먼저 선언 (파라미터 경로보다 우선)
  @Patch('read-all/:userId')
  markAllAsRead(@Param('userId', ParseIntPipe) userId: number, @Req() req: any) {
    // 본인의 알림만 모두 읽음 처리 가능
    const currentUserId = Number(req.user.userId || req.user.id);
    if (currentUserId !== userId) {
      throw new Error('본인의 알림만 모두 읽음 처리할 수 있습니다.');
    }
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
