import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const match = this.matchesRepository.create({
      club_id: createMatchDto.club_id,
      match_date: new Date(createMatchDto.match_date),
      location: createMatchDto.location,
      description: createMatchDto.description,
      created_by: createMatchDto.created_by || null,
    });
    return this.matchesRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return this.matchesRepository.find({
      relations: ['club', 'created_by_user', 'match_attendance', 'match_attendance.user'],
    });
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchesRepository.findOne({
      where: { id },
      relations: [
        'club',
        'created_by_user',
        'match_attendance',
        'match_attendance.user',
      ],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async findByClubId(clubId: number): Promise<Match[]> {
    return this.matchesRepository.find({
      where: { club_id: clubId },
      relations: ['created_by_user', 'match_attendance', 'match_attendance.user'],
    });
  }

  async update(id: number, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);

    if (updateMatchDto.match_date) {
      match.match_date = new Date(updateMatchDto.match_date);
    }

    Object.assign(match, updateMatchDto);
    return this.matchesRepository.save(match);
  }

  async remove(id: number): Promise<void> {
    const match = await this.findOne(id);
    await this.matchesRepository.remove(match);
  }
}
