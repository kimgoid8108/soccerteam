import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubMember } from './entities/club-member.entity';
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
    return this.clubMembersRepository.find({
      where: { club_id: clubId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<ClubMember[]> {
    return this.clubMembersRepository.find({
      where: { user_id: userId },
      relations: ['club'],
    });
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
