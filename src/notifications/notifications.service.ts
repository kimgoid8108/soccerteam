import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateClubNotificationDto } from './dto/create-club-notification.dto';
import { ClubsService } from '../clubs/clubs.service';
import { ClubMembersService } from '../club-members/club-members.service';
import { UsersService } from '../users/users.service';
import { OnboardingType } from '../users/entities/user.entity';
import { MemberStatus } from '../club-members/entities/club-member.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly clubsService: ClubsService,
    private readonly clubMembersService: ClubMembersService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user_id: createNotificationDto.user_id,
      type: createNotificationDto.type,
      message: createNotificationDto.message,
      is_read: createNotificationDto.is_read ?? false,
    });
    return this.notificationsRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByUserId(userId: number, isOwner?: boolean): Promise<Notification[]> {
    // owner인 경우: 자신이 생성한 알림만 조회 (is_read가 true인 것들로 구분)
    if (isOwner) {
      const notifications = await this.notificationsRepository.find({
        where: {
          user_id: userId,
          is_read: true, // owner가 생성한 알림은 is_read가 true
        },
        order: { created_at: 'DESC' },
      });
      console.log('[NotificationsService] findByUserId - owner:', {
        userId,
        isOwner,
        notificationsCount: notifications.length,
        notifications: notifications.map((n) => ({
          id: n.id,
          message: n.message.substring(0, 50),
          is_read: n.is_read,
          created_at: n.created_at,
        })),
      });
      return notifications;
    }

    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: {
        user_id: userId,
        is_read: false,
      },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.is_read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      {
        user_id: userId,
        is_read: false,
      },
      { is_read: true },
    );
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  async createClubNotification(
    createClubNotificationDto: CreateClubNotificationDto,
    userId: number,
  ): Promise<Notification[]> {
    // 1. 사용자가 owner인지 확인
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    if (user.onboarding_type !== OnboardingType.OWNER) {
      throw new ForbiddenException('운영자만 클럽 알림을 생성할 수 있습니다.');
    }

    // 2. 클럽 존재 및 소유권 확인
    const club = await this.clubsService.findOne(createClubNotificationDto.club_id);
    const adminUserId = Number(club.admin_user_id);
    const currentUserId = Number(userId);

    if (adminUserId !== currentUserId) {
      throw new ForbiddenException('해당 클럽의 운영자가 아닙니다.');
    }

    // 3. 클럽의 모든 active 멤버 조회
    const members = await this.clubMembersService.findByClubId(
      createClubNotificationDto.club_id,
    );

    if (members.length === 0) {
      return [];
    }

    // 4. 트랜잭션으로 모든 멤버에게 알림 생성
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 제목과 내용을 합쳐서 메시지로 저장 (기본 타입은 match_created)
      const fullMessage = `${createClubNotificationDto.title}\n\n${createClubNotificationDto.message}`;
      const notificationType = createClubNotificationDto.type || NotificationType.MATCH_CREATED;

      // owner가 멤버 목록에 포함되어 있는지 확인
      const isOwnerInMembers = members.some((member) => member.user_id === userId);

      const notifications = members.map((member) =>
        queryRunner.manager.create(Notification, {
          user_id: member.user_id,
          type: notificationType,
          message: fullMessage,
          is_read: false,
        }),
      );

      const savedNotifications = await queryRunner.manager.save(notifications);

      // owner에게도 자신이 생성한 알림을 저장 (조회용, is_read: true로 설정하여 구분)
      // owner가 멤버 목록에 있어도 별도로 저장하여 owner가 자신이 생성한 알림을 볼 수 있도록 함
      const ownerNotification = queryRunner.manager.create(Notification, {
        user_id: userId,
        type: notificationType,
        message: fullMessage,
        is_read: true, // owner가 생성한 알림은 is_read가 true로 설정하여 구분
      });
      const savedOwnerNotification = await queryRunner.manager.save(ownerNotification);

      console.log('[NotificationsService] createClubNotification - owner 알림 저장:', {
        userId,
        notificationId: savedOwnerNotification.id,
        message: savedOwnerNotification.message.substring(0, 50),
        is_read: savedOwnerNotification.is_read,
      });

      await queryRunner.commitTransaction();

      return savedNotifications;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
