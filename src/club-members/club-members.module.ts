import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubMembersService } from './club-members.service';
import { ClubMembersController } from './club-members.controller';
import { ClubMember } from './entities/club-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubMember])],
  controllers: [ClubMembersController],
  providers: [ClubMembersService],
  exports: [ClubMembersService],
})
export class ClubMembersModule {}
