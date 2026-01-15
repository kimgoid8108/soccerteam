import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinRequest, JoinRequestStatus } from './entities/join-request.entity';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto';

@Injectable()
export class JoinRequestsService {
  constructor(
    @InjectRepository(JoinRequest)
    private readonly joinRequestsRepository: Repository<JoinRequest>,
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
    const joinRequest = await this.findOne(id);
    joinRequest.status = JoinRequestStatus.APPROVED;
    joinRequest.responded_at = new Date();
    return this.joinRequestsRepository.save(joinRequest);
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
