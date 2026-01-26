import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { FeeCycle } from './entities/fee-cycle.entity';
import { FeeRequest } from './entities/fee-request.entity';
import { ClubsModule } from '../clubs/clubs.module';
import { ClubMembersModule } from '../club-members/club-members.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeCycle, FeeRequest]),
    ClubsModule,
    ClubMembersModule,
    UsersModule,
  ],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}
