import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubMember, MemberStatus } from './entities/club-member.entity';
import { CreateClubMemberDto } from './dto/create-club-member.dto';
import { UpdateClubMemberDto } from './dto/update-club-member.dto';

@Injectable()
export class ClubMembersService {
  constructor(
    @InjectRepository(ClubMember)
    private readonly clubMembersRepository: Repository<ClubMember>,
  ) {}

  async create(createClubMemberDto: CreateClubMemberDto): Promise<ClubMember> {
    const clubMember = this.clubMembersRepository.create({
      club_id: createClubMemberDto.club_id,
      user_id: createClubMemberDto.user_id,
      role: createClubMemberDto.role,
      status: createClubMemberDto.status,
    });
    return this.clubMembersRepository.save(clubMember);
  }

  async findAll(): Promise<ClubMember[]> {
    return this.clubMembersRepository.find({
      relations: ['club', 'user'],
    });
  }

  async findOne(id: number): Promise<ClubMember> {
    const clubMember = await this.clubMembersRepository.findOne({
      where: { id },
      relations: ['club', 'user'],
    });

    if (!clubMember) {
      throw new NotFoundException(`Club member with ID ${id} not found`);
    }

    return clubMember;
  }

  async findByClubId(clubId: number): Promise<ClubMember[]> {
    const members = await this.clubMembersRepository.find({
      where: {
        club_id: clubId,
        status: MemberStatus.ACTIVE, // active 상태만 조회
      },
      relations: ['user'],
    });
    console.log('[ClubMembersService] findByClubId:', {
      clubId,
      membersCount: members.length,
      members: members.map((m) => ({
        id: m.id,
        user_id: m.user_id,
        user_name: m.user?.name,
        role: m.role,
        status: m.status,
      })),
    });
    return members;
  }

  async findByUserId(userId: number, status?: MemberStatus): Promise<ClubMember[]> {
    const where: any = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const members = await this.clubMembersRepository.find({
      where,
      relations: ['club'],
    });

    console.log('[ClubMembersService] findByUserId:', {
      userId,
      status,
      membersCount: members.length,
      members: members.map((m) => ({
        id: m.id,
        club_id: m.club_id,
        user_id: m.user_id,
        status: m.status,
        hasClub: !!m.club,
        clubId: m.club?.id,
        clubName: m.club?.name,
      })),
    });

    return members;
  }

  async update(
    id: number,
    updateClubMemberDto: UpdateClubMemberDto,
  ): Promise<ClubMember> {
    const clubMember = await this.findOne(id);
    Object.assign(clubMember, updateClubMemberDto);
    return this.clubMembersRepository.save(clubMember);
  }

  async remove(id: number): Promise<void> {
    const clubMember = await this.findOne(id);
    await this.clubMembersRepository.remove(clubMember);
  }
}
