import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinRequest, JoinRequestStatus } from './entities/join-request.entity';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto';
import { ClubMembersService } from '../club-members/club-members.service';
import { ClubRole, MemberStatus } from '../club-members/entities/club-member.entity';

@Injectable()
export class JoinRequestsService {
  constructor(
    @InjectRepository(JoinRequest)
    private readonly joinRequestsRepository: Repository<JoinRequest>,
    private readonly clubMembersService: ClubMembersService,
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
    console.log('[APPROVE] 🔵 승인 시작 - Request ID:', id);

    const joinRequest = await this.findOne(id);

    console.log('[APPROVE] 📋 가입 요청 정보:', {
      id: joinRequest.id,
      club_id: joinRequest.club_id,
      user_id: joinRequest.user_id,
      status: joinRequest.status,
      club_name: joinRequest.club?.name,
      user_name: joinRequest.user?.name,
    });

    // 이미 승인된 요청인지 확인
    if (joinRequest.status === JoinRequestStatus.APPROVED) {
      console.log('[APPROVE] ⚠️ 이미 승인된 요청');
      throw new ConflictException('이미 승인된 가입 요청입니다.');
    }

    // 클럽 멤버로 추가
    try {
      console.log('[APPROVE] 🔵 멤버 추가 시도 중...');
      const newMember = await this.clubMembersService.create({
        club_id: joinRequest.club_id,
        user_id: joinRequest.user_id,
        role: ClubRole.MEMBER,
        status: MemberStatus.ACTIVE,
      });

      console.log('[APPROVE] ✅ 멤버 추가 성공!', {
        member_id: newMember.id,
        club_id: newMember.club_id,
        user_id: newMember.user_id,
        role: newMember.role,
        status: newMember.status,
        joined_at: newMember.joined_at,
      });
    } catch (error: any) {
      console.error('[APPROVE] ❌ 멤버 추가 에러:', {
        code: error.code,
        message: error.message,
        detail: error.detail,
      });

      // 이미 멤버인 경우 무시 (중복 가입 방지)
      if (error.code !== '23505') {
        console.error('[APPROVE] 🚨 심각한 에러 발생 - throw');
        throw error;
      }
      console.log('[APPROVE] ⚠️ 중복 멤버 무시됨 (이미 존재)');
    }

    // 가입 요청 상태 업데이트
    joinRequest.status = JoinRequestStatus.APPROVED;
    joinRequest.responded_at = new Date();
    const result = await this.joinRequestsRepository.save(joinRequest);

    console.log('[APPROVE] ✅ 승인 완료!', {
      request_id: result.id,
      status: result.status,
      responded_at: result.responded_at,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return result;
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
