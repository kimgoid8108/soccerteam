import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubMembersService } from './club-members.service';
import { ClubMembersController } from './club-members.controller';
import { ClubMember } from './entities/club-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubMember])],
  controllers: [ClubMembersController],
  providers: [ClubMembersService],
  exports: [ClubMembersService],  // ✅ 이게 있어야 다른 모듈에서 사용 가능
})
export class ClubMembersModule {}
