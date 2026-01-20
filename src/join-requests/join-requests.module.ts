import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinRequestsService } from './join-requests.service';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequest } from './entities/join-request.entity';
import { ClubMember } from '../club-members/entities/club-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JoinRequest, ClubMember]),
  ],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
