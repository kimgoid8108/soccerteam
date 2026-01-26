import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { FeeCycle } from './entities/fee-cycle.entity';
import { FeeRequest, FeeRequestStatus } from './entities/fee-request.entity';
import { CreateFeeCycleDto } from './dto/create-fee-cycle.dto';
import { ConfirmFeeRequestDto } from './dto/confirm-fee-request.dto';
import { ClubsService } from '../clubs/clubs.service';
import { ClubMembersService } from '../club-members/club-members.service';
import { UsersService } from '../users/users.service';
import { MemberStatus } from '../club-members/entities/club-member.entity';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeCycle)
    private readonly feeCycleRepository: Repository<FeeCycle>,
    @InjectRepository(FeeRequest)
    private readonly feeRequestRepository: Repository<FeeRequest>,
    private readonly clubsService: ClubsService,
    private readonly clubMembersService: ClubMembersService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async createFeeCycle(
    createFeeCycleDto: CreateFeeCycleDto,
    userId: number,
  ): Promise<FeeCycle> {
    // 1. 사용자가 owner인지 확인
    const user = await this.usersService.findById(userId);
    if (!user || user.onboarding_type !== 'owner') {
      throw new ForbiddenException('운영자만 회비 회차를 생성할 수 있습니다.');
    }

    // 2. 클럽 존재 및 소유권 확인
    const club = await this.clubsService.findOne(createFeeCycleDto.club_id);
    if (club.admin_user_id !== userId) {
      throw new ForbiddenException('해당 클럽의 운영자가 아닙니다.');
    }

    // 3. 트랜잭션으로 회차 생성 및 모든 멤버에 대한 fee_requests 생성
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 회차 생성
      const feeCycle = queryRunner.manager.create(FeeCycle, {
        ...createFeeCycleDto,
        club_id: createFeeCycleDto.club_id,
        due_date: new Date(createFeeCycleDto.due_date),
        created_by: userId,
      });
      const savedFeeCycle = await queryRunner.manager.save(feeCycle);

      // 해당 클럽의 모든 active 멤버 조회
      const members = await this.clubMembersService.findByClubId(
        createFeeCycleDto.club_id,
      );

      // 각 멤버에 대해 fee_request 생성
      const feeRequests = members.map((member) =>
        queryRunner.manager.create(FeeRequest, {
          fee_cycle_id: savedFeeCycle.id,
          club_id: createFeeCycleDto.club_id,
          user_id: member.user_id,
          status: FeeRequestStatus.NOT_PAID,
        }),
      );

      await queryRunner.manager.save(feeRequests);

      await queryRunner.commitTransaction();

      // 생성된 회차를 relations와 함께 반환
      const createdCycle = await this.feeCycleRepository.findOne({
        where: { id: savedFeeCycle.id },
        relations: ['club', 'created_by_user', 'fee_requests'],
      });

      if (!createdCycle) {
        throw new NotFoundException('생성된 회비 회차를 찾을 수 없습니다.');
      }

      return createdCycle;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reportFeeRequest(
    feeRequestId: number,
    userId: number,
  ): Promise<FeeRequest> {
    const feeRequest = await this.feeRequestRepository.findOne({
      where: { id: feeRequestId },
      relations: ['user', 'fee_cycle', 'club'],
    });

    if (!feeRequest) {
      throw new NotFoundException('회비 요청을 찾을 수 없습니다.');
    }

    // 본인의 요청인지 확인
    if (feeRequest.user_id !== userId) {
      throw new ForbiddenException('본인의 회비만 신고할 수 있습니다.');
    }

    // 이미 확인된 경우
    if (feeRequest.status === FeeRequestStatus.CONFIRMED) {
      throw new BadRequestException('이미 확인된 회비입니다.');
    }

    // 입금 신고 처리
    feeRequest.status = FeeRequestStatus.REPORTED_PAID;
    feeRequest.reported_at = new Date();

    return await this.feeRequestRepository.save(feeRequest);
  }

  async confirmFeeRequest(
    feeRequestId: number,
    userId: number,
    confirmDto?: ConfirmFeeRequestDto,
  ): Promise<FeeRequest> {
    const feeRequest = await this.feeRequestRepository.findOne({
      where: { id: feeRequestId },
      relations: ['user', 'fee_cycle', 'club'],
    });

    if (!feeRequest) {
      throw new NotFoundException('회비 요청을 찾을 수 없습니다.');
    }

    // 사용자가 owner인지 확인
    const user = await this.usersService.findById(userId);
    if (!user || user.onboarding_type !== 'owner') {
      throw new ForbiddenException('운영자만 입금을 확인할 수 있습니다.');
    }

    // 클럽 소유권 확인
    const club = await this.clubsService.findOne(feeRequest.club_id);
    if (club.admin_user_id !== userId) {
      throw new ForbiddenException('해당 클럽의 운영자가 아닙니다.');
    }

    // 이미 확인된 경우
    if (feeRequest.status === FeeRequestStatus.CONFIRMED) {
      throw new BadRequestException('이미 확인된 회비입니다.');
    }

    // 입금 확인 처리
    feeRequest.status = FeeRequestStatus.CONFIRMED;
    feeRequest.confirmed_at = new Date();
    feeRequest.confirmed_by = userId;
    if (confirmDto?.admin_note) {
      feeRequest.admin_note = confirmDto.admin_note;
    }

    return await this.feeRequestRepository.save(feeRequest);
  }

  async getFeeCycleRequests(
    feeCycleId: number,
    userId: number,
  ): Promise<FeeRequest[]> {
    // 회차 존재 확인
    const feeCycle = await this.feeCycleRepository.findOne({
      where: { id: feeCycleId },
      relations: ['club'],
    });

    if (!feeCycle) {
      throw new NotFoundException('회비 회차를 찾을 수 없습니다.');
    }

    // 사용자가 owner인지 확인
    const user = await this.usersService.findById(userId);
    if (!user || user.onboarding_type !== 'owner') {
      throw new ForbiddenException('운영자만 회비 상태를 조회할 수 있습니다.');
    }

    // 클럽 소유권 확인
    if (feeCycle.club.admin_user_id !== userId) {
      throw new ForbiddenException('해당 클럽의 운영자가 아닙니다.');
    }

    // 해당 회차의 모든 fee_requests 조회
    return await this.feeRequestRepository.find({
      where: { fee_cycle_id: feeCycleId },
      relations: ['user', 'fee_cycle', 'confirmed_by_user'],
      order: { created_at: 'ASC' },
    });
  }

  async getMyFeeRequests(userId: number): Promise<FeeRequest[]> {
    // 사용자가 속한 클럽 조회
    const memberships = await this.clubMembersService.findByUserId(
      userId,
      MemberStatus.ACTIVE,
    );

    if (memberships.length === 0) {
      return [];
    }

    const clubIds = memberships.map((m) => m.club_id);

    // 해당 클럽들의 회비 요청 조회
    return await this.feeRequestRepository.find({
      where: {
        user_id: userId,
        club_id: In(clubIds),
      },
      relations: ['fee_cycle', 'club', 'confirmed_by_user'],
      order: { created_at: 'DESC' },
    });
  }

  async getClubFeeCycles(clubId: number, userId: number): Promise<FeeCycle[]> {
    // 클럽 존재 확인
    const club = await this.clubsService.findOne(clubId);

    // 사용자가 해당 클럽의 멤버인지 확인
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.onboarding_type === 'owner') {
      // owner인 경우 클럽 소유권 확인
      if (club.admin_user_id !== userId) {
        throw new ForbiddenException('해당 클럽의 운영자가 아닙니다.');
      }
    } else {
      // member인 경우 클럽 멤버인지 확인
      const membership = await this.clubMembersService.findByUserId(userId);
      const isMember = membership.some(
        (m) => m.club_id === clubId && m.status === MemberStatus.ACTIVE,
      );
      if (!isMember) {
        throw new ForbiddenException('해당 클럽의 멤버가 아닙니다.');
      }
    }

    return await this.feeCycleRepository.find({
      where: { club_id: clubId },
      relations: ['created_by_user'],
      order: { created_at: 'DESC' },
    });
  }
}
