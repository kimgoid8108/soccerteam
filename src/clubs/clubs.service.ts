import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubsRepository: Repository<Club>,
  ) {}

  async create(createClubDto: CreateClubDto, adminUserId: number): Promise<Club> {
    const club = this.clubsRepository.create({
      ...createClubDto,
      admin_user_id: adminUserId,
      founded_at: createClubDto.founded_at
        ? new Date(createClubDto.founded_at)
        : null,
    });
    return this.clubsRepository.save(club);
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
