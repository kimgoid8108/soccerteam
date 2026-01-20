import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JoinRequest, JoinRequestStatus } from './entities/join-request.entity';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto';
import { ClubMember, ClubRole, MemberStatus } from '../club-members/entities/club-member.entity';

@Injectable()
export class JoinRequestsService {
  constructor(
    @InjectRepository(JoinRequest)
    private readonly joinRequestsRepository: Repository<JoinRequest>,
    @InjectRepository(ClubMember)
    private readonly clubMembersRepository: Repository<ClubMember>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createJoinRequestDto: CreateJoinRequestDto): Promise<JoinRequest> {
    const joinRequest = this.joinRequestsRepository.create({
      club_id: createJoinRequestDto.club_id,
      user_id: createJoinRequestDto.user_id,
      status: createJoinRequestDto.status,
    });
    return this.joinRequestsRepository.save(joinRequest);
  }

  async findAll(): Promise<JoinRequest[]> {
    return this.joinRequestsRepository.find({
      relations: ['club', 'user'],
    });
  }

  async findOne(id: number): Promise<JoinRequest> {
    const joinRequest = await this.joinRequestsRepository.findOne({
      where: { id },
      relations: ['club', 'user'],
    });

    if (!joinRequest) {
      throw new NotFoundException(`Join request with ID ${id} not found`);
    }

    return joinRequest;
  }

  async findByClubId(clubId: number): Promise<JoinRequest[]> {
    return this.joinRequestsRepository.find({
      where: { club_id: clubId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<JoinRequest[]> {
    return this.joinRequestsRepository.find({
      where: { user_id: userId },
      relations: ['club'],
    });
  }

  async approve(id: number): Promise<JoinRequest> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[APPROVE] 시작 - Request ID:', id);

    return this.dataSource.transaction(async (manager) => {
      const joinRequest = await manager.findOne(JoinRequest, {
        where: { id },
        relations: ['club', 'user'],
      });

      if (!joinRequest) {
        throw new NotFoundException(`Join request with ID ${id} not found`);
      }

      console.log('[APPROVE] 가입 요청 정보:', {
        id: joinRequest.id,
        club_id: joinRequest.club_id,
        user_id: joinRequest.user_id,
        status: joinRequest.status,
      });

      if (joinRequest.status === JoinRequestStatus.APPROVED) {
        throw new ConflictException('이미 승인된 가입 요청입니다.');
      }

      try {
        console.log('[APPROVE] 멤버 추가 시도...');

        const memberData = {
          club_id: joinRequest.club_id,
          user_id: joinRequest.user_id,
          role: ClubRole.MEMBER,
          status: MemberStatus.ACTIVE,
          joined_at: new Date(),
        };

        console.log('[APPROVE] 저장할 데이터:', memberData);

        const newMember = await manager.save(ClubMember, memberData);

        console.log('[APPROVE] ✅ 멤버 추가 성공!', {
          id: newMember.id,
          club_id: newMember.club_id,
          user_id: newMember.user_id,
          role: newMember.role,
          status: newMember.status,
        });
      } catch (error: any) {
        console.error('[APPROVE] ❌ 멤버 추가 에러:', {
          code: error.code,
          message: error.message,
          detail: error.detail,
        });

        if (error.code !== '23505') {
          throw error;
        }
        console.log('[APPROVE] ⚠️ 중복 멤버 무시');
      }

      joinRequest.status = JoinRequestStatus.APPROVED;
      joinRequest.responded_at = new Date();
      const result = await manager.save(JoinRequest, joinRequest);

      console.log('[APPROVE] ✅ 승인 완료!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return result;
    });
  }

  async reject(id: number): Promise<JoinRequest> {
    const joinRequest = await this.findOne(id);
    joinRequest.status = JoinRequestStatus.REJECTED;
    joinRequest.responded_at = new Date();
    return this.joinRequestsRepository.save(joinRequest);
  }

  async update(
    id: number,
    updateJoinRequestDto: UpdateJoinRequestDto,
  ): Promise<JoinRequest> {
    const joinRequest = await this.findOne(id);

    if (updateJoinRequestDto.status) {
      joinRequest.responded_at = new Date();
    }

    Object.assign(joinRequest, updateJoinRequestDto);
    return this.joinRequestsRepository.save(joinRequest);
  }

  async remove(id: number): Promise<void> {
    const joinRequest = await this.findOne(id);
    await this.joinRequestsRepository.remove(joinRequest);
  }
}
