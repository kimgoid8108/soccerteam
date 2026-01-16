import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubsRepository: Repository<Club>,
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
    const club = await this.clubsRepository.findOne({
      where: { admin_user_id: userId },
      relations: ['admin_user'],
    });
    return club || null;
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
