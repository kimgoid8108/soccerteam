import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { Club } from './entities/club.entity';
import { ClubMembersModule } from '../club-members/club-members.module';  // ✅ 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([Club]),
    ClubMembersModule,  // ✅ 추가 (ClubMembersService를 사용하기 위해)
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
