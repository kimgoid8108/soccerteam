import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ConflictException } from '@nestjs/common';
import { ClubMembersService } from '../club-members/club-members.service';
import { UsersService } from '../users/users.service';
import { MemberStatus } from '../club-members/entities/club-member.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubsRepository: Repository<Club>,
    private readonly clubMembersService: ClubMembersService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createClubDto: CreateClubDto,
    adminUserId: number,
  ): Promise<Club> {
    // ✅ 1. 운영자가 이미 클럽을 생성했는지 체크 (최초 1회만 생성 가능)
    const existingMyClub = await this.clubsRepository.findOne({
      where: { admin_user_id: adminUserId },
    });

    if (existingMyClub) {
      throw new ConflictException(
        '클럽은 운영자당 최초 1회만 생성할 수 있습니다.',
      );
    }

    // ✅ 2. 클럽 이름 중복 체크
    const existingClub = await this.clubsRepository.findOne({
      where: { name: createClubDto.name },
    });

    if (existingClub) {
      throw new ConflictException('이미 존재하는 클럽 이름입니다.');
    }

    // ✅ 3. 클럽 생성
    const club = this.clubsRepository.create({
      ...createClubDto,
      admin_user_id: adminUserId,
      founded_at: createClubDto.founded_at
        ? new Date(createClubDto.founded_at)
        : null,
    });

    return this.clubsRepository.save(club);
  }

  async findMyClub(userId: number): Promise<Club | null> {
    console.log('[ClubsService] findMyClub 시작:', { userId });

    // 사용자 정보 조회
    const user = await this.usersService.findById(userId);
    console.log('[ClubsService] findMyClub - 사용자 정보:', {
      userId,
      hasUser: !!user,
      onboardingType: user?.onboarding_type,
    });

    if (!user) {
      console.log('[ClubsService] findMyClub - 사용자 없음');
      return null;
    }

    // owner인 경우: 운영하는 클럽 조회
    if (user.onboarding_type === 'owner') {
      const club = await this.clubsRepository.findOne({
        where: { admin_user_id: userId },
        relations: ['admin_user'],
      });
      return club || null;
    }

    // member인 경우: active 상태의 클럽 멤버십만 조회 (DB 레벨 필터링)
    const clubMembers = await this.clubMembersService.findByUserId(userId, MemberStatus.ACTIVE);
    console.log('[ClubsService] findMyClub - member:', {
      userId,
      clubMembersCount: clubMembers.length,
      clubMembers: clubMembers.map((cm) => ({
        id: cm.id,
        club_id: cm.club_id,
        user_id: cm.user_id,
        status: cm.status,
        hasClub: !!cm.club,
        clubId: cm.club?.id,
        clubName: cm.club?.name,
      })),
    });

    if (clubMembers.length === 0) {
      console.log('[ClubsService] findMyClub - member: 활성 멤버십 없음');
      return null;
    }

    // findByUserId가 이미 relations: ['club']를 포함하므로 직접 사용
    const activeMember = clubMembers[0];
    let club = activeMember.club;

    console.log('[ClubsService] findMyClub - member: activeMember 확인:', {
      memberId: activeMember.id,
      clubId: activeMember.club_id,
      hasClub: !!club,
    });

    // club relation이 없으면 추가로 조회 (안전장치)
    if (!club) {
      console.log('[ClubsService] findMyClub - member: club relation 없음, 추가 조회');
      const clubData = await this.clubsRepository.findOne({
        where: { id: activeMember.club_id },
        relations: ['admin_user'],
      });
      console.log('[ClubsService] findMyClub - member: 추가 조회 결과:', {
        found: !!clubData,
        clubId: clubData?.id,
        clubName: clubData?.name,
      });
      return clubData || null;
    }

    // admin_user relation이 없으면 추가로 로드
    if (!club.admin_user) {
      console.log('[ClubsService] findMyClub - member: admin_user relation 없음, 추가 로드');
      const clubWithAdmin = await this.clubsRepository.findOne({
        where: { id: club.id },
        relations: ['admin_user'],
      });
      console.log('[ClubsService] findMyClub - member: admin_user 로드 결과:', {
        found: !!clubWithAdmin,
        hasAdminUser: !!clubWithAdmin?.admin_user,
      });
      return clubWithAdmin || club;
    }

    console.log('[ClubsService] findMyClub - member: 성공적으로 반환:', {
      clubId: club.id,
      clubName: club.name,
      hasAdminUser: !!club.admin_user,
    });
    return club;
  }

  async findAll(): Promise<Club[]> {
    return this.clubsRepository.find({
      relations: ['admin_user'],
    });
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.clubsRepository.findOne({
      where: { id },
      relations: ['admin_user', 'club_members', 'club_members.user'],
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async update(id: number, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);

    if (updateClubDto.founded_at) {
      updateClubDto.founded_at = new Date(updateClubDto.founded_at) as any;
    }

    Object.assign(club, updateClubDto);
    return this.clubsRepository.save(club);
  }

  async remove(id: number): Promise<void> {
    const club = await this.findOne(id);
    await this.clubsRepository.remove(club);
  }
}
