import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchAttendance } from './entities/match-attendance.entity';
import { CreateMatchAttendanceDto } from './dto/create-match-attendance.dto';
import { UpdateMatchAttendanceDto } from './dto/update-match-attendance.dto';

@Injectable()
export class MatchAttendanceService {
  constructor(
    @InjectRepository(MatchAttendance)
    private readonly matchAttendanceRepository: Repository<MatchAttendance>,
  ) {}

  async create(
    createMatchAttendanceDto: CreateMatchAttendanceDto,
  ): Promise<MatchAttendance> {
    const matchAttendance = this.matchAttendanceRepository.create({
      match_id: createMatchAttendanceDto.match_id,
      user_id: createMatchAttendanceDto.user_id,
      status: createMatchAttendanceDto.status,
    });
    return this.matchAttendanceRepository.save(matchAttendance);
  }

  async findAll(): Promise<MatchAttendance[]> {
    return this.matchAttendanceRepository.find({
      relations: ['match', 'match.club', 'user'],
    });
  }

  async findOne(id: number): Promise<MatchAttendance> {
    const matchAttendance = await this.matchAttendanceRepository.findOne({
      where: { id },
      relations: ['match', 'match.club', 'user'],
    });

    if (!matchAttendance) {
      throw new NotFoundException(
        `Match attendance with ID ${id} not found`,
      );
    }

    return matchAttendance;
  }

  async findByMatchId(matchId: number): Promise<MatchAttendance[]> {
    return this.matchAttendanceRepository.find({
      where: { match_id: matchId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<MatchAttendance[]> {
    return this.matchAttendanceRepository.find({
      where: { user_id: userId },
      relations: ['match', 'match.club'],
    });
  }

  async update(
    id: number,
    updateMatchAttendanceDto: UpdateMatchAttendanceDto,
  ): Promise<MatchAttendance> {
    const matchAttendance = await this.findOne(id);
    Object.assign(matchAttendance, updateMatchAttendanceDto);
    return this.matchAttendanceRepository.save(matchAttendance);
  }

  async remove(id: number): Promise<void> {
    const matchAttendance = await this.findOne(id);
    await this.matchAttendanceRepository.remove(matchAttendance);
  }
}
