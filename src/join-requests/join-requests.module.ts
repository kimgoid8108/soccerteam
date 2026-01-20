import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinRequestsService } from './join-requests.service';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequest } from './entities/join-request.entity';
import { ClubMembersModule } from '../club-members/club-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([JoinRequest]), ClubMembersModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
